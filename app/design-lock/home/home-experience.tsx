"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowRight, BookOpen, CalendarDays, Check, ChevronRight, Home, Library, LockKeyhole, Play, Route, Sparkles, UserRound } from "lucide-react";
import { courseManifest, getActivity, weekOneManifest } from "@/lib/course/manifest";
import { migrateLegacyWeekOneProgress } from "@/lib/course/legacy-week-one-progress";
import { activityArtwork, weekArtwork } from "@/lib/course/presentation";
import { resolveCourseProgress } from "@/lib/course/progress";
import type { CourseProgressStatus } from "@/lib/course/types";
import { readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import { EMPTY_PORTFOLIO, type StudyPortfolio } from "@/lib/study-types";
import { getWeekOneTracking, readWeekOneSession, WEEK_ONE_RESUME_KEY, type ResumeTarget } from "@/lib/week-one-tracking";
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
  pending: "Available",
  locked: "Locked",
};

const weekOneFeatures = [
  { section: weekOneManifest.sections[0], image: activityArtwork.movement, label: "Visual story" },
  { section: weekOneManifest.sections[1], image: activityArtwork.lesson, label: "Core lesson" },
  { section: weekOneManifest.sections[2], image: activityArtwork.scripture, label: "Scripture" },
  { section: weekOneManifest.sections[7], image: activityArtwork.devotional, label: "Go Deeper" },
] as const;

export default function HomeExperience() {
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(EMPTY_PORTFOLIO);
  const [session, setSession] = useState<ReturnType<typeof readWeekOneSession>>({});

  useEffect(() => {
    const refresh = () => { setPortfolio(readLocalPortfolio()); setSession(readWeekOneSession()); };
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

  const tracking = useMemo(() => getWeekOneTracking(session, portfolio), [session, portfolio]);
  const journey = useMemo(() => resolveCourseProgress(courseManifest, migrateLegacyWeekOneProgress(session, portfolio)), [session, portfolio]);
  const weekOne = journey.weeks[0];
  const currentActivity = journey.currentActivityId ? getActivity(journey.currentActivityId) : undefined;
  const hasStarted = weekOne.status === "in-progress" || weekOne.status === "completed";
  const mainLabel = weekOne.status === "completed" ? "Review Week 1" : hasStarted ? "Continue where you stopped" : "Start Week 1";

  function openTarget(target: ResumeTarget) {
    window.sessionStorage.setItem(WEEK_ONE_RESUME_KEY, JSON.stringify(target));
    window.location.assign("/?resume=week1");
  }

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <div><span>YOUR JOURNEY</span><h1>Good evening, Jasmine</h1></div>
          <Link className={styles.avatar} href="/design-lock/profile" aria-label="Open profile and account">J</Link>
        </header>

        <div className={`${styles.content} ${hasStarted ? styles.withNav : ""}`}>
          <section className={styles.currentCard} aria-label="Your current week">
            <div className={styles.currentImage}>
              <Image src={weekArtwork[1]} alt="Morning light over the created world" fill priority sizes="(max-width: 430px) 100vw, 390px" />
              <span aria-hidden="true" />
              <div className={styles.heroStatus}><span>{hasStarted ? <Play aria-hidden="true" /> : <Route aria-hidden="true" />}</span>WEEK 01 · {statusLabels[weekOne.status]}</div>
              <div className={styles.heroCopy}><small>GENESIS 1–3</small><h2>The Beginning</h2><p>Creation, the Fall and the First Promise</p></div>
            </div>
            <div className={styles.currentBody}>
              <div className={styles.progressTop}><span>WEEK PROGRESS</span><strong>{weekOne.percentage}%</strong></div>
              <span className={styles.progress}><i style={{ width: `${Math.max(weekOne.percentage, 2)}%` }} /></span>
              <div className={styles.position}><span><small>{hasStarted ? "YOUR NEXT STEP" : "YOUR FIRST STEP"}</small><strong>{currentActivity?.title || "Before anything else, God."}</strong></span><ChevronRight aria-hidden="true" /></div>
              <button type="button" className={styles.primaryAction} onClick={() => openTarget(tracking.next)}><span>{mainLabel}</span><ArrowRight aria-hidden="true" /></button>
              <Link className={styles.planAction} href="/weeks/1">See the complete Week 1 plan</Link>
            </div>
          </section>

          <section className={styles.journeySection} aria-labelledby="journey-title">
            <div className={styles.sectionHeading}><span><small>THE COMPLETE COURSE</small><h2 id="journey-title">Your 10-week journey</h2></span><p>Week 1 of 10</p></div>
            <p className={styles.sectionIntro}>Every week has a place. Open one to see its complete plan or what is coming next.</p>
            <div className={styles.weekGrid}>
              {journey.weeks.map(({ week, status, percentage }) => (
                <Link href={week.href} className={`${styles.weekCard} ${styles[status]}`} aria-label={`Open Week ${week.number}. ${statusLabels[status]}.`} key={week.id}>
                  <span className={styles.weekImage}><Image src={weekArtwork[week.number]} alt="" fill sizes="185px" /><i aria-hidden="true" /><em>{status === "locked" ? <LockKeyhole aria-hidden="true" /> : status === "completed" ? <Check aria-hidden="true" /> : <Play aria-hidden="true" />}</em></span>
                  <span className={styles.weekCopy}><small>WEEK {String(week.number).padStart(2, "0")}</small><strong>{week.title || "Coming into view"}</strong><em>{status === "in-progress" ? `${percentage}% complete` : statusLabels[status]}</em></span>
                </Link>
              ))}
            </div>
          </section>

          <section className={styles.insideSection} aria-labelledby="inside-week-one">
            <div className={styles.sectionHeading}><span><small>INSIDE YOUR CURRENT WEEK</small><h2 id="inside-week-one">Enter Week 1 directly</h2></span></div>
            <div className={styles.featureGrid}>
              {weekOneFeatures.map(({ section, image, label }) => (
                <Link href={section.activities[0].href} className={styles.featureCard} key={section.id}>
                  <span><Image src={image} alt="" fill sizes="185px" /><i aria-hidden="true" /></span>
                  <small>{String(section.activities.length).padStart(2, "0")} {section.activities.length === 1 ? "ACTIVITY" : "ACTIVITIES"}</small>
                  <strong>{label}</strong>
                  <em>Open <ChevronRight aria-hidden="true" /></em>
                </Link>
              ))}
            </div>
            <Link className={styles.fullPlan} href="/weeks/1"><span><BookOpen aria-hidden="true" /><strong>View every lesson, Scripture and activity</strong></span><ArrowRight aria-hidden="true" /></Link>
          </section>
        </div>

        {hasStarted ? <nav className={styles.bottomNav} aria-label="Main navigation">{returningNav.map(({ label, icon: Icon, href, active }) => <Link href={href} className={active ? styles.navActive : styles.navItem} key={label}><Icon aria-hidden="true" /><span>{label}</span></Link>)}</nav> : null}
      </section>
    </main>
  );
}
