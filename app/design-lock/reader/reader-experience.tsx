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
  Pencil,
  RotateCcw,
  Trash2,
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

type ReaderTextSize = "small" | "standard" | "large";

type ManageTarget = {
  selectionIds: string[];
  entryIds: string[];
};

type UndoNotice = {
  message: string;
  undo: () => void;
};

const SCRIPTURES = lesson.SCRIPTURES as Record<string, Scripture>;
const DEFAULT_REFERENCE = "Genesis 1:3–31";
const TEXT_SIZE_STORAGE_KEY = "ttb-reader-text-size";

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
      return '<span class="' + classes.join(" ") + '" data-selection-ids="' + active.map((item) => item.id).join(",") + '">' + text + "</span>";
    }).join("");
  }).join("");
}

function attachStudyIndicators(
  html: string,
  entries: ScriptureStudyEntry[],
  classNames: { note: string; question: string },
) {
  const byVerse = new Map<string, { notes: string[]; questions: string[] }>();
  entries.forEach((entry) => {
    if (!entry.verse) return;
    const group = byVerse.get(entry.verse) || { notes: [], questions: [] };
    if (entry.type === "note") group.notes.push(entry.id);
    else group.questions.push(entry.id);
    byVerse.set(entry.verse, group);
  });

  if (!byVerse.size) return html;
  return html.replace(
    /(<p class="scripture-line"><sup>([^<]+)<\/sup>)([\s\S]*?)(<\/p>)/g,
    (verseHtml, open: string, verse: string, text: string, close: string) => {
      const group = byVerse.get(verse.trim());
      if (!group) return verseHtml;
      const indicators = [
        group.notes.length
          ? `<button type="button" class="${classNames.note}" data-study-entry-ids="${group.notes.join(",")}" aria-label="Manage notes on verse ${verse.trim()}"></button>`
          : "",
        group.questions.length
          ? `<button type="button" class="${classNames.question}" data-study-entry-ids="${group.questions.join(",")}" aria-label="Manage questions on verse ${verse.trim()}"></button>`
          : "",
      ].join("");
      return open + text + indicators + close;
    },
  );
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
  const [editingEntryId, setEditingEntryId] = useState<string | null>(null);
  const [highlightPicker, setHighlightPicker] = useState(false);
  const [textSizePicker, setTextSizePicker] = useState(false);
  const [textSize, setTextSize] = useState<ReaderTextSize>("standard");
  const [manageTarget, setManageTarget] = useState<ManageTarget | null>(null);
  const [undoNotice, setUndoNotice] = useState<UndoNotice | null>(null);
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
    () => attachStudyIndicators(
      annotateScriptureHtml(
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
      mark.studyEntries || [],
      { note: styles.noteIndicator, question: styles.questionIndicator },
    ),
    [scripture.html, mark.selections, mark.studyEntries],
  );

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPortfolio(readLocalPortfolio());
      const savedSize = window.localStorage.getItem(TEXT_SIZE_STORAGE_KEY);
      if (savedSize === "small" || savedSize === "standard" || savedSize === "large") {
        setTextSize(savedSize);
      }
      setReady(true);
    }, 0);
    return () => window.clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(TEXT_SIZE_STORAGE_KEY, textSize);
    } catch {
      // Reading preferences can fall back to the current session.
    }
  }, [ready, textSize]);

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

  useEffect(() => {
    if (!toolMessage || pendingSelection) return;
    const timer = window.setTimeout(() => setToolMessage(""), 1800);
    return () => window.clearTimeout(timer);
  }, [toolMessage, pendingSelection]);

  useEffect(() => {
    if (!undoNotice) return;
    const timer = window.setTimeout(() => setUndoNotice(null), 4000);
    return () => window.clearTimeout(timer);
  }, [undoNotice]);

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

  function showUndo(message: string, undo: () => void) {
    setToolMessage("");
    setUndoNotice({ message, undo });
  }

  function handleScriptureClick(event: ReactMouseEvent<HTMLElement>) {
    const element = event.target instanceof Element ? event.target : null;
    const entryControl = element?.closest<HTMLElement>("[data-study-entry-ids]");
    const markedText = element?.closest<HTMLElement>("[data-selection-ids]");
    const entryIds = entryControl?.dataset.studyEntryIds?.split(",").filter(Boolean) || [];
    const selectionIds = markedText?.dataset.selectionIds?.split(",").filter(Boolean) || [];
    if (!entryIds.length && !selectionIds.length) return;
    setManageTarget({ entryIds, selectionIds });
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
    const activity = makeActivity(type === "highlight" ? "highlight_created" : "underline_created", reference);

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
        activityEvents: keepActivity(current.activityEvents, activity),
      };
    });

    setHighlightPicker(false);
    clearActiveSelection();
    showUndo(type === "highlight" ? "Highlight saved." : "Underline saved.", () => {
      setPortfolio((current) => {
        const prior = current.scriptureTools[reference] || {};
        return {
          ...current,
          scriptureTools: {
            ...current.scriptureTools,
            [reference]: {
              ...prior,
              selections: (prior.selections || []).filter((item) => item.id !== selection.id),
            },
          },
          activityEvents: current.activityEvents.filter((event) => event.id !== activity.id),
        };
      });
    });
  }

  function toggleBookmark() {
    const previousBookmark = Boolean(mark.bookmark);
    const activity = previousBookmark ? null : makeActivity("bookmark_saved", reference);
    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      const bookmark = !prior.bookmark;
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: { ...prior, bookmark },
        },
        activityEvents: bookmark && activity
          ? keepActivity(current.activityEvents, activity)
          : current.activityEvents,
      };
    });
    showUndo(previousBookmark ? "Removed from saved passages." : "Saved to My Bible.", () => {
      setPortfolio((current) => {
        const prior = current.scriptureTools[reference] || {};
        return {
          ...current,
          scriptureTools: {
            ...current.scriptureTools,
            [reference]: { ...prior, bookmark: previousBookmark },
          },
          activityEvents: activity
            ? current.activityEvents.filter((event) => event.id !== activity.id)
            : current.activityEvents,
        };
      });
    });
  }

  function openComposer(kind: "notes" | "question") {
    const captured = activeSelection();
    if (!captured) {
      requestSelection();
      return;
    }
    setComposerSelection(captured);
    setComposerText("");
    setEditingEntryId(null);
    setComposer(kind);
  }

  function editStudyEntry(entry: ScriptureStudyEntry) {
    setComposerSelection({
      quote: entry.quote,
      start: entry.start,
      end: entry.end,
      scope: "phrase",
      verse: entry.verse,
    });
    setComposerText(entry.body);
    setEditingEntryId(entry.id);
    setComposer(entry.type === "note" ? "notes" : "question");
    setManageTarget(null);
  }

  function closeComposer() {
    setComposer(null);
    setComposerSelection(null);
    setComposerText("");
    setEditingEntryId(null);
  }

  function saveComposerEntry() {
    const body = composerText.trim();
    if (!composer || !composerSelection || !body) return;
    const now = new Date().toISOString();
    const existingEntry = editingEntryId
      ? (mark.studyEntries || []).find((entry) => entry.id === editingEntryId)
      : undefined;
    const entry: ScriptureStudyEntry = {
      ...composerSelection,
      id: existingEntry?.id || globalThis.crypto?.randomUUID?.() || String(Date.now()),
      type: composer === "notes" ? "note" : "question",
      body,
      createdAt: existingEntry?.createdAt || now,
      updatedAt: now,
    };
    const eventType: StudyActivityType = composer === "notes" ? "note_written" : "question_written";
    const activity = existingEntry ? null : makeActivity(eventType, reference, {
      verse: composerSelection.verse || "",
      quote: composerSelection.quote.slice(0, 120),
    });

    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      const entries = prior.studyEntries || [];
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: {
            ...prior,
            studyEntries: existingEntry
              ? entries.map((item) => item.id === entry.id ? entry : item)
              : [...entries, entry],
          },
        },
        activityEvents: activity ? keepActivity(current.activityEvents, activity) : current.activityEvents,
      };
    });

    const savedLabel = existingEntry
      ? (composer === "notes" ? "Note updated." : "Question updated.")
      : (composer === "notes" ? "Note saved to My Bible." : "Question saved to My Bible.");
    closeComposer();
    clearActiveSelection();
    showUndo(savedLabel, () => {
      setPortfolio((current) => {
        const prior = current.scriptureTools[reference] || {};
        const entries = prior.studyEntries || [];
        return {
          ...current,
          scriptureTools: {
            ...current.scriptureTools,
            [reference]: {
              ...prior,
              studyEntries: existingEntry
                ? entries.map((item) => item.id === existingEntry.id ? existingEntry : item)
                : entries.filter((item) => item.id !== entry.id),
            },
          },
          activityEvents: activity
            ? current.activityEvents.filter((event) => event.id !== activity.id)
            : current.activityEvents,
        };
      });
    });
  }

  function removeSelections(ids: string[], label: string) {
    const removed = (mark.selections || []).filter((item) => ids.includes(item.id));
    if (!removed.length) return;
    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: {
            ...prior,
            selections: (prior.selections || []).filter((item) => !ids.includes(item.id)),
          },
        },
      };
    });
    setManageTarget(null);
    showUndo(label, () => {
      setPortfolio((current) => {
        const prior = current.scriptureTools[reference] || {};
        const existingIds = new Set((prior.selections || []).map((item) => item.id));
        return {
          ...current,
          scriptureTools: {
            ...current.scriptureTools,
            [reference]: {
              ...prior,
              selections: [...(prior.selections || []), ...removed.filter((item) => !existingIds.has(item.id))],
            },
          },
        };
      });
    });
  }

  function changeHighlightColor(ids: string[], color: ScriptureHighlightColor) {
    const previous = (mark.selections || []).filter((item) => ids.includes(item.id));
    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: {
            ...prior,
            selections: (prior.selections || []).map((item) => ids.includes(item.id) ? { ...item, color } : item),
          },
        },
      };
    });
    setManageTarget(null);
    showUndo("Highlight color changed.", () => {
      const previousById = new Map(previous.map((item) => [item.id, item]));
      setPortfolio((current) => {
        const prior = current.scriptureTools[reference] || {};
        return {
          ...current,
          scriptureTools: {
            ...current.scriptureTools,
            [reference]: {
              ...prior,
              selections: (prior.selections || []).map((item) => previousById.get(item.id) || item),
            },
          },
        };
      });
    });
  }

  function deleteStudyEntries(ids: string[], label: string) {
    const removed = (mark.studyEntries || []).filter((entry) => ids.includes(entry.id));
    if (!removed.length) return;
    setPortfolio((current) => {
      const prior = current.scriptureTools[reference] || {};
      return {
        ...current,
        scriptureTools: {
          ...current.scriptureTools,
          [reference]: {
            ...prior,
            studyEntries: (prior.studyEntries || []).filter((entry) => !ids.includes(entry.id)),
          },
        },
      };
    });
    setManageTarget(null);
    showUndo(label, () => {
      setPortfolio((current) => {
        const prior = current.scriptureTools[reference] || {};
        const existingIds = new Set((prior.studyEntries || []).map((entry) => entry.id));
        return {
          ...current,
          scriptureTools: {
            ...current.scriptureTools,
            [reference]: {
              ...prior,
              studyEntries: [...(prior.studyEntries || []), ...removed.filter((entry) => !existingIds.has(entry.id))],
            },
          },
        };
      });
    });
  }

  function completeReading() {
    if (completed || !reachedEnd) return;
    const now = new Date().toISOString();
    const previousReading = portfolio.readingHistory[reference];
    const activity = makeActivity("scripture_read", reference, { verseCount });

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
        activityEvents: keepActivity(current.activityEvents, activity),
      };
    });
    showUndo("Reading completed and added to Week 1.", () => {
      setPortfolio((current) => {
        const readingHistory = { ...current.readingHistory };
        if (previousReading) readingHistory[reference] = previousReading;
        else delete readingHistory[reference];
        return {
          ...current,
          readingHistory,
          activityEvents: current.activityEvents.filter((event) => event.id !== activity.id),
        };
      });
    });
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
  const managedSelections = manageTarget
    ? (mark.selections || []).filter((item) => manageTarget.selectionIds.includes(item.id))
    : [];
  const managedEntries = manageTarget
    ? (mark.studyEntries || []).filter((entry) => manageTarget.entryIds.includes(entry.id))
    : [];
  const managedHighlights = managedSelections.filter((item) => item.type === "highlight");
  const managedUnderlines = managedSelections.filter((item) => item.type === "underline");
  const managedQuote = managedSelections[0]?.quote || managedEntries[0]?.quote || "Saved Scripture study";

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
              className={textSize !== "standard" ? styles.textActive : ""}
              onClick={() => setTextSizePicker(true)}
              aria-label="Change text size"
            >
              <span className={styles.textSizeLabel}>Aa</span>
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
            className={[
              styles.scriptureText,
              textSize === "small" ? styles.smallText : "",
              textSize === "large" ? styles.largeText : "",
            ].join(" ")}
            onMouseUp={captureSelection}
            onPointerDown={handleScripturePointerDown}
            onPointerUp={handleScripturePointerUp}
            onDoubleClick={handleScriptureDoubleClick}
            onClick={handleScriptureClick}
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

        {!pendingSelection && undoNotice && (
          <div className={[styles.toast, styles.undoToast].join(" ")} role="status">
            <span>{undoNotice.message}</span>
            <button
              type="button"
              onClick={() => {
                const undo = undoNotice.undo;
                setUndoNotice(null);
                undo();
              }}
            >
              <RotateCcw /> Undo
            </button>
          </div>
        )}

        {!pendingSelection && !undoNotice && toolMessage && (
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

        {textSizePicker && (
          <div className={styles.pickerBackdrop} onClick={() => setTextSizePicker(false)}>
            <section className={styles.sizePicker} onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog">
              <header>
                <div>
                  <small>READING SIZE</small>
                  <h2>Make the text comfortable.</h2>
                </div>
                <button type="button" onClick={() => setTextSizePicker(false)} aria-label="Close text size options"><X /></button>
              </header>
              <div className={styles.sizeOptions}>
                {(["small", "standard", "large"] as ReaderTextSize[]).map((size) => (
                  <button
                    type="button"
                    className={textSize === size ? styles.sizeSelected : ""}
                    key={size}
                    onClick={() => {
                      setTextSize(size);
                      setTextSizePicker(false);
                      setToolMessage(`${size.charAt(0).toUpperCase() + size.slice(1)} reading size selected.`);
                    }}
                  >
                    <span className={styles[`sizeSample${size.charAt(0).toUpperCase() + size.slice(1)}` as keyof typeof styles]}>Aa</span>
                    <span>{size.charAt(0).toUpperCase() + size.slice(1)}</span>
                    {textSize === size ? <Check /> : null}
                  </button>
                ))}
              </div>
            </section>
          </div>
        )}

        {manageTarget && (
          <div className={styles.pickerBackdrop} onClick={() => setManageTarget(null)}>
            <section className={styles.manageSheet} onClick={(event) => event.stopPropagation()} aria-modal="true" role="dialog">
              <header>
                <div><small>SAVED STUDY</small><h2>Manage what you kept.</h2></div>
                <button type="button" onClick={() => setManageTarget(null)} aria-label="Close saved study"><X /></button>
              </header>
              <blockquote>“{managedQuote}”</blockquote>

              {managedHighlights.length ? <div className={styles.manageGroup}>
                <div><Highlighter /><span><strong>Highlight</strong><small>Change its color or remove it</small></span></div>
                <div className={styles.manageColors}>
                  {(["yellow", "blue", "red"] as ScriptureHighlightColor[]).map((color) => <button type="button" key={color} onClick={() => changeHighlightColor(managedHighlights.map((item) => item.id), color)} aria-label={`Change highlight to ${color}`}><span className={styles[`${color}Swatch`]} /></button>)}
                  <button type="button" className={styles.removeAction} onClick={() => removeSelections(managedHighlights.map((item) => item.id), "Highlight removed.")}><Trash2 /> Remove</button>
                </div>
              </div> : null}

              {managedUnderlines.length ? <div className={styles.manageGroup}>
                <div><Underline /><span><strong>Underline</strong><small>Attached to this exact text</small></span></div>
                <button type="button" className={styles.removeWide} onClick={() => removeSelections(managedUnderlines.map((item) => item.id), "Underline removed.")}><Trash2 /> Remove underline</button>
              </div> : null}

              {managedEntries.map((entry) => <article className={styles.manageEntry} key={entry.id}>
                <small>{entry.type === "note" ? "NOTE" : "QUESTION"}{entry.verse ? ` · VERSE ${entry.verse}` : ""}</small>
                <p>{entry.body}</p>
                <div>
                  <button type="button" onClick={() => editStudyEntry(entry)}><Pencil /> Edit</button>
                  <button type="button" onClick={() => deleteStudyEntries([entry.id], entry.type === "note" ? "Note deleted." : "Question deleted.")}><Trash2 /> Delete</button>
                </div>
              </article>)}
            </section>
          </div>
        )}

        {composer && (
          <div className={styles.composerBackdrop} onClick={closeComposer}>
            <section className={styles.composer} onClick={(event) => event.stopPropagation()}>
              <header>
                <div>
                  <small>{composer === "notes" ? "PRIVATE NOTE" : "YOUR QUESTION"}</small>
                  <h2>{editingEntryId
                    ? (composer === "notes" ? "Edit your note." : "Edit your question.")
                    : (composer === "notes" ? "Keep what you noticed." : "What do you want to understand?")}</h2>
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
                  {editingEntryId
                    ? (composer === "notes" ? "Update note" : "Update question")
                    : (composer === "notes" ? "Save note" : "Save question")}
                </button>
              </footer>
            </section>
          </div>
        )}
      </section>
    </main>
  );
}
