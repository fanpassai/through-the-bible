"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode, type UIEvent } from "react";
import {
  ArrowLeft, ArrowRight, Bookmark, BookOpen, Check, ChevronDown, ChevronRight, CircleHelp,
  GripVertical, Highlighter, Info, Link2, LockKeyhole, MapPin, Minus,
  MessageCircleQuestion, NotebookPen, RotateCcw,
  Sparkles, Underline, UserRound, Users, Waypoints, X,
} from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import lesson from "./week1-data.json";
import { useStudyAccount } from "./study-account";
import { announceStudyUpdate, mergePortfolios, PERSONAL_STORAGE_KEY } from "@/lib/study-progress";
import type { ScriptureMark, ScriptureReading, ScriptureSelection, StudyActivityEvent, StudyActivityType, StudyPortfolio } from "@/lib/study-types";
import { WEEK_ONE_RESUME_KEY, type ResumeTarget } from "@/lib/week-one-tracking";

type ToolName = "place" | "fill" | "connect" | "unlock";
type StudyDockName = ToolName | "deep";
type Screen = "home" | "roadmap" | "movement" | "story" | "promise" | "family" |
  "placeIntro" | "fillIntro" | "connectIntro" | "unlockIntro" | "place" | "fill" | "connect" | "unlock" | "deep" | "complete";
type Scripture = { html: string; study: string; translation: string; kind: string };
type FillItem = { q: string; answer: string; accepted: string[]; hint: string; why: string };
type DeepDay = {
  tab: string; eyebrow: string; title: string; cover: string; subtitle: string;
  time: string; refs: string[]; lede: string; paragraphs: string[];
  quote: string; quoteRef: string; hold: string; reflect: string; prayer: string;
};
type AppState = {
  started: boolean; story: number; place: string[]; placeOrder: string[];
  fillAnswers: Record<string, string>; fillCorrect: Record<string, boolean>;
  connect: number; teachback: string[]; teachbackComplete: boolean;
  deepCompleted: Record<string, boolean>; deepNotes: Record<string, string>;
  deepReflections: Record<string, string>; scriptureTools: Record<string, ScriptureMark>;
  readingHistory: Record<string, ScriptureReading>; activityEvents: StudyActivityEvent[];
};

const STORY = lesson.STORY as [string, string, string[], string, string][];
const FILL = lesson.FILL as FillItem[];
const PLACE = lesson.PLACE as string[];
const SCRIPTURES = lesson.SCRIPTURES as Record<string, Scripture>;
const DISCOVERIES = lesson.W1_DISCOVERIES as { title: string; body: string }[];
const TEACHBACK = lesson.TEACHBACK_STEPS as { label: string; trail: string; title: string; prompt: string; placeholder: string; nudge: string }[];
const DEEP_DAYS = lesson.DEEP_DAYS as DeepDay[];
const DEEP_INSIGHTS = lesson.DEEP_INSIGHTS as Record<string, { type: string; title: string; body: string; source: string }>;
const DEEP_ART = DEEP_DAYS.map((_, index) => `/images/week1-deep-day-${String(index + 1).padStart(2, "0")}.jpg`);
const DEEP_COVER = "/images/week1-deep-plan-cover-v2.png";
const SCRAMBLED_PLACE = [PLACE[4], PLACE[1], PLACE[5], PLACE[2], PLACE[0], PLACE[3]];

const DEFAULT_STATE: AppState = {
  started: false, story: 0, place: [], placeOrder: SCRAMBLED_PLACE, fillAnswers: {}, fillCorrect: {}, connect: 0,
  teachback: ["", "", "", ""], teachbackComplete: false, deepCompleted: {},
  deepNotes: {}, deepReflections: {}, scriptureTools: {}, readingHistory: {}, activityEvents: [],
};
const SESSION_STORAGE_KEY = "ttb-week01-active-study-session-v1";
const LEGACY_STORAGE_KEYS = ["ttb-week01-living-atlas-v2", "ttb-week01-living-atlas-v1"];
const HOME_HERO = "/images/week1-cinematic-master-v4.webp";
const CINEMA_HERO = "/images/week1-hero-cinematic.png";
const CINEMA_CREATION = "/images/week1-story-creation.png";
const ROADMAP_ART = [
  "/images/week1-roadmap-creation.png",
  "/images/week1-roadmap-image-bearers.png",
  "/images/week1-roadmap-rupture.png",
  "/images/week1-eden-exile-couple.jpg",
] as const;
const STORY_ART = [
  CINEMA_CREATION,
  "/images/week1-creation-sea.jpg",
  "/images/week1-eden-couple.jpg",
  "/images/week1-eden-vocation.jpg",
  "/images/week1-eden-temptation.jpg",
  "/images/week1-eden-shame.jpg",
  "/images/week1-eden-exile-couple.jpg",
  CINEMA_HERO,
] as const;
const PROMISE_ART = "/images/week1-hero-reference-v2.png";
const FAMILY_ART = "/images/week1-hero-reference-v3.png";
const MOVEMENTS = [
  {
    eyebrow: "01 · THE SIX DAYS", title: "A world formed—and filled.",
    roadmapTitle: "Six Days: A World Formed and Filled",
    roadmapSummary: "God orders the realms, fills them with life, and rests over a world declared very good.",
    deck: "Genesis opens with movement, sequence and intention. God does not merely make things; He orders a world in which life can flourish.",
    sectionTitle: "Creation is architecture before it is scenery.",
    paragraphs: [
      "During Days 1–3, God forms the realms: light and darkness, sky and sea, dry land and vegetation. During Days 4–6, He fills those realms with the lights, birds and fish, animals and finally humanity.",
      "The repeated rhythm—God speaks, creation responds, God names, and God calls it good—presents a world that is neither accidental nor chaotic. It arrives by His word, under His authority, and according to His purpose.",
      "Day Seven completes the pattern. God rests, blesses the day and makes it holy—not because He is tired, but because the ordered work is complete and His rule is established.",
    ],
    beats: [["DAYS 1–3", "God forms the realms"], ["DAYS 4–6", "God fills what He formed"], ["DAY 7", "God rests, blesses and reigns"]],
    insight: "The first truth Scripture gives us about reality is that the world belongs to God and carries the marks of His intention.",
    refs: ["Genesis 1:3–31"], image: CINEMA_CREATION,
  },
  {
    eyebrow: "02 · THE CROWN", title: "Image-bearers become earth’s regents.",
    roadmapTitle: "The Crown of Creation: Image-Bearers and Regents",
    roadmapSummary: "Humanity receives royal dignity, delegated authority and a vocation beneath God’s rule.",
    deck: "Creation reaches its climax when God makes humanity in His image and entrusts the earth to their care.",
    sectionTitle: "Identity comes before assignment.",
    paragraphs: [
      "On the sixth day, God creates humankind—male and female—in His image and likeness. In the ancient world, an image represented the presence and authority of a king. Genesis gives that royal dignity not to one ruler, but to every human being.",
      "Humanity is commissioned to be fruitful, fill the earth, subdue it and rule over its creatures. This is not permission to exploit creation. It is delegated authority: human beings govern under God, reflecting His wise and life-giving rule.",
      "The garden makes the vocation concrete. Humanity is placed there to work it and keep it. Meaningful work, cultivation and responsibility exist before sin; they belong to the goodness of creation itself.",
    ],
    beats: [["IDENTITY", "Made in God’s image"], ["AUTHORITY", "Royal representatives under God"], ["VOCATION", "Cultivate, guard and extend order"]],
    insight: "To be human is to possess God-given dignity—and to carry God-given responsibility for the world entrusted to us.",
    refs: ["Genesis 1:26–28", "Genesis 2:15–17"], image: "/images/week1-image-bearers.webp",
  },
  {
    eyebrow: "03 · THE RUPTURE", title: "Sin breaks trust—and disorders everything.",
    roadmapTitle: "The Rupture: Sin and What It Changed",
    roadmapSummary: "Distrust becomes rebellion; shame, disorder, mortality and exile enter the human story.",
    deck: "The fall begins when God’s goodness is questioned and human beings reach for the right to define good and evil for themselves.",
    sectionTitle: "The first rebellion produces the first hiding place.",
    paragraphs: [
      "The serpent reframes God’s generous world around one prohibition: “Did God really say?” Distrust comes before disobedience. The humans seize autonomy, taking what God had withheld rather than receiving wisdom on His terms.",
      "The effects are immediate: innocence becomes shame, openness becomes hiding, fellowship becomes blame. Sin ruptures humanity’s relationship with God, with one another, with the self and with the ground from which humanity was formed.",
      "Judgment reaches relationships, labor, pain and mortality. Finally, humanity is sent east of Eden, away from the tree of life. The world remains God’s creation, but life within it is now marked by resistance, fracture and death.",
    ],
    beats: [["DISTRUST", "God’s goodness is questioned"], ["DISORDER", "Shame, hiding and blame enter"], ["EXILE", "Humanity moves east of Eden"]],
    insight: "Sin is more than rule-breaking. It is the rejection of God’s rule—and the unraveling of the order His rule sustained.",
    refs: ["Genesis 3:1–7", "Genesis 3:14–19", "Genesis 3:22–24"], image: "/images/week1-trust-fractures.webp",
  },
  {
    eyebrow: "04 · THE FIRST PROMISE", title: "Hope speaks before Eden closes.",
    roadmapTitle: "The First Promise: Hope Before Eden Closes",
    roadmapSummary: "Inside the judgment, God promises a coming Seed and a victory evil cannot prevent.",
    deck: "Judgment is not the Bible’s final word in Genesis 3. Before humanity leaves the garden, God places a promise inside the sentence.",
    sectionTitle: "The conflict will continue—but evil will not win.",
    paragraphs: [
      "Speaking to the serpent, God announces enmity between the serpent and the woman, and between their offspring. One coming Seed will be wounded, yet He will crush the serpent’s head.",
      "Genesis 3:15 is a beginning, not the completed explanation. It introduces a conflict, a coming descendant and a decisive victory. The rest of Scripture will progressively identify where that promised deliverance leads.",
      "The promise is spoken before the expulsion. Humanity will leave Eden, but not without hope. From this moment onward, the biblical story follows God’s purpose to defeat evil, restore His people and bring creation under His good rule again.",
    ],
    beats: [["CONFLICT", "The serpent will be opposed"], ["SEED", "A coming offspring will enter"], ["VICTORY", "Wounded—yet finally crushing evil"]],
    insight: "Grace appears at the very place rebellion is judged: God Himself promises that the destroyer will not have the last word.",
    refs: ["Genesis 3:15", "1 John 3:8"], image: "/images/week1-atlas-eden.png",
  },
] as const;

const PLACE_CARD_META: Record<string, { kicker: string; title: string; body: string; ref: string; image: string; fallback: string }> = {
  "God creates and calls creation good": {
    kicker: "FORMED + FILLED", title: "A World Called Good",
    body: "Across six ordered days, God forms the realms, fills them with life and declares the whole creation very good.",
    ref: "Genesis 1:3–31", image: "/images/place-01-creation-v24.webp", fallback: "/images/week1-creation-sea.jpg?place=v24",
  },
  "Humanity bears God's image": {
    kicker: "THE CROWN", title: "Royal Image-Bearers",
    body: "Male and female receive God-given dignity and are commissioned to represent His rule within creation.",
    ref: "Genesis 1:26–28", image: "/images/place-02-image-bearers-v24.webp", fallback: "/images/week1-eden-couple.jpg?place=v24",
  },
  "God gives abundance and a boundary": {
    kicker: "GIFT + TRUST", title: "Abundance with a Boundary",
    body: "The garden is generous, work is meaningful and one command makes trusting the Giver visible.",
    ref: "Genesis 2:15–17", image: "/images/place-03-vocation-v24.webp", fallback: "/images/week1-eden-vocation.jpg?place=v24",
  },
  "The serpent questions God's word": {
    kicker: "THE QUESTION", title: "Trust Comes Under Attack",
    body: "The serpent reframes God’s generosity and plants suspicion before the first act of disobedience.",
    ref: "Genesis 3:1–7", image: "/images/place-04-temptation-v24.webp", fallback: "/images/week1-eden-temptation.jpg?place=v24",
  },
  "Rebellion brings shame, blame, and judgment": {
    kicker: "THE RUPTURE", title: "Shame, Blame and Judgment",
    body: "Sin disorders humanity’s relationship with God, one another, the self and the ground beneath them.",
    ref: "Genesis 3:8–13", image: "/images/place-05-rupture-v24.webp", fallback: "/images/week1-eden-shame.jpg?place=v24",
  },
  "Promise appears before humanity is exiled": {
    kicker: "HOPE SPEAKS", title: "Promise Before Exile",
    body: "Before Eden closes, God announces a coming Seed and a victory the serpent cannot prevent.",
    ref: "Genesis 3:15", image: "/images/place-06-promise-v24.webp", fallback: "/images/cinema-night.png?place=v24",
  },
};

