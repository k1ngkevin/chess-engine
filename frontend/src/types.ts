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
  moves: string[];
  fens: string[];
  evaluations: (EngineEvaluation | null)[];
  bestMoves: (EngineMove[] | null)[];
};

export type Arrow = {
  startSquare: string;
  endSquare: string;
  color: string;
}