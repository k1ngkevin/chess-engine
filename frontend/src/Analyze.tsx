import { type EngineMove, type Branch } from "./types";
interface AnalyzeProps {
  branches: Branch[];
  bestMoves: (EngineMove[] | null)[];
  currentIndex: number;
  isOnMainline: boolean;
  currentBranchId: string | null;
  currentBranchIndex: number;
  onAnalyze: () => Promise<string[] | void>;
}

const Analyze = ({
  branches: branches,
  bestMoves: bestMoves,
  currentIndex: currentIndex,
  isOnMainline: isOnMainline,
  currentBranchId: currentBranchId,
  currentBranchIndex: currentBranchIndex,
  onAnalyze: onAnalyze,
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
    <>
      {/* <button onClick={() => onAnalyze()}>Analyze</button> */}
      <p style={{ color: "white" }}>
        {currentBestMoves?.map((move) => move.san).join(" ") ?? null}
      </p>
      <p style={{ color: "white" }}>
        {currentBestMoves
          ?.map((move) =>
            move.mate !== null
              ? `M${move.mate}`
              : move.centipawn !== null
                ? (move.centipawn / 100).toFixed(2)
                : "",
          )
          .join(" ") ?? null}
      </p>
    </>
  );
};

export default Analyze;
