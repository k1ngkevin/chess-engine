export type EngineMove = {
  uci: string;
  san: string;
  centipawn: number | null;
  mate: number | null;
  line: string[]
};

export type EngineEvaluation = {
  type: "cp" | "mate" | "mate_over";
  value: number;
};

export type GameMove = {
  san: string;
  from: string;
  to: string;
}

export type ImportProgress = {
  current: number;
  total: number;
  label: string;
};

export type AnalyzeResponse = {
  best_moves: EngineMove[];
  fen: string;
};

export type AnalyzeBatchResponse = {
  best_moves: (EngineMove[] | null)[];
};

export type EvaluateBatchResponse = {
  move_evaluations: (EngineEvaluation | null)[];
};

export type Branch = {
  id: string;
  startIndex: number;
  moves: GameMove[];
  fens: string[];
  evaluations: (EngineEvaluation | null)[];
  bestMoves: (EngineMove[] | null)[];
  classifications: (NullableMoveClassification | null)[];
};

export type Arrow = {
  startSquare: string;
  endSquare: string;
  color: string;
}

export type MoveClassification =
  | "book"
  | "best"
  | "excellent"
  | "okay"
  | "inaccuracy"
  | "mistake"
  | "blunder";

export type MoveClassificationResult = {
  classification: MoveClassification;
  openingName?: string;
};

export type NullableMoveClassification = MoveClassificationResult | null;

export type ClassificationCounts = Record<MoveClassification, number>;

export type SidebarView = "import" | "report" | "analysis"

export type Settings = {
  showEngineArrows: boolean;
  engineDepth: number;
  numberOfLines: number;
};