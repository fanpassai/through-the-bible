"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, Award, BookMarked, BookOpen, Bookmark, CalendarDays,
  ChevronRight, CircleHelp, Compass, Flame, Highlighter, Home, Mail,
  Map, NotebookPen, Search, ShieldCheck, Sparkles, Underline, UserRound,
} from "lucide-react";
import CourseExperience from "./course-experience";
import { useStudyAccount } from "./study-account";
import { getWeeklyStudyStats, mergePortfolios, readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import type { StudyPortfolio } from "@/lib/study-types";

type Stage = "launch" | "auth" | "home" | "today" | "study" | "bible" | "profile" | "journey" | "week1";

function firstName(email: string | undefined, metadataName: unknown) {
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim().split(/\s+/)[0];
  const local = email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  return local ? local.charAt(0).toUpperCase() + local.slice(1) : "friend";
}

function greeting() {
  const hour = new Date().getHours();
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

function initials(name: string) { return name.slice(0, 1).toUpperCase(); }

export default function ProductExperience() {
  const { user, loading } = useStudyAccount();
  const [stage, setStage] = useState<Stage>("launch");
  const [openStudyOnEntry, setOpenStudyOnEntry] = useState(false);

  useEffect(() => {
    if (loading) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("resume") !== "week1") return;
    window.history.replaceState({}, "", window.location.pathname);
    const timer = window.setTimeout(() => setStage("week1"), 0);
    return () => window.clearTimeout(timer);
  }, [loading]);

  function enter() { if (!loading) setStage(user ? "home" : "auth"); }
  function openWeek(study = false) { setOpenStudyOnEntry(study); setStage("week1"); }

  if (stage === "launch") return <Launch loading={loading} onEnter={enter} />;
  if (stage === "auth" && !user) return <SignIn onBack={() => setStage("launch")} onPreview={() => setStage("home")} />;
  if (stage === "journey") return <CourseExperience initialView="intro" onProductHome={() => setStage("home")} />;
  if (stage === "week1") return <CourseExperience initialView="week1" initialOpenStudy={openStudyOnEntry} onProductHome={() => setStage("home")} />;

  return <ProductShell stage={stage === "auth" ? "home" : stage} setStage={setStage} openWeek={openWeek} />;
}

function Launch({ loading, onEnter }: { loading: boolean; onEnter: () => void }) {
  return <main className="ttb-product"><section className="ttb-mobile ttb-launch ttb-launch-v2">
    <div className="ttb-launch-lockup">
      <span className="ttb-launch-mark"><BookOpen /></span>
      <h1><span>Through the</span><span>Bible</span></h1>
      <i className="ttb-launch-divider" aria-hidden="true" />
      <p>YOUR JOURNEY · HIS STORY</p>
    </div>
    <div className="ttb-launch-bottom">
      <small>UNDERSTAND · CONNECT · LIVE</small>
      <button type="button" onClick={onEnter} disabled={loading}>{loading ? "Preparing…" : "Enter"}<ArrowRight /></button>
    </div>
  </section></main>;
}

function SignIn({ onBack, onPreview }: { onBack: () => void; onPreview: () => void }) {
  const { cloudConfigured, authMessage, authSending, clearAuthMessage, sendMagicLink } = useStudyAccount();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (await sendMagicLink(email, name)) setSent(true);
  }

  if (sent) return <main className="ttb-product"><section className="ttb-mobile ttb-sent"><span><Mail /></span><h1 className="ttb-serif">Check your email.</h1><p>Your private sign-in link is on its way to <b>{email}</b>. Open it and your study will be waiting.</p><button className="ttb-preview" onClick={() => setSent(false)}>Use another email</button></section></main>;

  return <main className="ttb-product"><section className="ttb-mobile ttb-signin">
    <div className="ttb-signin-top"><button className="ttb-icon-button" onClick={onBack}><ArrowLeft /></button><span className="ttb-brand-mini">THROUGH THE BIBLE</span></div>
    <div className="ttb-signin-hero"><p className="ttb-eyebrow">YOUR STUDY · REMEMBERED</p><h1 className="ttb-serif">Read deeply.<br />Keep what<br />you find.</h1><p>Scripture, questions, highlights and reflections—kept together as the story unfolds.</p></div>
    <form className="ttb-signin-card" onSubmit={submit}><h2>Enter your study.</h2><p>We’ll email you a secure link. No password to create or remember.</p>
      <label className="ttb-field"><span>First name</span><input value={name} onChange={(e) => setName(e.target.value)} placeholder="How should we greet you?" /></label>
      <label className="ttb-field"><span>Email address</span><input type="email" value={email} onChange={(e) => { setEmail(e.target.value); clearAuthMessage(); }} placeholder="you@example.com" required /></label>
      <button className="ttb-primary" disabled={!cloudConfigured || !email.trim() || authSending}><Mail />{authSending ? "Sending secure link…" : "Continue securely"}<ArrowRight /></button>
      {authMessage ? <p className="ttb-auth-message">{authMessage}</p> : null}
      <div className="ttb-private"><ShieldCheck /><span><b>Private by design.</b> Your notes, highlights and reflections belong to you.</span></div>
    </form>
    <button className="ttb-preview" onClick={onPreview}>Preview the course without saving</button>
  </section></main>;
}

