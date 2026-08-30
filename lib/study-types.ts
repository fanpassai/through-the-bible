export type ScriptureSelection = {
  id: string;
  type: "highlight" | "underline";
  quote: string;
  start: number;
  end: number;
  createdAt: string;
};

export type ScriptureMark = {
  highlight?: boolean;
  underline?: boolean;
  bookmark?: boolean;
  notes?: string;
  question?: string;
  selections?: ScriptureSelection[];
};

export type StudyPortfolio = {
  deepCompleted: Record<string, boolean>;
  deepNotes: Record<string, string>;
  deepReflections: Record<string, string>;
  scriptureTools: Record<string, ScriptureMark>;
};

export const EMPTY_PORTFOLIO: StudyPortfolio = {
  deepCompleted: {},
  deepNotes: {},
  deepReflections: {},
  scriptureTools: {},
};

