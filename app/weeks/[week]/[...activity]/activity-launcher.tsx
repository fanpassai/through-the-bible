"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { ArrowLeft, ArrowRight, BookOpen, LockKeyhole } from "lucide-react";
import { courseManifest, getActivity } from "@/lib/course/manifest";
import { migrateLegacyWeekOneProgress } from "@/lib/course/legacy-week-one-progress";
import { resolveCourseProgress } from "@/lib/course/progress";
import type { CourseActivity } from "@/lib/course/types";
import { readLocalPortfolio } from "@/lib/study-progress";
import { WEEK_ONE_RESUME_KEY, type ResumeTarget } from "@/lib/week-one-tracking";
import { readWeekOneSession } from "@/lib/week-one-tracking";
import styles from "./activity.module.css";

function resumeTarget(activity: CourseActivity): ResumeTarget {
  const route = activity.route;
  const common = { title: activity.title, detail: activity.summary || "Week 1 · The Beginning" };
  switch (route.kind) {
    case "movement": return { ...common, key: "lesson", eyebrow: "VISUAL STORY", screen: "movement", index: route.movement - 1 };
    case "lesson": return { ...common, key: "lesson", eyebrow: "CORE LESSON", screen: "story", index: route.subject - 1 };
    case "scripture": return { ...common, key: "scripture", eyebrow: "REQUIRED SCRIPTURE", title: route.passage, screen: "scripture" };
    case "place": return { ...common, key: "place", eyebrow: "PLACE", screen: "place" };
    case "fill": return { ...common, key: "fill", eyebrow: "FILL", screen: "fill", index: route.question - 1 };
    case "connect": return { ...common, key: "connect", eyebrow: "CONNECT", screen: "connect", index: route.discovery - 1 };
    case "unlock": return { ...common, key: "unlock", eyebrow: "UNLOCK", screen: "unlock" };
    case "devotional": return { ...common, key: "deeper", eyebrow: "GO DEEPER", screen: "deep", index: route.day - 1 };
  }
}

export default function ActivityLauncher({ activity }: { activity: CourseActivity }) {
  const [blockedBy, setBlockedBy] = useState<CourseActivity | null | undefined>(undefined);

  useEffect(() => {
    const ledger = migrateLegacyWeekOneProgress(readWeekOneSession(), readLocalPortfolio());
    const resolved = resolveCourseProgress(courseManifest, ledger).weeks[0].activities.find(({ activity: item }) => item.id === activity.id);
    if (resolved?.status === "locked") {
      setBlockedBy(resolved.blockingActivityId ? getActivity(resolved.blockingActivityId) || null : null);
      return;
    }
    window.sessionStorage.setItem(WEEK_ONE_RESUME_KEY, JSON.stringify(resumeTarget(activity)));
    window.location.replace("/?resume=week1");
  }, [activity]);

  if (blockedBy !== undefined) {
    return (
      <main className={styles.lockedPage}>
        <Link className={styles.back} href="/weeks/1"><ArrowLeft aria-hidden="true" /> Week 1 plan</Link>
        <div className={styles.lockedCard}>
          <span className={styles.lock}><LockKeyhole aria-hidden="true" /></span>
          <p>NOT YET AVAILABLE</p>
          <h1>{activity.title}</h1>
          <span>Complete the step below first. Your place in the course will be preserved.</span>
          {blockedBy ? <Link className={styles.required} href={blockedBy.href}><span><small>REQUIRED FIRST</small><strong>{blockedBy.title}</strong></span><ArrowRight aria-hidden="true" /></Link> : null}
        </div>
      </main>
    );
  }

  return (
    <main className={styles.page}>
      <div className={styles.mark}><BookOpen aria-hidden="true" /></div>
      <p>OPENING WEEK 1</p>
      <h1>{activity.title}</h1>
    </main>
  );
}