function ProductShell({ stage, setStage, openWeek }: { stage: Stage; setStage: (stage: Stage) => void; openWeek: (study?: boolean) => void }) {
  const { user, loadPortfolio, openAccount } = useStudyAccount();
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(() => readLocalPortfolio());
  const stats = useMemo(() => getWeeklyStudyStats(portfolio), [portfolio]);
  const name = firstName(user?.email, user?.user_metadata?.full_name);

  useEffect(() => {
    let cancelled = false;
    const refresh = () => { if (!cancelled) setPortfolio(readLocalPortfolio()); };
    refresh();
    if (user) loadPortfolio().then((cloud) => { if (!cancelled && cloud) setPortfolio(mergePortfolios(cloud, readLocalPortfolio())); }).catch(() => undefined);
    window.addEventListener(STUDY_UPDATED_EVENT, refresh);
    return () => { cancelled = true; window.removeEventListener(STUDY_UPDATED_EVENT, refresh); };
  }, [user, loadPortfolio]);

  const navStage = stage === "study" || stage === "bible" ? stage : stage === "profile" ? "profile" : stage === "today" ? "today" : "home";
  return <main className="ttb-product"><section className="ttb-mobile">
    {stage === "home" && <HomeScreen name={name} stats={stats} openWeek={openWeek} setStage={setStage} openAccount={openAccount} />}
    {stage === "today" && <TodayScreen stats={stats} openWeek={openWeek} />}
    {stage === "study" && <StudyScreen setStage={setStage} openWeek={openWeek} />}
    {stage === "bible" && <MyBibleScreen portfolio={portfolio} stats={stats} openWeek={openWeek} />}
    {stage === "profile" && <ProfileScreen name={name} stats={stats} openAccount={openAccount} />}
    <BottomNav active={navStage} setStage={setStage} />
  </section></main>;
}

function HomeScreen({ name, stats, openWeek, setStage, openAccount }: { name: string; stats: ReturnType<typeof getWeeklyStudyStats>; openWeek: (study?: boolean) => void; setStage: (s: Stage) => void; openAccount: () => void }) {
  return <div className="ttb-page">
    <header className="ttb-topbar"><div className="ttb-greeting"><small>{greeting()}</small><h1 className="ttb-serif">{name}</h1></div><button className="ttb-avatar" onClick={openAccount}>{initials(name)}<i /></button></header>
    <section className="ttb-journey"><div className="ttb-journey-row"><div><p className="ttb-eyebrow">CONTINUE YOUR JOURNEY</p><h2 className="ttb-serif">Week 01: The Beginning</h2><p>Creation · Fall · First Promise</p></div><span className="ttb-progress-value">{stats.progress}%</span></div><div className="ttb-progress"><i style={{ width: `${Math.max(stats.progress, 3)}%` }} /></div><button onClick={() => openWeek(false)}>{stats.progress ? "Continue Week 01" : "Begin Week 01"}<ArrowRight /></button></section>
    <div className="ttb-section-head"><h2>Today</h2><button onClick={() => setStage("today")}>See your day <ChevronRight /></button></div>
    <div className="ttb-daily-list"><Daily icon={BookOpen} title="Daily Reading" meta="Genesis 1–3 · Start in the text" onClick={() => openWeek(false)} /><Daily icon={Sparkles} title="Devotional" meta="Intentional God" onClick={() => openWeek(true)} /><Daily icon={Flame} title="Review" meta="Place · Fill · Connect · Unlock" onClick={() => openWeek(false)} /></div>
    <div className="ttb-section-head"><h2>Your week</h2><button onClick={() => setStage("profile")}>Full recap <ChevronRight /></button></div>
    <Stats stats={stats} />
  </div>;
}

