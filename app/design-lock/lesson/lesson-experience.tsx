"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Bookmark,
  CalendarDays,
  Check,
  ChevronRight,
  Clock3,
  Compass,
  Home,
  Library,
  LockKeyhole,
  MapPin,
  Minus,
  Play,
  Sparkles,
  UserRound,
} from "lucide-react";
import lesson from "@/app/week1-data.json";
import { useStudyAccount } from "@/app/study-account";
import { mergePortfolios, readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import type { StudyPortfolio } from "@/lib/study-types";
import {
  getWeekOneTracking,
  readWeekOneSession,
  WEEK_ONE_RESUME_KEY,
  type ResumeTarget,
  type TrackingKey,
} from "@/lib/week-one-tracking";
import styles from "./lesson.module.css";

const story = lesson.STORY as [string, string, string[], string, string][];
const subjectImages = [
  "/images/week1-subject-01-cover.svg",
  "/images/week1-creation-sea.jpg",
  "/images/week1-eden-couple.jpg",
  "/images/week1-eden-vocation.jpg",
  "/images/week1-eden-temptation.jpg",
  "/images/week1-eden-shame.jpg",
  "/images/week1-eden-exile-couple.jpg",
  "/images/week1-hero-reference-v3-hd.png",
] as const;

const unitIcons = {
  lesson: BookOpen,
  scripture: Bookmark,
  place: MapPin,
  fill: Minus,
  connect: Compass,
  unlock: LockKeyhole,
  deeper: Sparkles,
} satisfies Record<TrackingKey, typeof BookOpen>;

const unitScreens: Record<TrackingKey, string> = {
  lesson: "story",
  scripture: "scripture",
  place: "place",
  fill: "fill",
  connect: "connect",
  unlock: "unlock",
  deeper: "deep",
};

const emptyPortfolio: StudyPortfolio = {
  deepCompleted: {},
  deepNotes: {},
  deepReflections: {},
  scriptureTools: {},
  readingHistory: {},
  activityEvents: [],
};

const navigation = [
  { label: "Home", icon: Home, href: "/design-lock/home" },
  { label: "Today", icon: CalendarDays, href: "/design-lock/today", active: true },
  { label: "Study", icon: BookOpen, href: "/design-lock/lesson" },
  { label: "My Bible", icon: Library, href: "/?resume=week1" },
  { label: "Profile", icon: UserRound, href: "#" },
];

export default function LessonExperience() {
  const { user, loadPortfolio } = useStudyAccount();
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(emptyPortfolio);
  const [session, setSession] = useState<ReturnType<typeof readWeekOneSession>>({});

  useEffect(() => {
    const refresh = () => {
      setPortfolio(readLocalPortfolio());
      setSession(readWeekOneSession());
    };
    refresh();
    let cancelled = false;
    if (user) {
      loadPortfolio().then((cloud) => {
        if (!cancelled && cloud) setPortfolio(mergePortfolios(cloud, readLocalPortfolio()));
      }).catch(() => undefined);
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

  const tracking = useMemo(() => getWeekOneTracking(session, portfolio), [session, portfolio]);
  const lessonUnit = tracking.units[0];
  const activeSubject = Math.min(lessonUnit.completed, story.length - 1);

  function openTarget(target: ResumeTarget) {
    window.sessionStorage.setItem(WEEK_ONE_RESUME_KEY, JSON.stringify(target));
    window.location.assign("/?resume=week1");
  }

  function openSubject(index: number) {
    const complete = index < lessonUnit.completed;
    openTarget({
      key: "lesson",
      eyebrow: complete ? "REVIEW SUBJECT" : index === activeSubject ? "CONTINUE LESSON" : "OPEN SUBJECT",
      title: story[index][1],
      detail: `Subject ${index + 1} of ${story.length}`,
      screen: "story",
      index,
    });
  }

  function openUnit(key: TrackingKey) {
    const unit = tracking.units.find((item) => item.key === key);
    if (!unit) return;
    if (tracking.next.key === key) return openTarget(tracking.next);
    openTarget({
      key,
      eyebrow: unit.completed >= unit.total ? "REVIEW COURSE WORK" : "OPEN COURSE WORK",
      title: unit.title,
      detail: unit.description,
      screen: unitScreens[key],
      index: 0,
    });
  }

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <Link href="/design-lock/today" aria-label="Back to Today"><ArrowLeft /></Link>
          <span><small>WEEK 1</small><strong>Lesson overview</strong></span>
          <i />
        </header>

        <div className={styles.content}>
          <section className={styles.hero}>
            <Image src="/images/today-week-1-creation-v2.webp" alt="Morning sunlight over mountains, a winding river and a landscape alive with wildflowers" fill priority sizes="(max-width: 430px) 100vw, 390px" />
            <span className={styles.heroShade} />
            <div><small>GENESIS 1–3</small><h1>The Beginning</h1><p>Creation, the Fall and the First Promise</p></div>
          </section>

          <section className={styles.progressCard}>
            <div><span>WEEK PROGRESS</span><strong>{tracking.percentage}%</strong></div>
            <div className={styles.progress}><i style={{ width: `${Math.max(tracking.percentage, 2)}%` }} /></div>
            <p>{tracking.completed} of {tracking.total} required steps complete</p>
          </section>

          <section className={styles.sectionHeading}>
            <small>IN PROGRESS</small><h2>Continue where you stopped</h2>
          </section>
          <section className={styles.continueCard}>
            <div className={styles.thumbnail}><Image src={subjectImages[activeSubject]} alt="" fill sizes="72px" /></div>
            <div><small>{tracking.next.eyebrow}</small><strong>{tracking.next.title}</strong><p>{tracking.next.detail}</p></div>
            <button type="button" onClick={() => openTarget(tracking.next)}>Continue</button>
          </section>

          <section className={styles.sectionHeading}>
            <small>THE LESSON</small><h2>Eight subjects. One story.</h2>
            <p>Every subject must be read before the lesson is marked complete.</p>
          </section>
          <div className={styles.subjectList}>
            {story.map((subject, index) => {
              const complete = index < lessonUnit.completed;
              const current = !complete && index === activeSubject;
              return (
                <button type="button" onClick={() => openSubject(index)} className={current ? styles.current : complete ? styles.complete : ""} key={subject[1]}>
                  <span className={styles.subjectImage}><Image src={subjectImages[index]} alt="" fill sizes="72px" /></span>
                  <span className={styles.subjectCopy}><small>{complete ? "COMPLETED" : current ? "IN PROGRESS" : "UP NEXT"} · SUBJECT {index + 1}</small><strong>{subject[1]}</strong><em>{subject[4]}</em></span>
                  <span className={styles.stateIcon}>{complete ? <Check /> : current ? <Play /> : <ChevronRight />}</span>
                </button>
              );
            })}
          </div>

          <section className={styles.sectionHeading}>
            <small>COURSE WORK</small><h2>Practice what you learned.</h2>
            <p>Required Scripture and every study activity count toward your Week 1 record.</p>
          </section>
          <div className={styles.courseworkList}>
            {tracking.units.slice(1).map((unit) => {
              const Icon = unitIcons[unit.key];
              const complete = unit.completed >= unit.total;
              const current = tracking.next.key === unit.key;
              return (
                <button type="button" onClick={() => openUnit(unit.key)} className={current ? styles.current : complete ? styles.complete : ""} key={unit.key}>
                  <span className={styles.courseIcon}>{complete ? <Check /> : <Icon />}</span>
                  <span><small>{complete ? "COMPLETED" : current ? "IN PROGRESS" : "UP NEXT"}</small><strong>{unit.title}</strong><em>{unit.description}</em></span>
                  <ChevronRight />
                </button>
              );
            })}
          </div>

          <section className={styles.nextLesson}>
            <Clock3 /><span><small>NEXT LESSON</small><strong>Week 2 opens Friday at 7:00 a.m.</strong><p>Everything you save remains connected to My Bible.</p></span>
          </section>
        </div>

        <nav className={styles.bottomNav} aria-label="Main navigation">
          {navigation.map(({ label, icon: Icon, href, active }) => (
            <Link href={href} className={active ? styles.navActive : styles.navItem} key={label}><Icon /><span>{label}</span></Link>
          ))}
        </nav>
      </section>
    </main>
  );
}
