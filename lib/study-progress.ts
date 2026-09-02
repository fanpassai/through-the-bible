import type { ScriptureReading, StudyActivityEvent, StudyPortfolio } from "@/lib/study-types";
import { EMPTY_PORTFOLIO } from "@/lib/study-types";

export const PERSONAL_STORAGE_KEY = "ttb-week01-saved-study-v1";
export const STUDY_UPDATED_EVENT = "ttb-study-updated";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

export function normalizePortfolio(value: unknown): StudyPortfolio {
  const candidate = asRecord(value);
  return {
    deepCompleted: asRecord(candidate.deepCompleted) as Record<string, boolean>,
    deepNotes: asRecord(candidate.deepNotes) as Record<string, string>,
    deepReflections: asRecord(candidate.deepReflections) as Record<string, string>,
    scriptureTools: asRecord(candidate.scriptureTools) as StudyPortfolio["scriptureTools"],
    readingHistory: asRecord(candidate.readingHistory) as Record<string, ScriptureReading>,
    activityEvents: Array.isArray(candidate.activityEvents)
      ? candidate.activityEvents.filter((event): event is StudyActivityEvent => Boolean(event && typeof event === "object"))
      : [],
  };
}

export function mergePortfolios(cloudValue: unknown, localValue: unknown): StudyPortfolio {
  const cloud = normalizePortfolio(cloudValue);
  const local = normalizePortfolio(localValue);
  const eventMap = new Map<string, StudyActivityEvent>();
  [...cloud.activityEvents, ...local.activityEvents].forEach((event) => eventMap.set(event.id, event));
  return {
    deepCompleted: { ...cloud.deepCompleted, ...local.deepCompleted },
    deepNotes: { ...cloud.deepNotes, ...local.deepNotes },
    deepReflections: { ...cloud.deepReflections, ...local.deepReflections },
    scriptureTools: { ...cloud.scriptureTools, ...local.scriptureTools },
    readingHistory: { ...cloud.readingHistory, ...local.readingHistory },
    activityEvents: [...eventMap.values()]
      .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
      .slice(-500),
  };
}

export function readLocalPortfolio(): StudyPortfolio {
  if (typeof window === "undefined") return EMPTY_PORTFOLIO;
  try {
    return normalizePortfolio(JSON.parse(window.localStorage.getItem(PERSONAL_STORAGE_KEY) || "null"));
  } catch {
    return EMPTY_PORTFOLIO;
  }
}

export function announceStudyUpdate() {
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(STUDY_UPDATED_EVENT));
}

function startOfCurrentStudyWeek(now: Date) {
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  start.setDate(start.getDate() - start.getDay());
  return start.getTime();
}

function isCurrentWeek(value: string | undefined, start: number) {
  if (!value) return false;
  const timestamp = new Date(value).getTime();
  return Number.isFinite(timestamp) && timestamp >= start;
}

export type WeeklyStudyStats = {
  passagesRead: number;
  versesRead: number;
  scriptureOpens: number;
  marks: number;
  notes: number;
  questions: number;
  devotionalDays: number;
  labMoments: number;
  retrievalAccuracy: number | null;
  progress: number;
  theme: string;
  mostRevisited: string | null;
};

export function getWeeklyStudyStats(portfolio: StudyPortfolio, now = new Date()): WeeklyStudyStats {
  const weekStart = startOfCurrentStudyWeek(now);
  const readings = Object.values(portfolio.readingHistory || {});
  const weeklyReadings = readings.filter((reading) => isCurrentWeek(reading.lastReadAt || reading.completedAt, weekStart));
  const weeklyEvents = (portfolio.activityEvents || []).filter((event) => isCurrentWeek(event.createdAt, weekStart));
  const scriptureMarks = Object.values(portfolio.scriptureTools || {});
  const anchoredEntries = scriptureMarks.flatMap((mark) => mark.studyEntries || []);
  const marks = scriptureMarks.reduce((total, mark) => total + (mark.selections?.length || 0), 0);
  const scriptureNotes = scriptureMarks.filter((mark) => Boolean(mark.notes?.trim())).length
    + anchoredEntries.filter((entry) => entry.type === "note" && entry.body.trim()).length;
  const devotionalNotes = Object.values(portfolio.deepNotes || {}).filter((note) => Boolean(note?.trim())).length;
  const questions = scriptureMarks.filter((mark) => Boolean(mark.question?.trim())).length
    + anchoredEntries.filter((entry) => entry.type === "question" && entry.body.trim()).length;
  const devotionalDays = Object.values(portfolio.deepCompleted || {}).filter(Boolean).length;
  const fillAttempts = weeklyEvents.filter((event) => event.type === "fill_attempt");
  const correctAttempts = fillAttempts.filter((event) => event.detail?.correct === true).length;
  const labs = new Set(weeklyEvents.filter((event) => ["place_completed", "connect_completed", "unlock_completed"].includes(event.type)).map((event) => event.type));
  const progress = Math.min(100, Math.round(
    Math.min(weeklyReadings.length, 4) * 6.25 +
    Math.min(marks, 4) * 2.5 +
    Math.min(scriptureNotes + questions, 4) * 2.5 +
    Math.min(devotionalDays, 7) * 5 +
    labs.size * 5,
  ));
  const mostRevisited = readings.length
    ? readings.reduce((best, reading) => reading.opens > best.opens ? reading : best).reference
    : null;
  const refs = weeklyReadings.map((reading) => reading.reference).join(" ");
  const theme = /Genesis 3/.test(refs) ? "Trust" : /Genesis 1/.test(refs) ? "Purpose" : readings.length ? "Beginnings" : "Your first discovery";
  return {
    passagesRead: weeklyReadings.length,
    versesRead: weeklyReadings.reduce((total, reading) => total + (reading.verseCount || 0), 0),
    scriptureOpens: weeklyEvents.filter((event) => event.type === "scripture_opened").length,
    marks,
    notes: scriptureNotes + devotionalNotes,
    questions,
    devotionalDays,
    labMoments: labs.size,
    retrievalAccuracy: fillAttempts.length ? Math.round((correctAttempts / fillAttempts.length) * 100) : null,
    progress,
    theme,
    mostRevisited,
  };
}
