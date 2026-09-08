"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Heart,
  Home,
  Library,
  UserRound,
} from "lucide-react";
import { readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import type { StudyPortfolio } from "@/lib/study-types";
import {
  getWeekOneTracking,
  readWeekOneSession,
  WEEK_ONE_RESUME_KEY,
  type ResumeTarget,
} from "@/lib/week-one-tracking";
import styles from "./home.module.css";

const nav = [
  { label: "Home", icon: Home, href: "/design-lock/home", active: true },
  { label: "Today", icon: CalendarDays, href: "/design-lock/today" },
  { label: "Study", icon: BookOpen, href: "/design-lock/lesson" },
  { label: "My Bible", icon: Library, href: "/?resume=week1&study=open" },
  { label: "Profile", icon: UserRound, href: "/design-lock/profile" },
];

const emptyPortfolio: StudyPortfolio = {
  deepCompleted: {},
  deepNotes: {},
  deepReflections: {},
  scriptureTools: {},
  readingHistory: {},
  activityEvents: [],
};

export default function HomeExperience() {
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(emptyPortfolio);
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

  const tracking = useMemo(() => getWeekOneTracking(session, portfolio), [session, portfolio]);
  const devotional = tracking.units.find((unit) => unit.key === "deeper");
  const devotionalDay = Math.min((devotional?.completed ?? 0) + 1, 7);

  function openTarget(target: ResumeTarget) {
    window.sessionStorage.setItem(WEEK_ONE_RESUME_KEY, JSON.stringify(target));
    window.location.assign("/?resume=week1");
  }

  function openDevotional() {
    openTarget({
      key: "deeper",
      eyebrow: "CONTINUE GO DEEPER",
      title: `Day ${devotionalDay}`,
      detail: `${devotional?.completed ?? 0} of 7 days complete`,
      screen: "deep",
      index: Math.max(0, devotionalDay - 1),
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <div>
            <span>Good Evening,</span>
            <h1>Jasmine</h1>
          </div>
          <Link className={styles.avatar} href="/design-lock/profile" aria-label="Open profile and account">
            <span>J</span>
            <Bell aria-hidden="true" />
          </Link>
        </header>

        <div className={styles.content}>
          <section className={styles.journey}>
            <p className={styles.cardTopline}>Continue Your Journey</p>
            <h2><span>Week 01: The Beginning</span>Creation, the Fall and the First Promise</h2>
            <div className={styles.progressRow}>
              <div className={styles.progress} aria-label={`${tracking.percentage}% complete`}><span style={{ width: `${Math.max(tracking.percentage, 2)}%` }} /></div>
              <strong>{tracking.percentage}%</strong>
            </div>
            <div className={styles.time}><Clock3 aria-hidden="true" /><span>{tracking.completed} of {tracking.total} required steps complete</span></div>
            <button type="button" className={styles.continueButton} onClick={() => openTarget(tracking.next)}>
              {tracking.percentage ? "Continue Lesson 1" : "Begin Lesson 1"}
            </button>
          </section>

          <div className={styles.sectionHeading}>
            <h2>Today</h2>
            <span>WEEK 1 · GENESIS 1–3</span>
          </div>

          <section className={styles.todayList} aria-label="Today's study activities">
            <Link href="/design-lock/reader?reference=Genesis%201%3A3%E2%80%9331" className={styles.activity}>
              <span className={styles.icon}><Bookmark /></span>
              <span><strong>Daily Reading</strong><small>Genesis 1:3–31</small></span>
              <ChevronRight className={styles.chevron} />
            </Link>
            <button type="button" className={styles.activity} onClick={openDevotional}>
              <span className={styles.icon}><Heart /></span>
              <span><strong>Devotional</strong><small>Go Deeper · Day {devotionalDay}</small></span>
              <ChevronRight className={styles.chevron} />
            </button>
            <Link href="/?resume=week1&study=open" className={styles.activity}>
              <span className={styles.icon}><Check /></span>
              <span><strong>Review</strong><small>{tracking.savedDiscoveryCount ? `${tracking.savedDiscoveryCount} saved discoveries` : "Your notes, questions and marked Scripture"}</small></span>
              <ChevronRight className={styles.chevron} />
            </Link>
          </section>

          <section className={styles.weekSnapshot} aria-label="Your Week 1 progress">
            <div className={styles.snapshotHeading}>
              <span><strong>Your Week 1</strong><small>Everything stays connected.</small></span>
              <Link href="/design-lock/today">View plan <ChevronRight /></Link>
            </div>
            <div className={styles.snapshotStats}>
              <span><strong>{tracking.percentage}%</strong><small>Progress</small></span>
              <span><strong>{tracking.savedDiscoveryCount}</strong><small>Saved</small></span>
              <span><strong>{tracking.reviewCount}</strong><small>To review</small></span>
            </div>
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
