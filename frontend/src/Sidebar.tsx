import React from "react";
import styles from "./Sidebar.module.css";
import { type Branch } from "./types.ts";
import MovesList from "./MovesList.tsx";

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
    isOnMainline: boolean;
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
    isOnMainline,
    currentBranchId,
    currentBranchIndex,
  } = gameState;

  const { onImportPgn } = actions;

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
        <button type="button" onClick={() => onImportPgn(pgn)}>
          {isImporting ? "Importing..." : "Import PGN"}
        </button>
      </>
      <MovesList
        navigation={{
          onNextMove: onNextMove,
          onPrevMove: onPrevMove,
          gotoMainlineMove: gotoMainlineMove,
          gotoBranchMove: gotoBranchMove,
          onBeginning: onBeginning,
          onEnd: onEnd,
          returnToMainline: returnToMainline,
        }}
        gameState={{
          branches: branches,
          mainlineMoves: mainlineMoves,
          currentIndex: currentIndex,
          isOnMainline: isOnMainline,
          currentBranchId: currentBranchId,
          currentBranchIndex: currentBranchIndex,
        }}
      />
    </div>
  );
};

export default Sidebar;
