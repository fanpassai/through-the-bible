"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, Check, ChevronRight, Circle, LockKeyhole, Play, Route } from "lucide-react";
import { weekOneManifest } from "@/lib/course/manifest";
import { migrateLegacyWeekOneProgress } from "@/lib/course/legacy-week-one-progress";
import { activityArtwork } from "@/lib/course/presentation";
import { resolveWeekProgress } from "@/lib/course/progress";
import type { CourseProgressStatus } from "@/lib/course/types";
import { readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import { EMPTY_PORTFOLIO, type StudyPortfolio } from "@/lib/study-types";
import { getWeekOneTracking, readWeekOneSession, WEEK_ONE_RESUME_KEY } from "@/lib/week-one-tracking";
import styles from "./week.module.css";

const statusCopy: Record<CourseProgressStatus, string> = {
  completed: "Completed",
  "in-progress": "In progress",
  available: "Start here",
  pending: "Available",
  locked: "Locked",
};

function StatusIcon({ status }: { status: CourseProgressStatus }) {
  if (status === "completed") return <Check aria-hidden="true" />;
  if (status === "locked") return <LockKeyhole aria-hidden="true" />;
  if (status === "in-progress" || status === "available") return <Play aria-hidden="true" />;
  return <Circle aria-hidden="true" />;
}

export default function WeekPlanExperience() {
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(EMPTY_PORTFOLIO);
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

  const progress = useMemo(() => resolveWeekProgress(weekOneManifest, migrateLegacyWeekOneProgress(session, portfolio)), [session, portfolio]);
  const tracking = useMemo(() => getWeekOneTracking(session, portfolio), [session, portfolio]);
  const byId = useMemo(() => new Map(progress.activities.map((item) => [item.activity.id, item])), [progress]);

  function continueWeek() {
    window.sessionStorage.setItem(WEEK_ONE_RESUME_KEY, JSON.stringify(tracking.next));
    window.location.assign("/?resume=week1");
  }

  return (
    <main className={styles.planPage}>
      <section className={styles.planDevice}>
        <header className={styles.planHeader}>
          <Link href="/journey" aria-label="Back to your journey"><ArrowLeft aria-hidden="true" /></Link>
          <span><small>YOUR JOURNEY</small><strong>Week 01</strong></span>
          <i />
        </header>

        <div className={styles.planContent}>
          <section className={styles.planHero}>
            <Image src="/images/week1-cinematic-master-v4.webp" alt="The created world opening into light" fill priority sizes="(max-width: 430px) 100vw, 430px" />
            <span className={styles.planHeroShade} aria-hidden="true" />
            <div><small>GENESIS 1–3</small><h1>The Beginning</h1><p>Creation, the Fall and the First Promise</p></div>
          </section>

          <section className={styles.planProgress} aria-label={`Week 1 is ${progress.percentage}% complete`}>
            <div><span><Route aria-hidden="true" /><small>WEEK PROGRESS</small></span><strong>{progress.percentage}%</strong></div>
            <span className={styles.planMeter}><i style={{ width: `${Math.max(progress.percentage, 2)}%` }} /></span>
            <p>{progress.completed} of {progress.total} required activities completed</p>
            <button type="button" onClick={continueWeek}><span>{progress.percentage ? "Continue where you stopped" : "Begin Week 1"}<small>{tracking.next.title}</small></span><ArrowRight aria-hidden="true" /></button>
          </section>

          <div className={styles.planIntro}>
            <small>YOUR COMPLETE WEEK</small>
            <h2>Everything is here. Nothing disappears.</h2>
            <p>Open any available activity directly. Locked steps show exactly what must be completed first.</p>
          </div>

          <div className={styles.sectionList}>
            {weekOneManifest.sections.map((section) => {
              const first = section.activities[0];
              return (
                <section className={styles.sectionCard} key={section.id}>
                  <div className={styles.sectionCover}>
                    <Image src={activityArtwork[first.kind]} alt="" fill sizes="382px" />
                    <span aria-hidden="true" />
                    <div><small>{String(section.activities.length).padStart(2, "0")} {section.activities.length === 1 ? "ACTIVITY" : "ACTIVITIES"}</small><h3>{section.title}</h3><p>{section.description}</p></div>
                  </div>
                  <div className={styles.activityList}>
                    {section.activities.map((activity, index) => {
                      const resolved = byId.get(activity.id);
                      const status = resolved?.status || "locked";
                      return (
                        <Link href={activity.href} className={`${styles.activityRow} ${styles[status]}`} key={activity.id}>
                          <span className={styles.activityNumber}>{String(index + 1).padStart(2, "0")}</span>
                          <span className={styles.activityCopy}><strong>{activity.title}</strong>{activity.summary ? <small>{activity.summary}</small> : null}<em>{statusCopy[status]}</em></span>
                          <span className={styles.activityState}><StatusIcon status={status} /></span>
                        </Link>
                      );
                    })}
                  </div>
                  <Link className={styles.sectionContinue} href={first.href}><span>Open {section.title}</span><ChevronRight aria-hidden="true" /></Link>
                </section>
              );
            })}
          </div>
        </div>
      </section>
    </main>
  );
}
