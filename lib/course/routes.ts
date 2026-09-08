import type { ActivityRouteInput, WeekNumber } from "./types.ts";

export const courseRoutes = {
  journey: "/journey",
  myBible: "/my-bible",
  profile: "/profile",
  week: (week: WeekNumber) => `/weeks/${week}`,
} as const;

export function scripturePassageSlug(reference: string) {
  return reference
    .normalize("NFKD")
    .toLowerCase()
    .replace(/[–—:]/g, "-")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function buildActivityRoute(input: ActivityRouteInput): string {
  const base = courseRoutes.week(input.week);
  switch (input.kind) {
    case "movement": return `${base}/lesson/movement-${input.movement}`;
    case "lesson": return `${base}/lesson/subject-${input.subject}`;
    case "scripture": return `${base}/scripture/${scripturePassageSlug(input.passage)}`;
    case "place": return `${base}/place`;
    case "fill": return `${base}/fill/${input.question}`;
    case "connect": return `${base}/connect/${input.discovery}`;
    case "unlock": return `${base}/unlock`;
    case "devotional": return `${base}/devotional/${input.day}`;
  }
}

export function isPermanentCourseRoute(href: string) {
  if (!href.startsWith("/") || href.includes("?") || href.includes("#") || href.includes("//")) return false;
  return href === courseRoutes.journey
    || href === courseRoutes.myBible
    || href === courseRoutes.profile
    || /^\/weeks\/(?:[1-9]|10)(?:\/(?:lesson\/(?:movement|subject)-\d+|scripture\/[a-z0-9-]+|place|fill\/\d+|connect\/\d+|unlock|devotional\/\d+))?$/.test(href);
}
