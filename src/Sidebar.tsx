import { useMemo } from "react";
import React from "react";
import styles from "./Sidebar.module.css";
import { type Branch } from "./types.ts";

type SidebarProps = {
  pgnState: {
    pgn: string;
    setPgn: React.Dispatch<React.SetStateAction<string>>;
    isImporting: boolean;
  };
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
    mainlineMoves: string[];
    currentIndex: number;
    onMainLine: boolean;
    currentBranchId: string | null;
    currentBranchIndex: number;
  };
  actions: {
    onImportPgn: (pgn: string) => void;
  };
};

const Sidebar = ({
  pgnState,
  navigation,
  gameState,
  actions,
}: SidebarProps) => {
  const { pgn, setPgn, isImporting } = pgnState;
  const {
    onNextMove,
    onPrevMove,
    gotoMainlineMove,
    gotoBranchMove,
    onBeginning,
    onEnd,
    returnToMainline,
  } = navigation;
  const {
    branches,
    mainlineMoves,
    currentIndex,
    onMainLine,
    currentBranchId,
    currentBranchIndex,
  } = gameState;

  const { onImportPgn } = actions;

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

  return (
    <div className={styles.sidebarContainer}>
      <>
        <textarea
          value={pgn}
          rows={10}
          cols={50}
          onChange={(e) => setPgn(e.target.value)}
          placeholder="Paste PGN contents"
        ></textarea>
        {/* add a popup when the pgn was imported */}
        <button type="button" onClick={() => onImportPgn(pgn)}>
          {isImporting ? "Importing..." : "Import PGN"}
        </button>
      </>
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
      <div className={styles.movesContainer}>
        <table className={styles.movesTable}>
          <tbody>
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
                        ${onMainLine && currentIndex === fenIndex ? styles.currentMove : ""}`}
                          onClick={() => gotoMainlineMove(fenIndex)}
                        >
                          {move}
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

                  return branchesAfterThisMove.map((branch) => (
                    <tr key={branch.id} className={styles.branchRow}>
                      <td />

                      <td colSpan={2}>
                        <div className={styles.branchLine}>
                          {branch.moves.map((branchMove, branchMoveIndex) => {
                            const branchFenIndex = branchMoveIndex + 1;

                            return (
                              <button
                                key={branchMoveIndex}
                                className={`${styles.branchMoveButton} ${
                                  !onMainLine &&
                                  currentBranchId === branch.id &&
                                  currentBranchIndex === branchFenIndex
                                    ? styles.currentMove
                                    : ""
                                }`}
                                onClick={() => {
                                  gotoBranchMove(branch.id, branchFenIndex);
                                }}
                              >
                                {branchMove}
                              </button>
                            );
                          })}
                        </div>
                      </td>
                    </tr>
                  ));
                })}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      {!onMainLine && pgn.trim() !== "" && (
        <button onClick={() => returnToMainline()}>return to mainline</button>
      )}
    </div>
  );
};

export default Sidebar;
