import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";
import styles from "./EvaluationBar.module.css";
import type { EngineEvaluation } from "./types";

type EvalPoint = {
  index: number;
  evaluation: number;
};

type EvaluationGraphProps = {
  playedMovesEvaluation: (EngineEvaluation | null)[];
  currentIndex: number;
};

function convertEval(evaluation: EngineEvaluation | null): number {
  if (!evaluation) return 0;
  if (evaluation.type === "cp") {
    const pawns = evaluation.value / 100;
    return evaluation.value > 0 ? Math.min(10, pawns) : Math.max(-10, pawns);
  }
  if (evaluation.type === "mate" || evaluation.type === "mate_over") {
    return evaluation.value > 0 ? 10 : -10;
  }
  return 0;
}

function EvaluationGraph({
  playedMovesEvaluation,
  currentIndex,
}: EvaluationGraphProps) {
  const data: EvalPoint[] = playedMovesEvaluation.map((evaluation, idx) => {
    return {
      index: idx,
      evaluation: convertEval(evaluation),
    };
  });

  return (
    <div className={styles.evaluationGraphContainer}>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <XAxis dataKey="index" hide />
          <YAxis domain={[-10, 10]} hide />
          <ReferenceLine y={0} stroke="#777" strokeWidth={1} />
          <ReferenceLine
            x={currentIndex}
            stroke="#c78c4a"
            fill="#c78c4a"
            strokeWidth={2}
          />

          <Area
            type="linear"
            dataKey="evaluation"
            stroke="#ffffff"
            fill="#ffffff"
            baseValue={-10}
            fillOpacity={1}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EvaluationGraph;
