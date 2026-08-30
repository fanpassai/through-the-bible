"use client";

import Image from "next/image";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookMarked, BookOpen, Check, ChevronRight,
  Compass, Flame, Highlighter, Home, Mail, NotebookPen,
  ShieldCheck, Sparkles, UserRound, X,
} from "lucide-react";
import CourseExperience from "./course-experience";
import { useStudyAccount } from "./study-account";
import { getWeeklyStudyStats, mergePortfolios, readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import type { StudyPortfolio } from "@/lib/study-types";

type ProductStage = "launch" | "auth" | "today" | "journey" | "week1";

function studentName(email: string | undefined, metadataName: unknown) {
  if (typeof metadataName === "string" && metadataName.trim()) return metadataName.trim().split(/\s+/)[0];
  const local = email?.split("@")[0]?.replace(/[._-]+/g, " ").trim();
  if (!local) return "friend";
  return local.charAt(0).toUpperCase() + local.slice(1);
}

export default function ProductExperience() {
  const [stage, setStage] = useState<ProductStage>("launch");
  const [openStudyOnEntry, setOpenStudyOnEntry] = useState(false);
  const { user, loading } = useStudyAccount();

  function enterProduct() {
    if (loading) return;
    setStage(user ? "today" : "auth");
  }

  function enterWeek(openStudy = false) {
    setOpenStudyOnEntry(openStudy);
    setStage("week1");
  }

  const visibleStage = stage === "auth" && user ? "today" : stage;
  if (visibleStage === "launch") return <LaunchScreen userName={user ? studentName(user.email, user.user_metadata?.full_name) : null} loading={loading} onEnter={enterProduct} />;
  if (visibleStage === "auth") return <SignInScreen onBack={() => setStage("launch")} onPreview={() => setStage("journey")} />;
  if (visibleStage === "today") return <TodayScreen onJourney={() => setStage("journey")} onWeek={() => enterWeek(false)} onStudy={() => enterWeek(true)} />;
  if (visibleStage === "journey") return <CourseExperience initialView="intro" onProductHome={() => setStage(user ? "today" : "launch")} />;
  return <CourseExperience initialView="week1" initialOpenStudy={openStudyOnEntry} onProductHome={() => setStage(user ? "today" : "launch")} />;
}

function LaunchScreen({ userName, loading, onEnter }: { userName: string | null; loading: boolean; onEnter: () => void }) {
  return <main className="launch-screen" aria-label="Through the Bible entrance">
    <div className="launch-storyline" aria-hidden="true"><span /><i /></div>
    <div className="launch-wordmark" aria-label="Through the Bible">
      <span>THROUGH</span><span>THE</span><span>BIBLE</span>
    </div>
    <div className="launch-finale">
      <p>ONE STORY · YOUR PLACE IN IT</p>
      <button onClick={onEnter} disabled={loading}><span>{loading ? "Preparing your study" : userName ? `Continue as ${userName}` : "Enter"}</span><ArrowRight /></button>
    </div>
  </main>;
}

function SignInScreen({ onBack, onPreview }: { onBack: () => void; onPreview: () => void }) {
  const { cloudConfigured, authMessage, authSending, clearAuthMessage, sendMagicLink, signInWithGoogle } = useStudyAccount();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const succeeded = await sendMagicLink(email, name);
    if (succeeded) setSent(true);
  }

  return <main className="signin-screen">
    <section className="signin-art" aria-label="An open Bible becoming a path toward a radiant horizon">
      <Image src="/images/signin-story-path-v33.webp" alt="An open Bible becoming a luminous path toward a radiant horizon" fill priority sizes="(max-width: 900px) 100vw, 52vw" />
      <span className="signin-art-shade" />
      <header><button onClick={onBack} aria-label="Return to entrance"><ArrowLeft /></button><div><BookOpen /><b>THROUGH THE BIBLE</b></div></header>
      <div className="signin-art-copy"><small>YOUR STUDY · KEPT TOGETHER</small><h1>Keep your place<br />in the story.</h1><p>Your reading, discoveries and questions should travel with you.</p></div>
    </section>
    <section className="signin-panel">
      {!sent ? <div className="signin-panel-inner">
        <div className="signin-panel-heading"><span><Sparkles /></span><small>WELCOME</small><h2>Begin with an account that remembers.</h2><p>Sign in once. Every Scripture, note, highlight and devotional reflection will remain connected to you.</p></div>
        {googleEnabled ? <><button className="signin-google" onClick={signInWithGoogle}><span>G</span>Continue with Google<ArrowRight /></button><div className="signin-divider"><span>OR USE EMAIL</span></div></> : null}
        <form onSubmit={submit} className="signin-form">
          <label><span>First name</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="given-name" placeholder="How should we greet you?" /></label>
          <label><span>Email address</span><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); clearAuthMessage(); }} autoComplete="email" placeholder="you@example.com" required /></label>
          <button type="submit" disabled={!cloudConfigured || !email.trim() || authSending}><Mail />{authSending ? "Sending your secure link…" : "Continue securely"}<ArrowRight /></button>
        </form>
        {authMessage ? <p className="signin-message">{authMessage}</p> : null}
        <div className="signin-assurance"><ShieldCheck /><span><b>Private by design</b><small>Your writing is yours. Only questions you submit are shared.</small></span></div>
        <button className="signin-preview" onClick={onPreview}>Preview the course without saving <ChevronRight /></button>
      </div> : <div className="signin-sent">
        <span><Mail /></span><small>SECURE LINK SENT</small><h2>Open your email to enter.</h2><p>We sent a private sign-in link to <b>{email}</b>. Tap it and you will return directly to your study.</p><div><Check />No password to remember</div><button onClick={() => setSent(false)}>Use a different email</button>
      </div>}
    </section>
  </main>;
}

