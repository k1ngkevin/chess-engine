import { useState } from "react";
import { type EngineEvaluation, type Branch } from "../types/chessTypes.ts";
import styles from "./EvaluationBar.module.css";

interface EvaluationProps {
  branches: Branch[];
  currentIndex: number;
  currentBranchIndex: number;
  currentBranchId: string | null;
  isOnMainline: boolean;
  playedMovesEvaluation: (EngineEvaluation | null)[];
  boardOrientation: "white" | "black";
}

const EvaluationBar = ({
  branches,
  currentIndex,
  currentBranchIndex,
  currentBranchId,
  isOnMainline,
  playedMovesEvaluation,
  boardOrientation,
}: EvaluationProps) => {
  const [cachedEvaluation, setCachedEvaluation] =
    useState<EngineEvaluation | null>(null);

  const currentMainlineEvaluation = playedMovesEvaluation[currentIndex] ?? null;

  const currentBranch = currentBranchId
    ? branches.find((branch) => branch.id === currentBranchId)
    : null;

  const currentBranchEvaluation =
    currentBranch?.evaluations[currentBranchIndex - 1] ?? null;

  const currentEvaluation = isOnMainline
    ? currentMainlineEvaluation
    : currentBranchEvaluation;

  function convertEvalToPercent(
    type: string,
    evaluation: number,
  ): number | undefined {
    if (!type || evaluation == null) return;

    if (type === "mate_over") {
      return evaluation === 1 ? 100 : 0;
    }

    if (type === "mate") {
      return evaluation > 0 ? 100 : 0;
    }

    const maxEval = 1000;
    const tempEval = Math.max(-maxEval, Math.min(maxEval, evaluation));
    return 50 + (tempEval / maxEval) * 50;
  }

  const isResetPosition =
    currentIndex === 0 &&
    isOnMainline &&
    currentBranchId === null &&
    currentBranchIndex === -1 &&
    playedMovesEvaluation.length === 0;

  let displayedEvaluation = isResetPosition
    ? null
    : (currentEvaluation ?? cachedEvaluation);

  if (isResetPosition && cachedEvaluation !== null) {
    setCachedEvaluation(null);
    displayedEvaluation = null;
  } else if (
    currentEvaluation !== null &&
    currentEvaluation !== cachedEvaluation
  ) {
    setCachedEvaluation(currentEvaluation);
    displayedEvaluation = currentEvaluation;
  }

  const type = displayedEvaluation?.type ?? "cp";
  const value = displayedEvaluation?.value ?? 0;
  const whitePercent = convertEvalToPercent(type, value);

  const evalTextStyle =
    boardOrientation === "white" && value >= 0
      ? { bottom: "8px", color: "black" }
      : boardOrientation === "white" && value < 0
        ? { top: "8px", color: "white" }
        : boardOrientation === "black" && value >= 0
          ? { top: "8px", color: "black" }
          : { bottom: "8px", color: "white" };

  return (
    <>
      <div
        className={
          boardOrientation === "white"
            ? styles.evaluationBarWhite
            : styles.evaluationBarBlack
        }
      >
        <div
          className={styles.evaluationWhite}
          style={{ height: `${whitePercent}%` }}
        ></div>

        <p className={styles.evaluationText} style={evalTextStyle}>
          {type === "mate_over"
            ? "M0"
            : type === "mate"
              ? `M${Math.abs(value)}`
              : Number.isFinite(value)
                ? Math.abs(value / 100).toFixed(2)
                : "..."}
        </p>
      </div>
    </>
  );
};

export default EvaluationBar;
