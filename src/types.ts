import { type EngineEvaluation, type EngineMove } from "./api";

export type Branch = {
  id: string;
  startIndex: number;
  moves: string[];
  fens: string[];
  evaluations: (EngineEvaluation | null)[];
  bestMoves: (EngineMove[] | null)[];
};