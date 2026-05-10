import { useMemo } from "react";
import React from "react";
import styles from "./MovesList.module.css";
import {
  type Branch,
  type GameMove,
  type MoveClassification,
} from "./types.ts";
import { classificationToIcon } from "./classifciations.ts";

type MovesListProps = {
  navigation: {
    onNextMove: () => void;
    onPrevMove: () => void;
    gotoMainlineMove: (move: number) => void;
    gotoBranchMove: (branchId: string, move: number) => void;
    onBeginning: () => void;
    onEnd: () => void;
    returnToMainline: () => void;
  };
  gameState: {
    branches: Branch[];
    mainlineMoves: GameMove[];
    currentIndex: number;
    isOnMainline: boolean;
    currentBranchId: string | null;
    currentBranchIndex: number;
    moveClassifications: MoveClassification[];
  };
};

const MovesList = ({ navigation, gameState }: MovesListProps) => {
  const {
    onNextMove,
    onPrevMove,
    gotoMainlineMove,
    gotoBranchMove,
    onBeginning,
    onEnd,
  } = navigation;
  const {
    branches,
    mainlineMoves,
    currentIndex,
    isOnMainline,
    currentBranchId,
    currentBranchIndex,
    moveClassifications,
  } = gameState;

  const rows = [];
  for (let i = 0; i < mainlineMoves.length; i += 2) {
    rows.push(mainlineMoves.slice(i, i + 2));
  }

  const branchesByStartIndex = useMemo(() => {
    return branches.reduce<Record<number, Branch[]>>((acc, branch) => {
      if (!acc[branch.startIndex]) {
        acc[branch.startIndex] = [];
      }
      acc[branch.startIndex].push(branch);
      return acc;
    }, {});
  }, [branches]);

  function renderBranchRows(branchesToRender: Branch[]) {
    return branchesToRender.map((branch) => (
      <tr key={branch.id} className={styles.branchRow}>
        <td />

        <td colSpan={2}>
          <div className={styles.branchLine}>
            {branch.moves.map((branchMove, branchMoveIndex) => {
              const branchFenIndex = branchMoveIndex + 1;
              const plyIndex = branch.startIndex + branchMoveIndex;
              const moveNumber = Math.floor(plyIndex / 2) + 1;
              const isWhiteMove = plyIndex % 2 === 0;

              return (
                <div key={branchMoveIndex}>
                  <span className={styles.branchMovesNumber}>
                    {isWhiteMove ? `${moveNumber}. ` : ""}
                  </span>
                  <button
                    className={`${styles.branchMoveButton} ${
                      !isOnMainline &&
                      currentBranchId === branch.id &&
                      currentBranchIndex === branchFenIndex
                        ? styles.currentMove
                        : ""
                    }`}
                    onClick={() => {
                      gotoBranchMove(branch.id, branchFenIndex);
                    }}
                  >
                    {branchMove.san}
                  </button>
                </div>
              );
            })}
          </div>
        </td>
      </tr>
    ));
  }

  return (
    <div className={styles.movesListContainer}>
      <div className={styles.movesContainer}>
        <table className={styles.movesTable}>
          <tbody>
            {renderBranchRows(branchesByStartIndex[0] ?? [])}
            {rows.map((row, rowIndex) => (
              <React.Fragment key={rowIndex}>
                <tr>
                  <td className={styles.movesNumber}>{rowIndex + 1}</td>

                  {row.map((move, moveIndex) => {
                    const currentMove = rowIndex * 2 + moveIndex;
                    const fenIndex = currentMove + 1;

                    return (
                      <td key={currentMove}>
                        <button
                          className={`${styles.movesButton} 
                        ${isOnMainline && currentIndex === fenIndex ? styles.currentMove : ""}`}
                          onClick={() => gotoMainlineMove(fenIndex)}
                        >
                          <img
                            key={currentMove}
                            src={
                              classificationToIcon[
                                moveClassifications[currentMove]
                                  ? moveClassifications[currentMove]
                                  : ""
                              ]
                            }
                            className={styles.classificationIcon}
                          />
                          {move.san}
                        </button>
                      </td>
                    );
                  })}
                  {row.length === 1 && <td key={`empty-${rowIndex}`} />}
                </tr>

                {row.map((_, moveIndex) => {
                  const currentMove = rowIndex * 2 + moveIndex;
                  const fenIndex = currentMove + 1;
                  const branchesAfterThisMove =
                    branchesByStartIndex[fenIndex] ?? [];

                  if (branchesAfterThisMove.length === 0) return null;

                  return renderBranchRows(branchesAfterThisMove);
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className={styles.arrowButtonGroup}>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => onBeginning()}
        >
          {"<<"}
        </button>
        <button
          type="button"
          className={styles.arrowButton}
          style={{ padding: "10px 28px" }}
          onClick={() => onPrevMove()}
        >
          {"<"}
        </button>
        <button
          type="button"
          className={styles.arrowButton}
          style={{ padding: "10px 28px" }}
          onClick={() => onNextMove()}
        >
          {">"}
        </button>
        <button
          type="button"
          className={styles.arrowButton}
          onClick={() => onEnd()}
        >
          {">>"}
        </button>
      </div>
    </div>
  );
};

export default MovesList;
