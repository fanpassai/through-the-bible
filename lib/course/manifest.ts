import { buildActivityRoute, courseRoutes } from "./routes.ts";
import { type ActivityRouteInput, type CourseActivity, type CourseManifest, type CourseSection, type CourseWeek, type WeekNumber } from "./types.ts";

function activity(
  id: string,
  title: string,
  route: ActivityRouteInput,
  position: number,
  prerequisiteIds: readonly string[] = [],
  options: { summary?: string; steps?: readonly string[]; required?: boolean } = {},
): CourseActivity {
  return {
    id,
    kind: route.kind,
    position,
    title,
    summary: options.summary,
    required: options.required ?? true,
    route,
    href: buildActivityRoute(route),
    prerequisiteIds,
    steps: options.steps,
  };
}

const lessonTitles = [
  "Before anything else, God.",
  "God speaks a good world into order.",
  "Humanity bears God's image.",
  "Humanity receives gifts and a boundary.",
  "The serpent begins with a question.",
  "Shame becomes hiding and blame.",
  "Judgment names what has changed.",
  "Promise appears before exile.",
] as const;

const editorialMovements = [
  ["Six Days: A World Formed and Filled", "God orders the realms, fills them with life, and rests over a world declared very good."],
  ["The Crown of Creation: Image-Bearers and Regents", "Humanity receives royal dignity, delegated authority and a vocation beneath God's rule."],
  ["The Rupture: Sin and What It Changed", "Distrust becomes rebellion; shame, disorder, mortality and exile enter the human story."],
  ["The First Promise: Hope Before Eden Closes", "Inside the judgment, God promises a coming Seed and a victory evil cannot prevent."],
] as const;

const scriptureReferences = [
  "Genesis 1:3–31",
  "Genesis 1:26–28",
  "Genesis 2:15–17",
  "Genesis 3:1–7",
  "Genesis 3:14–19",
  "Genesis 3:22–24",
  "Genesis 3:15",
  "1 John 3:8",
] as const;

const placeMovements = [
  "God creates and calls creation good",
  "Humanity bears God's image",
  "God gives abundance and a boundary",
  "The serpent questions God's word",
  "Rebellion brings shame, blame, and judgment",
  "Promise appears before humanity is exiled",
] as const;

const fillQuestions = [
  "The Bible begins with ________, not with humanity.",
  "God repeatedly calls His creation ________.",
  "Male and female are made in God's ________.",
  "Genesis 2 gives humanity abundance and one clear ________.",
  "The serpent begins by questioning God's ________.",
  "After eating, Adam and Eve become aware of their nakedness and feel ________.",
  "When God questions them, hiding turns into ________.",
  "God addresses the serpent, woman, man, and ground. This is ________.",
  "Genesis 3:15 introduces a coming ________ or offspring.",
  "Genesis 3 ends with humanity sent out of Eden. This is called ________.",
] as const;

const connectDiscoveries = [
  "Begin with the One who is already there.",
  "Then John returns to the beginning.",
  "Colossians names the center.",
  "Now save a promise for the journey.",
] as const;

const devotionals = [
  ["Before He filled it, He formed it.", "Formed before filled."],
  ["The garden was waiting for a gardener.", "The garden needed hands."],
  ["You were named before you performed.", "Named before broken."],
  ["The first battle was over a sentence.", "Which voice sounds true?"],
  ["God's first question was an invitation.", "Where are you?"],
  ["The promise came before the exit.", "Buried is not dead."],
  ["The One who made all things can remake you.", "The beginning belongs to Christ."],
] as const;

const movementActivities = editorialMovements.map(([title, summary], index) => activity(
  `w01-movement-${String(index + 1).padStart(2, "0")}`,
  title,
  { kind: "movement", week: 1, movement: index + 1 },
  index + 1,
  [],
  { summary, required: false },
));

const lessonActivities = lessonTitles.map((title, index) => activity(
  `w01-lesson-${String(index + 1).padStart(2, "0")}`,
  title,
  { kind: "lesson", week: 1, subject: index + 1 },
  index + 1,
  index ? [`w01-lesson-${String(index).padStart(2, "0")}`] : [],
));

const scriptureActivities = scriptureReferences.map((reference, index) => activity(
  `w01-scripture-${String(index + 1).padStart(2, "0")}`,
  reference,
  { kind: "scripture", week: 1, passage: reference },
  index + 1,
  ["w01-lesson-08"],
  { summary: "Required Week 1 Scripture" },
));

