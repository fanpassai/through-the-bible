"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Clock3,
  Home,
  Library,
  LockKeyhole,
  MapPin,
  Minus,
  Sparkles,
  UserRound,
  Waypoints,
} from "lucide-react";
import { mergePortfolios, readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import type { StudyPortfolio } from "@/lib/study-types";
import { useStudyAccount } from "@/app/study-account";
import {
  getWeekOneTracking,
  readWeekOneSession,
  WEEK_ONE_RESUME_KEY,
  type ResumeTarget,
  type TrackingKey,
  type TrackingStatus,
  type WeekOneTracking,
} from "@/lib/week-one-tracking";
import styles from "./today.module.css";

const lessonThumbnails = [
  "/images/week1-subject-01-cover.svg",
  "/images/week1-creation-sea.jpg",
  "/images/week1-eden-couple.jpg",
  "/images/week1-eden-vocation.jpg",
  "/images/week1-eden-temptation.jpg",
  "/images/week1-eden-shame.jpg",
  "/images/week1-eden-exile-couple.jpg",
  "/images/week1-hero-cinematic.png",
] as const;

const scriptureThumbnails = [
  "/images/week1-story-creation.png",
  "/images/week1-image-bearers.webp",
  "/images/week1-eden-vocation.jpg",
  "/images/week1-eden-temptation.jpg",
  "/images/week1-roadmap-rupture.png",
  "/images/week1-eden-exile-couple.jpg",
  "/images/week1-east-of-eden.webp",
  "/images/week1-hero-cinematic.png",
] as const;

function nextThumbnail(next: ResumeTarget) {
  const index = Math.max(0, next.index ?? 0);
  if (next.screen === "complete") return "/images/week1-hero-reference-v3-hd.png";
  if (next.key === "lesson") return lessonThumbnails[Math.min(index, lessonThumbnails.length - 1)];
  if (next.key === "scripture") return scriptureThumbnails[Math.min(index, scriptureThumbnails.length - 1)];
  if (next.key === "place") return "/images/place-01-creation-v24.webp";
  if (next.key === "fill") return "/images/source-01.jpg";
  if (next.key === "connect") return "/images/week1-cinematic-master-v4.webp";
  if (next.key === "unlock") return "/images/week1-east-of-eden.webp";
  return `/images/week1-deep-day-${String(Math.min(index + 1, 7)).padStart(2, "0")}.jpg`;
}

const unitIcons = {
  lesson: BookOpen,
  scripture: Bookmark,
  place: MapPin,
  fill: Minus,
  connect: Waypoints,
  unlock: LockKeyhole,
  deeper: Sparkles,
} satisfies Record<TrackingKey, typeof BookOpen>;

const nav = [
  { label: "Home", icon: Home, href: "/design-lock/home" },
  { label: "Today", icon: CalendarDays, href: "/design-lock/today", active: true },
  { label: "Study", icon: BookOpen, href: "#" },
  { label: "My Bible", icon: Library, href: "#" },
  { label: "Profile", icon: UserRound, href: "#" },
];

const emptyPortfolio: StudyPortfolio = {
  deepCompleted: {},
  deepNotes: {},
  deepReflections: {},
  scriptureTools: {},
  readingHistory: {},
  activityEvents: [],
};

function statusLabel(status: TrackingStatus) {
  if (status === "complete") return "Complete";
  if (status === "in-progress" || status === "current") return "Continue";
  return "Up next";
}

export default function TodayExperience() {
  const { user, loadPortfolio } = useStudyAccount();
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(emptyPortfolio);
  const [session, setSession] = useState<ReturnType<typeof readWeekOneSession>>({});
  const [filter, setFilter] = useState<"progress" | "next" | "complete">("progress");

  useEffect(() => {
    const refresh = () => {
      setPortfolio(readLocalPortfolio());
      setSession(readWeekOneSession());
    };
    refresh();
    let cancelled = false;
    if (user) {
      loadPortfolio()
        .then((cloud) => {
          if (!cancelled && cloud) setPortfolio(mergePortfolios(cloud, readLocalPortfolio()));
        })
        .catch(() => undefined);
    }
    window.addEventListener("storage", refresh);
    window.addEventListener(STUDY_UPDATED_EVENT, refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", refresh);
      window.removeEventListener(STUDY_UPDATED_EVENT, refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, [user, loadPortfolio]);

  const tracking = useMemo<WeekOneTracking>(() => getWeekOneTracking(session, portfolio), [session, portfolio]);
  const visibleUnits = tracking.units.filter((unit) => {
    if (filter === "complete") return unit.status === "complete";
    if (filter === "next") return unit.status === "up-next";
    return unit.status === "current" || unit.status === "in-progress";
  });
  const filterCounts = {
    progress: tracking.units.filter((unit) => unit.status === "current" || unit.status === "in-progress").length,
    next: tracking.units.filter((unit) => unit.status === "up-next").length,
    complete: tracking.units.filter((unit) => unit.status === "complete").length,
  };
  const filterExplanation = filter === "progress"
    ? "Started or ready now. Continue from the exact point where you stopped."
    : filter === "next"
      ? "Required course sections waiting in order. Finish the active section to move forward."
      : "Every required item in these sections is finished and recorded.";

  function continueCourse() {
    window.sessionStorage.setItem(WEEK_ONE_RESUME_KEY, JSON.stringify(tracking.next));
    window.location.assign("/?resume=week1");
  }

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <div>
            <span>TODAY</span>
            <h1>Your course plan</h1>
          </div>
          <time>Monday · September 1</time>
        </header>

        <div className={styles.content}>
          <section className={styles.hero} aria-label="Week 1 course focus">
            <Image
              src="/images/today-week-1-creation-v2.webp"
              alt="Morning sunlight over mountains, a winding river and a landscape alive with wildflowers"
              fill
              priority
              sizes="(max-width: 430px) 100vw, 390px"
            />
            <span className={styles.heroShade} aria-hidden="true" />
            <div className={styles.heroCopy}>
              <span>WEEK 1 · COURSE</span>
              <h2>The Beginning</h2>
              <p>Creation, the Fall and the First Promise</p>
            </div>
          </section>

          <section className={styles.weekCard}>
            <div className={styles.weekTop}>
              <span>WEEK PROGRESS</span>
              <strong>{tracking.percentage}%</strong>
            </div>
            <div className={styles.progress} aria-label={tracking.percentage + "% of Week 1 complete"}>
              <span style={{ width: Math.max(tracking.percentage, 2) + "%" }} />
            </div>
            <small>{tracking.completed} of {tracking.total} steps complete</small>
          </section>

          <section className={styles.continueCard}>
            <div className={styles.continueThumbnail}>
              <Image src={nextThumbnail(tracking.next)} alt="" fill sizes="58px" />
            </div>
            <div className={styles.continueCopy}>
              <span>{tracking.next.eyebrow}</span>
              <h2>{tracking.next.title}</h2>
              <p>{tracking.next.detail}</p>
            </div>
            <button type="button" onClick={continueCourse}>
              {tracking.weekComplete ? "Review" : "Continue"}
            </button>
          </section>

          <section className={styles.planSection}>
            <div className={styles.sectionHeading}>
              <div><h2>Your Week 1 plan</h2><p>Complete every required item to finish the week.</p></div>
            </div>

            <div className={styles.filters} role="tablist" aria-label="Filter course requirements">
              <button className={filter === "progress" ? styles.filterActive : ""} onClick={() => setFilter("progress")} type="button"><span>In Progress</span><small>{filterCounts.progress}</small></button>
              <button className={filter === "next" ? styles.filterActive : ""} onClick={() => setFilter("next")} type="button"><span>Up Next</span><small>{filterCounts.next}</small></button>
              <button className={filter === "complete" ? styles.filterActive : ""} onClick={() => setFilter("complete")} type="button"><span>Completed</span><small>{filterCounts.complete}</small></button>
            </div>
            <p className={styles.filterExplanation}>{filterExplanation}</p>

            <div className={styles.unitList}>
              {visibleUnits.length ? visibleUnits.map((unit) => {
                const Icon = unitIcons[unit.key];
                return (
                  <button
                    type="button"
                    className={styles.unit}
                    key={unit.key}
                    onClick={unit.status === "current" || unit.status === "in-progress" ? continueCourse : undefined}
                    disabled={unit.status === "up-next" || unit.status === "complete"}
                  >
                    <span className={[styles.unitIcon, unit.status === "complete" ? styles.done : ""].join(" ")}>
                      {unit.status === "complete" ? <Check /> : <Icon />}
                    </span>
                    <span className={styles.unitCopy}><strong>{unit.title}</strong><small>{unit.description}</small></span>
                    <span className={styles.unitState}>{statusLabel(unit.status)}</span>
                    {unit.status === "complete" ? <Check className={styles.endIcon} /> : unit.status === "up-next" ? <Circle className={styles.endIcon} /> : <ChevronRight className={styles.endIcon} />}
                  </button>
                );
              }) : (
                <div className={styles.emptyState}>
                  <Check />
                  <strong>{filter === "complete" ? "No completed requirements yet" : filter === "next" ? "Nothing waiting behind this step" : "No unfinished activity in progress"}</strong>
                  <p>Your course record updates as you read and complete each requirement.</p>
                </div>
              )}
            </div>
          </section>

          <section className={styles.lowerGrid}>
            <article><Clock3 /><span><small>NEXT LESSON</small><strong>Unlocks Friday · 7:00 a.m.</strong><p>Week 2 opens automatically in your course plan.</p></span></article>
            <article><Bookmark /><span><small>SAVED FROM YOUR STUDY</small><strong>{tracking.savedDiscoveryCount} discoveries</strong><p>{tracking.reviewCount ? tracking.reviewCount + " Fill question" + (tracking.reviewCount === 1 ? "" : "s") + " to review" : "Your notes and marked Scripture stay connected."}</p></span></article>
          </section>
        </div>

        <nav className={styles.bottomNav} aria-label="Main navigation">
          {nav.map(({ label, icon: Icon, href, active }) => (
            <Link href={href} className={active ? styles.navActive : styles.navItem} key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
