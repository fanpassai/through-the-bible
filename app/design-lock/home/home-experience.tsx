import Link from "next/link";
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
import styles from "./home.module.css";

const nav = [
  { label: "Home", icon: Home, active: true },
  { label: "Today", icon: CalendarDays },
  { label: "Study", icon: BookOpen },
  { label: "My Bible", icon: Library },
  { label: "Profile", icon: UserRound },
];

export default function HomeExperience() {
  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.header}>
          <div>
            <span>Good Evening,</span>
            <h1>Jasmine</h1>
          </div>
          <button className={styles.avatar} type="button" aria-label="Open profile">
            <span>J</span>
            <Bell aria-hidden="true" />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.journey}>
            <p className={styles.cardTopline}>Continue Your Journey</p>
            <h2><span>Week 03: Abraham</span>The Covenant Promise</h2>
            <div className={styles.progressRow}>
              <div className={styles.progress} aria-label="60% complete"><span /></div>
              <strong>60%</strong>
            </div>
            <div className={styles.time}><Clock3 aria-hidden="true" /><span>12 min remaining today</span></div>
            <Link href="/" className={styles.continueButton}>Continue Reading</Link>
          </section>

          <div className={styles.sectionHeading}>
            <h2>Today</h2>
            <span>SUNDAY, MAY 18</span>
          </div>

          <section className={styles.todayList} aria-label="Today's study activities">
            <button type="button" className={styles.activity}>
              <span className={styles.icon}><Bookmark /></span>
              <span><strong>Daily Reading</strong><small>Genesis 12–15</small></span>
              <ChevronRight className={styles.chevron} />
            </button>
            <button type="button" className={styles.activity}>
              <span className={styles.icon}><Heart /></span>
              <span><strong>Devotional</strong><small>A Promise for Generations</small></span>
              <ChevronRight className={styles.chevron} />
            </button>
            <button type="button" className={styles.activity}>
              <span className={styles.icon}><Check /></span>
              <span><strong>Review</strong><small>2 passages to review</small></span>
              <ChevronRight className={styles.chevron} />
            </button>
          </section>
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
