import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceDot,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { useState } from "react";
import styles from "./EvaluationGraph.module.css";
import {
  type EngineEvaluation,
  type NullableMoveClassification,
  type Branch,
  type GameMove,
} from "../types/chessTypes";
import {
  classificationToIcon,
  classificationToTextColor,
} from "../lib/classifications";

type EvalPoint = {
  index: number;
  evaluation: number;
  rawEvaluation: EngineEvaluation | null;
  san: string;
  icon: string | null;
};

type ChartClickState = {
  activeTooltipIndex?: number | string | null;
  activeIndex?: number | string | null;
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
  onMoveSelect: (moveIndex: number) => void;
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
  onMoveSelect,
}: EvaluationGraphProps) {
  const [isTooltipActive, setIsTooltipActive] = useState(false);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const data: EvalPoint[] = playedMovesEvaluation.map((evaluation, idx) => {
    const classification = idx > 0 ? moveClassification[idx - 1] : null;
    const classificationKey = classification?.classification;

    return {
      index: idx,
      evaluation: convertEval(evaluation),
      rawEvaluation: evaluation,
      san: idx > 0 ? (mainlineMoves[idx - 1]?.san ?? `Move ${idx}`) : "Start",
      icon: classificationKey ? classificationToIcon[classificationKey] : null,
    };
  });

  const maxAbsEvaluation = Math.max(
    1,
    ...data.map((point) => Math.abs(point.evaluation)),
  );
  const yLimit = Math.min(10, maxAbsEvaluation);

  function getPointColor(pointIndex: number): string {
    const classification =
      pointIndex > 0 ? moveClassification[pointIndex - 1] : null;
    const classificationKey = classification?.classification;
    return classificationKey
      ? classificationToTextColor[classificationKey]
      : "#fff";
  }

  const currentLineColor = getPointColor(currentIndex);
  const currentPoint = data[currentIndex];
  const hoveredPoint =
    hoveredIndex !== null && hoveredIndex !== currentIndex
      ? data[hoveredIndex]
      : null;
  const hoveredPointColor = hoveredPoint
    ? getPointColor(hoveredPoint.index)
    : "#fff";

  function getPointFromChartState(nextState: ChartClickState) {
    const activeIndex = nextState.activeTooltipIndex ?? nextState.activeIndex;
    const pointIndex =
      typeof activeIndex === "number" ? activeIndex : Number(activeIndex);

    if (!Number.isInteger(pointIndex)) return null;

    return data[pointIndex] ?? null;
  }

  function handleChartMouseMove(nextState: ChartClickState) {
    setIsTooltipActive(true);

    const point = getPointFromChartState(nextState);
    setHoveredIndex(point?.index ?? null);
  }

  function handleChartMouseLeave() {
    setIsTooltipActive(false);
    setHoveredIndex(null);
  }

  function handleChartClick(nextState: ChartClickState) {
    const point = getPointFromChartState(nextState);
    if (!point) return;

    onMoveSelect(point.index);
  }

  return (
    <div className={styles.evaluationGraphContainer}>
      <ResponsiveContainer width="100%" height={120}>
        <AreaChart
          data={data}
          onClick={handleChartClick}
          onMouseMove={handleChartMouseMove}
          onMouseLeave={handleChartMouseLeave}
        >
          <XAxis dataKey="index" hide />
          <YAxis domain={[-yLimit, yLimit]} hide />
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
            strokeWidth={2}
            fill="#ffffff"
            fillOpacity={1}
            baseValue={-yLimit}
            isAnimationActive={false}
            activeDot={false}
          />

          {currentPoint && (
            <ReferenceDot
              x={currentPoint.index}
              y={currentPoint.evaluation}
              r={4}
              fill={currentLineColor}
              stroke={currentLineColor}
              strokeWidth={2}
            />
          )}

          {hoveredPoint && (
            <ReferenceDot
              x={hoveredPoint.index}
              y={hoveredPoint.evaluation}
              r={4}
              fill={hoveredPointColor}
              stroke={hoveredPointColor}
              strokeWidth={2}
            />
          )}

          <Tooltip
            active={isTooltipActive}
            cursor={false}
            trigger="hover"
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
