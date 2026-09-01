"use client";

import { useEffect, useMemo, useRef, useState, type UIEvent } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Bookmark,
  Check,
  ChevronDown,
  Highlighter,
  MessageCircleQuestion,
  NotebookPen,
  Type,
  Underline,
  X,
} from "lucide-react";
import lesson from "@/app/week1-data.json";
import { useStudyAccount } from "@/app/study-account";
import {
  announceStudyUpdate,
  mergePortfolios,
  PERSONAL_STORAGE_KEY,
  readLocalPortfolio,
} from "@/lib/study-progress";
import {
  EMPTY_PORTFOLIO,
  type ScriptureMark,
  type ScriptureReading,
  type ScriptureSelection,
  type StudyActivityEvent,
  type StudyActivityType,
  type StudyPortfolio,
} from "@/lib/study-types";
import styles from "./reader.module.css";

type Scripture = {
  html: string;
  study: string;
  translation: string;
  kind: string;
};

type SelectionDraft = {
  quote: string;
  start: number;
  end: number;
};

const SCRIPTURES = lesson.SCRIPTURES as Record<string, Scripture>;
const DEFAULT_REFERENCE = "Genesis 1:3–31";

function makeActivity(
  type: StudyActivityType,
  reference: string,
  detail?: StudyActivityEvent["detail"],
): StudyActivityEvent {
  return {
    id: globalThis.crypto?.randomUUID?.() || String(Date.now()) + "-" + String(Math.random()),
    type,
    reference,
    detail,
    createdAt: new Date().toISOString(),
  };
}

function keepActivity(events: StudyActivityEvent[], event: StudyActivityEvent) {
  return [...events, event].slice(-500);
}

function annotateScriptureHtml(
  html: string,
  annotations: ScriptureSelection[],
  classNames: { selection: string; highlight: string; underline: string },
) {
  if (!annotations.length) return html;
  let offset = 0;

  return (html.match(/<[^>]+>|[^<]+/g) || []).map((token) => {
    if (token.startsWith("<")) return token;

    const start = offset;
    const end = start + token.length;
    offset = end;
    const local = annotations.filter((item) => item.start < end && item.end > start);
    if (!local.length) return token;

    const boundaries = new Set<number>([0, token.length]);
    local.forEach((item) => {
      boundaries.add(Math.max(0, item.start - start));
      boundaries.add(Math.min(token.length, item.end - start));
    });

    const points = [...boundaries].sort((a, b) => a - b);
    return points.slice(0, -1).map((from, index) => {
      const to = points[index + 1];
      const text = token.slice(from, to);
      const active = local.filter((item) => item.start < start + to && item.end > start + from);
      if (!active.length) return text;

      const classes = [classNames.selection];
      if (active.some((item) => item.type === "highlight")) classes.push(classNames.highlight);
      if (active.some((item) => item.type === "underline")) classes.push(classNames.underline);
      return '<span class="' + classes.join(" ") + '">' + text + "</span>";
    }).join("");
  }).join("");
}

