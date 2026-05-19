import { useEffect, useRef, useState } from "react";
import { IconChevronDown, IconChevronUp } from "@tabler/icons-react";
import {
  type EngineMove,
  type Branch,
  type Settings,
} from "../types/chessTypes";
import styles from "./Analyze.module.css";

interface AnalyzeProps {
  branches: Branch[];
  bestMoves: (EngineMove[] | null)[];
  currentIndex: number;
  isOnMainline: boolean;
  currentBranchId: string | null;
  currentBranchIndex: number;
  settings: Settings;
}

interface AnalysisMoveRowProps {
  move: EngineMove;
}

const AnalysisMoveRow = ({ move }: AnalysisMoveRowProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [canExpand, setCanExpand] = useState(false);
  const moveTextRef = useRef<HTMLSpanElement>(null);
  const moveText = [move.san, ...(move.line?.slice(1) ?? [])].join(" ");

  useEffect(() => {
    const element = moveTextRef.current;
    if (!element) return;

    function updateCanExpand() {
      if (!element) return;

      const previousWhiteSpace = element.style.whiteSpace;
      element.style.whiteSpace = "nowrap";
      const hasOverflow = element.scrollWidth > element.clientWidth + 1;
      element.style.whiteSpace = previousWhiteSpace;

      setCanExpand(hasOverflow);
      if (!hasOverflow) {
        setIsExpanded(false);
      }
    }

    updateCanExpand();

    const resizeObserver = new ResizeObserver(updateCanExpand);
    resizeObserver.observe(element);

    return () => {
      resizeObserver.disconnect();
    };
  }, [moveText]);

  const whiteTurn =
    (move.mate !== null && move.mate > 0) ||
    (move.centipawn !== null && move.centipawn > 0);

  return (
    <div
      className={`${styles.analysisItem} ${
        canExpand ? styles.analysisItemExpandable : ""
      }`}
    >
      <span
        className={whiteTurn ? styles.evaluationWhite : styles.evaluationBlack}
      >
        {move.mate !== null
          ? `M${move.mate}`
          : move.centipawn !== null
            ? `${move.centipawn / 100 > 0 ? "+" : ""}${(move.centipawn / 100).toFixed(2)}`
            : ""}
      </span>
      <span
        ref={moveTextRef}
        className={`${styles.moveLine} ${isExpanded ? styles.moveLineExpanded : ""}`}
      >
        {moveText}
      </span>
      {canExpand ? (
        <button
          type="button"
          className={styles.expandButton}
          aria-label={isExpanded ? "Collapse line" : "Expand line"}
          aria-expanded={isExpanded}
          onClick={() => setIsExpanded((prev) => !prev)}
        >
          {isExpanded ? (
            <IconChevronUp size={20} />
          ) : (
            <IconChevronDown size={20} />
          )}
        </button>
      ) : null}
    </div>
  );
};

const Analyze = ({
  branches: branches,
  bestMoves: bestMoves,
  currentIndex: currentIndex,
  isOnMainline: isOnMainline,
  currentBranchId: currentBranchId,
  currentBranchIndex: currentBranchIndex,
  settings: settings,
}: AnalyzeProps) => {
  const currentMainlineBestMoves = bestMoves[currentIndex];
  const currentBranch = currentBranchId
    ? branches.find((branch) => branch.id === currentBranchId)
    : null;
  const currentBranchBestMoves =
    currentBranch?.bestMoves[currentBranchIndex] ?? null;

  const currentBestMoves = isOnMainline
    ? currentMainlineBestMoves
    : currentBranchBestMoves;

  const isLoading = currentBestMoves == null;

  return (
    <div className={styles.analysisContainer}>
      {isLoading ? (
        <>
          {[0, 1, 2].map((idx) => (
            <div key={idx} className={styles.analysisItem}>
              <span className={styles.evaluationLoading}></span>
              <span className={styles.bestMovesLoading}></span>
            </div>
          ))}
        </>
      ) : (
        <div>
          <p style={{ color: "gray" }}>{`Depth: ${settings.engineDepth}`}</p>
          {currentBestMoves?.map((move, idx) => (
            <AnalysisMoveRow key={idx} move={move} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Analyze;
