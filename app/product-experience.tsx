"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import {
  ArrowLeft, ArrowRight, BarChart3, BookOpen, Check, ChevronRight,
  Compass, Flame, Home, Mail, NotebookPen,
  ShieldCheck, Sparkles, UserRound, X,
} from "lucide-react";
import CourseExperience from "./course-experience";
import { useStudyAccount } from "./study-account";
import { getWeeklyStudyStats, mergePortfolios, readLocalPortfolio, STUDY_UPDATED_EVENT } from "@/lib/study-progress";
import type { StudyPortfolio } from "@/lib/study-types";

type ProductStage = "launch" | "auth" | "orientation" | "today" | "journey" | "week1";

const ORIENTATION_KEY = "ttb-product-orientation-v2";

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
    setStage(user ? nextSignedInStage() : "auth");
  }

  function nextSignedInStage(): ProductStage {
    if (typeof window === "undefined") return "today";
    return window.localStorage.getItem(ORIENTATION_KEY) === "complete" ? "today" : "orientation";
  }

  function finishOrientation() {
    window.localStorage.setItem(ORIENTATION_KEY, "complete");
    setStage("today");
  }

  function enterWeek(openStudy = false) {
    setOpenStudyOnEntry(openStudy);
    setStage("week1");
  }

  const visibleStage = stage === "auth" && user ? nextSignedInStage() : stage;
  if (visibleStage === "launch") return <LaunchScreen userName={user ? studentName(user.email, user.user_metadata?.full_name) : null} loading={loading} onEnter={enterProduct} />;
  if (visibleStage === "auth") return <SignInScreen onBack={() => setStage("launch")} onPreview={() => setStage("journey")} />;
  if (visibleStage === "orientation") return <OrientationScreen onComplete={finishOrientation} />;
  if (visibleStage === "today") return <TodayScreen onJourney={() => setStage("journey")} onWeek={() => enterWeek(false)} onStudy={() => enterWeek(true)} />;
  if (visibleStage === "journey") return <CourseExperience initialView="intro" onProductHome={() => setStage(user ? "today" : "launch")} />;
  return <CourseExperience initialView="week1" initialOpenStudy={openStudyOnEntry} onProductHome={() => setStage(user ? "today" : "launch")} />;
}

function LaunchScreen({ userName, loading, onEnter }: { userName: string | null; loading: boolean; onEnter: () => void }) {
  return <main className="launch-v34" aria-label="Through the Bible entrance">
    <div className="launch-thread" aria-hidden="true"><i className="launch-line" /><i className="launch-cross" /><i className="launch-point" /></div>
    <div className="launch-lockup">
      <h1><span>Through</span><span>the Bible</span></h1>
      <p>One story. One Redeemer. One hope.</p>
    </div>
    <button className="launch-enter" onClick={onEnter} disabled={loading}>
      <span>{loading ? "Preparing your study" : userName ? `Continue as ${userName}` : "Enter"}</span><ArrowRight />
    </button>
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

  return <main className="signin-v34">
    <section className="signin-story">
      <header><button onClick={onBack} aria-label="Return to entrance"><ArrowLeft /></button><b>THROUGH THE BIBLE</b></header>
      <div className="signin-story-copy">
        <div className="signin-threadmark" aria-hidden="true"><i /><span /></div>
        <small>YOUR STUDY · REMEMBERED</small>
        <h1>Your study.<br />Remembered.</h1>
        <p>Read closely. Keep what matters. Return to the story without losing your place.</p>
      </div>
      <p className="signin-story-note">One account for your reading, notes, questions and progress.</p>
    </section>
    <section className="signin-form-panel">
      {!sent ? <div className="signin-form-inner">
        <div className="signin-form-heading"><small>WELCOME</small><h2>Enter your study.</h2><p>We will email you a secure link. No password to create or remember.</p></div>
        {googleEnabled ? <><button className="signin-google" onClick={signInWithGoogle}><span>G</span>Continue with Google<ArrowRight /></button><div className="signin-divider"><span>OR USE EMAIL</span></div></> : null}
        <form onSubmit={submit} className="signin-form">
          <label><span>First name</span><input value={name} onChange={(event) => setName(event.target.value)} autoComplete="given-name" placeholder="How should we greet you?" /></label>
          <label><span>Email address</span><input type="email" value={email} onChange={(event) => { setEmail(event.target.value); clearAuthMessage(); }} autoComplete="email" placeholder="you@example.com" required /></label>
          <button type="submit" disabled={!cloudConfigured || !email.trim() || authSending}><Mail />{authSending ? "Sending your secure link…" : "Continue securely"}<ArrowRight /></button>
        </form>
        {authMessage ? <p className="signin-message">{authMessage}</p> : null}
        <div className="signin-assurance"><ShieldCheck /><span><b>Private by design</b><small>Your notes and highlights belong to you.</small></span></div>
        <button className="signin-preview" onClick={onPreview}>Preview the course without saving <ChevronRight /></button>
      </div> : <div className="signin-sent">
        <span><Mail /></span><small>SECURE LINK SENT</small><h2>Open your email to enter.</h2><p>We sent a private sign-in link to <b>{email}</b>. Tap it and you will return directly to your study.</p><div><Check />No password to remember</div><button onClick={() => setSent(false)}>Use a different email</button>
      </div>}
    </section>
  </main>;
}

