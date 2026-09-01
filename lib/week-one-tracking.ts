import lesson from "@/app/week1-data.json";
import type { StudyActivityEvent, StudyPortfolio } from "@/lib/study-types";

export const WEEK_ONE_SESSION_KEY = "ttb-week01-active-study-session-v1";
export const WEEK_ONE_RESUME_KEY = "ttb-week01-resume-target-v1";

const REQUIRED_SCRIPTURES = [
  "Genesis 1:3–31",
  "Genesis 1:26–28",
  "Genesis 2:15–17",
  "Genesis 3:1–7",
  "Genesis 3:14–19",
  "Genesis 3:22–24",
  "Genesis 3:15",
  "1 John 3:8",
] as const;

type SessionState = {
  started?: boolean;
  story?: number;
  place?: unknown[];
  fillCorrect?: Record<string, boolean>;
  connect?: number;
  teachbackComplete?: boolean;
  deepCompleted?: Record<string, boolean>;
  readingHistory?: StudyPortfolio["readingHistory"];
  activityEvents?: StudyActivityEvent[];
};

export type TrackingStatus = "complete" | "current" | "in-progress" | "up-next";
export type TrackingKey = "lesson" | "scripture" | "place" | "fill" | "connect" | "unlock" | "deeper";

export type TrackingUnit = {
  key: TrackingKey;
  title: string;
  description: string;
  completed: number;
  total: number;
  status: TrackingStatus;
};

export type ResumeTarget = {
  key: TrackingKey;
  title: string;
  eyebrow: string;
  detail: string;
  screen: string;
  index?: number;
};

export type WeekOneTracking = {
  percentage: number;
  completed: number;
  total: number;
  coreComplete: boolean;
  weekComplete: boolean;
  units: TrackingUnit[];
  next: ResumeTarget;
  reviewCount: number;
  savedDiscoveryCount: number;
};

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function countTrue(value: unknown) {
  return Object.values(record(value)).filter(Boolean).length;
}

function eventDone(events: StudyActivityEvent[], type: StudyActivityEvent["type"]) {
  return events.some((event) => event.type === type);
}

function unitStatus(completed: number, total: number): TrackingStatus {
  if (completed >= total) return "complete";
  if (completed > 0) return "in-progress";
  return "up-next";
}

export function readWeekOneSession(): SessionState {
  if (typeof window === "undefined") return {};
  try {
    return record(JSON.parse(window.sessionStorage.getItem(WEEK_ONE_SESSION_KEY) || "null")) as SessionState;
  } catch {
    return {};
  }
}

