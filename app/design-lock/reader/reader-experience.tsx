"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
  type PointerEvent as ReactPointerEvent,
  type UIEvent,
} from "react";
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
  type ScriptureHighlightColor,
  type ScriptureMark,
  type ScriptureReading,
  type ScriptureSelection,
  type ScriptureStudyEntry,
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
  scope: "phrase" | "verse";
  verse?: string;
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
  classNames: {
    selection: string;
    highlight: string;
    underline: string;
    highlightColors: Record<ScriptureHighlightColor, string>;
  },
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
      const highlights = active.filter((item) => item.type === "highlight");
      if (highlights.length) {
        const latest = highlights[highlights.length - 1];
        classes.push(classNames.highlight);
        classes.push(classNames.highlightColors[latest.color || "yellow"]);
      }
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
  const [composerSelection, setComposerSelection] = useState<SelectionDraft | null>(null);
  const [composerText, setComposerText] = useState("");
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [largeText, setLargeText] = useState(false);
  const [reachedEnd, setReachedEnd] = useState(false);
  const articleRef = useRef<HTMLElement>(null);
  const selectionDraftRef = useRef<SelectionDraft | null>(null);
  const pointerGestureRef = useRef<{ startedAt: number; verse?: string } | null>(null);
  const lastVerseTapRef = useRef<{ at: number; verse: string } | null>(null);
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
        highlightColors: {
          yellow: styles.markYellow,
          blue: styles.markBlue,
          red: styles.markRed,
        },
      },
    ),
    [scripture.html, mark.selections],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPortfolio(readLocalPortfolio());
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
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
      const rawQuote = range.toString();
      const quote = rawQuote.trim();
      if (quote.length < 2) return;

      const before = document.createRange();
      before.selectNodeContents(article);
      before.setEnd(range.startContainer, range.startOffset);
      const leadingSpace = rawQuote.length - rawQuote.trimStart().length;
      const start = before.toString().length + leadingSpace;
      const element = range.startContainer instanceof Element
        ? range.startContainer
        : range.startContainer.parentElement;
      const verseElement = element?.closest(".scripture-line");
      const captured: SelectionDraft = {
        quote,
        start,
        end: start + quote.length,
        scope: "phrase",
        verse: verseElement?.querySelector("sup")?.textContent?.trim() || undefined,
      };
      const existing = selectionDraftRef.current;
      if (existing && existing.start === captured.start && existing.end === captured.end && existing.quote === captured.quote) {
        if (existing.scope === "verse") setPendingSelection(existing);
        return;
      }
      selectionDraftRef.current = captured;
      setPendingSelection(captured);
      setToolMessage("");
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () => document.removeEventListener("selectionchange", handleSelectionChange);
  }, [reference]);

  function verseElementFromNode(node: Node | null) {
    const article = articleRef.current;
    const element = node instanceof Element ? node : node?.parentElement;
    const verse = element?.closest(".scripture-line");
    return article && verse && article.contains(verse) ? verse as HTMLElement : null;
  }

  function verseElementFromTarget(target: EventTarget | null) {
    return target instanceof Node ? verseElementFromNode(target) : null;
  }

  function verseNumberFor(element: HTMLElement | null) {
    return element?.querySelector("sup")?.textContent?.trim() || undefined;
  }

  function makeSelectionDraft(
    range: Range,
    scope: SelectionDraft["scope"],
    verseOverride?: string,
  ): SelectionDraft | null {
    const article = articleRef.current;
    if (!article || !article.contains(range.commonAncestorContainer)) return null;

    const rawQuote = range.toString();
    const quote = rawQuote.trim();
    if (quote.length < 2) return null;

    const before = document.createRange();
    before.selectNodeContents(article);
    before.setEnd(range.startContainer, range.startOffset);
    const leadingSpace = rawQuote.length - rawQuote.trimStart().length;
    const start = before.toString().length + leadingSpace;
    const verseElement = verseElementFromNode(range.startContainer);

    return {
      quote,
      start,
      end: start + quote.length,
      scope,
      verse: verseOverride || verseNumberFor(verseElement),
    };
  }

  function rememberSelection(captured: SelectionDraft) {
    selectionDraftRef.current = captured;
    setPendingSelection(captured);
    setToolMessage("");
  }

  function captureSelection() {
    const article = articleRef.current;
    const selection = window.getSelection();
    if (!article || !selection || selection.rangeCount === 0 || selection.isCollapsed) return null;

    const range = selection.getRangeAt(0);
    const captured = makeSelectionDraft(range, "phrase");
    if (!captured) return null;
    const existing = selectionDraftRef.current;
    if (existing?.scope === "verse" && existing.start === captured.start && existing.end === captured.end) {
      setPendingSelection(existing);
      return existing;
    }
    rememberSelection(captured);
    return captured;
  }

  function selectWholeVerse(verseElement: HTMLElement) {
    const verseNumber = verseNumberFor(verseElement);
    const verseNumberElement = verseElement.querySelector("sup");
    const range = document.createRange();

    if (verseNumberElement?.nextSibling) {
      range.setStartBefore(verseNumberElement.nextSibling);
      range.setEnd(verseElement, verseElement.childNodes.length);
    } else {
      range.selectNodeContents(verseElement);
    }

    const captured = makeSelectionDraft(range, "verse", verseNumber);
    if (!captured) return;

    const nativeSelection = window.getSelection();
    nativeSelection?.removeAllRanges();
    nativeSelection?.addRange(range);
    rememberSelection(captured);
    setToolMessage(verseNumber ? `Verse ${verseNumber} selected.` : "Verse selected.");
  }

  function handleScripturePointerDown(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "touch") return;
    const verseElement = verseElementFromTarget(event.target);
    pointerGestureRef.current = {
      startedAt: Date.now(),
      verse: verseNumberFor(verseElement),
    };
  }

  function handleScripturePointerUp(event: ReactPointerEvent<HTMLElement>) {
    if (event.pointerType !== "touch") return;
    const gesture = pointerGestureRef.current;
    pointerGestureRef.current = null;
    const verseElement = verseElementFromTarget(event.target);
    const verse = verseNumberFor(verseElement);
    if (!gesture || !verse || !verseElement || gesture.verse !== verse) return;
    if (Date.now() - gesture.startedAt > 280) return;

    const now = Date.now();
    const lastTap = lastVerseTapRef.current;
    if (lastTap?.verse === verse && now - lastTap.at < 420) {
      event.preventDefault();
      lastVerseTapRef.current = null;
      selectWholeVerse(verseElement);
      return;
    }
    lastVerseTapRef.current = { at: now, verse };
  }

  function handleScriptureDoubleClick(event: ReactMouseEvent<HTMLElement>) {
    const verseElement = verseElementFromTarget(event.target);
    if (verseElement) selectWholeVerse(verseElement);
  }

  function activeSelection() {
    return pendingSelection || selectionDraftRef.current || captureSelection();
  }

  function requestSelection() {
    setToolMessage("Double tap a verse, or press and hold a word and drag to select a phrase.");
    articleRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function clearActiveSelection() {
    window.getSelection()?.removeAllRanges();
    selectionDraftRef.current = null;
    setPendingSelection(null);
  }

  function openHighlightPicker() {
    if (!activeSelection()) {
      requestSelection();
      return;
    }
    setHighlightPicker(true);
  }

  function applySelection(type: "highlight" | "underline", color?: ScriptureHighlightColor) {
    const captured = pendingSelection || selectionDraftRef.current || captureSelection();
    if (!captured) {
      requestSelection();
      return;
    }

    const selection: ScriptureSelection = {
      ...captured,
      type,
      color: type === "highlight" ? color || "yellow" : undefined,
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

    setHighlightPicker(false);
    clearActiveSelection();
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

  function openComposer(kind: "notes" | "question") {
    const captured = activeSelection();
    if (!captured) {
      requestSelection();
      return;
    }
    setComposerSelection(captured);
    setComposerText("");
    setComposer(kind);
  }

  function closeComposer() {
    setComposer(null);
    setComposerSelection(null);
    setComposerText("");
  }

  function saveComposerEntry() {
    const body = composerText.trim();
    if (!composer || !composerSelection || !body) return;
    const now = new Date().toISOString();
    const entry: ScriptureStudyEntry = {
      ...composerSelection,
      id: globalThis.crypto?.randomUUID?.() || String(Date.now()),
      type: composer === "notes" ? "note" : "question",
      body,
      createdAt: now,
      updatedAt: now,
    };
    const eventType: StudyActivityType = composer === "notes" ? "note_written" : "question_written";

    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: {
            ...prior,
            studyEntries: [...(prior.studyEntries || []), entry],
          },
        },
        activityEvents: keepActivity(current.activityEvents, makeActivity(eventType, reference, {
          verse: composerSelection.verse || "",
          quote: composerSelection.quote.slice(0, 120),
        })),
      };
    });

    const savedLabel = composer === "notes" ? "Note saved to My Bible." : "Question saved to My Bible.";
    closeComposer();
    clearActiveSelection();
    setToolMessage(savedLabel);
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
            <span>
              <strong>Study the text</strong>
              Double tap a verse to select it. Press and hold to select a word or phrase.
            </span>
          </div>

          <article
            ref={articleRef}
            className={[styles.scriptureText, largeText ? styles.largeText : ""].join(" ")}
            onMouseUp={captureSelection}
            onPointerDown={handleScripturePointerDown}
            onPointerUp={handleScripturePointerUp}
            onDoubleClick={handleScriptureDoubleClick}
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
            <div>
              <small>{pendingSelection.scope === "verse" && pendingSelection.verse
                ? `VERSE ${pendingSelection.verse} SELECTED`
                : "TEXT SELECTED"}</small>
              <p>“{selectionPreview}”</p>
            </div>
            <button
              type="button"
              onClick={clearActiveSelection}
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
            onClick={openHighlightPicker}
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
          <button
            type="button"
            className={pendingSelection ? styles.actionReady : ""}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => openComposer("notes")}
          >
            <NotebookPen />
            <span>Note</span>
          </button>
          <button
            type="button"
            className={pendingSelection ? styles.actionReady : ""}
            onPointerDown={(event) => event.preventDefault()}
            onClick={() => openComposer("question")}
          >
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

        {highlightPicker && (
          <div className={styles.pickerBackdrop} onClick={() => setHighlightPicker(false)}>
            <section className={styles.colorPicker} onClick={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <small>HIGHLIGHT</small>
                  <h2>Choose a color.</h2>
                </div>
                <button type="button" onClick={() => setHighlightPicker(false)} aria-label="Close color picker">
                  <X />
                </button>
              </header>
              <p>{pendingSelection?.scope === "verse" && pendingSelection.verse
                ? `This will highlight all of verse ${pendingSelection.verse}.`
                : "This will highlight the exact words you selected."}</p>
              <div className={styles.colorOptions}>
                <button type="button" onClick={() => applySelection("highlight", "yellow")}>
                  <span className={styles.yellowSwatch} /> Yellow
                </button>
                <button type="button" onClick={() => applySelection("highlight", "blue")}>
                  <span className={styles.blueSwatch} /> Blue
                </button>
                <button type="button" onClick={() => applySelection("highlight", "red")}>
                  <span className={styles.redSwatch} /> Red
                </button>
              </div>
            </section>
          </div>
        )}

        {composer && (
          <div className={styles.composerBackdrop} onClick={closeComposer}>
            <section className={styles.composer} onClick={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <small>{composer === "notes" ? "PRIVATE NOTE" : "YOUR QUESTION"}</small>
                  <h2>{composer === "notes" ? "Keep what you noticed." : "What do you want to understand?"}</h2>
                </div>
                <button type="button" onClick={closeComposer} aria-label="Close">
                  <X />
                </button>
              </header>
              <p>Attached privately to {reference}{composerSelection?.verse ? `, verse ${composerSelection.verse}` : ""}.</p>
              <blockquote className={styles.composerQuote}>“{composerSelection?.quote}”</blockquote>
              <textarea
                autoFocus
                value={composerText}
                onChange={(event) => setComposerText(event.target.value)}
                placeholder={composer === "notes"
                  ? "Write an observation, connection or thought…"
                  : "Write the question you want to return to…"}
              />
              <footer>
                <span><Bookmark /> Saved with this exact text</span>
                <button type="button" onClick={saveComposerEntry} disabled={!composerText.trim()}>
                  {composer === "notes" ? "Save note" : "Save question"}
                </button>
              </footer>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
