export const WEEK_NUMBERS = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const;

export type WeekNumber = (typeof WEEK_NUMBERS)[number];
export type CourseContentStatus = "complete" | "placeholder";
export type CourseProgressStatus = "completed" | "in-progress" | "available" | "pending" | "locked";

export type CourseActivityKind =
  | "movement"
  | "lesson"
  | "scripture"
  | "place"
  | "fill"
  | "connect"
  | "unlock"
  | "devotional";

export type ActivityRouteInput =
  | { kind: "movement"; week: WeekNumber; movement: number }
  | { kind: "lesson"; week: WeekNumber; subject: number }
  | { kind: "scripture"; week: WeekNumber; passage: string }
  | { kind: "place"; week: WeekNumber }
  | { kind: "fill"; week: WeekNumber; question: number }
  | { kind: "connect"; week: WeekNumber; discovery: number }
  | { kind: "unlock"; week: WeekNumber }
  | { kind: "devotional"; week: WeekNumber; day: number };

export type CourseActivity = {
  id: string;
  kind: CourseActivityKind;
  position: number;
  title: string;
  summary?: string;
  required: boolean;
  route: ActivityRouteInput;
  href: string;
  prerequisiteIds: readonly string[];
  steps?: readonly string[];
};

export type CourseSection = {
  id: string;
  title: string;
  description: string;
  activities: readonly CourseActivity[];
};

export type CourseWeek = {
  number: WeekNumber;
  id: string;
  title: string | null;
  subtitle: string | null;
  scripture: string | null;
  contentStatus: CourseContentStatus;
  href: string;
  placeholderMessage?: string;
  sections: readonly CourseSection[];
};

export type CourseManifest = {
  id: string;
  title: string;
  version: number;
  weeks: readonly CourseWeek[];
};

export type ActivityProgressEvidence = {
  startedAt?: string;
  completedAt?: string;
  currentStep?: number;
  completedSteps?: number;
  totalSteps?: number;
};

export type CourseProgressLedger = Readonly<Record<string, ActivityProgressEvidence | undefined>>;

export type ResolvedActivityProgress = {
  activity: CourseActivity;
  status: CourseProgressStatus;
  progress: number;
  blockingActivityId?: string;
};

export type ResolvedWeekProgress = {
  week: CourseWeek;
  status: CourseProgressStatus;
  completed: number;
  total: number;
  percentage: number;
  recommendedActivityId?: string;
  activities: readonly ResolvedActivityProgress[];
};
