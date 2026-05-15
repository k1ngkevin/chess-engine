import React from "react";
import styles from "./Sidebar.module.css";
import {
  type Branch,
  type EngineMove,
  type NullableMoveClassification,
  type ClassificationCounts,
  type GameMove,
  type ImportProgress,
  type SidebarView,
  type MoveClassification,
  type EngineEvaluation,
} from "./types.ts";
import MovesList from "./MovesList.tsx";
import Analyze from "./Analyze.tsx";
import PgnImportForm from "./PgnImportForm.tsx";
import {
  classificationToIcon,
  classificationToTextColor,
} from "./classifications";
import { IconArrowLeft } from "@tabler/icons-react";
import ClassificationStats from "./ClassificationStats.tsx";
import EvaluationGraph from "./EvaluationGraph.tsx";

type SidebarProps = {
  pgnState: {
    pgn: string;
    setPgn: React.Dispatch<React.SetStateAction<string>>;
    isImporting: boolean;
    importProgress: ImportProgress | null;
    sidebarView: SidebarView;
    setSidebarView: React.Dispatch<React.SetStateAction<SidebarView>>;
  };
  navigation: {
    onNextMove: () => void;
    onPrevMove: () => void;
    gotoMainlineMove: (move: number) => void;
    gotoBranchMove: (branchId: string, move: number) => void;
    onBeginning: () => void;
    onEnd: () => void;
    returnToMainline: () => void;
    onFlipBoard: () => void;
  };
  gameState: {
    branches: Branch[];
    bestMoves: (EngineMove[] | null)[];
    mainlineMoves: GameMove[];
    currentIndex: number;
    isOnMainline: boolean;
    currentBranchId: string | null;
    currentBranchIndex: number;
    moveClassification: NullableMoveClassification[];
    playedMoveEvaluations: (EngineEvaluation | null)[];
  };
  actions: {
    onImportPgn: (pgn: string) => Promise<void>;
    onBackButton: () => void;
  };
};

type ImportProgressBarProps = {
  progress: ImportProgress;
};

const ImportProgressBar = ({ progress }: ImportProgressBarProps) => {
  const progressPercent =
    progress.total > 0
      ? Math.round((progress.current / progress.total) * 100)
      : 0;

  return (
    <div className={styles.importProgressContainer}>
      <div className={styles.importProgressHeader}>
        <span>{progress.label}</span>
        <span>{progressPercent}%</span>
      </div>
      <div
        className={styles.importProgressTrack}
        aria-label="PGN import analysis progress"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={progressPercent}
        role="progressbar"
      >
        <div
          className={styles.importProgressFill}
          style={{ width: `${progressPercent}%` }}
        />
      </div>
    </div>
  );
};

