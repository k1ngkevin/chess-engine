import { useEffect, useRef } from "react";
import { type EngineEvaluation } from "./types.ts";
import styles from "./EvaluationBar.module.css";

interface EvaluationProps {
  currentIndex: number;
  playedMovesEvaluation: (EngineEvaluation | null)[];
}

const EvaluationBar = ({
  currentIndex,
  playedMovesEvaluation,
}: EvaluationProps) => {
  const previousEvaluationRef = useRef<EngineEvaluation | null>(null);
  const currentEvaluation = playedMovesEvaluation[currentIndex];

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
