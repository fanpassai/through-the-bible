export type ScriptureHighlightColor = "yellow" | "blue" | "red";

export type ScriptureSelection = {
  id: string;
  type: "highlight" | "underline";
  quote: string;
  start: number;
  end: number;
  scope?: "phrase" | "verse";
  verse?: string;
  color?: ScriptureHighlightColor;
  createdAt: string;
};

export type ScriptureStudyEntry = {
  id: string;
  type: "note" | "question";
  quote: string;
  start: number;
  end: number;
  verse?: string;
  body: string;
  createdAt: string;
  updatedAt: string;
};

export type ScriptureMark = {
  highlight?: boolean;
  underline?: boolean;
  bookmark?: boolean;
  notes?: string;
  question?: string;
  selections?: ScriptureSelection[];
  studyEntries?: ScriptureStudyEntry[];
};

export type ScriptureReading = {
  reference: string;
  opens: number;
  reads: number;
  firstOpenedAt: string;
  lastOpenedAt: string;
  completedAt?: string;
  lastReadAt?: string;
  verseCount?: number;
};

export type StudyActivityType =
  | "scripture_opened"
  | "scripture_read"
  | "highlight_created"
  | "underline_created"
  | "bookmark_saved"
  | "note_written"
  | "question_written"
  | "fill_attempt"
  | "place_completed"
  | "connect_completed"
  | "unlock_completed"
  | "devotional_completed";

export type StudyActivityEvent = {
  id: string;
  type: StudyActivityType;
  createdAt: string;
  reference?: string;
  detail?: Record<string, string | number | boolean>;
};

export type StudyPortfolio = {
  deepCompleted: Record<string, boolean>;
  deepNotes: Record<string, string>;
  deepReflections: Record<string, string>;
  scriptureTools: Record<string, ScriptureMark>;
  readingHistory: Record<string, ScriptureReading>;
  activityEvents: StudyActivityEvent[];
};

export const EMPTY_PORTFOLIO: StudyPortfolio = {
  deepCompleted: {},
  deepNotes: {},
  deepReflections: {},
  scriptureTools: {},
  readingHistory: {},
  activityEvents: [],
};
