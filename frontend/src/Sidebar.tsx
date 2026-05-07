import React, { useState } from "react";
import styles from "./Sidebar.module.css";
import {
  type Branch,
  type EngineMove,
  type MoveClassification,
} from "./types.ts";
import MovesList from "./MovesList.tsx";
import Analyze from "./Analyze.tsx";
import PgnImportForm from "./PgnImportForm.tsx";
import { IconArrowLeft } from "@tabler/icons-react";

type SidebarProps = {
  pgnState: {
    pgn: string;
    setPgn: React.Dispatch<React.SetStateAction<string>>;
    isImporting: boolean;
    sidebarView: "import" | "analysis";
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
    bestMoves: (EngineMove[] | null)[];
    mainlineMoves: string[];
    currentIndex: number;
    isOnMainline: boolean;
    currentBranchId: string | null;
    currentBranchIndex: number;
    moveClassification: MoveClassification[];
  };
  actions: {
    onImportPgn: (pgn: string) => Promise<void>;
    onBackButton: () => void;
  };
};

const Sidebar = ({
  pgnState,
  navigation,
  gameState,
  actions,
}: SidebarProps) => {
  const { pgn, setPgn, isImporting, sidebarView } = pgnState;
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
    bestMoves,
    mainlineMoves,
    currentIndex,
    isOnMainline,
    currentBranchId,
    currentBranchIndex,
    moveClassification,
  } = gameState;

  const { onImportPgn, onBackButton } = actions;

  return (
    <div className={styles.sidebarContainer}>
      {sidebarView === "analysis" && (
        <button className={styles.backButton} onClick={() => onBackButton()}>
          <IconArrowLeft stroke={1.75} />
        </button>
      )}
      {sidebarView === "import" && (
        <PgnImportForm
          pgn={pgn}
          setPgn={setPgn}
          isImporting={isImporting}
          onImportPgn={async () => await onImportPgn(pgn)}
        />
      )}
      {sidebarView === "analysis" && (
        <div className={styles.analyzeWrapper}>
          <Analyze
            branches={branches}
            bestMoves={bestMoves}
            currentIndex={currentIndex}
            isOnMainline={isOnMainline}
            currentBranchId={currentBranchId}
            currentBranchIndex={currentBranchIndex}
          />
        </div>
      )}
      {sidebarView === "analysis" && (
        <div className={styles.movesListWrapper}>
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
      )}
      <div>
        <p style={{ color: "white" }}>{moveClassification[currentIndex - 1]}</p>
      </div>
    </div>
  );
};

export default Sidebar;
