"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  CalendarDays,
  ChevronRight,
  Home,
  Library,
  MessageCircleQuestion,
  NotebookPen,
  ShieldCheck,
  UserRound,
} from "lucide-react";
import { useStudyAccount } from "@/app/study-account";
import { readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import type { StudyPortfolio } from "@/lib/study-types";
import { getWeekOneTracking, readWeekOneSession } from "@/lib/week-one-tracking";
import styles from "./profile.module.css";

const nav = [
  { label: "Home", icon: Home, href: "/design-lock/home" },
  { label: "Today", icon: CalendarDays, href: "/design-lock/today" },
  { label: "Study", icon: BookOpen, href: "/design-lock/lesson" },
  { label: "My Bible", icon: Library, href: "/?resume=week1&study=open" },
  { label: "Profile", icon: UserRound, href: "/design-lock/profile", active: true },
];

const emptyPortfolio: StudyPortfolio = {
  deepCompleted: {}, deepNotes: {}, deepReflections: {}, scriptureTools: {}, readingHistory: {}, activityEvents: [],
};

export default function ProfileExperience() {
  const { user, cloudConfigured, openAccount } = useStudyAccount();
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(emptyPortfolio);
  const [session, setSession] = useState<ReturnType<typeof readWeekOneSession>>({});

  useEffect(() => {
    const refresh = () => { setPortfolio(readLocalPortfolio()); setSession(readWeekOneSession()); };
    refresh();
    window.addEventListener("storage", refresh);
    window.addEventListener(STUDY_UPDATED_EVENT, refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener(STUDY_UPDATED_EVENT, refresh);
    };
  }, []);

  const tracking = useMemo(() => getWeekOneTracking(session, portfolio), [session, portfolio]);
  const studyCounts = useMemo(() => Object.values(portfolio.scriptureTools || {}).reduce((counts, mark) => ({
    notes: counts.notes + (mark.notes?.trim() || mark.studyEntries?.some((entry) => entry.type === "note") ? 1 : 0),
    questions: counts.questions + (mark.question?.trim() || mark.studyEntries?.some((entry) => entry.type === "question") ? 1 : 0),
  }), { notes: 0, questions: 0 }), [portfolio]);

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <Link href="/design-lock/home" aria-label="Back to Home"><ArrowLeft /></Link>
          <strong>Profile</strong><span />
        </header>
        <div className={styles.content}>
          <section className={styles.identity}>
            <div>J</div><h1>Jasmine</h1><p>Your journey through Scripture</p>
          </section>
          <section className={styles.progressCard}>
            <small>WEEK 1 · THE BEGINNING</small>
            <div><h2>Your story is taking shape.</h2><strong>{tracking.percentage}%</strong></div>
            <span className={styles.progress}><i style={{ width: `${Math.max(tracking.percentage, 2)}%` }} /></span>
            <p>{tracking.completed} of {tracking.total} required steps complete</p>
            <Link href="/design-lock/today">View your course plan <ChevronRight /></Link>
          </section>
          <section className={styles.stats} aria-label="Saved study totals">
            <span><Bookmark /><strong>{tracking.savedDiscoveryCount}</strong><small>Saved</small></span>
            <span><NotebookPen /><strong>{studyCounts.notes}</strong><small>Notes</small></span>
            <span><MessageCircleQuestion /><strong>{studyCounts.questions}</strong><small>Questions</small></span>
          </section>
          <button type="button" className={styles.accountButton} onClick={openAccount}>
            <ShieldCheck /><span><strong>Account & sync</strong><small>{user?.email || (cloudConfigured ? "Protect your study across devices" : "Saved safely on this device")}</small></span><ChevronRight />
          </button>
        </div>
        <nav className={styles.bottomNav} aria-label="Main navigation">
          {nav.map(({ label, icon: Icon, href, active }) => <Link href={href} className={active ? styles.navActive : styles.navItem} key={label}><Icon /><span>{label}</span></Link>)}
        </nav>
      </section>
    </main>
  );
}