const Sidebar = ({
  pgnState,
  navigation,
  gameState,
  actions,
}: SidebarProps) => {
  const {
    pgn,
    setPgn,
    isImporting,
    importProgress,
    sidebarView,
    setSidebarView,
  } = pgnState;
  const {
    onNextMove,
    onPrevMove,
    gotoMainlineMove,
    gotoBranchMove,
    onBeginning,
    onEnd,
    returnToMainline,
    onFlipBoard: onHandleClick,
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
    playedMoveEvaluations,
  } = gameState;

  const { onImportPgn, onBackButton } = actions;

  const currentBranch = branches.find(
    (branch) => branch.id === currentBranchId,
  );

  const currentMainlineClassification =
    moveClassification[currentIndex - 1] ?? "";

  const currentBranchClassification =
    currentBranchIndex > 0
      ? currentBranch?.classifications[currentBranchIndex - 1]
      : "";

  const currentMainlineSan = mainlineMoves[currentIndex - 1]?.san ?? "";
  const currentBranchSan =
    currentBranch?.moves[currentBranchIndex - 1].san ?? "";
  const currentMoveSan = isOnMainline ? currentMainlineSan : currentBranchSan;

  const currentMoveClassification = isOnMainline
    ? currentMainlineClassification
    : currentBranchClassification;

  const currentMoveText =
    currentMoveSan != "" && currentMoveClassification != ""
      ? `${currentMoveSan} is ${currentMoveClassification}`
      : "";

  const currentClassification = isOnMainline
    ? currentMainlineClassification
    : currentBranchClassification;

  const currentMove = isOnMainline
    ? mainlineMoves[currentIndex - 1]
    : currentBranch?.moves[currentBranchIndex - 1];

  const currentIconClassification = currentClassification
    ? [
        {
          square: currentMove?.to,
          src: classificationToIcon[currentClassification],
        },
      ]
    : [];

  const currentClassificationColor = currentClassification
    ? classificationToTextColor[currentClassification]
    : "white";

  const whiteClassifications = moveClassification.filter(
    (_, idx) => idx % 2 === 0,
  );
  const blackClassifications = moveClassification.filter(
    (_, idx) => idx % 2 !== 0,
  );

  function countClassification(
    arr: NullableMoveClassification[],
    targetClassification: MoveClassification,
  ): number {
    return arr.filter(
      (classification) => classification === targetClassification,
    ).length;
  }

  const whiteCounts: ClassificationCounts = {
    best: countClassification(whiteClassifications, "best"),
    excellent: countClassification(whiteClassifications, "excellent"),
    okay: countClassification(whiteClassifications, "okay"),
    inaccuracy: countClassification(whiteClassifications, "inaccuracy"),
    mistake: countClassification(whiteClassifications, "mistake"),
    blunder: countClassification(whiteClassifications, "blunder"),
  };

  const blackCounts: ClassificationCounts = {
    best: countClassification(blackClassifications, "best"),
    excellent: countClassification(blackClassifications, "excellent"),
    okay: countClassification(blackClassifications, "okay"),
    inaccuracy: countClassification(blackClassifications, "inaccuracy"),
    mistake: countClassification(blackClassifications, "mistake"),
    blunder: countClassification(blackClassifications, "blunder"),
  };

  return (
    <div className={styles.sidebarContainer}>
      {(sidebarView === "analysis" || sidebarView === "report") && (
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

      {sidebarView === "import" && isImporting && importProgress && (
        <ImportProgressBar progress={importProgress} />
      )}

      {(sidebarView === "analysis" || sidebarView === "report") && (
        <div className={styles.tabButtonGroup}>
          <button
            className={`${styles.tabButton} ${
              sidebarView === "report" ? styles.activeTabButton : ""
            }`}
            onClick={() => setSidebarView("report")}
          >
            Report
          </button>
          <button
            className={`${styles.tabButton} ${
              sidebarView === "analysis" ? styles.activeTabButton : ""
            }`}
            onClick={() => setSidebarView("analysis")}
          >
            Analysis
          </button>
        </div>
      )}

      {}

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

      {(sidebarView === "analysis" || sidebarView === "report") && (
        <div className={styles.moveTextContainer}>
          {currentIconClassification.map((icon) => {
            if (!icon.square) return null;
            return (
              <img
                key={icon.square}
                src={icon.src}
                className={styles.classificationIconText}
              />
            );
          })}
          <p style={{ color: currentClassificationColor }}>{currentMoveText}</p>
        </div>
      )}

      {sidebarView === "report" && (
        <div className={styles.reportGraphContainer}>
          <EvaluationGraph
            playedMovesEvaluation={playedMoveEvaluations}
            currentIndex={currentIndex}
          />
        </div>
      )}

      {sidebarView === "report" && (
        <div>
          <ClassificationStats
            whiteCounts={whiteCounts}
            blackCounts={blackCounts}
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
              onFlipBoard: onHandleClick,
            }}
            gameState={{
              branches: branches,
              mainlineMoves: mainlineMoves,
              currentIndex: currentIndex,
              isOnMainline: isOnMainline,
              currentBranchId: currentBranchId,
              currentBranchIndex: currentBranchIndex,
              moveClassifications: moveClassification,
            }}
          />
        </div>
      )}
    </div>
  );
};

export default Sidebar;