function normalize(value: string) {
  return value.toLowerCase().trim().replace(/[.,!?;:'"“”‘’]/g, "").replace(/\s+/g, " ");
}

function annotateScriptureHtml(html: string, annotations: ScriptureSelection[]) {
  if (!annotations.length) return html;
  let offset = 0;
  return (html.match(/<[^>]+>|[^<]+/g) || []).map((token) => {
    if (token.startsWith("<")) return token;
    const start = offset;
    const end = start + token.length;
    offset = end;
    const local = annotations.filter((item) => item.start < end && item.end > start);
    if (!local.length) return token;
    const boundaries = new Set<number>([0, token.length]);
    local.forEach((item) => {
      boundaries.add(Math.max(0, item.start - start));
      boundaries.add(Math.min(token.length, item.end - start));
    });
    const points = [...boundaries].sort((a, b) => a - b);
    return points.slice(0, -1).map((from, index) => {
      const to = points[index + 1];
      const text = token.slice(from, to);
      const active = local.filter((item) => item.start < start + to && item.end > start + from);
      if (!active.length) return text;
      const classes = ["scripture-selection"];
      if (active.some((item) => item.type === "highlight")) classes.push("is-highlighted");
      if (active.some((item) => item.type === "underline")) classes.push("is-underlined");
      return `<span class="${classes.join(" ")}">${text}</span>`;
    }).join("");
  }).join("");
}

function restoreState(saved: unknown): AppState {
  if (!saved || typeof saved !== "object") return DEFAULT_STATE;
  const candidate = saved as Partial<AppState>;
  const validPlace = Array.isArray(candidate.place)
    ? candidate.place.filter((item): item is string => typeof item === "string" && PLACE.includes(item))
    : [];
  const validPlaceOrder = Array.isArray(candidate.placeOrder) && candidate.placeOrder.length === PLACE.length &&
    new Set(candidate.placeOrder).size === PLACE.length && candidate.placeOrder.every((item) => typeof item === "string" && PLACE.includes(item))
    ? candidate.placeOrder as string[] : SCRAMBLED_PLACE;
  const validTeachback = Array.isArray(candidate.teachback)
    ? [...candidate.teachback.filter((item): item is string => typeof item === "string"), "", "", "", ""].slice(0, 4)
    : [...DEFAULT_STATE.teachback];

  return {
    started: Boolean(candidate.started),
    story: typeof candidate.story === "number" && Number.isFinite(candidate.story) ? candidate.story : 0,
    place: validPlace, placeOrder: validPlaceOrder,
    fillAnswers: candidate.fillAnswers && typeof candidate.fillAnswers === "object" ? candidate.fillAnswers : {},
    fillCorrect: candidate.fillCorrect && typeof candidate.fillCorrect === "object" ? candidate.fillCorrect : {},
    connect: typeof candidate.connect === "number" && Number.isFinite(candidate.connect) ? candidate.connect : 0,
    teachback: validTeachback,
    teachbackComplete: Boolean(candidate.teachbackComplete),
    deepCompleted: candidate.deepCompleted && typeof candidate.deepCompleted === "object" ? candidate.deepCompleted : {},
    deepNotes: candidate.deepNotes && typeof candidate.deepNotes === "object" ? candidate.deepNotes : {},
    deepReflections: candidate.deepReflections && typeof candidate.deepReflections === "object" ? candidate.deepReflections : {},
    scriptureTools: candidate.scriptureTools && typeof candidate.scriptureTools === "object" ? candidate.scriptureTools : {},
    readingHistory: candidate.readingHistory && typeof candidate.readingHistory === "object" ? candidate.readingHistory : {},
    activityEvents: Array.isArray(candidate.activityEvents)
      ? candidate.activityEvents.filter((event): event is StudyActivityEvent => Boolean(event && typeof event === "object")).slice(-500)
      : [],
  };
}

export default function WeekOne({ onCourseHome, initialOpenStudy = false }: { onCourseHome?: () => void; initialOpenStudy?: boolean }) {
  const [state, setState] = useState<AppState>(DEFAULT_STATE);
  const [ready, setReady] = useState(false);
  const [screen, setScreen] = useState<Screen>("roadmap");
  const [storyIndex, setStoryIndex] = useState(0);
  const [movementIndex, setMovementIndex] = useState(0);
  const [fillIndex, setFillIndex] = useState(0);
  const [fillHint, setFillHint] = useState(false);
  const [fillMessage, setFillMessage] = useState("");
  const [placeMessage, setPlaceMessage] = useState("");
  const [scriptureRef, setScriptureRef] = useState<string | null>(null);
  const [deepDay, setDeepDay] = useState(0);
  const [deepOpen, setDeepOpen] = useState(false);
  const [insightKey, setInsightKey] = useState<string | null>(null);
  const [teachbackStep, setTeachbackStep] = useState(0);
  const [teachbackSummary, setTeachbackSummary] = useState("");
  const [showModel, setShowModel] = useState(false);
  const [teachbackMessage, setTeachbackMessage] = useState("");
  const [myStudyOpen, setMyStudyOpen] = useState(initialOpenStudy);
  const cloudLoadedFor = useRef<string | null>(null);
  const { user, cloudConfigured, loading: accountLoading, openAccount, loadPortfolio, savePortfolio, submitQuestion } = useStudyAccount();

  function makeActivity(type: StudyActivityType, reference?: string, detail?: StudyActivityEvent["detail"]): StudyActivityEvent {
    return {
      id: crypto.randomUUID?.() || `${Date.now()}-${Math.random()}`,
      type,
      createdAt: new Date().toISOString(),
      reference,
      detail,
    };
  }

  function keepActivity(events: StudyActivityEvent[], event: StudyActivityEvent) {
    return [...events, event].slice(-500);
  }

  useEffect(() => {
    const loadSavedProgress = window.setTimeout(() => {
      try {
        const session = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_KEY) || "null");
        const savedPersonal = JSON.parse(localStorage.getItem(PERSONAL_STORAGE_KEY) || "null");
        const legacy = JSON.parse(LEGACY_STORAGE_KEYS.map((key) => localStorage.getItem(key)).find(Boolean) || "null");
        const personal = savedPersonal && typeof savedPersonal === "object" ? savedPersonal : legacy;
        const personalRecord = personal && typeof personal === "object" ? personal as Partial<AppState> : {};
        setState(restoreState({
          ...(session && typeof session === "object" ? session : {}),
          deepCompleted: personalRecord.deepCompleted || {},
          deepNotes: personalRecord.deepNotes || {},
          deepReflections: personalRecord.deepReflections || {},
          scriptureTools: personalRecord.scriptureTools || {},
          readingHistory: personalRecord.readingHistory || {},
          activityEvents: personalRecord.activityEvents || [],
        }));
        LEGACY_STORAGE_KEYS.forEach((key) => localStorage.removeItem(key));
      } catch { /* malformed local progress must never block the lesson */ }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(loadSavedProgress);
  }, []);
  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify({
        started: state.started,
        story: state.story,
        place: state.place,
        placeOrder: state.placeOrder,
        fillAnswers: state.fillAnswers,
        fillCorrect: state.fillCorrect,
        connect: state.connect,
        teachback: state.teachback,
        teachbackComplete: state.teachbackComplete,
      }));
      localStorage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify({
        deepCompleted: state.deepCompleted,
        deepNotes: state.deepNotes,
        deepReflections: state.deepReflections,
        scriptureTools: state.scriptureTools,
        readingHistory: state.readingHistory,
        activityEvents: state.activityEvents,
      }));
      announceStudyUpdate();
    } catch { /* storage restrictions must never block the lesson */ }
  }, [ready, state]);

  useEffect(() => {
    if (!ready || !user || cloudLoadedFor.current === user.id) return;
    let cancelled = false;
    loadPortfolio().then((cloud) => {
      if (cancelled) return;
      setState((current) => {
        if (!cloud) return current;
        const merged = mergePortfolios(cloud, current);
        return { ...current, ...merged };
      });
      cloudLoadedFor.current = user.id;
    }).catch(() => { cloudLoadedFor.current = user.id; });
    return () => { cancelled = true; };
  }, [ready, user, loadPortfolio]);

  useEffect(() => {
    if (!ready || !user || cloudLoadedFor.current !== user.id) return;
    const portfolio: StudyPortfolio = {
      deepCompleted: state.deepCompleted,
      deepNotes: state.deepNotes,
      deepReflections: state.deepReflections,
      scriptureTools: state.scriptureTools,
      readingHistory: state.readingHistory,
      activityEvents: state.activityEvents,
    };
    const timer = window.setTimeout(() => savePortfolio(portfolio).catch(() => undefined), 700);
    return () => window.clearTimeout(timer);
  }, [ready, user, state.deepCompleted, state.deepNotes, state.deepReflections, state.scriptureTools, state.readingHistory, state.activityEvents, savePortfolio]);

  useEffect(() => {
    if (!ready) return;
    const timer = window.setTimeout(() => {
      try {
        const target = JSON.parse(sessionStorage.getItem(WEEK_ONE_RESUME_KEY) || "null") as ResumeTarget | null;
        if (!target?.screen) return;
        sessionStorage.removeItem(WEEK_ONE_RESUME_KEY);
        if (target.screen === "scripture") {
          openScripture(target.title);
          return;
        }
        const allowed: Screen[] = ["story", "place", "fill", "connect", "unlock", "deep", "complete"];
        if (!allowed.includes(target.screen as Screen)) return;
        if (target.screen === "story" && typeof target.index === "number") setStoryIndex(Math.max(0, Math.min(STORY.length - 1, target.index)));
        if (target.screen === "fill" && typeof target.index === "number") setFillIndex(Math.max(0, Math.min(FILL.length - 1, target.index)));
        if (target.screen === "deep" && typeof target.index === "number") setDeepDay(Math.max(0, Math.min(DEEP_DAYS.length - 1, target.index)));
        navigate(target.screen as Screen);
      } catch {
        sessionStorage.removeItem(WEEK_ONE_RESUME_KEY);
      }
    }, 0);
    return () => window.clearTimeout(timer);
  // The resume target is intentionally consumed once, after saved course state has loaded.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ready]);

  const progress = useMemo(() => {
    const story = state.started ? ((Math.max(state.story, 0) + 1) / STORY.length) * 20 : 0;
    const place = (state.place.length / PLACE.length) * 20;
    const fill = (Object.values(state.fillCorrect).filter(Boolean).length / FILL.length) * 20;
    const connect = (Math.min(state.connect, 4) / 4) * 20;
    const unlock = state.teachbackComplete ? 20 : 0;
    return Math.min(100, Math.round(story + place + fill + connect + unlock));
  }, [state]);

  function navigate(next: Screen) {
    setScreen(next);
    requestAnimationFrame(() => document.querySelector<HTMLElement>(".screen-scroll")?.scrollTo({ top: 0 }));
  }
  function beginJourney() {
    setState((current) => ({ ...current, started: true }));
    navigate("roadmap");
  }
  function openScripture(ref: string) {
    if (!SCRIPTURES[ref]) return;
    const now = new Date().toISOString();
    setState((current) => {
      const prior = current.readingHistory[ref];
      return {
        ...current,
        readingHistory: {
          ...current.readingHistory,
          [ref]: {
            reference: ref,
            opens: (prior?.opens || 0) + 1,
            reads: prior?.reads || 0,
            firstOpenedAt: prior?.firstOpenedAt || now,
            lastOpenedAt: now,
            completedAt: prior?.completedAt,
            lastReadAt: prior?.lastReadAt,
            verseCount: prior?.verseCount,
          },
        },
        activityEvents: keepActivity(current.activityEvents, makeActivity("scripture_opened", ref)),
      };
    });
    setScriptureRef(ref);
  }

  function markScriptureRead(ref: string, verseCount: number) {
    const now = new Date().toISOString();
    setState((current) => {
      const prior = current.readingHistory[ref];
      const alreadyReadThisOpen = prior?.lastReadAt && prior.lastOpenedAt && prior.lastReadAt >= prior.lastOpenedAt;
      if (alreadyReadThisOpen) return current;
      return {
        ...current,
        readingHistory: {
          ...current.readingHistory,
          [ref]: {
            reference: ref,
            opens: Math.max(1, prior?.opens || 0),
            reads: (prior?.reads || 0) + 1,
            firstOpenedAt: prior?.firstOpenedAt || now,
            lastOpenedAt: prior?.lastOpenedAt || now,
            completedAt: prior?.completedAt || now,
            lastReadAt: now,
            verseCount,
          },
        },
        activityEvents: keepActivity(current.activityEvents, makeActivity("scripture_read", ref, { verseCount })),
      };
    });
  }
  function selectStory(index: number) {
    setStoryIndex(index);
    setState((current) => ({ ...current, started: true, story: Math.max(current.story, index) }));
  }
  function updatePlaceOrder(order: string[]) {
    setState((current) => ({ ...current, placeOrder: order, place: [] }));
    setPlaceMessage("");
  }
  function checkPlaceOrder() {
    const correct = state.placeOrder.every((item, index) => item === PLACE[index]);
    if (correct) {
      setState((current) => ({ ...current, place: [...PLACE],
        activityEvents: keepActivity(current.activityEvents, makeActivity("place_completed")) }));
      setPlaceMessage("You rebuilt the beginning. All six movements are in their biblical order.");
    } else {
      setState((current) => ({ ...current, place: [] }));
      setPlaceMessage("Not quite yet. Re-read the card summaries, move the sequence, and check it again.");
    }
  }
  function submitFill() {
    const item = FILL[fillIndex];
    const answer = state.fillAnswers[String(fillIndex)] || "";
    const correct = [item.answer, ...item.accepted].map(normalize).includes(normalize(answer));
    if (correct) {
      setState((current) => ({ ...current, fillCorrect: { ...current.fillCorrect, [fillIndex]: true },
        activityEvents: keepActivity(current.activityEvents, makeActivity("fill_attempt", undefined, { question: fillIndex + 1, correct: true })) }));
      setFillHint(false);
      setFillMessage(item.why);
    } else {
      setState((current) => ({ ...current,
        activityEvents: keepActivity(current.activityEvents, makeActivity("fill_attempt", undefined, { question: fillIndex + 1, correct: false })) }));
      setFillMessage("Read the sentence once more. Use the hint if you need it.");
    }
  }
  function saveTeachback() {
    const answer = state.teachback[teachbackStep]?.trim();
    if (!answer || answer.length < 18) {
      setTeachbackMessage("Add one clear sentence before moving on. Aim for at least a complete thought.");
      return;
    }
    setTeachbackMessage("");
    if (teachbackStep < 3) setTeachbackStep((step) => step + 1);
    else setTeachbackSummary(state.teachback.join(" "));
  }
  function completeTeachback() {
    if (!state.teachback.every((answer) => answer.trim().length >= 18)) {
      setTeachbackMessage("Return to any unfinished step and add one complete thought.");
      return;
    }
    if (teachbackSummary.trim().length < 80) {
      setTeachbackMessage("Bring the four movements together in a short paragraph before unlocking the lesson.");
      return;
    }
    setTeachbackMessage("");
    setState((current) => ({ ...current, teachbackComplete: true,
      activityEvents: keepActivity(current.activityEvents, makeActivity("unlock_completed")) }));
  }
  function updateScriptureTool(key: "highlight" | "underline" | "bookmark") {
    if (!scriptureRef) return;
    setState((current) => {
      const nextValue = !current.scriptureTools[scriptureRef]?.[key];
      return { ...current, scriptureTools: { ...current.scriptureTools,
        [scriptureRef]: { ...current.scriptureTools[scriptureRef], [key]: nextValue } },
        activityEvents: key === "bookmark" && nextValue
          ? keepActivity(current.activityEvents, makeActivity("bookmark_saved", scriptureRef))
          : current.activityEvents };
    });
  }
  function updateScriptureText(key: "notes" | "question", value: string) {
    if (!scriptureRef) return;
    setState((current) => {
      const wasEmpty = !current.scriptureTools[scriptureRef]?.[key]?.trim();
      const eventType = key === "notes" ? "note_written" : "question_written";
      return { ...current, scriptureTools: { ...current.scriptureTools,
        [scriptureRef]: { ...current.scriptureTools[scriptureRef], [key]: value } },
        activityEvents: wasEmpty && value.trim()
          ? keepActivity(current.activityEvents, makeActivity(eventType, scriptureRef))
          : current.activityEvents };
    });
  }
  function addScriptureSelection(selection: ScriptureSelection) {
    if (!scriptureRef) return;
    setState((current) => ({ ...current, scriptureTools: { ...current.scriptureTools,
      [scriptureRef]: { ...current.scriptureTools[scriptureRef], selections: [...(current.scriptureTools[scriptureRef]?.selections || []), selection] } },
      activityEvents: keepActivity(current.activityEvents, makeActivity(selection.type === "highlight" ? "highlight_created" : "underline_created", scriptureRef)) }));
  }
  function completeDeepDay() {
    if ((state.deepReflections[String(deepDay)] || "").trim().length < 15) return;
    setState((current) => ({ ...current, deepCompleted: { ...current.deepCompleted, [deepDay]: true },
      activityEvents: keepActivity(current.activityEvents, makeActivity("devotional_completed", undefined, { day: deepDay + 1 })) }));
    setDeepOpen(false);
    if (deepDay < 6) setDeepDay((day) => day + 1);
    else navigate("complete");
  }

  const common = { navigate, openScripture };
  return (
    <main className="product-shell">
      <DesktopRail screen={screen} progress={progress} navigate={navigate} />
      <section className="phone-canvas" aria-label="Through the Bible Week 1">
        <button className={`my-study-trigger ${["home", "movement", "story", "promise", "family", "complete"].includes(screen) ? "on-dark" : ""}`} onClick={() => setMyStudyOpen(true)} aria-label="Open My Study"><NotebookPen />{user && <span />}</button>
        {screen === "home" && <HomeScreen beginJourney={beginJourney} onCourseHome={onCourseHome} />}
        {screen === "roadmap" && <RoadmapScreen navigate={navigate} openMovement={(index) => { setMovementIndex(index); navigate("movement"); }} />}
        {screen === "movement" && <MovementScreen index={movementIndex} setIndex={setMovementIndex} {...common} />}
        {screen === "story" && <StoryScreen index={storyIndex} selectStory={selectStory} {...common} />}
        {screen === "promise" && <PromiseScreen {...common} />}
        {screen === "family" && <FamilyScreen {...common} />}
        {screen === "placeIntro" && <ToolIntroScreen tool="place" state={state} navigate={navigate} />}
        {screen === "fillIntro" && <ToolIntroScreen tool="fill" state={state} navigate={navigate} />}
        {screen === "connectIntro" && <ToolIntroScreen tool="connect" state={state} navigate={navigate} />}
        {screen === "unlockIntro" && <ToolIntroScreen tool="unlock" state={state} navigate={navigate} />}
        {screen === "place" && <PlaceScreen order={state.placeOrder} completed={state.place.length === PLACE.length} message={placeMessage}
          setOrder={updatePlaceOrder} checkOrder={checkPlaceOrder}
          reset={() => { setState((current) => ({ ...current, place: [], placeOrder: SCRAMBLED_PLACE })); setPlaceMessage(""); }} {...common} />}
        {screen === "fill" && <FillScreen state={state} index={fillIndex} hint={fillHint} message={fillMessage}
          setIndex={(index) => { setFillIndex(index); setFillHint(false); setFillMessage(""); }} setHint={setFillHint}
          setAnswer={(value) => setState((current) => ({ ...current, fillAnswers: { ...current.fillAnswers, [fillIndex]: value } }))}
          clearMessage={() => setFillMessage("")} completeRevealed={() => {
            setState((current) => ({ ...current, fillCorrect: { ...current.fillCorrect, [fillIndex]: true } }));
            setFillMessage("");
          }} submit={submitFill} navigate={navigate} />}
        {screen === "connect" && <ConnectScreen step={state.connect}
          advance={() => setState((current) => { const next = Math.min(4, current.connect + 1); return { ...current, connect: next,
            activityEvents: next === 4 && current.connect < 4 ? keepActivity(current.activityEvents, makeActivity("connect_completed")) : current.activityEvents }; })} {...common} />}
        {screen === "unlock" && <UnlockScreen state={state} step={teachbackStep} summary={teachbackSummary}
          showModel={showModel} message={teachbackMessage} setStep={(nextStep) => { setTeachbackStep(nextStep); setTeachbackMessage(""); }}
          setSummary={(value) => { setTeachbackSummary(value); setTeachbackMessage(""); }} setShowModel={setShowModel}
          setAnswer={(value) => { setTeachbackMessage(""); setState((current) => { const answers = [...current.teachback]; answers[teachbackStep] = value; return { ...current, teachback: answers }; }); }}
          save={saveTeachback} complete={completeTeachback} navigate={navigate} />}
        {screen === "deep" && <DeepStudyScreen completed={state.deepCompleted}
          openDay={(index) => { setDeepDay(index); setDeepOpen(true); }} navigate={navigate} />}
        {screen === "complete" && <WeekCompleteScreen state={state} navigate={navigate} />}

        <ScriptureReader key={scriptureRef || "closed-scripture"} reference={scriptureRef} scripture={scriptureRef ? SCRIPTURES[scriptureRef] : null}
          mark={scriptureRef ? state.scriptureTools[scriptureRef] || {} : {}} onClose={() => setScriptureRef(null)}
          onTool={updateScriptureTool} onText={updateScriptureText} onSelection={addScriptureSelection}
          reading={scriptureRef ? state.readingHistory[scriptureRef] : undefined}
          onRead={markScriptureRead} onNavigate={openScripture} />
        <DeepReader key={`deep-reader-${deepDay}`} open={deepOpen} dayIndex={deepDay} day={DEEP_DAYS[deepDay]}
          completed={Boolean(state.deepCompleted[deepDay])} reflection={state.deepReflections[deepDay] || ""}
          notes={state.deepNotes[deepDay] || ""} onClose={() => setDeepOpen(false)} onScripture={openScripture}
          onInsight={setInsightKey} onReflection={(value) => setState((current) => ({ ...current, deepReflections: { ...current.deepReflections, [deepDay]: value } }))}
          onNotes={(value) => setState((current) => ({ ...current, deepNotes: { ...current.deepNotes, [deepDay]: value } }))}
          onComplete={completeDeepDay} />
        <MyStudySheet open={myStudyOpen} onOpenChange={setMyStudyOpen} state={state} userEmail={user?.email || null}
          cloudConfigured={cloudConfigured} accountLoading={accountLoading} openAccount={openAccount}
          openScripture={(ref) => { setMyStudyOpen(false); openScripture(ref); }}
          openDay={(index) => { setMyStudyOpen(false); setDeepDay(index); setDeepOpen(true); }} submitQuestion={submitQuestion} />
        <Sheet open={Boolean(insightKey)} onOpenChange={(open) => !open && setInsightKey(null)}>
          <SheetContent side="bottom" className="insight-sheet">
            <SheetHeader><MicroLabel>{insightKey ? DEEP_INSIGHTS[insightKey]?.type : "STUDY NOTE"}</MicroLabel>
              <SheetTitle>{insightKey && DEEP_INSIGHTS[insightKey]?.title}</SheetTitle>
              <SheetDescription>{insightKey && DEEP_INSIGHTS[insightKey]?.source}</SheetDescription></SheetHeader>
            <p>{insightKey && DEEP_INSIGHTS[insightKey]?.body}</p>
          </SheetContent>
        </Sheet>
      </section>
    </main>
  );
}

function HomeScreen({ beginJourney, onCourseHome }: { beginJourney: () => void; onCourseHome?: () => void }) {
  return (
    <section className="app-screen cinema-screen home-screen" style={{ "--cinema-image": `url('${HOME_HERO}')` } as CSSProperties}>
      <CinemaHeader onHome={onCourseHome} />
      <div className="home-content">
        <div className="home-copy">
          <h1><span>Creation, Rupture &amp;</span><span>the First Promise</span></h1>
          <p>A good world is formed. Trust fractures. Hope appears before Eden closes.</p></div>
        <div className="home-spacer" />
        <button className="journey-button" onClick={beginJourney}>Begin journey</button>
      </div>
    </section>
  );
}

function RoadmapScreen({ navigate, openMovement }: { navigate: (screen: Screen) => void; openMovement: (index: number) => void }) {
  const chapterThreads = [
    "FORM · FILL · GOOD",
    "IMAGE · VOCATION · BOUNDARY",
    "QUESTION · REBELLION · JUDGMENT",
    "SEED · HOPE · EXILE",
  ];
  return (
    <section className="app-screen atlas-screen roadmap-screen">
      <AtlasHeader label="THROUGH THE BIBLE · WEEK 01" onBack={() => navigate("home")} />
      <div className="screen-scroll roadmap-body">
        <header className="roadmap-intro">
          <div className="roadmap-intro-top"><p>WEEK 01 · GENESIS 1–3</p><em>18 MIN · VISUAL STORY</em></div>
          <h1>Follow the story<br />as it changes.</h1>
          <span>Four decisive movements establish the world, the human calling, the rupture and the promise that carries the Bible forward.</span>
          <div className="roadmap-thread-map" aria-label="Week 1 story progression">
            {MOVEMENTS.map((movement, index) => <button key={movement.roadmapTitle} onClick={() => openMovement(index)}><i>{String(index + 1).padStart(2, "0")}</i><b>{["FORMED", "CROWNED", "RUPTURED", "PROMISED"][index]}</b></button>)}
          </div>
          <small>CHOOSE A CHAPTER · EACH OPENS AS A VISUAL STORY</small>
        </header>
        <div className="roadmap-cinema-list">{MOVEMENTS.map((movement, index) => (
          <button
            className={`roadmap-cinema-card roadmap-chapter-${index + 1}`}
            key={movement.roadmapTitle}
            onClick={() => openMovement(index)}
            aria-label={`Open chapter ${index + 1}: ${movement.roadmapTitle}`}
          >
            <span className="roadmap-image-frame"><img src={ROADMAP_ART[index]} alt="" aria-hidden="true" /><span className="roadmap-cinema-shade" /></span>
            <span className="roadmap-cinema-copy">
              <span className="roadmap-cinema-meta">CHAPTER {String(index + 1).padStart(2, "0")} · OPEN STORY</span>
              <strong>{movement.roadmapTitle}</strong>
              <span className="roadmap-cinema-summary">{movement.roadmapSummary}</span>
              <span className="roadmap-cinema-refs">{movement.refs.join(" · ")}</span>
              <span className="roadmap-cinema-thread">{chapterThreads[index]}</span>
              <span className="roadmap-cinema-enter"><b>ENTER CHAPTER</b><ArrowRight /></span>
            </span>
          </button>
        ))}</div>
        <footer className="roadmap-finale">
          <p>Four chapters. One opening movement.</p>
          <button onClick={() => openMovement(0)}><span><small>START AT THE BEGINNING</small><strong>Enter the visual story</strong></span><ArrowRight /></button>
        </footer>
      </div>
    </section>
  );
}

function MovementScreen({ index, setIndex, navigate, openScripture }: { index: number; setIndex: (index: number) => void; navigate: (screen: Screen) => void; openScripture: (ref: string) => void }) {
  const movement = MOVEMENTS[index];
  const isLast = index === MOVEMENTS.length - 1;
  useEffect(() => {
    document.querySelector<HTMLElement>(".movement-scroll")?.scrollTo({ top: 0 });
  }, [index]);

  function continueStory() {
    if (isLast) navigate("placeIntro");
    else setIndex(index + 1);
  }

  function scrollIntoStory() {
    document.querySelector<HTMLElement>(".movement-lesson")?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="app-screen cinema-screen movement-screen" style={{ "--cinema-image": `url('${movement.image}')` } as CSSProperties}>
      <header className="movement-header"><button aria-label="Back to roadmap" onClick={() => navigate("roadmap")}><ArrowLeft /></button><b>VISUAL STORY · {index + 1} / {MOVEMENTS.length}</b><span className="header-spacer" aria-hidden="true" /></header>
      <div className="movement-scroll">
        <div className="movement-hero-block">
          <div className="movement-copy"><span>{movement.eyebrow}</span><h1>{movement.title}</h1><p>{movement.deck}</p></div>
          <button className="movement-scroll-cue" onClick={scrollIntoStory}><span>Continue into the story</span><ChevronDown /></button>
        </div>
        <article className="movement-lesson">
          <header className="movement-lesson-header">
            <span>0{index + 1}</span>
            <div><small>THE STORY</small><b>{movement.eyebrow.replace(/^\d+ · /, "")}</b></div>
          </header>
          <h2>{movement.sectionTitle}</h2>
          <div className="movement-paragraphs">{movement.paragraphs.map((paragraph, paragraphIndex) => (
            <p className={paragraphIndex === 0 ? "movement-lede" : ""} key={paragraph}>{paragraph}</p>
          ))}</div>

          <section className="movement-beats" aria-label="Key movements">
            <div className="movement-section-label"><span>FOLLOW THE MOVEMENT</span><small>{movement.beats.length} MOMENTS</small></div>
            {movement.beats.map(([label, description], beatIndex) => (
              <article key={label}><span>0{beatIndex + 1}</span><div><small>{label}</small><strong>{description}</strong></div></article>
            ))}
          </section>

          <blockquote className="movement-insight"><small>WHY IT MATTERS</small><p>{movement.insight}</p></blockquote>

          <section className="movement-reading">
            <div><small>READ IT IN CONTEXT</small><p>Open the passage without leaving the lesson.</p></div>
            {movement.refs.map((ref) => <button key={ref} onClick={() => openScripture(ref)}><BookOpen /><span>{ref}</span><ChevronRight /></button>)}
          </section>

          <button className="movement-next" onClick={continueStory}>
            <span><small>{isLast ? "STORY COMPLETE" : `UP NEXT · CHAPTER 0${index + 2}`}</small><strong>{isLast ? "Build what you learned" : MOVEMENTS[index + 1].roadmapTitle}</strong></span><ArrowRight />
          </button>
        </article>
      </div>
    </section>
  );
}

function StoryScreen({ index, selectStory, navigate, openScripture }: { index: number; selectStory: (index: number) => void; navigate: (screen: Screen) => void; openScripture: (ref: string) => void }) {
  const story = STORY[index];
  return (
    <section className="app-screen cinema-screen story-screen" style={{ "--cinema-image": `url('${STORY_ART[index]}')` } as CSSProperties}>
      <CinemaHeader onBack={() => navigate("roadmap")} label="STORY" />
      <div className="story-progress" aria-label={`Story movement ${index + 1} of 8`}>{STORY.map((_, itemIndex) => (
        <button key={itemIndex} aria-label={`Open movement ${itemIndex + 1}`} className={itemIndex <= index ? "active" : ""} onClick={() => selectStory(itemIndex)} />
      ))}</div>
      <article className="story-content"><MicroLabel light>{story[0]} · {String(index + 1).padStart(2, "0")} OF 08</MicroLabel>
        <h1>{story[1]}</h1><p>{story[2][0]}</p><blockquote>{story[3]}</blockquote>
        <div className="story-actions"><button className="glass-action" onClick={() => openScripture(story[4])}><BookOpen /> {story[4]}</button>
          <button className="story-next" onClick={() => index < STORY.length - 1 ? selectStory(index + 1) : navigate("placeIntro")}>
            {index < STORY.length - 1 ? "Next movement" : "Open the atlas"} <ArrowRight /></button></div>
      </article>
      <CoreDock active="story" navigate={navigate} />
    </section>
  );
}

function PromiseScreen({ navigate, openScripture }: { navigate: (screen: Screen) => void; openScripture: (ref: string) => void }) {
  return (
    <section className="app-screen atlas-screen"><AtlasHeader label="PROMISE" onBack={() => navigate("home")} />
      <div className="screen-scroll atlas-body detail-body"><MicroLabel>GENESIS 3:15</MicroLabel>
        <h1>Hope appears before Eden closes.</h1><p className="screen-lede">Judgment is real, but it is not the final word. Scripture introduces a coming Seed.</p>
        <figure className="atlas-visual promise-visual"><img src={PROMISE_ART} alt="A luminous path moving toward a distant promise" />
          <div className="promise-marker promise-marker-one">Conflict</div><div className="promise-marker promise-marker-two">Seed</div><div className="promise-marker promise-marker-three">Hope</div></figure>
        <WhyCard>Genesis 3:15 begins a thread; it does not finish the explanation. The course follows that promise through later Scripture without forcing the first verse to say more than it says.</WhyCard>
        <button className="primary-action" onClick={() => openScripture("Genesis 3:15")}><BookOpen /> Read Genesis 3:15 <ArrowRight /></button>
        <button className="text-action" onClick={() => navigate("connectIntro")}>Trace the promise toward Christ <ArrowRight /></button>
      </div><CoreDock active="promise" navigate={navigate} />
    </section>
  );
}

function FamilyScreen({ navigate, openScripture }: { navigate: (screen: Screen) => void; openScripture: (ref: string) => void }) {
  const cards = [
    ["IDENTITY", "Made in God’s image", "Human worth begins with the Creator, not with achievement."],
    ["DIGNITY", "Male and female", "Both receive the image and the blessing before the Fall."],
    ["VOCATION", "Fill, subdue, steward", "Humanity is entrusted with meaningful responsibility in God’s world."],
  ];
  return (
    <section className="app-screen atlas-screen"><AtlasHeader label="FAMILY" onBack={() => navigate("home")} />
      <div className="screen-scroll atlas-body family-body"><MicroLabel>HUMANITY · GENESIS 1:26–28</MicroLabel>
        <h1>Identity comes before brokenness.</h1><p className="screen-lede">Genesis first tells us what human beings were created to be—not simply what went wrong.</p>
        <div className="family-portrait" style={{ backgroundImage: `url('${FAMILY_ART}')` }}><span>IMAGE BEARERS</span><strong>Dignity. Purpose. Responsibility.</strong></div>
        <div className="principle-list">{cards.map(([label, title, body], index) => (
          <article key={label}><span>{String(index + 1).padStart(2, "0")}</span><div><small>{label}</small><h2>{title}</h2><p>{body}</p></div></article>
        ))}</div>
        <button className="primary-action" onClick={() => openScripture("Genesis 1:26–28")}><BookOpen /> Read Genesis 1:26–28 <ArrowRight /></button>
      </div><CoreDock active="family" navigate={navigate} />
    </section>
  );
}

function ToolIntroScreen({ tool, state, navigate }: { tool: ToolName; state: AppState; navigate: (screen: Screen) => void }) {
  const configs: Record<ToolName, {
    label: string; eyebrow: string; title: string; lede: string; image: string;
    icon: ReactNode; steps: [string, string][]; progress: string; destination: Screen; cta: string;
  }> = {
    place: {
      label: "PLACE · STORY ORDER", eyebrow: "REBUILD THE NARRATIVE",
      title: "Can you put the beginning back in order?",
      lede: "Six cinematic cards hold the movement of Genesis 1–3. Reconstruct the sequence from goodness to promise.",
      image: "/images/week1-hero-reference-v3-hd.png", icon: <MapPin />,
      steps: [["Press", "Hold the grip on any story card."], ["Move", "Drag it above or below the other movements."], ["Check", "Test the full sequence when all six are in view."]],
      progress: `${state.place.length} of ${PLACE.length} placed`, destination: "place", cta: "Enter the card studio",
    },
    fill: {
      label: "FILL · RETRIEVAL", eyebrow: "RECALL THE ESSENTIALS",
      title: "What can you retrieve without reopening the page?",
      lede: "Ten focused prompts test whether the central truths of Creation, the Fall and the first promise have taken root.",
      image: "/images/source-01.jpg", icon: <Minus />,
      steps: [["Read", "Take one carefully written prompt at a time."], ["Recall", "Complete the truth in your own memory."], ["Learn", "See why the answer matters in the biblical story."]],
      progress: `${Object.values(state.fillCorrect).filter(Boolean).length} of ${FILL.length} mastered`, destination: "fill", cta: "Begin retrieval",
    },
    connect: {
      label: "CONNECT · SCRIPTURE", eyebrow: "TRACE THE THREADS",
      title: "Watch Genesis reach forward through Scripture.",
      lede: "Follow the Creator and promised Seed threads from the opening chapters toward the person and work of Christ.",
      image: CINEMA_HERO, icon: <Waypoints />,
      steps: [["Open", "Begin with the first pulsing Scripture node."], ["Observe", "Read the discovery before moving forward."], ["Watch", "See the living line converge on Christ and carry the Seed thread ahead."]],
      progress: `${Math.min(state.connect, 4)} of 4 connections`, destination: "connect", cta: "Trace the connections",
    },
    unlock: {
      label: "UNLOCK · TEACH BACK", eyebrow: "OWN THE UNDERSTANDING",
      title: "Can you tell the beginning without the workbook?",
      lede: "Turn recognition into understanding by explaining what was good, what broke and what hope God promised.",
      image: "/images/week1-east-of-eden.webp", icon: <LockKeyhole />,
      steps: [["Frame", "Answer four short prompts in sequence."], ["Explain", "Join your answers into one clear story."], ["Own", "Compare, refine and complete your teach-back."]],
      progress: state.teachbackComplete ? "Understanding unlocked" : `${state.teachback.filter((answer) => answer.trim().length >= 18).length} of 4 responses`, destination: "unlock", cta: "Begin the teach-back",
    },
  };
  const config = configs[tool];

  return (
    <section className="app-screen atlas-screen tool-intro-screen">
      <AtlasHeader label={`${config.label} · WEEK 01`} onBack={() => navigate("roadmap")} />
      <div className="screen-scroll tool-intro-scroll">
        <figure className="tool-intro-hero"><img src={config.image} alt="" /><span className="tool-intro-shade" />
          <div className="tool-intro-copy"><span>{config.eyebrow}</span><h1>{config.title}</h1><p>{config.lede}</p></div>
        </figure>
        <section className="tool-intro-guide"><header><span>{config.icon}</span><div><small>HOW THIS SECTION WORKS</small><strong>One focused experience.</strong></div></header>
          <ol>{config.steps.map(([title, body], index) => <li key={title}><b>{index + 1}</b><span><strong>{title}</strong><small>{body}</small></span></li>)}</ol>
          <div className="tool-intro-status"><span><small>YOUR PROGRESS</small><strong>{config.progress}</strong></span><i /></div>
          <button className="tool-intro-action" onClick={() => navigate(config.destination)}>{config.cta}<ArrowRight /></button>
        </section>
      </div>
      <ToolDock active={tool} navigate={navigate} />
    </section>
  );
}

function PlaceScreen({ order, completed, message, setOrder, checkOrder, reset, navigate, openScripture }: {
  order: string[]; completed: boolean; message: string; setOrder: (order: string[]) => void; checkOrder: () => void; reset: () => void;
  navigate: (screen: Screen) => void; openScripture: (ref: string) => void;
}) {
  const dragging = useRef<string | null>(null);
  const [draggingItem, setDraggingItem] = useState<string | null>(null);
  const feedbackTone = completed ? "success" : message ? "error" : "";

  function moveItem(item: string, target: string) {
    if (item === target) return;
    const next = [...order];
    const from = next.indexOf(item);
    const to = next.indexOf(target);
    next.splice(from, 1);
    next.splice(to, 0, item);
    setOrder(next);
  }

  function onDragMove(event: React.PointerEvent<HTMLButtonElement>) {
    const active = dragging.current;
    if (!active) return;
    const target = document.elementFromPoint(event.clientX, event.clientY)?.closest<HTMLElement>("[data-place-item]")?.dataset.placeItem;
    if (target) moveItem(active, target);
  }

  function stopDragging() {
    dragging.current = null;
    setDraggingItem(null);
  }

  return (
    <section className="app-screen atlas-screen place-build-screen"><AtlasHeader label="PLACE · BUILD THE STORY" onBack={() => navigate("placeIntro")} />
      <div className="screen-scroll atlas-body tool-body place-build-body">
        <div className="place-title-row"><div><MicroLabel>RECALL MODE · GENESIS 1–3</MicroLabel><h1>Put the beginning in order.</h1></div><div className="place-count"><strong>6</strong><span>CARDS<br />TO MOVE</span></div></div>
        <p className="screen-lede">Press a grip and move the cards with your hand. When the story reads correctly from top to bottom, check the order.</p>
        <div className="place-sort-guide"><GripVertical /><span><strong>HOLD + DRAG</strong><small>Move any card above or below another.</small></span></div>
        {message && <div className={`place-feedback ${feedbackTone}`}><span>{completed ? <Check /> : <CircleHelp />}</span><p>{message}</p></div>}
        <div className={`place-sort-list ${completed ? "complete" : ""}`} aria-label="Sortable story cards">{order.map((item, index) => {
          const card = PLACE_CARD_META[item];
          return <article key={item} data-place-item={item} className={draggingItem === item ? "dragging" : ""}>
            <span className="place-sort-number">{index + 1}</span><img className="place-card-art" src={card.image} data-fallback={card.fallback} alt={`${card.title} cinematic artwork`} loading="eager" decoding="async"
              onError={(event) => { const image = event.currentTarget; const fallback = image.dataset.fallback; if (fallback && !image.dataset.fallbackUsed) { image.dataset.fallbackUsed = "true"; image.src = fallback; } }} />
            <button className="place-sort-copy" onClick={() => openScripture(card.ref)}><small>{card.kicker} · {card.ref}</small><strong>{card.title}</strong><span>{card.body}</span></button>
            <button className="place-grip" aria-label={`Move ${card.title}`} onPointerDown={(event) => { dragging.current = item; setDraggingItem(item); event.currentTarget.setPointerCapture(event.pointerId); }}
              onPointerMove={onDragMove} onPointerUp={stopDragging} onPointerCancel={stopDragging}><GripVertical /></button>
          </article>;
        })}</div>
        <div className="place-sort-actions"><button className="primary-action" onClick={checkOrder}>{completed ? "Order confirmed" : "Check order"}<Check /></button>
          <button className="text-action" onClick={reset}><RotateCcw /> Scramble again</button></div>
        {completed && <article className="place-complete-card"><span><Check /></span><small>STORY ORDER RESTORED</small><h2>Goodness comes before rupture. Promise appears before exile.</h2>
          <p>The sequence matters: Scripture begins with God’s good design, tells the truth about what sin changed, and introduces hope before humanity leaves Eden.</p>
          <button onClick={() => navigate("fillIntro")}>Continue to Fill <ArrowRight /></button></article>}
      </div><ToolDock active="place" navigate={navigate} />
    </section>
  );
}

function FillScreen({ state, index, hint, message, setIndex, setHint, setAnswer, submit, clearMessage, completeRevealed, navigate }: {
  state: AppState; index: number; hint: boolean; message: string; setIndex: (index: number) => void;
  setHint: (value: boolean) => void; setAnswer: (value: string) => void; submit: () => void; clearMessage: () => void;
  completeRevealed: () => void; navigate: (screen: Screen) => void;
}) {
  const correct = Boolean(state.fillCorrect[index]);
  const [showAnswer, setShowAnswer] = useState(false);
  const promptParts = FILL[index].q.split(/_{3,}/);
  const currentAnswer = state.fillAnswers[index] || "";
  const answerWidth = Math.min(182, Math.max(112, Math.max(currentAnswer.length, FILL[index].answer.length) * 16 + 32));

  function blurAndReveal(selector?: string) {
    (document.activeElement as HTMLElement | null)?.blur?.();
    window.setTimeout(() => {
      const body = document.querySelector<HTMLElement>(".fill-body");
      if (selector) document.querySelector<HTMLElement>(selector)?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      else body?.scrollTo({ top: 0, behavior: "smooth" });
    }, 80);
  }

  function selectQuestion(nextIndex: number) {
    setShowAnswer(false);
    setIndex(nextIndex);
    blurAndReveal();
  }

  function checkAnswer() {
    blurAndReveal(".fill-correct-card, .fill-body .inline-note");
    submit();
  }

  function toggleHint() {
    clearMessage();
    setHint(!hint);
    setShowAnswer(false);
    blurAndReveal(".hint-note");
  }

  function revealAnswer() {
    setAnswer(FILL[index].answer);
    setShowAnswer(true);
    setHint(false);
    clearMessage();
    blurAndReveal(".answer-reveal");
  }

  function continueAfterReveal() {
    completeRevealed();
    if (index < FILL.length - 1) selectQuestion(index + 1);
    else navigate("connectIntro");
  }

  return (
    <section className="app-screen atlas-screen"><AtlasHeader label="FILL · GUIDED NOTES" onBack={() => navigate("fillIntro")} onInfo={() => navigate("fillIntro")} />
      <div className="screen-scroll atlas-body tool-body fill-body">
        <div className="fill-progress-head"><span>QUESTION {index + 1} OF {FILL.length}</span><b>{Object.values(state.fillCorrect).filter(Boolean).length} / {FILL.length}</b></div>
        <div className="fill-progress-line"><span style={{ width: `${((index + 1) / FILL.length) * 100}%` }} /></div>
        <article className={`question-card ${correct ? "correct" : ""}`}>
          <h2 className="inline-fill-prompt"><span>{promptParts[0]}</span><input id="fill-answer" className="inline-fill-answer" aria-label="Type the missing word or phrase"
            value={currentAnswer} style={{ width: `${answerWidth}px` }} readOnly={correct || showAnswer}
            onChange={(event) => { setAnswer(event.target.value); if (showAnswer) setShowAnswer(false); clearMessage(); }}
            onKeyDown={(event) => event.key === "Enter" && !correct && !showAnswer && checkAnswer()} autoCapitalize="none" autoComplete="off" /><span>{promptParts[1]}</span></h2>
          <p className="inline-fill-guide">TYPE YOUR ANSWER ON THE LINE ABOVE</p>
          {!correct && !showAnswer && <button className="primary-action fill-check" onClick={checkAnswer}>Check answer <ArrowRight /></button>}
          {correct && <div className="fill-correct-card"><span><Check /></span><div><strong>Correct!</strong><p>{FILL[index].why}</p>
            <button onClick={() => index < FILL.length - 1 ? selectQuestion(index + 1) : navigate("connectIntro")}>{index < FILL.length - 1 ? "Next question" : "Continue to Connect"}<ArrowRight /></button></div></div>}
          <div className="fill-help-actions"><button className="fill-help-row" onClick={toggleHint}><CircleHelp /><span><small>NEED A NUDGE?</small><b>{hint ? "Hide the clue" : "Open a clue"}</b></span><ChevronRight /></button>
            <button className="fill-help-row" onClick={revealAnswer}><BookOpen /><span><small>NOT SURE?</small><b>Show me + explain why</b></span><ChevronRight /></button></div>
          {hint && !correct && !showAnswer && <p className="inline-note hint-note"><b>A CLUE—NOT THE ANSWER</b>{FILL[index].hint}</p>}
          {showAnswer && <div className="answer-reveal"><small>THE ANSWER</small><strong>{FILL[index].answer}</strong><p>{FILL[index].why}</p>
            <span>Read the explanation once, then continue when you are ready.</span></div>}
          {message && !correct && !hint && !showAnswer && <p className="inline-note"><b>Try again.</b>{message}</p>}
          {showAnswer && !correct && <button className="primary-action fill-continue" onClick={continueAfterReveal}>{index < FILL.length - 1 ? "Continue to next question" : "Complete Fill"}<ArrowRight /></button>}
        </article>
      </div><ToolDock active="fill" navigate={navigate} />
    </section>
  );
}

function ConnectScreen({ step, advance, navigate, openScripture }: { step: number; advance: () => void; navigate: (screen: Screen) => void; openScripture: (ref: string) => void }) {
  const nodes = [
    { thread: "CREATOR THREAD", ref: "Genesis 1:1", title: "God creates", discoveryIndex: 0 },
    { thread: "CREATOR THREAD", ref: "John 1:1–3", title: "The Word was there", discoveryIndex: 1 },
    { thread: "SEED THREAD", ref: "Genesis 3:15", title: "A promised victor", discoveryIndex: 3 },
    { thread: "FINAL CONNECTION", ref: "Colossians 1:15–17", title: "The center is named", discoveryIndex: 2 },
  ];
  const completed = Math.min(step, nodes.length);
  const christRevealed = completed >= nodes.length;
  const [activeDiscovery, setActiveDiscovery] = useState<number | null>(null);
  const discovery = activeDiscovery === null ? null : DISCOVERIES[nodes[activeDiscovery].discoveryIndex];
  const finalRevealGate = activeDiscovery === nodes.length - 1 && completed === nodes.length - 1;

  function openDiscovery(index: number) {
    if (index > completed) return;
    setActiveDiscovery(index);
    window.setTimeout(() => document.querySelector<HTMLElement>(".connect-discovery-card")?.scrollIntoView({ behavior: "smooth", block: "start" }), 60);
  }

  function continueThread() {
    if (activeDiscovery === completed && completed < nodes.length) advance();
    setActiveDiscovery(null);
    window.setTimeout(() => document.querySelector<HTMLElement>(completed === nodes.length - 1 ? ".connect-complete-card" : ".christ-thread-map")?.scrollIntoView({ behavior: "smooth", block: "center" }), 80);
  }

  return (
    <section className="app-screen atlas-screen"><AtlasHeader label="CONNECT" onBack={() => navigate("connectIntro")} onInfo={() => navigate("connectIntro")} />
      <div className="screen-scroll atlas-body tool-body connect-body"><MicroLabel>CREATOR + SEED THREADS</MicroLabel>
        <h1>Watch the beginning converge.</h1><p className="screen-lede">Tap each pulsing node and follow the living thread. Its center stays hidden until the final connection is made.</p>

        <section className={`christ-thread-map connect-progress-${completed}`} aria-label="Animated Scripture connection map">
          <header><span><small>THE LIVING THREAD</small><strong>{completed < nodes.length ? `Discovery ${completed + 1} is ready` : "The map is open"}</strong></span>
            <em>{completed} / {nodes.length}</em></header>
          <div className="thread-legend"><span><i />Creator thread</span><span><i />Promise carried forward</span></div>
          <div className="thread-stage">
            <svg viewBox="0 0 360 520" preserveAspectRatio="none" aria-hidden="true">
              <path className="thread-ghost" d="M75 77 C150 77 151 167 273 167" />
              <path className="thread-ghost" d="M273 167 C206 167 215 261 75 261" />
              <path className="thread-ghost" d="M75 261 C137 280 135 367 180 377" />
              <path className="thread-ghost seed" d="M180 377 C235 385 223 458 273 458" />
              <path className={`thread-live ${completed >= 1 ? "drawn" : ""}`} pathLength="1" d="M75 77 C150 77 151 167 273 167" />
              <path className={`thread-live ${completed >= 2 ? "drawn" : ""}`} pathLength="1" d="M273 167 C206 167 215 261 75 261" />
              <path className={`thread-live ${completed >= 3 ? "drawn" : ""}`} pathLength="1" d="M75 261 C137 280 135 367 180 377" />
              <path className={`thread-live seed ${completed >= 4 ? "drawn" : ""}`} pathLength="1" d="M180 377 C235 385 223 458 273 458" />
            </svg>
            {nodes.map((node, index) => <button key={node.ref} className={`thread-node thread-node-${index} ${index < completed ? "done" : ""} ${index === completed ? "ready" : ""} ${index > completed ? "locked" : ""}`}
              onClick={() => openDiscovery(index)} aria-label={`${index < completed ? "Review" : "Open"} discovery ${index + 1}: ${node.ref}`}>
              <span className="thread-node-dot">{index < completed ? <Check /> : index + 1}</span><span><small>{node.thread}</small><strong>{node.ref}</strong><em>{node.title}</em></span>
            </button>)}
            <div className={`christ-center ${christRevealed ? "found revealed" : "veiled"}`}><span>{christRevealed ? <Sparkles /> : <LockKeyhole />}</span><small>{christRevealed ? "CREATOR REVEALED" : "FINAL REVEAL"}</small><strong>{christRevealed ? "CHRIST" : "?"}</strong></div>
          </div>
          <p className="thread-instruction"><span>{completed < nodes.length ? completed + 1 : <Check />}</span>{completed < nodes.length ? "Tap the pulsing node to open the next discovery." : "Tap any completed node to revisit its Scripture discovery."}</p>
        </section>

        {discovery && activeDiscovery !== null && <article className="connect-discovery-card" onClick={(event) => { const target = (event.target as HTMLElement).closest<HTMLElement>("[data-ref]"); if (target?.dataset.ref) { event.preventDefault(); openScripture(target.dataset.ref); } }}>
          <div className="connect-discovery-head"><span>0{activeDiscovery + 1}</span><div><small>{nodes[activeDiscovery].thread}</small><strong>DISCOVERY {activeDiscovery + 1} OF {nodes.length}</strong></div></div>
          <h2>{finalRevealGate ? "One final connection remains." : discovery.title}</h2>
          {finalRevealGate ? <div className="connect-reveal-gate"><LockKeyhole /><p>Colossians takes the Creator thread and names its center. Make the final connection when you are ready.</p></div>
            : <div className="connect-discovery-content" dangerouslySetInnerHTML={{ __html: discovery.body }} />}
          <button className="light-action" onClick={continueThread}>{finalRevealGate ? "Reveal the center" : activeDiscovery === completed && completed < nodes.length ? "Continue the thread" : "Back to the map"}<ArrowRight /></button>
        </article>}

        {completed >= nodes.length && activeDiscovery === null && <article className="connect-complete-card"><span><Sparkles /></span><small>THE THREADS ARE NOW VISIBLE</small><h2>Christ is not added to the beginning. He is its center.</h2>
          <p>John and Colossians identify Christ as the eternal Word through whom creation came and for whom it exists. Genesis 3:15 opens the Seed promise; the course will keep tracing it until later Scripture brings it fully into focus.</p>
          <div><b>CREATOR THREAD</b><strong>Resolved in Christ</strong></div><div><b>SEED THREAD</b><strong>Open—carry it forward</strong></div>
          <button onClick={() => navigate("unlockIntro")}>Continue to Unlock <ArrowRight /></button></article>}
      </div><ToolDock active="connect" navigate={navigate} />
    </section>
  );
}

function UnlockScreen({ state, step, summary, showModel, message, setStep, setSummary, setShowModel, setAnswer, save, complete, navigate }: {
  state: AppState; step: number; summary: string; showModel: boolean; message: string; setStep: (step: number) => void;
  setSummary: (value: string) => void; setShowModel: (value: boolean) => void; setAnswer: (value: string) => void;
  save: () => void; complete: () => void; navigate: (screen: Screen) => void;
}) {
  return (
    <section className="app-screen atlas-screen"><AtlasHeader label="UNLOCK" onBack={() => navigate("unlockIntro")} />
      <div className="screen-scroll atlas-body tool-body unlock-body"><MicroLabel>TEACH BACK · 60 SECONDS</MicroLabel>
        <h1>Tell the beginning clearly.</h1><p className="screen-lede">Explain what was good, what broke, and what hope God gave.</p>
        {!state.teachbackComplete && !summary && <article className="teachback-card">
          <div className="teachback-steps">{TEACHBACK.map((item, index) => (
            <button key={item.trail} className={`${index === step ? "active" : ""} ${state.teachback[index]?.length >= 18 ? "done" : ""}`} onClick={() => index <= step && setStep(index)}>
              <span>{index + 1}</span><small>{item.trail}</small></button>
          ))}</div>
          <div className="question-meta"><span>{TEACHBACK[step].label}</span><b>{step + 1} / 4</b></div><h2>{TEACHBACK[step].title}</h2><p>{TEACHBACK[step].prompt}</p>
          <label htmlFor="teachback">YOUR EXPLANATION</label><textarea id="teachback" value={state.teachback[step] || ""} placeholder={TEACHBACK[step].placeholder} onChange={(event) => setAnswer(event.target.value)} />
          <details><summary>Need a nudge?</summary><p>{TEACHBACK[step].nudge}</p></details>{message && <p className="unlock-message"><CircleHelp />{message}</p>}
          <button className="primary-action" onClick={save}>{step === 3 ? "Build my explanation" : "Save + next"}<ArrowRight /></button>
        </article>}
        {!state.teachbackComplete && summary && <article className="teachback-card summary-card"><MicroLabel>FINAL PASS</MicroLabel><h2>Make it one clear story.</h2>
          <textarea value={summary} onChange={(event) => setSummary(event.target.value)} /><button className="text-action" onClick={() => setShowModel(!showModel)}>{showModel ? "Hide" : "Compare with"} a strong answer</button>
          {showModel && <div className="model-answer"><small>A STRONG ANSWER</small><p>God created everything good, and humanity—male and female—was made in His image, given a place, work, relationship, provision, and a boundary. The serpent questioned God&apos;s word, humanity rebelled, and shame, judgment, death, and exile entered the story. Yet before Eden closes, God promises that the woman&apos;s Seed will confront the serpent.</p></div>}
          {message && <p className="unlock-message"><CircleHelp />{message}</p>}<button className="primary-action" onClick={complete}>I can explain Week 1 <Check /></button></article>}
        {state.teachbackComplete && <article className="unlock-reward"><span><Check /></span><MicroLabel light>UNDERSTANDING UNLOCKED</MicroLabel>
          <h2>You can explain why the Bible needs a rescue story.</h2><p>You did more than recognize an answer—you rebuilt the beginning in your own words.</p>
          <div className="unlock-reward-actions"><button className="light-action" onClick={() => navigate("deep")}>Go deeper for seven days <ArrowRight /></button>
            <button className="unlock-finish-action" onClick={() => navigate("complete")}>Finish Week 1 <ArrowRight /></button></div></article>}
        {!state.teachbackComplete && <button className="unlock-devotion-route" onClick={() => navigate("deep")}><span><small>READY TO CONTINUE?</small><strong>Open the 7-day devotional</strong></span><ArrowRight /></button>}
      </div><ToolDock active="unlock" navigate={navigate} />
    </section>
  );
}

function DeepStudyScreen({ completed, openDay, navigate }: { completed: Record<string, boolean>; openDay: (index: number) => void; navigate: (screen: Screen) => void }) {
  const completedCount = Object.values(completed).filter(Boolean).length;
  const nextDay = DEEP_DAYS.findIndex((_, index) => !completed[index]);
  const featuredDay = nextDay === -1 ? 6 : nextDay;
  return (
    <section className="app-screen atlas-screen deep-screen"><AtlasHeader label="GO DEEPER · WEEK 01" onBack={() => navigate("home")} />
      <div className="screen-scroll deep-body">
        <section className="deep-plan-hero">
          <div className="deep-journal-art"><img src={DEEP_COVER} alt="A traveler looking across a landscape shaped by light and water" /><span><small>A SEVEN-DAY READING JOURNAL</small><b>WEEK 01</b></span></div>
          <div className="deep-plan-copy"><small>GO DEEPER</small><h1>Carry the beginning into your week.</h1>
            <p>Seven unhurried encounters with Scripture, context, reflection and prayer. Your notes remain private and saved on this device.</p></div>
          <div className="deep-progress" aria-label={`${completedCount} of 7 devotionals complete`}>
            {DEEP_DAYS.map((day, index) => <span className={completed[index] ? "done" : index === featuredDay ? "current" : ""} key={day.title}><i />DAY {index + 1}</span>)}
          </div>
        </section>

        <section className="deep-today">
          <div className="deep-today-heading"><span><small>{completedCount === 7 ? "RETURN TO THE STORY" : "CONTINUE HERE"}</small><strong>{completedCount === 7 ? "Revisit the final day" : "Today’s reading"}</strong></span><em>{completedCount} / 7 COMPLETE</em></div>
          <button onClick={() => openDay(featuredDay)}><img src={DEEP_ART[featuredDay]} alt="" /><span className="deep-today-copy"><small>DAY {String(featuredDay + 1).padStart(2, "0")} · {DEEP_DAYS[featuredDay].eyebrow}</small><b>{DEEP_DAYS[featuredDay].cover}</b><p>{DEEP_DAYS[featuredDay].subtitle}</p><strong>{completed[featuredDay] ? "Read again" : "Enter today’s study"}<ArrowRight /></strong></span></button>
        </section>

        <div className="deep-week-heading"><span><small>THE WEEK AHEAD</small><strong>Seven invitations to go deeper</strong></span><em>NOTES SAVE ON THIS DEVICE</em></div>
        <div className="deep-story-stack">{DEEP_DAYS.map((day, index) => index === featuredDay ? null : (
          <button className="deep-story-panel" key={day.title} onClick={() => openDay(index)}><img src={DEEP_ART[index]} alt="" /><span className="deep-shade" />
            <span className="deep-number">DAY 0{index + 1}</span>{completed[index] && <span className="deep-check"><Check /></span>}
            <span className="deep-copy"><small>{day.eyebrow}</small><b>{day.cover}</b><p>{day.subtitle}</p><em>{day.time} · READING + REFLECTION</em><strong>{completed[index] ? "Read again" : "Enter today’s study"}<ArrowRight /></strong></span></button>
        ))}
          <section className="deep-finish-card"><span>{completedCount === 7 ? <Check /> : <BookOpen />}</span><small>{completedCount === 7 ? "SEVEN DAYS COMPLETE" : "WEEK 01 · CLOSING THE STORY"}</small><h2>Carry the beginning forward.</h2>
            <p>{completedCount === 7 ? "Your reflections are saved. Close the devotional with the Week 1 story in one clear view." : "You can return to any devotional throughout the week. When you are ready, step into the Week 1 conclusion and see the whole beginning as one story."}</p>
            <button onClick={() => navigate("complete")}>Enter the Week 1 conclusion <ArrowRight /></button></section>
        </div>
      </div><ToolDock active="deep" navigate={navigate} />
    </section>
  );
}

function WeekCompleteScreen({ state, navigate }: { state: AppState; navigate: (screen: Screen) => void }) {
  const devotionalCount = Object.values(state.deepCompleted).filter(Boolean).length;
  const thread = ["GOD", "GOOD CREATION", "IMAGE", "BOUNDARY", "FALL", "SEED", "EXILE"];
  return <section className="app-screen complete-screen">
    <CinemaHeader onBack={() => navigate("unlock")} label="WEEK 01 COMPLETE" />
    <div className="screen-scroll complete-scroll">
      <section className="complete-hero"><span className="complete-hero-shade" />
        <div className="complete-mark"><Check /></div><div className="complete-copy"><small>CREATION · FALL · FIRST PROMISE</small>
          <h1>You now know why the Bible needs a rescue story.</h1><p>What God made was good. Humanity broke trust. Before Eden closed, God spoke hope.</p></div>
      </section>
      <section className="complete-story"><MicroLabel>THE WHOLE BEGINNING · ONE THREAD</MicroLabel><h2>Keep the order. Carry the promise.</h2>
        <div className="complete-thread">{thread.map((item, index) => <div key={item}><span>{index + 1}</span><strong>{item}</strong></div>)}</div>
        <p>Genesis 1–3 establishes the world as God’s good creation, humanity as His image-bearing representatives, sin as a rupture of trust and order, and the promised Seed as the first sign that evil will not have the final word.</p>
      </section>
      <section className="complete-next"><small>NEXT · WEEK 02</small><h2>The story does not stop east of Eden.</h2><p>Next, we follow what sin multiplies, what judgment reveals and how God preserves the human story.</p>
        <div><button className="primary-action" onClick={() => navigate("roadmap")}>Review Week 1 <RotateCcw /></button>
          <button className="complete-secondary" onClick={() => navigate("deep")}>{devotionalCount === 7 ? "Revisit saved reflections" : `Continue devotional · ${devotionalCount}/7`}<ArrowRight /></button></div>
      </section>
    </div>
  </section>;
}

function CinemaHeader({ onBack, onHome, label }: { onBack?: () => void; onHome?: () => void; label?: string }) {
  return <header className="app-header cinema-header">{onBack ? <button onClick={onBack} aria-label="Go back"><ArrowLeft /></button> : onHome ? <button onClick={onHome} aria-label="Return to course home"><BookOpen /></button> : <span className="header-symbol" aria-hidden="true"><BookOpen /></span>}
    <div><b>{label || "THROUGH THE BIBLE"}</b><span>WEEK 01</span></div><span className="header-spacer" aria-hidden="true" /></header>;
}
function AtlasHeader({ label, onBack, onInfo }: { label: string; onBack: () => void; onInfo?: () => void }) {
  return <header className="app-header atlas-header"><button onClick={onBack} aria-label="Go back"><ArrowLeft /></button><b>{label}</b>
    {onInfo ? <button aria-label="Review section instructions" onClick={onInfo}><Info /></button> : <span className="header-spacer" aria-hidden="true" />}</header>;
}
function ProgressRing({ value }: { value: number }) {
  return <div className="progress-ring" style={{ "--progress": `${value * 3.6}deg` } as CSSProperties} aria-label={`${value}% complete`}><span>{value}%</span></div>;
}
function MicroLabel({ children, light = false }: { children: ReactNode; light?: boolean }) { return <p className={`micro-label ${light ? "light" : ""}`}>{children}</p>; }
function WhyCard({ children }: { children: ReactNode }) { return <article className="why-card"><span /><div><small>WHY IT MATTERS</small><p>{children}</p></div></article>; }

function CoreDock({ active, navigate }: { active: "story" | "promise" | "family" | "deeper"; navigate: (screen: Screen) => void }) {
  const items: { label: string; id: typeof active; screen: Screen; icon: ReactNode }[] = [
    { label: "STORY", id: "story", screen: "home", icon: <BookOpen /> }, { label: "PROMISE", id: "promise", screen: "promise", icon: <Waypoints /> },
    { label: "FAMILY", id: "family", screen: "family", icon: <Users /> }, { label: "DEEPER", id: "deeper", screen: "deep", icon: <Sparkles /> },
  ];
  return <nav className="core-dock" aria-label="Lesson navigation">{items.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => navigate(item.screen)}>{item.icon}<span>{item.label}</span></button>)}</nav>;
}
function ToolDock({ active, navigate }: { active?: StudyDockName; navigate: (screen: Screen) => void }) {
  const items: { label: string; id: StudyDockName; screen: Screen; icon: ReactNode }[] = [
    { label: "PLACE", id: "place", screen: "placeIntro", icon: <MapPin /> }, { label: "FILL", id: "fill", screen: "fillIntro", icon: <Minus /> },
    { label: "CONNECT", id: "connect", screen: "connectIntro", icon: <Link2 /> }, { label: "UNLOCK", id: "unlock", screen: "unlockIntro", icon: <LockKeyhole /> },
    { label: "DEVOTION", id: "deep", screen: "deep", icon: <Sparkles /> },
  ];
  return <nav className="tool-dock" aria-label="Study tools">{items.map((item) => <button key={item.id} className={active === item.id ? "active" : ""} onClick={() => navigate(item.screen)}>{item.icon}<span>{item.label}</span></button>)}</nav>;
}