function OrientationScreen({ onComplete }: { onComplete: () => void }) {
  const steps = [
    { icon: BookOpen, number: "01", title: "Read the story", text: "Open the actual Scripture. Highlight, underline and save what arrests your attention." },
    { icon: Compass, number: "02", title: "Work the truth", text: "Place the story, fill the truth, connect its threads and unlock what you understand." },
    { icon: NotebookPen, number: "03", title: "Carry it with you", text: "Write notes, keep questions and take one devotional truth into the rest of your week." },
  ];
  return <main className="orientation-v34">
    <header><BookOpen /><b>THROUGH THE BIBLE</b></header>
    <section>
      <small>BEFORE YOU BEGIN</small>
      <h1>A simple rhythm<br />for going deeper.</h1>
      <div className="orientation-steps">
        {steps.map(({ icon: Icon, number, title, text }) => <article key={number}>
          <span>{number}</span><Icon /><div><h2>{title}</h2><p>{text}</p></div>
        </article>)}
      </div>
      <button onClick={onComplete}>Take me to my study <ArrowRight /></button>
      <p className="orientation-note">You will only see this introduction once.</p>
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

  return <main className="today-v34">
    <header className="today-v34-header"><div><BookOpen /><b>THROUGH THE BIBLE</b></div><button onClick={openAccount} aria-label="Open account"><UserRound />{user ? <i /> : null}</button></header>
    <div className="today-v34-scroll">
      <section className="today-v34-greeting"><small>{loading ? "PREPARING YOUR STUDY" : "TODAY"}</small><h1>Good to see you, {name}.</h1><p>{stats.passagesRead ? "Your study is ready where you left it." : "Begin Week 01 with the text itself."}</p></section>

      <section className="today-v34-week">
        <header><small>WEEK 01 · GENESIS 1–3</small><span>{stats.progress}%</span></header>
        <h2>The beginning changes everything.</h2>
        <p>Creation, rupture and the first promise—read as one unfolding story.</p>
        <div className="today-v34-progress"><i style={{ width: `${Math.max(3, stats.progress)}%` }} /></div>
        <button onClick={onWeek}>{stats.progress ? "Continue Week 01" : "Begin Week 01"}<ArrowRight /></button>
      </section>

      <section className="today-v34-stats">
        <header><small>THIS WEEK</small><button onClick={() => setRecapOpen(true)}>Personal recap <ChevronRight /></button></header>
        <div>
          <article><strong>{stats.passagesRead}</strong><span>passages</span></article>
          <article><strong>{stats.versesRead}</strong><span>verses</span></article>
          <article><strong>{stats.marks}</strong><span>marks</span></article>
          <article><strong>{stats.notes + stats.questions}</strong><span>notes</span></article>
        </div>
      </section>

      <section className="today-v34-actions">
        <button onClick={onWeek}><span><Flame /></span><div><small>NEXT STEP</small><b>{stats.devotionalDays ? "Carry the story into today" : "Read before you retrieve"}</b><p>{stats.devotionalDays ? `${stats.devotionalDays} of 7 devotional days complete.` : "Open Scripture, then work through Place and Fill."}</p></div><ArrowRight /></button>
        <button onClick={onStudy}><span><NotebookPen /></span><div><small>MY STUDY</small><b>Everything you kept</b><p>Notes, highlights, questions and devotional reflections.</p></div><ArrowRight /></button>
      </section>
    </div>
    <nav className="today-v34-nav" aria-label="Main navigation">
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