function TodayScreen({ stats, openWeek }: { stats: ReturnType<typeof getWeeklyStudyStats>; openWeek: (study?: boolean) => void }) {
  return <div className="ttb-page"><div className="ttb-screen-title"><small>MONDAY · WEEK 01</small><h1 className="ttb-serif">Today</h1></div>
    <section className="ttb-today-hero"><div><small>GENESIS 1–3</small><h2 className="ttb-serif">In the beginning, everything had purpose.</h2></div></section>
    <p className="ttb-eyebrow">YOUR DAILY RHYTHM</p>
    <div className="ttb-daily-list"><Daily icon={BookOpen} title="Read" meta="Genesis 1–3" onClick={() => openWeek(false)} /><Daily icon={Sparkles} title="Reflect" meta="Intentional God · Daily devotional" onClick={() => openWeek(true)} /><Daily icon={NotebookPen} title="Review" meta={stats.progress ? `${stats.progress}% of Week 01 complete` : "Build the story in memory"} onClick={() => openWeek(false)} /></div>
  </div>;
}

function StudyScreen({ setStage, openWeek }: { setStage: (s: Stage) => void; openWeek: (study?: boolean) => void }) {
  const items = [
    [BookOpen, "Bible Study", "Courses & lessons", () => openWeek(false)],
    [Compass, "Timeline", "See God's story", () => setStage("journey")],
    [Map, "Maps", "Explore people and places", () => openWeek(false)],
    [Search, "Word Studies", "Meaning, context & original language", () => openWeek(true)],
    [UserRound, "People & Places", "Profiles & background", () => openWeek(false)],
    [BookMarked, "Resources", "Articles, charts & study material", () => openWeek(true)],
  ] as const;
  return <div className="ttb-page"><div className="ttb-screen-title"><small>GO DEEPER</small><h1 className="ttb-serif">Study</h1></div><p className="ttb-eyebrow">YOUR STUDY CENTER</p><div className="ttb-menu-list">{items.map(([Icon,title,meta,onClick]) => <button className="ttb-menu" onClick={onClick} key={title}><span className="ttb-menu-icon"><Icon /></span><span><b>{title}</b><small>{meta}</small></span><ChevronRight /></button>)}</div></div>;
}

