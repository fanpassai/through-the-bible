import type { StudyActivityEvent, StudyPortfolio } from "../study-types.ts";
import { getWeekActivities, weekOneManifest } from "./manifest.ts";
import type { ActivityProgressEvidence, CourseProgressLedger } from "./types.ts";

const legacyTimestamp = "1970-01-01T00:00:00.000Z";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function save(ledger: Record<string, ActivityProgressEvidence>, id: string, evidence: ActivityProgressEvidence) {
  ledger[id] = { ...ledger[id], ...evidence };
}

export function migrateLegacyWeekOneProgress(sessionValue: unknown, portfolio: StudyPortfolio): CourseProgressLedger {
  const session = record(sessionValue);
  const ledger: Record<string, ActivityProgressEvidence> = {};
  const activities = getWeekActivities(weekOneManifest);
  const byKind = (kind: string) => activities.filter((item) => item.kind === kind);
  const events = [...(portfolio.activityEvents || []), ...((session.activityEvents as StudyActivityEvent[] | undefined) || [])];

  if (session.started) {
    const highestStory = Math.max(0, Math.min(7, Number(session.story || 0)));
    byKind("lesson").forEach((item, index) => {
      if (index <= highestStory) save(ledger, item.id, { startedAt: legacyTimestamp, completedAt: legacyTimestamp });
    });
  }

  byKind("scripture").forEach((item) => {
    if (item.route.kind !== "scripture") return;
    const reading = portfolio.readingHistory?.[item.route.passage]
      || (record(session.readingHistory)[item.route.passage] as StudyPortfolio["readingHistory"][string] | undefined);
    if (!reading) return;
    save(ledger, item.id, {
      startedAt: reading.firstOpenedAt || reading.lastOpenedAt || legacyTimestamp,
      completedAt: reading.completedAt,
      completedSteps: reading.completedAt ? 1 : 0,
      totalSteps: 1,
    });
  });

  const place = byKind("place")[0];
  const placed = Array.isArray(session.place) ? session.place.length : 0;
  const placeComplete = placed >= (place.steps?.length || 6) || events.some((event) => event.type === "place_completed");
  if (placed || placeComplete) save(ledger, place.id, {
    startedAt: legacyTimestamp,
    completedAt: placeComplete ? legacyTimestamp : undefined,
    completedSteps: Math.min(placed, place.steps?.length || 6),
    totalSteps: place.steps?.length || 6,
  });

  const fillCorrect = record(session.fillCorrect);
  const fillAnswers = record(session.fillAnswers);
  byKind("fill").forEach((item, index) => {
    const eventComplete = events.some((event) => event.type === "fill_attempt" && event.detail?.correct === true && Number(event.detail?.question) === index + 1);
    const completed = fillCorrect[String(index)] === true || eventComplete;
    const started = completed || typeof fillAnswers[String(index)] === "string";
    if (started) save(ledger, item.id, { startedAt: legacyTimestamp, completedAt: completed ? legacyTimestamp : undefined });
  });

  const connectCount = Math.max(0, Number(session.connect || 0));
  const connectComplete = events.some((event) => event.type === "connect_completed");
  byKind("connect").forEach((item, index, list) => {
    if (index < connectCount || connectComplete) save(ledger, item.id, {
      startedAt: legacyTimestamp,
      completedAt: connectComplete || connectCount >= list.length || index < connectCount ? legacyTimestamp : undefined,
    });
  });

  const unlock = byKind("unlock")[0];
  const unlockComplete = session.teachbackComplete === true || events.some((event) => event.type === "unlock_completed");
  const teachbackStarted = Array.isArray(session.teachback) && session.teachback.some((entry) => typeof entry === "string" && entry.trim());
  if (unlockComplete || teachbackStarted) save(ledger, unlock.id, { startedAt: legacyTimestamp, completedAt: unlockComplete ? legacyTimestamp : undefined });

  const deepCompleted = { ...portfolio.deepCompleted, ...record(session.deepCompleted) };
  byKind("devotional").forEach((item, index) => {
    if (deepCompleted[String(index)] === true) save(ledger, item.id, { startedAt: legacyTimestamp, completedAt: legacyTimestamp });
  });

  return ledger;
}