const placeActivity = activity(
  "w01-place",
  "Place the story",
  { kind: "place", week: 1 },
  1,
  scriptureActivities.map(({ id }) => id),
  { summary: "Arrange the six movements of Genesis 1–3.", steps: placeMovements },
);

const fillActivities = fillQuestions.map((title, index) => activity(
  `w01-fill-${String(index + 1).padStart(2, "0")}`,
  title,
  { kind: "fill", week: 1, question: index + 1 },
  index + 1,
  [index ? `w01-fill-${String(index).padStart(2, "0")}` : placeActivity.id],
  { summary: `Guided note ${index + 1} of ${fillQuestions.length}` },
));

const connectActivities = connectDiscoveries.map((title, index) => activity(
  `w01-connect-${String(index + 1).padStart(2, "0")}`,
  title,
  { kind: "connect", week: 1, discovery: index + 1 },
  index + 1,
  [index ? `w01-connect-${String(index).padStart(2, "0")}` : "w01-fill-10"],
));

const unlockActivity = activity(
  "w01-unlock",
  "Teach the story back",
  { kind: "unlock", week: 1 },
  1,
  ["w01-connect-04"],
  {
    summary: "Build a clear explanation of Week 1 in your own words.",
    steps: [
      "Begin with what was good.",
      "Name humanity's gift and responsibility.",
      "Explain the rupture.",
      "End with the hope.",
    ],
  },
);

const devotionalActivities = devotionals.map(([title, summary], index) => activity(
  `w01-devotional-${String(index + 1).padStart(2, "0")}`,
  title,
  { kind: "devotional", week: 1, day: index + 1 },
  index + 1,
  [index ? `w01-devotional-${String(index).padStart(2, "0")}` : unlockActivity.id],
  { summary },
));

const weekOneSections: readonly CourseSection[] = [
  { id: "w01-visual-story", title: "Visual story", description: "Four editorial movements establish the world, the rupture and the promise.", activities: movementActivities },
  { id: "w01-core-lesson", title: "Core lesson", description: "Eight subjects. One story.", activities: lessonActivities },
  { id: "w01-required-scripture", title: "Required Scripture", description: "Read and work with every passage in the lesson.", activities: scriptureActivities },
  { id: "w01-place", title: "Place", description: "Put the story in its biblical order.", activities: [placeActivity] },
  { id: "w01-fill", title: "Fill", description: "Complete ten guided notes.", activities: fillActivities },
  { id: "w01-connect", title: "Connect", description: "Trace four discoveries across Scripture.", activities: connectActivities },
  { id: "w01-unlock", title: "Unlock", description: "Teach the story back in your own words.", activities: [unlockActivity] },
  { id: "w01-go-deeper", title: "Go Deeper", description: "Seven devotional days for reflection and prayer.", activities: devotionalActivities },
] as const;

const weekOne: CourseWeek = {
  number: 1,
  id: "week-01",
  title: "The Beginning",
  subtitle: "Creation, the Fall and the First Promise",
  scripture: "Genesis 1–3",
  contentStatus: "complete",
  href: courseRoutes.week(1),
  sections: weekOneSections,
};

function placeholderWeek(number: Exclude<WeekNumber, 1>): CourseWeek {
  return {
    number,
    id: `week-${String(number).padStart(2, "0")}`,
    title: null,
    subtitle: null,
    scripture: null,
    contentStatus: "placeholder",
    href: courseRoutes.week(number),
    placeholderMessage: `Week ${number} is included in the journey architecture. Its approved title and content are pending.`,
    sections: [],
  };
}

export const courseManifest = {
  id: "through-the-bible-ten-week-journey",
  title: "Through the Bible",
  version: 1,
  weeks: [weekOne, ...([2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((number) => placeholderWeek(number))],
} as const satisfies CourseManifest;

export const weekOneManifest = courseManifest.weeks[0];

export function getWeek(number: WeekNumber) {
  return courseManifest.weeks.find((week) => week.number === number);
}

export function getWeekActivities(week: CourseWeek) {
  return week.sections.flatMap((section) => section.activities);
}

export function getActivity(activityId: string) {
  for (const week of courseManifest.weeks) {
    const found = getWeekActivities(week).find((item) => item.id === activityId);
    if (found) return found;
  }
  return undefined;
}
