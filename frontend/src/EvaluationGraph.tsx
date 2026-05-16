import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import styles from "./EvaluationGraph.module.css";
import {
  type EngineEvaluation,
  type NullableMoveClassification,
  type Branch,
  type GameMove,
} from "./types";
import {
  classificationToIcon,
  classificationToTextColor,
} from "./classifications";

type EvalPoint = {
  index: number;
  evaluation: number;
  rawEvaluation: EngineEvaluation | null;
  san: string;
  icon: string | null;
};

type EvaluationGraphProps = {
  isOnMainline: boolean;
  mainlineMoves: GameMove[];
  currentBranchId: string | null;
  playedMovesEvaluation: (EngineEvaluation | null)[];
  moveClassification: NullableMoveClassification[];
  branches: Branch[];
  currentIndex: number;
  currentBranchIndex: number;
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

function moveInfo(
  active?: boolean,
  payload?: ReadonlyArray<{ payload?: EvalPoint }>,
) {
  if (!active || !payload?.length) return null;

  const point = payload[0]?.payload;
  if (!point) return null;

  const value = formatEvaluation(point.rawEvaluation);

  return (
    <div className={styles.tooltipContainer}>
      <div className={styles.tooltipMove}>
        {point.icon && (
          <img
            src={point.icon}
            alt=""
            className={styles.tooltipClassificationIcon}
          />
        )}
        <span>{point.san}</span>
      </div>
      <span className={styles.tooltipEvaluation}>{value}</span>
    </div>
  );
}

function formatEvaluation(evaluation: EngineEvaluation | null): string {
  if (!evaluation) return "...";
  if (evaluation.type === "mate_over") return "M0";
  if (evaluation.type === "mate") return `M${Math.abs(evaluation.value)}`;
  return `${evaluation.value > 0 ? "+" : ""}${(evaluation.value / 100).toFixed(2)}`;
}

function EvaluationGraph({
  mainlineMoves,
  playedMovesEvaluation,
  moveClassification,
  currentIndex,
}: EvaluationGraphProps) {
  const data: EvalPoint[] = playedMovesEvaluation.map((evaluation, idx) => {
    const classification = idx > 0 ? moveClassification[idx - 1] : null;

    return {
      index: idx,
      evaluation: convertEval(evaluation),
      rawEvaluation: evaluation,
      san: idx > 0 ? (mainlineMoves[idx - 1]?.san ?? `Move ${idx}`) : "Start",
      icon: classification ? classificationToIcon[classification] : null,
    };
  });

  const currentClassification = moveClassification[currentIndex - 1];
  const currentLineColor = currentClassification
    ? classificationToTextColor[currentClassification]
    : "#fff";

  return (
    <div className={styles.evaluationGraphContainer}>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart data={data}>
          <XAxis dataKey="index" hide />
          <YAxis domain={[-10, 10]} hide />
          <ReferenceLine y={0} stroke="#777" strokeWidth={1} />
          <ReferenceLine
            x={currentIndex}
            stroke={currentLineColor}
            fill={currentLineColor}
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
          <Tooltip
            content={({
              active,
              payload,
            }: {
              active?: boolean;
              payload?: ReadonlyArray<{ payload?: EvalPoint }>;
            }) => moveInfo(active, payload)}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export default EvaluationGraph;
