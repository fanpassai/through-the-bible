import { getWeekActivities } from "./manifest.ts";
import type {
  CourseManifest,
  CourseProgressLedger,
  CourseProgressStatus,
  CourseWeek,
  ResolvedActivityProgress,
  ResolvedWeekProgress,
} from "./types.ts";

function completionRatio(completed: number, total: number) {
  return total ? Math.round((completed / total) * 100) : 0;
}

function evidenceProgress(evidence: CourseProgressLedger[string]) {
  if (!evidence) return 0;
  if (evidence.completedAt) return 100;
  if (evidence.totalSteps && evidence.completedSteps) {
    return Math.min(99, completionRatio(evidence.completedSteps, evidence.totalSteps));
  }
  return evidence.startedAt || evidence.currentStep !== undefined ? 1 : 0;
}

export function resolveWeekProgress(week: CourseWeek, ledger: CourseProgressLedger): ResolvedWeekProgress {
  const activities = getWeekActivities(week);
  if (week.contentStatus === "placeholder") {
    return {
      week,
      status: "locked",
      completed: 0,
      total: 0,
      percentage: 0,
      activities: [],
    };
  }

  const activityIds = new Set(activities.map(({ id }) => id));
  const completedIds = new Set(activities.filter(({ id }) => Boolean(ledger[id]?.completedAt)).map(({ id }) => id));
  const unlocked = activities.filter((item) => item.prerequisiteIds.every((id) => !activityIds.has(id) || completedIds.has(id)));
  const recommended = unlocked.find((item) => item.required && !ledger[item.id]?.completedAt && !ledger[item.id]?.startedAt)
    ?? unlocked.find((item) => item.required && !ledger[item.id]?.completedAt);

  const resolved: ResolvedActivityProgress[] = activities.map((activity) => {
    const evidence = ledger[activity.id];
    const blockingActivityId = activity.prerequisiteIds.find((id) => activityIds.has(id) && !completedIds.has(id));
    let status: CourseProgressStatus;
    if (evidence?.completedAt) status = "completed";
    else if (evidence?.startedAt || evidence?.currentStep !== undefined || evidence?.completedSteps) status = "in-progress";
    else if (blockingActivityId) status = "locked";
    else if (recommended?.id === activity.id) status = "available";
    else status = "pending";
    return { activity, status, progress: evidenceProgress(evidence), blockingActivityId };
  });

  const required = resolved.filter(({ activity }) => activity.required);
  const completed = required.filter(({ status }) => status === "completed").length;
  const started = resolved.some(({ status }) => status === "in-progress" || status === "completed");
  const status: CourseProgressStatus = completed === required.length && required.length
    ? "completed"
    : started ? "in-progress" : "available";

  return {
    week,
    status,
    completed,
    total: required.length,
    percentage: completionRatio(completed, required.length),
    recommendedActivityId: recommended?.id,
    activities: resolved,
  };
}

export function resolveCourseProgress(manifest: CourseManifest, ledger: CourseProgressLedger) {
  const weeks = manifest.weeks.map((week) => resolveWeekProgress(week, ledger));
  const current = weeks.find((week) => week.status === "in-progress")
    ?? weeks.find((week) => week.status === "available");
  return {
    weeks,
    currentWeekNumber: current?.week.number,
    currentActivityId: current?.recommendedActivityId,
  };
}
