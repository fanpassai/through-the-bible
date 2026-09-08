"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Circle,
  Home,
  Layers3,
  Library,
  LockKeyhole,
  Route,
  Sparkles,
  UserRound,
} from "lucide-react";
import { courseManifest, getActivity } from "@/lib/course/manifest";
import { migrateLegacyWeekOneProgress } from "@/lib/course/legacy-week-one-progress";
import { resolveCourseProgress } from "@/lib/course/progress";
import type { CourseProgressStatus } from "@/lib/course/types";
import { readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import { EMPTY_PORTFOLIO, type StudyPortfolio } from "@/lib/study-types";
import {
  getWeekOneTracking,
  readWeekOneSession,
  WEEK_ONE_RESUME_KEY,
  type ResumeTarget,
} from "@/lib/week-one-tracking";
import styles from "./home.module.css";

const returningNav = [
  { label: "Home", icon: Home, href: "/journey", active: true },
  { label: "Today", icon: CalendarDays, href: "/design-lock/today", active: false },
  { label: "My Bible", icon: Library, href: "/?resume=week1&study=open", active: false },
  { label: "Profile", icon: UserRound, href: "/design-lock/profile", active: false },
] as const;

const statusLabels: Record<CourseProgressStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  available: "Start here",
  pending: "Pending",
  locked: "Upcoming",
};

function WeekStateIcon({ status }: { status: CourseProgressStatus }) {
  if (status === "completed") return <Check aria-hidden="true" />;
  if (status === "locked") return <LockKeyhole aria-hidden="true" />;
  if (status === "in-progress") return <span className={styles.currentPulse} aria-hidden="true" />;
  return <Circle aria-hidden="true" />;
}

export default function HomeExperience() {
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(EMPTY_PORTFOLIO);
  const [session, setSession] = useState<ReturnType<typeof readWeekOneSession>>({});

  useEffect(() => {
    const refresh = () => {
      setPortfolio(readLocalPortfolio());
      setSession(readWeekOneSession());
    };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(STUDY_UPDATED_EVENT, refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(STUDY_UPDATED_EVENT, refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);

  const legacyTracking = useMemo(() => getWeekOneTracking(session, portfolio), [session, portfolio]);
  const journey = useMemo(() => {
    const ledger = migrateLegacyWeekOneProgress(session, portfolio);
    return resolveCourseProgress(courseManifest, ledger);
  }, [session, portfolio]);
  const weekOne = journey.weeks[0];
  const currentActivity = journey.currentActivityId ? getActivity(journey.currentActivityId) : undefined;
  const hasStarted = weekOne.status === "in-progress" || weekOne.status === "completed";
  const mainLabel = weekOne.status === "completed" ? "Review Week 1" : hasStarted ? "Continue where you stopped" : "Begin Week 1";

  function openTarget(target: ResumeTarget) {
    window.sessionStorage.setItem(WEEK_ONE_RESUME_KEY, JSON.stringify(target));
    window.location.assign("/?resume=week1");
  }

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <div>
            <span>YOUR JOURNEY</span>
            <h1>Good evening, Jasmine</h1>
          </div>
          <Link className={styles.avatar} href="/design-lock/profile" aria-label="Open profile and account">J</Link>
        </header>

        <div className={`${styles.content} ${hasStarted ? styles.withNav : ""}`}>
          <section className={styles.currentCard} aria-label="Your current position">
            <div className={styles.currentImage}>
              <Image src="/images/today-week-1-creation-v2.webp" alt="Morning sunlight over mountains, a winding river and wildflowers" fill priority sizes="(max-width: 430px) 100vw, 382px" />
              <span aria-hidden="true" />
              <p>WEEK 01 · {statusLabels[weekOne.status].toUpperCase()}</p>
            </div>
            <div className={styles.currentBody}>
              <div className={styles.currentTitle}>
                <span><small>THE BEGINNING</small><h2>Creation, the Fall and the First Promise</h2></span>
                <strong>{weekOne.percentage}%</strong>
              </div>
              <div className={styles.progress} aria-label={`${weekOne.percentage}% of Week 1 complete`}><i style={{ width: `${Math.max(weekOne.percentage, 2)}%` }} /></div>
              <div className={styles.position}>
                <Route aria-hidden="true" />
                <span><small>{hasStarted ? "YOUR NEXT STEP" : "YOUR FIRST STEP"}</small><strong>{currentActivity?.title || "Before anything else, God."}</strong></span>
              </div>
              <button type="button" className={styles.primaryAction} onClick={() => openTarget(legacyTracking.next)}>
                <span>{mainLabel}</span><ArrowRight aria-hidden="true" />
              </button>
            </div>
          </section>

          <section className={styles.journeySection} aria-labelledby="journey-title">
            <div className={styles.sectionHeading}>
              <span><small>THE COMPLETE COURSE</small><h2 id="journey-title">Your 10-week journey</h2></span>
              <p>Week 1 of 10</p>
            </div>
            <div className={styles.weekMap}>
              {journey.weeks.map(({ week, status, percentage }) => (
                <Link
                  href={week.href}
                  className={`${styles.weekCell} ${styles[status]}`}
                  aria-label={`Week ${week.number}: ${week.title || "Upcoming"}. ${statusLabels[status]}.`}
                  key={week.id}
                >
                  <span className={styles.weekNumber}>{String(week.number).padStart(2, "0")}</span>
                  <span className={styles.weekIcon}><WeekStateIcon status={status} /></span>
                  <small>{status === "in-progress" ? `${percentage}%` : statusLabels[status]}</small>
                </Link>
              ))}
            </div>
            <p className={styles.mapHelp}>Open any week to see its complete plan, status and next available activity.</p>
          </section>

          <section className={styles.insideCard} aria-labelledby="inside-week-one">
            <div className={styles.insideHeading}>
              <span><small>INSIDE YOUR CURRENT WEEK</small><h2 id="inside-week-one">Everything in Week 1</h2></span>
              <Link href="/weeks/1" aria-label="Open the complete Week 1 plan"><ChevronRight /></Link>
            </div>
            <div className={styles.inventory}>
              <span><Layers3 /><strong>4</strong><small>Story movements</small></span>
              <span><BookOpen /><strong>8</strong><small>Lesson subjects</small></span>
              <span><Bookmark /><strong>8</strong><small>Scripture passages</small></span>
              <span><Sparkles /><strong>7</strong><small>Devotionals</small></span>
            </div>
            <Link className={styles.planLink} href="/weeks/1"><span>Open the complete Week 1 plan</span><ArrowRight /></Link>
          </section>
        </div>

        {hasStarted ? (
          <nav className={styles.bottomNav} aria-label="Main navigation">
            {returningNav.map(({ label, icon: Icon, href, active }) => (
              <Link href={href} className={active ? styles.navActive : styles.navItem} key={label}><Icon aria-hidden="true" /><span>{label}</span></Link>
            ))}
          </nav>
        ) : null}
      </section>
    </main>
  );
}
