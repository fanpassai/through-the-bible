"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { User } from "@supabase/supabase-js";
import { ArrowRight, Check, Cloud, LockKeyhole, LogOut, Mail, ShieldCheck, UserRound } from "lucide-react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { StudyPortfolio } from "@/lib/study-types";

type StudyAccountContextValue = {
  user: User | null;
  loading: boolean;
  cloudConfigured: boolean;
  authMessage: string;
  authSending: boolean;
  openAccount: () => void;
  clearAuthMessage: () => void;
  sendMagicLink: (email: string, displayName?: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  loadPortfolio: () => Promise<StudyPortfolio | null>;
  savePortfolio: (portfolio: StudyPortfolio) => Promise<void>;
  submitQuestion: (reference: string, question: string) => Promise<boolean>;
};

const StudyAccountContext = createContext<StudyAccountContextValue | null>(null);

export function StudyAccountProvider({ children }: { children: ReactNode }) {
  const cloudConfigured = isSupabaseConfigured();
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(cloudConfigured);
  const [accountOpen, setAccountOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [authSending, setAuthSending] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => { setUser(data.user); setLoading(false); });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    setMessage("Opening secure sign-in…");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
    if (error) setMessage(error.message);
  }

  async function sendMagicLink(emailAddress: string, displayName?: string) {
    const supabase = getSupabaseBrowserClient();
    const normalizedEmail = emailAddress.trim();
    if (!supabase || !normalizedEmail) return false;
    setAuthSending(true);
    setMessage("Sending your secure sign-in link…");
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
        data: displayName?.trim() ? { full_name: displayName.trim() } : undefined,
      },
    });
    setMessage(error ? error.message : "Check your email. Your sign-in link is on its way.");
    setAuthSending(false);
    return !error;
  }

  async function signOut() {
    await getSupabaseBrowserClient()?.auth.signOut();
    setAccountOpen(false);
  }

  async function loadPortfolio() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return null;
    const { data, error } = await supabase.from("study_portfolios").select("payload").eq("user_id", user.id).maybeSingle();
    if (error) throw error;
    return (data?.payload as StudyPortfolio | undefined) || null;
  }

  async function savePortfolio(portfolio: StudyPortfolio) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user) return;
    const { error } = await supabase.from("study_portfolios").upsert({ user_id: user.id, payload: portfolio, updated_at: new Date().toISOString() });
    if (error) throw error;
  }

  async function submitQuestion(reference: string, question: string) {
    const supabase = getSupabaseBrowserClient();
    if (!supabase || !user || !question.trim()) return false;
    const { error } = await supabase.from("question_submissions").insert({
      user_id: user.id,
      course_key: "through-the-bible",
      week_key: "week-01",
      scripture_reference: reference,
      question: question.trim(),
    });
    return !error;
  }

  const value = useMemo<StudyAccountContextValue>(() => ({
    user, loading, cloudConfigured, authMessage: message, authSending,
    openAccount: () => { setMessage(""); setAccountOpen(true); },
    clearAuthMessage: () => setMessage(""), sendMagicLink, signInWithGoogle,
    signOut, loadPortfolio, savePortfolio, submitQuestion,
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [user, loading, cloudConfigured, message, authSending]);

  return <StudyAccountContext.Provider value={value}>{children}
    <Sheet open={accountOpen} onOpenChange={setAccountOpen}><SheetContent side="right" className="account-sheet">
      <SheetHeader><span className="account-mark"><UserRound /></span><SheetTitle>{user ? "Your study is protected." : "Keep what God is teaching you."}</SheetTitle>
        <SheetDescription>{user ? "Your saved study can follow you across your devices." : "Create a free account to protect and synchronize your notes, highlights, questions and devotional reflections."}</SheetDescription></SheetHeader>
      {user ? <div className="account-signed-in"><div><Cloud /><span><small>SIGNED IN AS</small><b>{user.email}</b></span><Check /></div>
        <p><ShieldCheck />Private notes and reflections remain visible only to you.</p><button onClick={signOut}>Sign out <LogOut /></button></div>
      : cloudConfigured ? <div className="account-signin">{googleEnabled && <><button className="google-signin" onClick={signInWithGoogle}><span>G</span>Continue with Google<ArrowRight /></button>
        <div className="account-divider"><span>OR USE EMAIL</span></div></>}<label><span>Email address</span><input type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label>
        <button className="email-signin" onClick={() => sendMagicLink(email)} disabled={!email.trim() || authSending}><Mail />{authSending ? "Sending secure link…" : "Email me a secure link"}<ArrowRight /></button>{message && <p className="account-message">{message}</p>}</div>
      : <div className="account-awaiting"><LockKeyhole /><h3>Account connection is ready.</h3><p>The student experience has been built. Connect the Supabase project to activate secure sign-in and cross-device saving.</p></div>}
      <footer className="account-privacy"><LockKeyhole /><span><b>Private by design</b><small>Nothing is shared with an instructor unless you deliberately submit it.</small></span></footer>
    </SheetContent></Sheet>
  </StudyAccountContext.Provider>;
}

export function useStudyAccount() {
  const context = useContext(StudyAccountContext);
  if (!context) throw new Error("useStudyAccount must be used inside StudyAccountProvider");
  return context;
}