function TodayScreen({ onJourney, onWeek, onStudy }: { onJourney: () => void; onWeek: () => void; onStudy: () => void }) {
  const { user, loading, loadPortfolio, openAccount } = useStudyAccount();
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(() => readLocalPortfolio());
  const [recapOpen, setRecapOpen] = useState(false);
  const stats = useMemo(() => getWeeklyStudyStats(portfolio), [portfolio]);
  const name = studentName(user?.email, user?.user_metadata?.full_name);

  useEffect(() => {
    let cancelled = false;
    function refreshLocal() { if (!cancelled) setPortfolio(readLocalPortfolio()); }
    refreshLocal();
    if (user) loadPortfolio().then((cloud) => { if (!cancelled && cloud) setPortfolio(mergePortfolios(cloud, readLocalPortfolio())); }).catch(() => undefined);
    window.addEventListener(STUDY_UPDATED_EVENT, refreshLocal);
    return () => { cancelled = true; window.removeEventListener(STUDY_UPDATED_EVENT, refreshLocal); };
  }, [user, loadPortfolio]);

  return <main className="today-screen">
    <header className="today-header"><div><span><BookOpen /></span><b>THROUGH THE BIBLE</b></div><button onClick={openAccount} aria-label="Open account"><UserRound />{user ? <i /> : null}</button></header>
    <div className="today-scroll">
      <section className="today-greeting"><small>{loading ? "PREPARING YOUR STUDY" : "YOUR PLACE IN THE STORY"}</small><h1>Good to see you,<br />{name}.</h1><p>{stats.passagesRead ? "Your Week 01 study is waiting exactly where you left it." : "Your first week begins with creation, rupture and the first promise."}</p></section>

      <section className="today-continue-card">
        <div className="today-continue-art"><Image src="/images/today-week01-v33.webp" alt="A cobalt river winding through an ancient landscape toward a golden horizon" fill sizes="(max-width: 900px) 100vw, 640px" /><span /></div>
        <div className="today-continue-copy"><div><small>WEEK 01 · GENESIS 1–3</small><span>{stats.progress}%</span></div><h2>Creation, Rupture &amp;<br />the First Promise</h2><p>{stats.mostRevisited ? `Return to ${stats.mostRevisited}, your most revisited passage.` : "Begin where every human story begins."}</p><div className="today-progress"><i style={{ width: `${Math.max(4, stats.progress)}%` }} /></div><button onClick={onWeek}>{stats.progress ? "Continue Week 01" : "Begin Week 01"}<ArrowRight /></button></div>
      </section>

      <section className="today-pulse">
        <header><div><small>YOUR SCRIPTURE WEEK</small><h2>A living record—not a score.</h2></div><button onClick={() => setRecapOpen(true)}>View your week <ChevronRight /></button></header>
        <div className="today-stat-grid">
          <article><BookMarked /><strong>{stats.passagesRead}</strong><span>passages read</span></article>
          <article><BookOpen /><strong>{stats.versesRead}</strong><span>verses explored</span></article>
          <article><Highlighter /><strong>{stats.marks}</strong><span>truths marked</span></article>
          <article><NotebookPen /><strong>{stats.notes + stats.questions}</strong><span>notes + questions</span></article>
        </div>
        <div className="today-theme"><span><Sparkles /></span><div><small>THEME TAKING SHAPE</small><b>{stats.theme}</b><p>{stats.passagesRead ? "The pattern emerging from the passages you have opened this week." : "Read your first passage and your personal study pattern will begin here."}</p></div></div>
      </section>

      <section className="today-next"><small>NEXT BEST STEP</small><div><span><Flame /></span><div><h2>{stats.devotionalDays ? "Carry the story into today." : "Read before you retrieve."}</h2><p>{stats.devotionalDays ? `${stats.devotionalDays} of 7 devotional days completed.` : "Open the Week 01 story, then let Place and Fill test what remained."}</p></div><button onClick={onWeek} aria-label="Continue studying"><ArrowRight /></button></div></section>
    </div>
    <nav className="today-nav" aria-label="Main navigation">
      <button className="active"><Home /><span>Today</span></button>
      <button onClick={onJourney}><Compass /><span>Journey</span></button>
      <button onClick={onStudy}><NotebookPen /><span>My Study</span></button>
      <button onClick={openAccount}><UserRound /><span>Account</span></button>
    </nav>
    <WeeklyRecap open={recapOpen} onClose={() => setRecapOpen(false)} name={name} stats={stats} />
  </main>;
}

