"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Bell,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  Clock3,
  Heart,
  Home,
  Library,
  UserRound,
} from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { getWeeklyStudyStats, readLocalPortfolio } from "@/lib/study-progress";
import styles from "./home.module.css";

const nav = [
  { label: "Home", icon: Home, active: true },
  { label: "Today", icon: CalendarDays },
  { label: "Study", icon: BookOpen },
  { label: "My Bible", icon: Library },
  { label: "Profile", icon: UserRound },
];

function preferredName(user: User | null) {
  const metadataName = user?.user_metadata?.full_name || user?.user_metadata?.name;
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim().split(" ")[0];
  const emailName = user?.email?.split("@")[0];
  if (emailName) return emailName.charAt(0).toUpperCase() + emailName.slice(1);
  return "Jasmine";
}

export default function HomeExperience() {
  const [user, setUser] = useState<User | null>(null);
  const stats = useMemo(() => getWeeklyStudyStats(readLocalPortfolio()), []);
  const progress = stats.progress || 18;
  const name = preferredName(user);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => setUser(data.user));
    const { data } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    return () => data.subscription.unsubscribe();
  }, []);

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <div>
            <span>Good evening,</span>
            <h1>{name}</h1>
          </div>
          <button className={styles.avatar} type="button" aria-label="Open profile">
            <span>{name.charAt(0)}</span>
            <Bell aria-hidden="true" />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.journey}>
            <div className={styles.cardTopline}>
              <span>Continue Your Journey</span>
              <strong>{progress}%</strong>
            </div>
            <p className={styles.weekLabel}>WEEK 01</p>
            <h2>The Beginning</h2>
            <p className={styles.lessonName}>Creation, the Fall and the First Promise</p>
            <div className={styles.progress} aria-label={`${progress}% complete`}><span style={{ width: `${progress}%` }} /></div>
            <div className={styles.time}><Clock3 aria-hidden="true" /><span>12 min remaining today</span></div>
            <Link href="/" className={styles.continueButton}>Continue Reading <ArrowRight aria-hidden="true" /></Link>
          </section>

          <div className={styles.sectionHeading}>
            <h2>Today</h2>
            <span>MONDAY · SEPTEMBER 1</span>
          </div>

          <section className={styles.todayList} aria-label="Today's study activities">
            <button type="button" className={styles.activity}>
              <span className={styles.icon}><Bookmark /></span>
              <span><strong>Daily Reading</strong><small>Genesis 1:1–31</small></span>
              <ArrowRight className={styles.chevron} />
            </button>
            <button type="button" className={styles.activity}>
              <span className={styles.icon}><Heart /></span>
              <span><strong>Devotional</strong><small>Before anything began</small></span>
              <ArrowRight className={styles.chevron} />
            </button>
            <button type="button" className={styles.activity}>
              <span className={styles.icon}><Check /></span>
              <span><strong>Review</strong><small>{stats.mostRevisited ? `Return to ${stats.mostRevisited}` : "2 passages to revisit"}</small></span>
              <ArrowRight className={styles.chevron} />
            </button>
          </section>

          <p className={styles.quietNote}>One faithful step at a time. Your study is saved automatically.</p>
        </div>

        <nav className={styles.bottomNav} aria-label="Main navigation">
          {nav.map(({ label, icon: Icon, active }) => (
            <button type="button" className={active ? styles.navActive : styles.navItem} key={label}>
              <Icon aria-hidden="true" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </section>
    </main>
  );
}
