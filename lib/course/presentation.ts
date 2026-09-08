import type { CourseActivityKind, WeekNumber } from "./types.ts";

export const weekArtwork: Record<WeekNumber, string> = {
  1: "/images/today-week-1-creation-v2.webp",
  2: "/images/week1-creation-sea.jpg",
  3: "/images/week1-east-of-eden.webp",
  4: "/images/place-01-creation-v24.webp",
  5: "/images/week1-image-bearers.webp",
  6: "/images/week1-eden-vocation.jpg",
  7: "/images/week1-eden-temptation.jpg",
  8: "/images/week1-eden-shame.jpg",
  9: "/images/week1-eden-exile-couple.jpg",
  10: "/images/place-06-promise-v24.webp",
};

export const activityArtwork: Record<CourseActivityKind, string> = {
  movement: "/images/week1-cinematic-master-v4.webp",
  lesson: "/images/week1-story-creation.png",
  scripture: "/images/week1-hero-reference-v3-hd.png",
  place: "/images/week1-atlas-eden.png",
  fill: "/images/week1-image-bearers.webp",
  connect: "/images/week1-trust-fractures.webp",
  unlock: "/images/week1-east-of-eden.webp",
  devotional: "/images/week1-deep-plan-cover-v2.png",
};
