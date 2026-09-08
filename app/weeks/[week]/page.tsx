import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, BookOpen, LockKeyhole } from "lucide-react";
import { courseManifest, getWeek } from "@/lib/course/manifest";
import type { WeekNumber } from "@/lib/course/types";
import { weekArtwork } from "@/lib/course/presentation";
import styles from "./week.module.css";
import WeekPlanExperience from "./week-plan-experience";

type WeekPageProps = { params: Promise<{ week: string }> };

function parseWeek(value: string): WeekNumber | null {
  const number = Number(value);
  return Number.isInteger(number) && number >= 1 && number <= 10 ? number as WeekNumber : null;
}

export function generateStaticParams() {
  return courseManifest.weeks.map(({ number }) => ({ week: String(number) }));
}

export async function generateMetadata({ params }: WeekPageProps): Promise<Metadata> {
  const number = parseWeek((await params).week);
  const week = number ? getWeek(number) : undefined;
  if (!week) return { title: "Week — Through the Bible" };
  return {
    title: `Week ${week.number}${week.title ? `: ${week.title}` : ""} — Through the Bible`,
    description: week.subtitle || week.placeholderMessage,
  };
}

export default async function WeekPage({ params }: WeekPageProps) {
  const number = parseWeek((await params).week);
  if (!number) notFound();
  const week = getWeek(number);
  if (!week) notFound();
  if (week.number === 1) return <WeekPlanExperience />;

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <Link href="/journey" aria-label="Back to your journey"><ArrowLeft /></Link>
          <span><small>YOUR JOURNEY</small><strong>Week {String(week.number).padStart(2, "0")}</strong></span>
          <i />
        </header>
        <div className={styles.content}>
          <section className={styles.lockedHero}>
            <Image src={weekArtwork[week.number]} alt="A cinematic preview of the journey ahead" fill priority sizes="(max-width: 430px) 100vw, 430px" />
            <span aria-hidden="true" />
            <div className={styles.lockIcon}><LockKeyhole /></div>
            <div><p className={styles.eyebrow}>WEEK {String(week.number).padStart(2, "0")} · UPCOMING</p><h1>Your next chapter is being prepared.</h1></div>
          </section>
          <p className={styles.lockedMessage}>{week.placeholderMessage}</p>
          <section className={styles.promise}>
            <BookOpen />
            <span><strong>Nothing will be skipped.</strong><small>The lesson, Scripture, activities and devotionals will appear together here when the approved Week {week.number} plan is added.</small></span>
          </section>
          <Link className={styles.returnAction} href="/journey">Return to your current week</Link>
        </div>
      </section>
    </main>
  );
}
