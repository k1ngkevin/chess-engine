import { useEffect, useRef } from "react";
import { type EngineEvaluation, type Branch } from "./types.ts";
import styles from "./EvaluationBar.module.css";

interface EvaluationProps {
  branches: Branch[];
  currentIndex: number;
  currentBranchIndex: number;
  currentBranchId: string | null;
  isOnMainline: boolean;
  playedMovesEvaluation: (EngineEvaluation | null)[];
}

const EvaluationBar = ({
  branches,
  currentIndex,
  currentBranchIndex,
  currentBranchId,
  isOnMainline,
  playedMovesEvaluation,
}: EvaluationProps) => {
  const previousEvaluationRef = useRef<EngineEvaluation | null>(null);
  const currentMainlineEvaluation = playedMovesEvaluation[currentIndex] ?? null;

  const currentBranch = currentBranchId
    ? branches.find((branch) => branch.id === currentBranchId)
    : null;
  const currentBranchEvaluation =
    currentBranch?.evaluations[currentBranchIndex - 1] ?? null;

  const currentEvaluation = isOnMainline
    ? currentMainlineEvaluation
    : currentBranchEvaluation;

  useEffect(() => {
    if (currentEvaluation != null) {
      previousEvaluationRef.current = currentEvaluation;
    }
  });

  function convertEvalToPercent(
    type: string,
    evaluation: number,
  ): number | undefined {
    if (!type || !evaluation) return;

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

  const displayedEvaluation =
    currentEvaluation ?? previousEvaluationRef.current;

  const type = displayedEvaluation?.type ?? "cp";
  const value = displayedEvaluation?.value ?? 0;
  const whitePercent = convertEvalToPercent(type, value);

  return (
    <>
      <div className={styles.evaluationBar}>
        <div
          className={styles.evaluationWhite}
          style={{ height: `${whitePercent}%` }}
        ></div>

        <p
          className={
            value > 0 ? styles.evaluationTextWhite : styles.evaluationTextBlack
          }
        >
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
