const apiUrl = import.meta.env.VITE_API_URL ?? "http://localhost:8000"

console.log(`apiURL: ${apiUrl}`)

import {
  type EngineEvaluation,
  type AnalyzeResponse,
  type AnalyzeBatchResponse,
  type EvaluateBatchResponse,
} from "./types.ts";
export async function analyzePosition(
  fen: string,
  depth = 15,
  numResults = 3,
): Promise<AnalyzeResponse> {
  const response = await fetch(`${apiUrl}/analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen, depth, num_results: numResults }),
  });
  if (!response.ok) {
    throw new Error(`Reponse Status ${response.status}`);
  }

  const data: AnalyzeResponse = await response.json();
  return data;
}

export async function analyzeFenBatch(
  fens: string[],
  depth = 15,
  numResults = 3,
): Promise<AnalyzeBatchResponse> {
  const response = await fetch(`${apiUrl}/batch-analyze`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fens, depth, num_results: numResults }),
  });
  if (!response.ok) {
    throw new Error(`Reponse Status ${response.status}`);
  }

  const data: AnalyzeBatchResponse = await response.json();
  return data;
}

export async function fetchFenEvaluation(
  fen: string,
  depth = 15,
): Promise<EngineEvaluation> {
  const response = await fetch(`${apiUrl}/evaluate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fen, depth }),
  });
  if (!response.ok) {
    throw new Error(`Reponse Status ${response.status}`);
  }

  const data: EngineEvaluation = await response.json();
  return data;
}

export async function evaluateFensBatch(
  fens: string[],
  depth = 15,
): Promise<EvaluateBatchResponse> {
  const response = await fetch(`${apiUrl}/evaluate-moves`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ fens, depth }),
  });
  if (!response.ok) {
    throw new Error(`Reponse Status ${response.status}`);
  }

  const data: EvaluateBatchResponse = await response.json();
  return data;
}