export default function ReaderExperience({ initialReference }: { initialReference?: string }) {
  const reference = initialReference && SCRIPTURES[initialReference]
    ? initialReference
    : DEFAULT_REFERENCE;
  const scripture = SCRIPTURES[reference] || SCRIPTURES[DEFAULT_REFERENCE];
  const { user, loadPortfolio, savePortfolio } = useStudyAccount();
  const [portfolio, setPortfolio] = useState<StudyPortfolio>(EMPTY_PORTFOLIO);
  const [ready, setReady] = useState(false);
  const [pendingSelection, setPendingSelection] = useState<SelectionDraft | null>(null);
  const [toolMessage, setToolMessage] = useState("");
  const [composer, setComposer] = useState<"notes" | "question" | null>(null);
  const [largeText, setLargeText] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const selectionDraftRef = useRef<SelectionDraft | null>(null);
  const cloudLoadedFor = useRef<string | null>(null);
  const openedFor = useRef<string | null>(null);

  const mark: ScriptureMark = portfolio.scriptureTools[reference] || {};
  const reading: ScriptureReading | undefined = portfolio.readingHistory[reference];
  const completed = Boolean(reading?.completedAt);
  const verseCount = Math.max(1, scripture.html.match(/<sup>/g)?.length || 0);

  const scriptureHtml = useMemo(
    () => annotateScriptureHtml(
      scripture.html,
      mark.selections || [],
      {
        selection: styles.markSelection,
        highlight: styles.markHighlight,
        underline: styles.markUnderline,
      },
    ),
    [scripture.html, mark.selections],
  );

  useEffect(() => {
    setPortfolio(readLocalPortfolio());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !user || cloudLoadedFor.current === user.id) return;
    let cancelled = false;

    loadPortfolio()
      .then((cloud) => {
        if (cancelled) return;
        setPortfolio((current) => cloud ? mergePortfolios(cloud, current) : current);
        cloudLoadedFor.current = user.id;
      })
      .catch(() => {
        cloudLoadedFor.current = user.id;
      });

    return () => {
      cancelled = true;
    };
  }, [ready, user, loadPortfolio]);

  useEffect(() => {
    if (!ready) return;

    try {
      window.localStorage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(portfolio));
      announceStudyUpdate();
    } catch {
      // Storage restrictions must never interrupt reading.
    }

    if (!user || cloudLoadedFor.current !== user.id) return;
    const timer = window.setTimeout(() => {
      savePortfolio(portfolio).catch(() => undefined);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [portfolio, ready, user, savePortfolio]);

  useEffect(() => {
    if (!ready || openedFor.current === reference) return;
    openedFor.current = reference;
    const now = new Date().toISOString();

    setPortfolio((current) => {
      const prior = current.readingHistory[reference];
      const nextReading: ScriptureReading = {
        reference,
        opens: (prior?.opens || 0) + 1,
        reads: prior?.reads || 0,
        firstOpenedAt: prior?.firstOpenedAt || now,
        lastOpenedAt: now,
        completedAt: prior?.completedAt,
        lastReadAt: prior?.lastReadAt,
        verseCount: prior?.verseCount,
      };

      return {
        ...current,
        readingHistory: {
          ...current.readingHistory,
          [reference]: nextReading,
        },
        activityEvents: keepActivity(
          current.activityEvents,
          makeActivity("scripture_opened", reference),
        ),
      };
    });
  }, [ready, reference]);

  useEffect(() => {
    const handleSelectionChange = () => {
      const article = articleRef.current;
      const selection = window.getSelection();
      if (!article || !selection || selection.rangeCount === 0 || selection.isCollapsed) return;

      const range = selection.getRangeAt(0);
      if (!article.contains(range.commonAncestorContainer)) return;
      const quote = selection.toString().trim();
      if (quote.length < 2) return;

      const before = document.createRange();
      before.selectNodeContents(article);
      before.setEnd(range.startContainer, range.startOffset);
      const start = before.toString().length;
      const captured = {
        quote,
        start,
        end: start + selection.toString().length,
      };
      selectionDraftRef.current = captured;
      setPendingSelection(captured);
      setToolMessage("");
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [reference]);

  function captureSelection() {
    const article = articleRef.current;
    const selection = window.getSelection();
    if (!article || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    if (!article.contains(range.commonAncestorContainer)) return null;
    const quote = selection.toString().trim();
    if (quote.length < 2) return null;

    const before = document.createRange();
    before.selectNodeContents(article);
    before.setEnd(range.startContainer, range.startOffset);
    const start = before.toString().length;
    const captured = {
      quote,
      start,
      end: start + selection.toString().length,
    };
    selectionDraftRef.current = captured;
    setPendingSelection(captured);
    setToolMessage("");
    return captured;
  }

  function applySelection(type: "highlight" | "underline") {
    const captured = pendingSelection || selectionDraftRef.current || captureSelection();
    if (!captured) {
      setToolMessage("Press and hold a word, then drag the handles to select a phrase.");
      articleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    const selection: ScriptureSelection = {
      ...captured,
      type,
      id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
      createdAt: new Date().toISOString(),
    };

    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: {
            ...prior,
            selections: [...(prior.selections || []), selection],
          },
        },
        activityEvents: keepActivity(
          current.activityEvents,
          makeActivity(type === "highlight" ? "highlight_created" : "underline_created", reference),
        ),
      };
    });

    window.getSelection()?.removeAllRanges();
    selectionDraftRef.current = null;
    setPendingSelection(null);
    setToolMessage(type === "highlight" ? "Highlight saved." : "Underline saved.");
  }

  function toggleBookmark() {
    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      const bookmark = !prior.bookmark;
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: { ...prior, bookmark },
        },
        activityEvents: bookmark
          ? keepActivity(current.activityEvents, makeActivity("bookmark_saved", reference))
          : current.activityEvents,
      };
    });
    setToolMessage(mark.bookmark ? "Removed from saved passages." : "Saved to My Bible.");
  }

  function updateText(key: "notes" | "question", value: string) {
    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      const wasEmpty = !prior[key]?.trim();
      const eventType: StudyActivityType = key === "notes" ? "note_written" : "question_written";

      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: { ...prior, [key]: value },
        },
        activityEvents: wasEmpty && value.trim()
          ? keepActivity(current.activityEvents, makeActivity(eventType, reference))
          : current.activityEvents,
      };
    });
  }

  function completeReading() {
    if (completed || !reachedEnd) return;
    const now = new Date().toISOString();

    setPortfolio((current) => {
      const prior = current.readingHistory[reference];
      return {
        ...current,
        readingHistory: {
          ...current.readingHistory,
          [reference]: {
            reference,
            opens: Math.max(1, prior?.opens || 0),
            reads: (prior?.reads || 0) + 1,
            firstOpenedAt: prior?.firstOpenedAt || now,
            lastOpenedAt: prior?.lastOpenedAt || now,
            completedAt: now,
            lastReadAt: now,
            verseCount,
          },
        },
        activityEvents: keepActivity(
          current.activityEvents,
          makeActivity("scripture_read", reference, { verseCount }),
        ),
      };
    });
    setToolMessage("Reading completed and added to Week 1.");
  }

  function handleScroll(event: UIEvent<HTMLDivElement>) {
    const element = event.currentTarget;
    if (element.scrollHeight - element.scrollTop - element.clientHeight < 220) {
      setReachedEnd(true);
    }
  }

  const selectionPreview = pendingSelection?.quote.length && pendingSelection.quote.length > 74
    ? pendingSelection.quote.slice(0, 74) + "…"
    : pendingSelection?.quote;

  return (
    <main className={styles.page}>
      <section className={styles.device}>
        <header className={styles.topbar}>
          <Link href="/design-lock/today" aria-label="Back to Today">
            <ArrowLeft />
          </Link>
          <button className={styles.chapterPicker} type="button">
            <span>Genesis 1</span>
            <ChevronDown />
          </button>
          <div className={styles.topActions}>
            <span>KJV</span>
            <button
              type="button"
              className={largeText ? styles.textActive : ""}
              onClick={() => setLargeText((value) => !value)}
              aria-label="Change text size"
            >
              <Type />
            </button>
          </div>
        </header>

        <div className={styles.readerScroll} onScroll={handleScroll}>
          <section className={styles.readerHeader}>
            <div>
              <span>WEEK 1 · REQUIRED SCRIPTURE</span>
              <span className={completed ? styles.readStatusComplete : styles.readStatus}>
                {completed ? <><Check /> Complete</> : "In progress"}
              </span>
            </div>
            <h1>{reference}</h1>
            <p>Read the text slowly. Select only what asks you to stay.</p>
          </section>

          <div className={styles.instruction}>
            <Highlighter />
            <span><strong>Mark exact words</strong>Press and hold a word, drag to select a phrase, then choose a tool below.</span>
          </div>

          <article
            ref={articleRef}
            className={[styles.scriptureText, largeText ? styles.largeText : ""].join(" ")}
            onMouseUp={captureSelection}
            dangerouslySetInnerHTML={{ __html: scriptureHtml }}
          />

          <details className={styles.context}>
            <summary>
              <span><small>COURSE CONNECTION</small><strong>Why this passage matters</strong></span>
              <ChevronDown />
            </summary>
            <p>{scripture.study}</p>
          </details>

          <section className={styles.completion}>
            <span className={completed ? styles.completionIconDone : styles.completionIcon}>
              {completed ? <Check /> : <Bookmark />}
            </span>
            <div>
              <small>WEEK 1 RECORD</small>
              <h2>{completed ? "Reading complete." : "Finish the entire passage."}</h2>
              <p>{completed
                ? "This Scripture is now included in your course progress."
                : reachedEnd
                  ? "You reached the end. Complete this required reading when you are ready."
                  : "Read to the end before this requirement can be completed."}</p>
            </div>
            <button type="button" onClick={completeReading} disabled={!reachedEnd || completed}>
              {completed ? <><Check /> Done</> : "Complete"}
            </button>
          </section>
        </div>

        {pendingSelection && (
          <div className={styles.selectionBar}>
            <div><small>SELECTED</small><p>“{selectionPreview}”</p></div>
            <button
              type="button"
              onClick={() => {
                window.getSelection()?.removeAllRanges();
                selectionDraftRef.current = null;
                setPendingSelection(null);
              }}
              aria-label="Clear selection"
            >
              <X />
            </button>
          </div>
        )}

        {!pendingSelection && toolMessage && (
          <div className={styles.toast} role="status">
            {toolMessage}
          </div>
        )}

        <nav className={styles.actionDock} aria-label="Scripture study tools">
          <button
            type="button"
            className={pendingSelection ? styles.actionReady : ""}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => applySelection("highlight")}
          >
            <Highlighter />
            <span>Highlight</span>
          </button>
          <button
            type="button"
            className={pendingSelection ? styles.actionReady : ""}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => applySelection("underline")}
          >
            <Underline />
            <span>Underline</span>
          </button>
          <button type="button" onClick={() => setComposer("notes")}>
            <NotebookPen />
            <span>Note</span>
          </button>
          <button type="button" onClick={() => setComposer("question")}>
            <MessageCircleQuestion />
            <span>Question</span>
          </button>
          <button
            type="button"
            className={mark.bookmark ? styles.actionSaved : ""}
            onClick={toggleBookmark}
          >
            {mark.bookmark ? <Check /> : <Bookmark />}
            <span>{mark.bookmark ? "Saved" : "Save"}</span>
          </button>
        </nav>

        {composer && (
          <div className={styles.composerBackdrop} onClick={() => setComposer(null)}>
            <section className={styles.composer} onClick={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <small>{composer === "notes" ? "PRIVATE NOTE" : "YOUR QUESTION"}</small>
                  <h2>{composer === "notes" ? "Keep what you noticed." : "What do you want to understand?"}</h2>
                </div>
                <button type="button" onClick={() => setComposer(null)} aria-label="Close">
                  <X />
                </button>
              </header>
              <p>Attached privately to {reference} and saved automatically.</p>
              <textarea
                autoFocus
                value={composer === "notes" ? mark.notes || "" : mark.question || ""}
                onChange={(event) => updateText(composer, event.target.value)}
                placeholder={composer === "notes"
                  ? "Write an observation, connection or thought…"
                  : "Write the question you want to return to…"}
              />
              <footer>
                <span><Check /> Saved to My Bible</span>
                <button type="button" onClick={() => setComposer(null)}>Done</button>
              </footer>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