export function getWeekOneTracking(sessionValue: unknown, portfolio: StudyPortfolio): WeekOneTracking {
  const session = record(sessionValue) as SessionState;
  const events = [...(portfolio.activityEvents || []), ...(session.activityEvents || [])];
  const readingHistory = { ...(portfolio.readingHistory || {}), ...(session.readingHistory || {}) };

  const storyTotal = lesson.STORY.length;
  const storyCompleted = session.started
    ? Math.min(storyTotal, Math.max(1, Number(session.story || 0) + 1))
    : 0;
  const scriptureCompleted = REQUIRED_SCRIPTURES.filter((reference) => Boolean(readingHistory[reference]?.completedAt)).length;
  const placeCompleted = Array.isArray(session.place) && session.place.length >= lesson.PLACE.length
    ? lesson.PLACE.length
    : eventDone(events, "place_completed") ? lesson.PLACE.length : 0;

  const fillQuestions = new Set<number>();
  Object.entries(session.fillCorrect || {}).forEach(([question, correct]) => {
    if (correct) fillQuestions.add(Number(question));
  });
  events.filter((event) => event.type === "fill_attempt" && event.detail?.correct === true).forEach((event) => {
    const question = Number(event.detail?.question);
    if (Number.isFinite(question)) fillQuestions.add(Math.max(0, question - 1));
  });
  const fillCompleted = Math.min(lesson.FILL.length, fillQuestions.size);
  const connectCompleted = Number(session.connect || 0) >= lesson.W1_DISCOVERIES.length || eventDone(events, "connect_completed")
    ? lesson.W1_DISCOVERIES.length
    : Math.min(lesson.W1_DISCOVERIES.length, Math.max(0, Number(session.connect || 0)));
  const unlockCompleted = session.teachbackComplete || eventDone(events, "unlock_completed") ? 1 : 0;
  const deepCompleted = Math.min(lesson.DEEP_DAYS.length, Math.max(
    countTrue(portfolio.deepCompleted),
    countTrue(session.deepCompleted),
  ));

  const rawUnits: Array<Omit<TrackingUnit, "status">> = [
    { key: "lesson", title: "Lesson story", description: storyCompleted + " of " + storyTotal + " subjects read", completed: storyCompleted, total: storyTotal },
    { key: "scripture", title: "Required Scripture", description: scriptureCompleted + " of " + REQUIRED_SCRIPTURES.length + " passages read", completed: scriptureCompleted, total: REQUIRED_SCRIPTURES.length },
    { key: "place", title: "Place", description: placeCompleted + " of " + lesson.PLACE.length + " movements placed", completed: placeCompleted, total: lesson.PLACE.length },
    { key: "fill", title: "Fill", description: fillCompleted + " of " + lesson.FILL.length + " questions completed", completed: fillCompleted, total: lesson.FILL.length },
    { key: "connect", title: "Connect", description: connectCompleted + " of " + lesson.W1_DISCOVERIES.length + " discoveries opened", completed: connectCompleted, total: lesson.W1_DISCOVERIES.length },
    { key: "unlock", title: "Unlock", description: unlockCompleted ? "Understanding unlocked" : "Teach the story back", completed: unlockCompleted, total: 1 },
    { key: "deeper", title: "Go Deeper", description: deepCompleted + " of " + lesson.DEEP_DAYS.length + " days completed", completed: deepCompleted, total: lesson.DEEP_DAYS.length },
  ];

  const firstIncomplete = rawUnits.findIndex((unit) => unit.completed < unit.total);
  const units = rawUnits.map((unit, index): TrackingUnit => {
    const status = unitStatus(unit.completed, unit.total);
    return { ...unit, status: index === firstIncomplete && status === "up-next" ? "current" : status };
  });

  const firstUnreadScripture = REQUIRED_SCRIPTURES.findIndex((reference) => !readingHistory[reference]?.completedAt);
  const firstMissingFill = Array.from({ length: lesson.FILL.length }, (_, index) => index).find((index) => !fillQuestions.has(index)) ?? 0;
  const next: ResumeTarget = storyCompleted < storyTotal
    ? { key: "lesson", eyebrow: "CONTINUE LESSON", title: String(lesson.STORY[storyCompleted]?.[1] || "The Beginning"), detail: "Subject " + (storyCompleted + 1) + " of " + storyTotal, screen: "story", index: storyCompleted }
    : scriptureCompleted < REQUIRED_SCRIPTURES.length
      ? { key: "scripture", eyebrow: "CONTINUE REQUIRED SCRIPTURE", title: REQUIRED_SCRIPTURES[Math.max(0, firstUnreadScripture)], detail: scriptureCompleted + " of " + REQUIRED_SCRIPTURES.length + " passages complete", screen: "scripture", index: Math.max(0, firstUnreadScripture) }
      : placeCompleted < lesson.PLACE.length
        ? { key: "place", eyebrow: "CONTINUE COURSE WORK", title: "Place the story", detail: placeCompleted + " of " + lesson.PLACE.length + " movements placed", screen: "place" }
        : fillCompleted < lesson.FILL.length
          ? { key: "fill", eyebrow: "CONTINUE COURSE WORK", title: "Fill · Guided Notes", detail: "Question " + (firstMissingFill + 1) + " of " + lesson.FILL.length, screen: "fill", index: firstMissingFill }
          : connectCompleted < lesson.W1_DISCOVERIES.length
            ? { key: "connect", eyebrow: "CONTINUE COURSE WORK", title: "Connect the Scriptures", detail: connectCompleted + " of " + lesson.W1_DISCOVERIES.length + " discoveries opened", screen: "connect", index: connectCompleted }
            : !unlockCompleted
              ? { key: "unlock", eyebrow: "COMPLETE THE CORE LESSON", title: "Unlock your understanding", detail: "Teach Week 1 back in your own words", screen: "unlock" }
              : deepCompleted < lesson.DEEP_DAYS.length
                ? { key: "deeper", eyebrow: "CONTINUE GO DEEPER", title: "Day " + (deepCompleted + 1), detail: deepCompleted + " of " + lesson.DEEP_DAYS.length + " days complete", screen: "deep", index: deepCompleted }
                : { key: "lesson", eyebrow: "WEEK 1 COMPLETE", title: "Return to the beginning", detail: "Review the complete Week 1 journey", screen: "complete" };

  const completed = rawUnits.reduce((sum, unit) => sum + unit.completed, 0);
  const total = rawUnits.reduce((sum, unit) => sum + unit.total, 0);
  const incorrectQuestions = new Set(events
    .filter((event) => event.type === "fill_attempt" && event.detail?.correct === false)
    .map((event) => Number(event.detail?.question))
    .filter(Number.isFinite));
  const savedDiscoveryCount = Object.values(portfolio.scriptureTools || {}).filter((mark) =>
    Boolean(mark.bookmark || mark.notes?.trim() || mark.question?.trim() || mark.selections?.length),
  ).length;

  return {
    percentage: total ? Math.round((completed / total) * 100) : 0,
    completed,
    total,
    coreComplete: rawUnits.slice(0, 6).every((unit) => unit.completed >= unit.total),
    weekComplete: rawUnits.every((unit) => unit.completed >= unit.total),
    units,
    next,
    reviewCount: incorrectQuestions.size,
    savedDiscoveryCount,
  };
}
