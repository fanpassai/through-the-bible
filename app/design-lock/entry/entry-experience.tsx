"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { ArrowLeft, ArrowRight, BookOpen, Check, LockKeyhole, Mail } from "lucide-react";
import type { User } from "@supabase/supabase-js";
import { getSupabaseBrowserClient, isSupabaseConfigured } from "@/lib/supabase/client";
import styles from "./entry.module.css";

type View = "opening" | "signin";

function Brand({ compact = false }: { compact?: boolean }) {
  return (
    <div className={compact ? styles.brandCompact : styles.brand} aria-label="Through the Bible">
      <BookOpen aria-hidden="true" strokeWidth={1.35} />
      <span>Through<br />the Bible</span>
    </div>
  );
}

export default function EntryExperience() {
  const configured = isSupabaseConfigured();
  const googleEnabled = process.env.NEXT_PUBLIC_GOOGLE_AUTH_ENABLED === "true";
  const [view, setView] = useState<View>("opening");
  const [user, setUser] = useState<User | null>(null);
  const [checkingUser, setCheckingUser] = useState(configured);
  const [email, setEmail] = useState("");
  const [sending, setSending] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  useEffect(() => {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setCheckingUser(false);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setCheckingUser(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  async function sendMagicLink(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const supabase = getSupabaseBrowserClient();
    const normalizedEmail = email.trim();
    if (!normalizedEmail) return;
    if (!supabase) {
      setMessage("Secure sign-in will activate when this review is promoted to the configured environment.");
      return;
    }
    setSending(true);
    setMessage("");
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", "/design-lock/entry");
    const { error } = await supabase.auth.signInWithOtp({
      email: normalizedEmail,
      options: { emailRedirectTo: callback.toString() },
    });
    setSending(false);
    if (error) {
      setMessage(error.message);
      return;
    }
    setSent(true);
  }

  async function signInWithGoogle() {
    const supabase = getSupabaseBrowserClient();
    if (!supabase) return;
    const callback = new URL("/auth/callback", window.location.origin);
    callback.searchParams.set("next", "/design-lock/entry");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: callback.toString() },
    });
    if (error) setMessage(error.message);
  }

  return (
    <main className={styles.page}>
      <section className={styles.device} aria-live="polite">
        <div className={`${styles.opening} ${view === "signin" ? styles.openingAway : ""}`} aria-hidden={view === "signin"}>
          <Image
            className={styles.cover}
            src="/images/app-opening-alpine-v1.webp"
            alt="Morning light over a mountain valley"
            fill
            priority
            sizes="(max-width: 480px) 100vw, 430px"
          />
          <div className={styles.coverShade} />
          <div className={styles.openingBrand}>
            <Brand />
            <p>Your Journey · His Story.</p>
          </div>
          <div className={styles.openingAction}>
            <span>Understand · Connect · Live.</span>
            <button type="button" onClick={() => setView("signin")}>
              Enter <ArrowRight aria-hidden="true" />
            </button>
          </div>
        </div>

        <div className={`${styles.signIn} ${view === "signin" ? styles.signInVisible : ""}`} aria-hidden={view !== "signin"}>
          <header className={styles.signInHeader}>
            <button type="button" aria-label="Return to opening" onClick={() => setView("opening")}><ArrowLeft /></button>
            <Brand compact />
            <span />
          </header>

          <div className={styles.signInBody}>
            {user ? (
              <section className={styles.welcomeBack}>
                <span className={styles.successIcon}><Check /></span>
                <p className={styles.eyebrow}>YOUR STUDY IS READY</p>
                <h1>Welcome back.</h1>
                <p>Your highlights, notes, questions, devotionals and progress are connected to <strong>{user.email}</strong>.</p>
                <Link className={styles.primaryAction} href="/">Continue your journey <ArrowRight /></Link>
              </section>
            ) : sent ? (
              <section className={styles.linkSent}>
                <span className={styles.mailIcon}><Mail /></span>
                <p className={styles.eyebrow}>SECURE LINK SENT</p>
                <h1>Open your email to enter.</h1>
                <p>We sent a private sign-in link to <strong>{email.trim()}</strong>. Tap it and you will return directly to your study.</p>
                <div><Check /><span>No password to remember</span></div>
                <button type="button" onClick={() => { setSent(false); setMessage(""); }}>Use a different email</button>
              </section>
            ) : (
              <>
                <section className={styles.introCopy}>
                  <p className={styles.eyebrow}>YOUR STUDY · REMEMBERED</p>
                  <h1>Welcome to the story.</h1>
                  <p>Sign in once. Keep every highlight, note, question and discovery wherever you study.</p>
                </section>

                <div className={styles.authArea}>
                  {googleEnabled && (
                    <>
                      <button className={styles.googleButton} type="button" onClick={signInWithGoogle}>
                        <b>G</b><span>Continue with Google</span><ArrowRight />
                      </button>
                      <div className={styles.divider}><span />or use email<span /></div>
                    </>
                  )}
                  <form onSubmit={sendMagicLink}>
                    <label htmlFor="entry-email">Email address</label>
                    <input
                      id="entry-email"
                      type="email"
                      autoComplete="email"
                      inputMode="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(event) => setEmail(event.target.value)}
                      required
                    />
                    <button className={styles.primaryAction} type="submit" disabled={!email.trim() || sending}>
                      <span>{sending ? "Sending your link…" : "Email me a secure link"}</span><ArrowRight />
                    </button>
                  </form>
                  {message && <p className={styles.errorMessage} role="alert">{message}</p>}
                </div>
              </>
            )}
          </div>

          <footer className={styles.privacy}>
            <LockKeyhole aria-hidden="true" />
            <span><strong>Private by design</strong><small>Your personal study belongs to you.</small></span>
          </footer>
          {checkingUser && <div className={styles.checking}>Preparing your study…</div>}
        </div>
      </section>
    </main>
  );
}
