import { type EngineMove, type Branch } from "./types";
import styles from "./Analyze.module.css";
interface AnalyzeProps {
  branches: Branch[];
  bestMoves: (EngineMove[] | null)[];
  currentIndex: number;
  isOnMainline: boolean;
  currentBranchId: string | null;
  currentBranchIndex: number;
}

const Analyze = ({
  branches: branches,
  bestMoves: bestMoves,
  currentIndex: currentIndex,
  isOnMainline: isOnMainline,
  currentBranchId: currentBranchId,
  currentBranchIndex: currentBranchIndex,
}: AnalyzeProps) => {
  const currentMainlineBestMoves = bestMoves[currentIndex];
  const currentBranch = currentBranchId
    ? branches.find((branch) => branch.id === currentBranchId)
    : null;
  const currentBranchBestMoves =
    currentBranch?.bestMoves[currentBranchIndex - 1] ?? null;

  const currentBestMoves = isOnMainline
    ? currentMainlineBestMoves
    : currentBranchBestMoves;

  return (
    <div className={styles.analysisContainer}>
      {currentBestMoves?.map((move, idx) => {
        const whiteTurn =
          (move.mate !== null && move.mate > 0) ||
          (move.centipawn !== null && move.centipawn > 0);
        return (
          <div key={idx} className={styles.analysisItem}>
            <span
              className={
                whiteTurn ? styles.evaluationWhite : styles.evaluationBlack
              }
            >
              {move.mate !== null
                ? `M${move.mate}`
                : move.centipawn !== null
                  ? `${move.centipawn / 100 > 0 ? "+" : ""}${(move.centipawn / 100).toFixed(2)}`
                  : ""}
            </span>
            <span className={styles.bestMove}>{move.san}</span>
          </div>
        );
      })}
    </div>
  );
};

export default Analyze;