function MyBibleScreen({ portfolio, stats, openWeek }: { portfolio: StudyPortfolio; stats: ReturnType<typeof getWeeklyStudyStats>; openWeek: (study?: boolean) => void }) {
  const markEntries = Object.entries(portfolio.scriptureTools || {});
  const marks = markEntries.map(([, mark]) => mark);
  const highlightCount = marks.reduce((n, m) => n + (m.selections?.filter(s => s.type === "highlight").length || 0), 0);
  const underlineCount = marks.reduce((n, m) => n + (m.selections?.filter(s => s.type === "underline").length || 0), 0);
  const savedCount = marks.filter(m => m.bookmark).length;
  const notes = markEntries.flatMap(([reference, mark]) => [
    ...(mark.notes?.trim() ? [{ reference, body: mark.notes.trim(), quote: "", verse: "" }] : []),
    ...(mark.studyEntries || [])
      .filter((entry) => entry.type === "note" && entry.body.trim())
      .map((entry) => ({ reference, body: entry.body.trim(), quote: entry.quote, verse: entry.verse || "" })),
  ]).slice(0, 3);
  const rows = [[Highlighter,"Highlights",highlightCount],[Underline,"Underlined",underlineCount],[NotebookPen,"My Notes",stats.notes],[CircleHelp,"Questions I Asked",stats.questions],[Bookmark,"Saved Scriptures",savedCount],[Search,"Word Studies",0]] as const;
  return <div className="ttb-page"><div className="ttb-screen-title"><small>EVERYTHING YOU&apos;VE KEPT</small><h1 className="ttb-serif">My Bible</h1></div><div className="ttb-library-counts">{rows.map(([Icon,label,count]) => <button className="ttb-library-card" key={label} onClick={() => openWeek(true)}><span><Icon /></span><span><b>{label}</b><small>Week 01 saved study</small></span><strong>{count}</strong></button>)}</div><div className="ttb-section-head"><h2>Recent notes</h2></div>{notes.length ? notes.map((note,i) => <article className="ttb-saved-note" key={`${note.reference}-${note.verse}-${i}`}><small>{note.reference}{note.verse ? ` · VERSE ${note.verse}` : ""}</small>{note.quote ? <blockquote>“{note.quote}”</blockquote> : null}<p>{note.body}</p></article>) : <div className="ttb-empty">Your notes will collect here as you read. Open a Scripture, select what arrests your attention, and save the thought you want to carry with you.</div>}</div>;
}

function ProfileScreen({ name, stats, openAccount }: { name: string; stats: ReturnType<typeof getWeeklyStudyStats>; openAccount: () => void }) {
  return <div className="ttb-page"><section className="ttb-profile-card"><div className="ttb-profile-avatar">{initials(name)}</div><h1 className="ttb-serif">{name}</h1><p>Your journey through Scripture</p></section>
    <section className="ttb-week-card"><small>YOUR WEEK</small><h2 className="ttb-serif">You stayed with the story.</h2><p>A record of where you read, paused, marked and asked.</p><div className="ttb-week-grid"><div><strong>{stats.passagesRead}</strong><span>passages</span></div><div><strong>{stats.marks}</strong><span>highlights</span></div><div><strong>{stats.notes}</strong><span>notes</span></div><div><strong>{stats.questions}</strong><span>questions</span></div></div></section>
    <div className="ttb-section-head"><h2>Milestones</h2></div><div className="ttb-achievement"><span><Award /></span><div><b>Week 01 Explorer</b><small>{stats.progress ? `${stats.progress}% of the beginning explored` : "Your first milestone begins here"}</small></div></div><div className="ttb-achievement"><span><BookOpen /></span><div><b>Most revisited</b><small>{stats.mostRevisited || "Your first passage will appear here"}</small></div></div>
    <button className="ttb-primary" style={{ marginTop: 20 }} onClick={openAccount}><UserRound />Account & sync</button>
  </div>;
}

function Daily({ icon: Icon, title, meta, onClick }: { icon: typeof BookOpen; title: string; meta: string; onClick: () => void }) {
  return <button className="ttb-daily-item" onClick={onClick}><span className="ttb-daily-icon"><Icon /></span><span><b>{title}</b><small>{meta}</small></span><ChevronRight /></button>;
}

function Stats({ stats }: { stats: ReturnType<typeof getWeeklyStudyStats> }) {
  return <div className="ttb-stats-strip"><div className="ttb-stat-mini"><strong>{stats.passagesRead}</strong><span>Passages</span></div><div className="ttb-stat-mini"><strong>{stats.marks}</strong><span>Highlights</span></div><div className="ttb-stat-mini"><strong>{stats.notes}</strong><span>Notes</span></div><div className="ttb-stat-mini"><strong>{stats.questions}</strong><span>Questions</span></div></div>;
}

function BottomNav({ active, setStage }: { active: string; setStage: (s: Stage) => void }) {
  const items = [["home",Home,"Home"],["today",CalendarDays,"Today"],["study",Compass,"Study"],["bible",BookOpen,"My Bible"],["profile",UserRound,"Profile"]] as const;
  return <nav className="ttb-nav">{items.map(([stage,Icon,label]) => <button key={stage} className={active === stage ? "active" : ""} onClick={() => setStage(stage)}><Icon /><span>{label}</span></button>)}</nav>;
}