function WeeklyRecap({ open, onClose, name, stats }: { open: boolean; onClose: () => void; name: string; stats: ReturnType<typeof getWeeklyStudyStats> }) {
  if (!open) return null;
  return <section className="weekly-recap" role="dialog" aria-modal="true" aria-label="Your week in Scripture">
    <header><div><BookOpen /><span><b>THROUGH THE BIBLE</b><small>YOUR WEEK IN THE STORY</small></span></div><button onClick={onClose} aria-label="Close weekly recap"><X /></button></header>
    <div className="weekly-recap-scroll">
      <article className="recap-opening"><small>WEEK 01 · PERSONAL RECAP</small><h1>{name}, this is the story<br />you carried this week.</h1><p>Not a competition. A record of where you paused, returned and paid attention.</p><span><BarChart3 /></span></article>
      <article className="recap-numbers"><small>YOU OPENED THE WORD</small><div><strong>{stats.passagesRead}</strong><span>passages</span></div><div><strong>{stats.versesRead}</strong><span>verses explored</span></div><p>{stats.mostRevisited ? `${stats.mostRevisited} became the passage you returned to most.` : "Your first passage will become the beginning of this record."}</p></article>
      <article className="recap-attention"><small>WHAT YOU KEPT</small><h2>{stats.marks} truths marked.<br />{stats.notes} notes written.<br />{stats.questions} questions held.</h2><p>Your library is becoming a map of what God is teaching you—not a pile of disconnected entries.</p></article>
      <article className="recap-theme"><Sparkles /><small>YOUR EMERGING THEME</small><h2>{stats.theme}</h2><p>{stats.passagesRead ? "This is the thread running through the passages and actions in your study this week." : "Your theme will take shape as you read, mark and reflect."}</p><button onClick={onClose}>Return to Today <ArrowRight /></button></article>
    </div>
  </section>;
}
