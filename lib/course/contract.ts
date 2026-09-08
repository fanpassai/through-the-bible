import { courseManifest, getWeekActivities } from "./manifest.ts";
import { buildActivityRoute, courseRoutes, isPermanentCourseRoute } from "./routes.ts";
import { resolveCourseProgress, resolveWeekProgress } from "./progress.ts";
import { WEEK_NUMBERS, type CourseActivityKind } from "./types.ts";

export type CourseContractResult = {
  valid: boolean;
  errors: string[];
  weeks: number;
  activities: number;
  routes: number;
};

export function checkCourseContract(): CourseContractResult {
  const errors: string[] = [];
  const weekNumbers = courseManifest.weeks.map(({ number }) => number);
  if (JSON.stringify(weekNumbers) !== JSON.stringify(WEEK_NUMBERS)) {
    errors.push(`Expected weeks 1–10 in order; received ${weekNumbers.join(", ")}.`);
  }

  const placeholders = courseManifest.weeks.filter(({ number, contentStatus }) => number > 1 && contentStatus === "placeholder");
  if (placeholders.length !== 9) errors.push(`Expected explicit placeholders for Weeks 2–10; received ${placeholders.length}.`);

  const weekOne = courseManifest.weeks[0];
  if (weekOne.contentStatus !== "complete") errors.push("Week 1 must be marked as complete content.");
  const activities = courseManifest.weeks.flatMap(getWeekActivities);
  const weekOneActivities = getWeekActivities(weekOne);
  const expectedCounts: Record<CourseActivityKind, number> = {
    movement: 4,
    lesson: 8,
    scripture: 8,
    place: 1,
    fill: 10,
    connect: 4,
    unlock: 1,
    devotional: 7,
  };
  for (const [kind, expected] of Object.entries(expectedCounts)) {
    const actual = weekOneActivities.filter((item) => item.kind === kind).length;
    if (actual !== expected) errors.push(`Week 1 ${kind} inventory must contain ${expected}; received ${actual}.`);
  }
  const place = weekOneActivities.find(({ kind }) => kind === "place");
  if (place?.steps?.length !== 6) errors.push(`Week 1 Place must contain 6 movements; received ${place?.steps?.length ?? 0}.`);

  const allIds = new Set<string>();
  const allRoutes = new Set<string>([courseRoutes.journey, courseRoutes.myBible, courseRoutes.profile]);
  for (const week of courseManifest.weeks) {
    if (!isPermanentCourseRoute(week.href)) errors.push(`Week ${week.number} has invalid route ${week.href}.`);
    if (allRoutes.has(week.href)) errors.push(`Duplicate route ${week.href}.`);
    allRoutes.add(week.href);
  }
  for (const item of activities) {
    if (allIds.has(item.id)) errors.push(`Duplicate activity id ${item.id}.`);
    allIds.add(item.id);
    if (!isPermanentCourseRoute(item.href)) errors.push(`${item.id} has invalid route ${item.href}.`);
    if (item.href !== buildActivityRoute(item.route)) errors.push(`${item.id} does not match the permanent route builder.`);
    if (allRoutes.has(item.href)) errors.push(`Duplicate route ${item.href}.`);
    allRoutes.add(item.href);
  }
  const activityOrder = new Map(weekOneActivities.map(({ id }, index) => [id, index]));
  for (const item of weekOneActivities) {
    for (const prerequisiteId of item.prerequisiteIds) {
      const prerequisitePosition = activityOrder.get(prerequisiteId);
      if (prerequisitePosition === undefined) errors.push(`${item.id} references missing prerequisite ${prerequisiteId}.`);
      else if (prerequisitePosition >= (activityOrder.get(item.id) ?? -1)) errors.push(`${item.id} prerequisite ${prerequisiteId} must occur earlier.`);
    }
  }

  const emptyProgress = resolveCourseProgress(courseManifest, {});
  const emptyWeekOne = emptyProgress.weeks[0];
  if (emptyProgress.currentWeekNumber !== 1) errors.push("A new learner must begin on Week 1.");
  if (emptyWeekOne.recommendedActivityId !== "w01-lesson-01") errors.push("A new learner must be directed to Week 1, Subject 1.");
  if (emptyWeekOne.activities.find(({ activity }) => activity.id === "w01-lesson-01")?.status !== "available") errors.push("Week 1, Subject 1 must be available to a new learner.");
  if (emptyWeekOne.activities.find(({ activity }) => activity.id === "w01-lesson-02")?.status !== "locked") errors.push("Week 1, Subject 2 must remain locked before Subject 1 is complete.");

  const startedWeek = resolveWeekProgress(weekOne, { "w01-lesson-01": { startedAt: "2026-09-08T00:00:00.000Z" } });
  if (startedWeek.status !== "in-progress") errors.push("Started evidence must resolve the week to in-progress.");
  if (startedWeek.activities.find(({ activity }) => activity.id === "w01-lesson-01")?.status !== "in-progress") errors.push("Started evidence must resolve the activity to in-progress.");

  const lessonsComplete = Object.fromEntries(lessonActivitiesForContract(weekOneActivities).map(({ id }) => [id, { completedAt: "2026-09-08T00:00:00.000Z" }]));
  const scriptureReady = resolveWeekProgress(weekOne, lessonsComplete);
  const scriptureStatuses = scriptureReady.activities.filter(({ activity }) => activity.kind === "scripture").map(({ status }) => status);
  if (scriptureStatuses[0] !== "available" || scriptureStatuses.slice(1).some((status) => status !== "pending")) {
    errors.push("After the lesson, the first Scripture must be available and the remaining passages pending.");
  }
  if (emptyProgress.weeks.slice(1).some(({ status }) => status !== "locked")) errors.push("Placeholder Weeks 2–10 must resolve to locked.");

  return {
    valid: errors.length === 0,
    errors,
    weeks: courseManifest.weeks.length,
    activities: activities.length,
    routes: allRoutes.size,
  };
}

function lessonActivitiesForContract(activities: ReturnType<typeof getWeekActivities>) {
  return activities.filter(({ kind }) => kind === "lesson");
}

export function assertCourseContract() {
  const result = checkCourseContract();
  if (!result.valid) throw new Error(`Course contract failed:\n- ${result.errors.join("\n- ")}`);
  return result;
}