function DesktopRail({ screen, progress, navigate }: { screen: Screen; progress: number; navigate: (screen: Screen) => void }) {
  const routes: { label: string; screen: Screen; meta: string }[] = [
    { label: "The opening", screen: "home", meta: "CINEMA" }, { label: "The story", screen: "roadmap", meta: "4 CHAPTERS" },
    { label: "The promise", screen: "promise", meta: "GENESIS 3:15" }, { label: "Learning lab", screen: "placeIntro", meta: "4 TOOLS" },
    { label: "Deep study", screen: "deep", meta: "7 DAYS" },
  ];
  return <aside className="desktop-rail"><div className="desktop-brand"><BookOpen /><span><b>THROUGH THE BIBLE</b><small>WEEK 01 · GENESIS 1–3</small></span></div>
    <div className="desktop-progress"><ProgressRing value={progress} /><span><small>YOUR PROGRESS</small><b>The beginning is taking shape.</b></span></div>
    <div className="desktop-title"><MicroLabel light>CREATION · FALL · FIRST PROMISE</MicroLabel><h1>Creation, Rupture &amp; the First Promise</h1></div>
    <nav>{routes.map((route) => <button key={route.screen} className={screen === route.screen || (route.screen === "placeIntro" && ["placeIntro", "fillIntro", "connectIntro", "unlockIntro", "place", "fill", "connect", "unlock"].includes(screen)) ? "active" : ""} onClick={() => navigate(route.screen)}><span><small>{route.meta}</small><b>{route.label}</b></span><ArrowRight /></button>)}</nav>
    <blockquote>“Hope appears before Eden closes.”</blockquote></aside>;
}

function ScriptureReader({ reference, scripture, mark, reading, onClose, onTool, onText, onSelection, onRead, onNavigate }: {
  reference: string | null; scripture: Scripture | null; mark: ScriptureMark; reading?: ScriptureReading; onClose: () => void;
  onTool: (key: "highlight" | "underline" | "bookmark") => void; onText: (key: "notes" | "question", value: string) => void;
  onSelection: (selection: ScriptureSelection) => void; onRead: (reference: string, verseCount: number) => void;
  onNavigate: (reference: string) => void;
}) {
  const articleRef = useRef<HTMLElement>(null);
  const responseRef = useRef<HTMLElement>(null);
  const [pendingSelection, setPendingSelection] = useState<{ quote: string; start: number; end: number } | null>(null);
  const [toolMessage, setToolMessage] = useState("");
  const [studyOpen, setStudyOpen] = useState(false);
  const [readReference, setReadReference] = useState<string | null>(null);
  const readReportedFor = useRef<string | null>(reading?.lastReadAt && reference ? reference : null);
  const onReadRef = useRef(onRead);
  const references = Object.keys(SCRIPTURES);
  const referenceIndex = reference ? references.indexOf(reference) : -1;
  const previousReference = referenceIndex > 0 ? references[referenceIndex - 1] : null;
  const nextReference = referenceIndex >= 0 && referenceIndex < references.length - 1 ? references[referenceIndex + 1] : null;
  const verseCount = Math.max(1, scripture?.html.match(/<sup>/g)?.length || 0);
  const scriptureHtml = useMemo(() => annotateScriptureHtml(
    scripture?.html || '<p class="scripture-unavailable">This passage could not be loaded. Close the reader and try again.</p>',
    mark.selections || [],
  ), [scripture?.html, mark.selections]);
  const readLogged = Boolean(reading?.lastReadAt || readReference === reference);

  useEffect(() => { onReadRef.current = onRead; }, [onRead]);

  useEffect(() => {
    if (!reference) return;
    const timer = window.setTimeout(() => {
      if (readReportedFor.current === reference) return;
      readReportedFor.current = reference;
      setReadReference(reference);
      onReadRef.current(reference, verseCount);
    }, 10000);
    return () => window.clearTimeout(timer);
  }, [reference, reading?.lastReadAt, verseCount]);

  function reportRead() {
    if (!reference || readReportedFor.current === reference) return;
    readReportedFor.current = reference;
    setReadReference(reference);
    onReadRef.current(reference, verseCount);
  }

  function handleReaderScroll(event: UIEvent<HTMLDivElement>) {
    const article = articleRef.current;
    if (!article) return;
    const viewport = event.currentTarget.getBoundingClientRect();
    if (article.getBoundingClientRect().bottom <= viewport.bottom + 72) reportRead();
  }

  function captureSelection() {
    const article = articleRef.current;
    const selection = window.getSelection();
    if (!article || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;
    const range = selection.getRangeAt(0);
    if (!article.contains(range.commonAncestorContainer)) return null;
    const quote = selection.toString().trim();
    if (quote.length < 2) return null;
    const before = document.createRange();
    before.selectNodeContents(article);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const captured = { quote, start, end: start + selection.toString().length };
    setPendingSelection(captured);
    setToolMessage("");
    return captured;
  }

  function saveSelection(type: "highlight" | "underline") {
    const captured = pendingSelection || captureSelection();
    if (!captured) {
      setToolMessage(`Select a word or phrase in the Scripture, then tap ${type}.`);
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSelection({ ...captured, type, id: globalThis.crypto?.randomUUID?.() || `${Date.now()}`, createdAt: new Date().toISOString() });
    window.getSelection()?.removeAllRanges();
    setPendingSelection(null);
    setToolMessage(type === "highlight" ? "Highlight saved to My Study." : "Underline saved to My Study.");
  }

  useEffect(() => {
    if (!reference) return;
    const handleSelectionChange = () => {
      const selection = window.getSelection();
      const article = articleRef.current;
      if (!article || !selection || selection.rangeCount === 0 || selection.isCollapsed) return;
      const range = selection.getRangeAt(0);
      if (!article.contains(range.commonAncestorContainer)) return;
      const quote = selection.toString().trim();
      if (quote.length < 2) return;
      const before = document.createRange();
      before.selectNodeContents(article);
      before.setEnd(range.startContainer, range.startOffset);
      const start = before.toString().length;
      setPendingSelection({ quote, start, end: start + selection.toString().length });
      setToolMessage("");
    };
    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [reference]);

  return <Sheet open={Boolean(reference)} onOpenChange={(open) => !open && onClose()}><SheetContent side="right" className="scripture-sheet">
    <SheetHeader className="scripture-header"><div className="scripture-kicker"><MicroLabel>{scripture?.translation || "KING JAMES VERSION (KJV)"}</MicroLabel><span className={readLogged ? "read" : ""}>{readLogged ? <><Check />READ</> : "READING"}</span></div><SheetTitle>{reference || "Scripture"}</SheetTitle><SheetDescription>The text comes first. Read slowly; keep only what asks you to stay.</SheetDescription></SheetHeader>
    <div className="scripture-toolbar-v35" aria-label="Scripture study tools">
      <button className={pendingSelection ? "ready" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => saveSelection("highlight")}><Highlighter /><span>Highlight</span></button>
      <button className={pendingSelection ? "ready" : ""} onMouseDown={(event) => event.preventDefault()} onClick={() => saveSelection("underline")}><Underline /><span>Underline</span></button>
      <button className={mark.bookmark ? "active" : ""} onClick={() => onTool("bookmark")}><Bookmark /><span>{mark.bookmark ? "Saved" : "Save"}</span></button>
      <button onClick={() => responseRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })}><NotebookPen /><span>Notes</span></button>
    </div>
    <div className={`scripture-tool-status ${pendingSelection ? "has-selection" : ""}`} aria-live="polite">
      {pendingSelection ? <><span>Selected</span><p>“{pendingSelection.quote.length > 70 ? `${pendingSelection.quote.slice(0, 70)}…` : pendingSelection.quote}”</p><button onClick={() => { window.getSelection()?.removeAllRanges(); setPendingSelection(null); }} aria-label="Clear selection"><X /></button></> : <><span>{toolMessage || "Select any words in the passage, then choose Highlight or Underline."}</span></>}
    </div>
    <div className="scripture-scroll" onScroll={handleReaderScroll}>
      <article ref={articleRef} onMouseUp={captureSelection} onTouchEnd={() => window.setTimeout(captureSelection, 0)}
        className={`scripture-text ${mark.highlight ? "highlighted" : ""} ${mark.underline ? "underlined" : ""}`}
        dangerouslySetInnerHTML={{ __html: scriptureHtml }} />
      <section className={`scripture-context ${studyOpen ? "open" : ""}`}><button onClick={() => setStudyOpen((value) => !value)}><span><Sparkles /><small>UNDERSTAND THE TEXT</small><b>Why this passage matters</b></span><ChevronDown /></button>{studyOpen ? <WhyCard>{scripture?.study || "Read the passage in the movement of the larger biblical story."}</WhyCard> : null}</section>
      <section ref={responseRef} className="scripture-response"><header><small>KEEP WHAT YOU NOTICE</small><h2>Turn attention into a record.</h2><p>Your question and note remain attached to {reference}.</p></header>
        <label className="study-field"><span><MessageCircleQuestion />ASK A QUESTION</span><textarea value={mark.question || ""} onChange={(event) => onText("question", event.target.value)} placeholder="What do you want to understand about this text?" /></label>
        <label className="study-field"><span><NotebookPen />PRIVATE NOTES</span><textarea value={mark.notes || ""} onChange={(event) => onText("notes", event.target.value)} placeholder="Capture an observation, connection or question…" /></label><p className="saved-note"><Check />Saved automatically to My Study</p>
      </section>
      <nav className="scripture-passage-nav" aria-label="Move between Scripture passages">{previousReference ? <button onClick={() => onNavigate(previousReference)}><ArrowLeft /><span><small>PREVIOUS</small><b>{previousReference}</b></span></button> : <span />}{nextReference ? <button onClick={() => onNavigate(nextReference)}><span><small>NEXT</small><b>{nextReference}</b></span><ArrowRight /></button> : <span />}</nav>
    </div></SheetContent></Sheet>;
}

function MyStudySheet({ open, onOpenChange, state, userEmail, cloudConfigured, accountLoading, openAccount, openScripture, openDay, submitQuestion }: {
  open: boolean; onOpenChange: (open: boolean) => void; state: AppState; userEmail: string | null; cloudConfigured: boolean; accountLoading: boolean;
  openAccount: () => void; openScripture: (reference: string) => void; openDay: (index: number) => void;
  submitQuestion: (reference: string, question: string) => Promise<boolean>;
}) {
  const [submitted, setSubmitted] = useState<Record<string, boolean>>({});
  const keptReferences = new Set([
    ...Object.keys(state.readingHistory),
    ...Object.entries(state.scriptureTools).filter(([, mark]) => mark.bookmark || mark.notes?.trim() || mark.question?.trim() || mark.selections?.length).map(([reference]) => reference),
  ]);
  const scriptureEntries: [string, ScriptureMark][] = [...keptReferences].map((reference) => [reference, state.scriptureTools[reference] || {}]);
  const devotionalEntries = DEEP_DAYS.map((day, index) => ({ day, index, note: state.deepNotes[index] || "", reflection: state.deepReflections[index] || "" }))
    .filter((item) => item.note.trim() || item.reflection.trim());
  const highlightCount = scriptureEntries.reduce((total, [, mark]) => total + (mark.selections?.length || 0), 0);
  const questionCount = scriptureEntries.filter(([, mark]) => mark.question?.trim()).length;

  async function sendQuestion(reference: string, question: string) {
    if (!userEmail) { onOpenChange(false); openAccount(); return; }
    if (await submitQuestion(reference, question)) setSubmitted((current) => ({ ...current, [reference]: true }));
  }

  return <Sheet open={open} onOpenChange={onOpenChange}><SheetContent side="right" className="my-study-sheet" showCloseButton={false}>
    <header className="my-study-header"><button onClick={() => onOpenChange(false)}><ArrowLeft />Back</button><b>MY STUDY</b><button onClick={openAccount} aria-label="Open account"><UserRound /></button></header>
    <div className="my-study-scroll"><section className="my-study-hero"><small>YOUR PRIVATE STUDY LIBRARY</small><h1>Everything you<br />didn’t want to lose.</h1><p>Notes, marked Scripture, questions and devotional reflections—kept together and linked to their original context.</p>
      <div className={`study-sync-state ${userEmail ? "synced" : ""}`}><span>{userEmail ? <Check /> : <LockKeyhole />}</span><div><small>{userEmail ? "CLOUD SYNC ACTIVE" : cloudConfigured ? "SAVED ON THIS DEVICE" : "ACCOUNT CONNECTION PENDING"}</small><b>{accountLoading ? "Checking your account…" : userEmail || "Protect this study across every device"}</b></div>{!userEmail && <button onClick={() => { onOpenChange(false); openAccount(); }}>Protect it <ArrowRight /></button>}</div>
    </section>
    <section className="study-overview"><article><b>{scriptureEntries.length}</b><span>PASSAGES</span></article><article><b>{highlightCount}</b><span>MARKS</span></article><article><b>{questionCount}</b><span>QUESTIONS</span></article><article><b>{devotionalEntries.length}</b><span>JOURNAL DAYS</span></article></section>

    {!scriptureEntries.length && !devotionalEntries.length ? <section className="my-study-empty"><NotebookPen /><h2>Your study library is waiting.</h2><p>Highlight a phrase, save a Scripture or write inside a devotional. It will appear here automatically.</p></section> : null}

    {scriptureEntries.length > 0 && <section className="study-library-section"><header><small>SCRIPTURE STUDY</small><h2>Saved from the text</h2></header>{scriptureEntries.map(([reference, mark]) => <article className="study-library-card" key={reference}>
      <button className="study-card-main" onClick={() => openScripture(reference)}><span>{state.readingHistory[reference]?.completedAt ? <Check /> : <Bookmark />}</span><div><small>{reference}</small><b>{mark.notes?.trim() || mark.question?.trim() || mark.selections?.[0]?.quote || (state.readingHistory[reference]?.completedAt ? "Read in full" : "Opened in your study")}</b><em>{state.readingHistory[reference]?.opens || 0} visit{state.readingHistory[reference]?.opens === 1 ? "" : "s"}{mark.selections?.length ? ` · ${mark.selections.length} text mark${mark.selections.length === 1 ? "" : "s"}` : ""}{mark.notes?.trim() ? " · note" : ""}{mark.question?.trim() ? " · question" : ""}</em></div><ChevronRight /></button>
      {mark.selections?.map((selection) => <button className={`study-quote ${selection.type}`} onClick={() => openScripture(reference)} key={selection.id}>“{selection.quote}”</button>)}
      {mark.question?.trim() && <div className="study-question"><MessageCircleQuestion /><span><small>YOUR QUESTION</small><p>{mark.question}</p></span><button disabled={submitted[reference]} onClick={() => sendQuestion(reference, mark.question || "")}>{submitted[reference] ? "Submitted" : userEmail ? "Ask instructor" : "Sign in to ask"}</button></div>}
    </article>)}</section>}

    {devotionalEntries.length > 0 && <section className="study-library-section devotional-library"><header><small>DEVOTIONAL JOURNAL</small><h2>Reflections from the week</h2></header>{devotionalEntries.map(({ day, index, note, reflection }) => <button className="devotional-library-card" key={day.title} onClick={() => openDay(index)}><img src={DEEP_ART[index]} alt="" /><span><small>DAY {index + 1} · {day.eyebrow}</small><b>{day.cover}</b><p>{reflection || note}</p></span><ChevronRight /></button>)}</section>}
    <footer className="my-study-privacy"><LockKeyhole /><span><b>Your private writing belongs to you.</b><small>Only questions you deliberately submit can be seen by an instructor.</small></span></footer>
    </div>
  </SheetContent></Sheet>;
}

function DeepReader({ open, dayIndex, day, completed, reflection, notes, onClose, onScripture, onInsight, onReflection, onNotes, onComplete }: {
  open: boolean; dayIndex: number; day: DeepDay; completed: boolean; reflection: string; notes: string; onClose: () => void;
  onScripture: (ref: string) => void; onInsight: (key: string) => void; onReflection: (value: string) => void; onNotes: (value: string) => void; onComplete: () => void;
}) {
  const image = DEEP_ART[dayIndex];
  const [completionAttempted, setCompletionAttempted] = useState(false);

  function finishDay() {
    if (reflection.trim().length < 15) {
      setCompletionAttempted(true);
      window.setTimeout(() => document.querySelector<HTMLElement>(".reader-reflection-message")?.scrollIntoView({ behavior: "smooth", block: "nearest" }), 60);
      return;
    }
    setCompletionAttempted(false);
    onComplete();
  }

  return <Sheet open={open} onOpenChange={(value) => !value && onClose()}><SheetContent side="right" className="deep-reader-sheet" showCloseButton={false}>
    <header className="reader-topbar"><button onClick={onClose}><ArrowLeft />Back to plan</button><span>DAY {dayIndex + 1} OF 7</span><button onClick={onClose} aria-label="Close"><X /></button></header>
    <div className="deep-reader-scroll"><div className="reader-hero" style={{ backgroundImage: `url('${image}')` }}><div className="reader-hero-shade" /><div><small>{day.eyebrow}</small><h1>{day.title}</h1><p>{day.subtitle}</p></div></div>
      <article className="reader-body" onClick={(event) => { const target = (event.target as HTMLElement).closest<HTMLElement>("[data-insight]"); if (target?.dataset.insight) onInsight(target.dataset.insight); }}>
        <div className="reader-meta"><span>{day.time}</span><span>READING + REFLECTION</span></div><p className="reader-lede">{day.lede}</p>{day.paragraphs.map((paragraph, index) => <p key={index} dangerouslySetInnerHTML={{ __html: paragraph }} />)}
        <div className="reader-references"><small>READ THE TEXTS</small>{day.refs.map((ref) => <button key={ref} onClick={() => onScripture(ref)}>{ref}<ArrowRight /></button>)}</div>
        <blockquote><p>“{day.quote}”</p><button onClick={() => onScripture(day.quoteRef)}>{day.quoteRef}<ArrowRight /></button></blockquote><section className="hold-card"><small>HOLD THIS</small><p>{day.hold}</p></section>
        <section className="journal-section"><small>OBSERVE + RESPOND</small><h2>Stay honest here.</h2><p>{day.reflect}</p><label>YOUR REFLECTION<textarea value={reflection} onChange={(event) => onReflection(event.target.value)} placeholder="Write the truest answer you can…" /></label>
          <label>PRIVATE NOTES<textarea value={notes} onChange={(event) => onNotes(event.target.value)} placeholder="Capture what you do not want to lose…" /></label><span><Check />Saved automatically between visits</span></section>
        <section className="prayer-section"><small>A PRAYER TO CARRY</small><h2>Pray it slowly.</h2><p>{day.prayer}</p></section>
        {completionAttempted && reflection.trim().length < 15 && <p className="reader-reflection-message"><CircleHelp />Write one honest sentence in your reflection before completing today’s study.</p>}
        <button className="primary-action reader-complete" onClick={finishDay}>{completed ? "Day complete" : dayIndex === 6 ? "Complete the plan" : "Mark day complete"}<Check /></button>
      </article></div></SheetContent></Sheet>;
}
