import { useState, useEffect, useRef } from "react";
import ChessboardPanel from "./ChessboardPanel";
import { Chess } from "chess.js";
import Sidebar from "./Sidebar";
import EvaluationBar from "./EvaluationBar";
import {
  analyzePosition,
  analyzeFenBatch,
  fetchFenEvaluation,
  evaluateFensBatch,
} from "./api";
import captureSound from "./assets/capture.mp3";
import castleSound from "./assets/castle.mp3";
import checkSound from "./assets/check.mp3";
import moveSound from "./assets/move.mp3";
import promoteSound from "./assets/promote.mp3";
import checkmateSound from "./assets/checkmate.mp3";
import {
  type EngineMove,
  type EngineEvaluation,
  type MoveClassification,
  type GameMove,
  type Branch,
  type ImportProgress,
  type SidebarView,
} from "./types";
import "./App.css";

const App = () => {
  const [mainlineMoves, setMainlineMoves] = useState<GameMove[]>([]);
  const [mainlineFens, setMainlineFens] = useState<string[]>([
    new Chess().fen(),
  ]);
  const [currentFen, setCurrentFen] = useState(new Chess().fen());

  const [branches, setBranches] = useState<Branch[]>([]);

  const [isOnMainline, setIsOnMainline] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [currentBranchIndex, setCurrentBranchIndex] = useState<number>(-1);

  const [bestMovesArr, setBestMovesArr] = useState<(EngineMove[] | null)[]>([]);
  const [playedMovesEval, setPlayedMovesEval] = useState<
    (EngineEvaluation | null)[]
  >([]);
  const [moveClassifications, setMoveClassifications] = useState<
    (MoveClassification | null)[]
  >([]);

  const [pgn, setPgn] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState<ImportProgress | null>(
    null,
  );
  const isImportingRef = useRef(false);
  const [sidebarView, setSidebarView] = useState<SidebarView>("import");

  const [boardOrientation, setBoardOrientation] = useState<"white" | "black">(
    "white",
  );
  const [whiteUsername, setWhiteUsername] = useState("White");
  const [whiteElo, setWhiteElo] = useState<number>();
  const [blackUsername, setBlackUsername] = useState("Black");
  const [blackElo, setBlackElo] = useState<number>();

  const captureSoundRef = useRef(new Audio(captureSound));
  const castleSoundRef = useRef(new Audio(castleSound));
  const checkSoundRef = useRef(new Audio(checkSound));
  const moveSoundRef = useRef(new Audio(moveSound));
  const promoteSoundRef = useRef(new Audio(promoteSound));
  const checkmateSoundRef = useRef(new Audio(checkmateSound));

  useEffect(() => {
    function handleKeypress(e: KeyboardEvent) {
      if (
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLInputElement
      ) {
        return;
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextMove();
      }
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        prevMove();
      }
    }
    window.addEventListener("keydown", handleKeypress);

    return () => {
      window.removeEventListener("keydown", handleKeypress);
    };
  });

  useEffect(() => {
    async function analyzeStartingPosition() {
      const startingFen = new Chess().fen();

      const bestFenResult = await analyzeFen(startingFen);
      setBestMovesArr([bestFenResult]);
      const evaluationResult = await getFenEvaluation(startingFen);
      setPlayedMovesEval([evaluationResult]);
    }
    void analyzeStartingPosition();
  }, []);

  function gotoBeginning() {
    setCurrentIndex(0);
    setCurrentFen(mainlineFens[0]);

    if (!isOnMainline) {
      setCurrentBranchIndex(-1);
      setCurrentBranchId(null);
    }
    setIsOnMainline(true);
  }

  function gotoEnd() {
    const lastIndex = mainlineFens.length - 1;
    setCurrentIndex(lastIndex);
    setCurrentFen(mainlineFens[lastIndex]);
    playSound(mainlineMoves[lastIndex - 1].san);

    if (!isOnMainline) {
      setCurrentBranchIndex(-1);
      setCurrentBranchId(null);
    }
    setIsOnMainline(true);
  }

  function gotoMainlineMove(move: number) {
    if (move < 0 || move >= mainlineFens.length) return;

    setIsOnMainline(true);
    setCurrentBranchId(null);
    setCurrentBranchIndex(-1);

    setCurrentIndex(move);
    setCurrentFen(mainlineFens[move]);
    if (move > 0) {
      playSound(mainlineMoves[move - 1].san);
    }
  }

  function gotoBranchMove(branchId: string, move: number) {
    const branch = branches.find((branch) => branch.id === branchId);
    if (!branch) return;
    if (move < 0 || move >= branch.fens.length) return;

    setIsOnMainline(false);
    setCurrentBranchId(branchId);
    setCurrentBranchIndex(move);
    setCurrentFen(branch.fens[move]);

    if (move > 0) {
      playSound(branch.moves[move - 1].san);
    }
  }

  function nextMove() {
    if (isOnMainline) {
      gotoMainlineMove(currentIndex + 1);
      return;
    }
    if (!currentBranchId) return;
    gotoBranchMove(currentBranchId, currentBranchIndex + 1);
  }

  function prevMove() {
    if (isOnMainline) {
      gotoMainlineMove(currentIndex - 1);
      return;
    }

    if (!currentBranchId) return;

    if (currentBranchIndex > 1) {
      gotoBranchMove(currentBranchId, currentBranchIndex - 1);
      return;
    }

    const branch = branches.find((branch) => branch.id === currentBranchId);
    if (!branch) return;
    gotoMainlineMove(branch.startIndex);
  }

  function returnToMainline() {
    if (!currentBranchIndex) return;

    const branch = branches.find((branch) => branch.id === currentBranchId);
    if (!branch) return;

    gotoMainlineMove(branch.startIndex);
  }

  function playSound(move: string) {
    if (!move) return;

    if (move.includes("=")) {
      if (!promoteSoundRef.current) return;
      promoteSoundRef.current.currentTime = 0;
      promoteSoundRef.current.play();
      return;
    }

    if (move.includes("O-O")) {
      if (!castleSoundRef.current) return;
      castleSoundRef.current.currentTime = 0;
      castleSoundRef.current.play();
      return;
    }

    if (move.includes("#")) {
      if (!checkmateSoundRef.current) return;
      checkmateSoundRef.current.currentTime = 0;
      checkmateSoundRef.current.play();
      return;
    }

    if (move.includes("x")) {
      if (!captureSoundRef.current) return;
      captureSoundRef.current.currentTime = 0;
      captureSoundRef.current.play();
      return;
    }

    if (move.includes("+")) {
      if (!checkSoundRef.current) return;
      checkSoundRef.current.currentTime = 0;
      checkSoundRef.current.play();
      return;
    }

    if (!moveSoundRef.current) return;
    moveSoundRef.current.currentTime = 0;
    moveSoundRef.current.play();
  }

  function getUsernameAndElo(pgn: string) {
    const whiteUsernameMatch = pgn.match(/\[White "([^"]+)"\]/)?.[1];
    if (whiteUsernameMatch !== undefined) {
      setWhiteUsername(whiteUsernameMatch);
    }

    const blackUsernameMatch = pgn.match(/\[Black "([^"]+)"\]/)?.[1];
    if (blackUsernameMatch !== undefined) {
      setBlackUsername(blackUsernameMatch);
    }

    const whiteEloMatch = pgn.match(/\[WhiteElo "([^"]+)"\]/)?.[1];
    if (whiteEloMatch !== undefined && /^\d+$/.test(whiteEloMatch)) {
      setWhiteElo(Number(whiteEloMatch));
    }

    const blackEloMatch = pgn.match(/\[BlackElo "([^"]+)"\]/)?.[1];
    if (blackEloMatch !== undefined && /^\d+$/.test(blackEloMatch)) {
      setBlackElo(Number(blackEloMatch));
    }
  }

  async function analyzeAndEvaluateMoves(
    startIndex: number,
    fens: string[],
    chunkSize = 3,
  ) {
    const totalMoves = Math.max(fens.length - 1 - startIndex, 0);

    try {
      for (let i = startIndex; i < fens.length - 1; i += chunkSize) {
        const beforeChunk = fens.slice(
          i,
          Math.min(i + chunkSize, fens.length - 1),
        );
        const afterChunk = fens.slice(i + 1, i + 1 + chunkSize);

        const analyzeResults = await analyzeFens(beforeChunk);
        if (analyzeResults === null) {
          return null;
        }

        setBestMovesArr((prev) => {
          const analyzeCopy = [...prev];

          analyzeResults.forEach((result, j) => {
            if (result !== null) {
              analyzeCopy[i + j] = result;
            }
          });

          return analyzeCopy;
        });

        const evaluationResults = await evaluateFens(afterChunk);
        if (evaluationResults === null) {
          return null;
        }

        setPlayedMovesEval((prev) => {
          const evaluationCopy = [...prev];

          evaluationResults.forEach((result, j) => {
            if (result !== null) {
              evaluationCopy[i + j + 1] = result;
            }
          });

          return evaluationCopy;
        });

        setMoveClassifications((prev) => {
          const classificationsCopy = [...prev];

          analyzeResults.forEach((move, j) => {
            const playedEval = evaluationResults[j];
            const fenBefore = beforeChunk[j];

            if (!move || !playedEval || !fenBefore) {
              classificationsCopy[i + j] = null;
              return;
            }

            const bestMove = move[0];

            if (!bestMove) {
              classificationsCopy[i + j] = null;
              return;
            }

            const bestMoveValue = bestMoveToCentipawn(bestMove);
            const playedMoveValue = evaluationToCentipawn(playedEval);
            const sideToMove = getSideToMove(fenBefore);

            if (bestMoveValue === null) {
              classificationsCopy[i + j] = null;
              return;
            }

            classificationsCopy[i + j] = classifyMove(
              bestMoveValue,
              playedMoveValue,
              sideToMove,
            );
          });

          return classificationsCopy;
        });

        const completedMoves = Math.min(
          i + beforeChunk.length - startIndex,
          totalMoves,
        );
        setImportProgress({
          current: completedMoves,
          total: totalMoves,
          label: `Analyzing moves ${completedMoves} / ${totalMoves}`,
        });
      }

      const lastFenIndex = fens.length - 1;
      if (lastFenIndex >= startIndex) {
        setImportProgress({
          current: totalMoves,
          total: totalMoves,
          label: "Finalizing analysis",
        });

        const finalPositionBestMoves = await analyzeFen(fens[lastFenIndex]);
        if (finalPositionBestMoves !== null) {
          setBestMovesArr((prev) => {
            const analyzeCopy = [...prev];
            analyzeCopy[lastFenIndex] = finalPositionBestMoves;
            return analyzeCopy;
          });
        }

        setImportProgress({
          current: totalMoves,
          total: totalMoves,
          label: "Analysis complete",
        });
      }
    } catch (error) {
      console.error("background analysis failed:", error);
    }
  }

  async function importPgn(pgn: string) {
    if (isImportingRef.current) {
      return;
    }

    if (pgn.trim() === "") {
      return;
    }

    const temp = new Chess();

    try {
      temp.loadPgn(pgn);
    } catch {
      console.log("invalid pgn");
      return;
    }

    setIsImporting(true);
    isImportingRef.current = true;

    try {
      setBranches([]);
      getUsernameAndElo(pgn);

      const history = temp.history({ verbose: true });
      setImportProgress({
        current: 0,
        total: history.length,
        label: "Preparing analysis",
      });

      const replay = new Chess();
      const fens: string[] = [replay.fen()];

      const gameMoves = history.map((move) => ({
        san: move.san,
        from: move.from,
        to: move.to,
      }));

      for (const move of history) {
        replay.move(move);
        fens.push(replay.fen());
      }

      setMainlineMoves(gameMoves);
      setMainlineFens(fens);
      setCurrentIndex(0);
      await analyzeAndEvaluateMoves(0, fens);
      setSidebarView("analysis");
    } catch (error) {
      console.error("Import failed:", error);
      setImportProgress(null);
    } finally {
      setIsImporting(false);
      isImportingRef.current = false;
    }
  }

  function handleUserMove(from: string, to: string): boolean {
    const game = new Chess(currentFen);
    try {
      const move = game.move({ from, to, promotion: "q" });
      const isAtEndOfMainline = currentIndex === mainlineFens.length - 1;

      if (sidebarView === "import") {
        setSidebarView("analysis");
      }

      if (isOnMainline && isAtEndOfMainline) {
        const nextIndex = currentIndex + 1;
        const playedMoveIndex = nextIndex - 1;
        setMainlineMoves((prev) => [
          ...prev,
          {
            san: move.san,
            from: move.from,
            to: move.to,
          },
        ]);
        setMainlineFens((prev) => [...prev, game.fen()]);
        setMoveClassifications((prev) => [...prev, null]);
        setBestMovesArr((prev) => [...prev, null]);
        setPlayedMovesEval((prev) => [...prev, null]);

        setCurrentIndex(nextIndex);
        setCurrentFen(game.fen());

        setCurrentBranchId(null);
        setCurrentBranchIndex(-1);
        setIsOnMainline(true);

        playSound(move.san);
        void analyzeUserMove(
          currentFen,
          game.fen(),
          playedMoveIndex,
          nextIndex,
        );
        return true;
      }

      if (isOnMainline) {
        const branchId = crypto.randomUUID();
        const newBranch: Branch = {
          id: branchId,
          startIndex: currentIndex,
          moves: [{ san: move.san, from: move.from, to: move.to }],
          fens: [currentFen, game.fen()],
          evaluations: [null],
          bestMoves: [bestMovesArr[currentIndex] ?? null, null],
          classifications: [null],
        };

        setBranches((prev) => [...prev, newBranch]);

        setCurrentBranchId(branchId);
        setCurrentBranchIndex(1);
        setCurrentFen(game.fen());
        setIsOnMainline(false);

        playSound(move.san);
        void analyzeBranchMove(branchId, currentFen, game.fen(), 0, 1);
        return true;
      }
      if (!currentBranchId) return false;

      const branch = branches.find((branch) => branch.id === currentBranchId);
      if (!branch) return false;

      const nextFenIndex = currentBranchIndex + 1;
      const nextMoveIndex = nextFenIndex - 1;
      setBranches((prev) =>
        prev.map((branch) => {
          if (branch.id !== currentBranchId) return branch;
          return {
            ...branch,
            moves: [
              ...branch.moves.slice(0, nextMoveIndex),
              { san: move.san, from: move.from, to: move.to },
            ],
            fens: [...branch.fens.slice(0, nextFenIndex), game.fen()],
            evaluations: [...branch.evaluations.slice(0, nextMoveIndex), null],
            bestMoves: [...branch.bestMoves.slice(0, nextFenIndex), null],
            classifications: [
              ...branch.classifications.slice(0, nextMoveIndex),
              null,
            ],
          };
        }),
      );
      setCurrentBranchIndex(nextFenIndex);
      setCurrentFen(game.fen());
      setIsOnMainline(false);

      playSound(move.san);
      void analyzeBranchMove(
        currentBranchId,
        currentFen,
        game.fen(),
        nextMoveIndex,
        nextFenIndex,
      );
      return true;
    } catch {
      console.log("invalid move");
      return false;
    }
  }

  async function analyzeBranchMove(
    id: string,
    fenBefore: string,
    fenAfter: string,
    moveIndex: number,
    currentFenIndex: number,
  ) {
    try {
      const [bestMovesBefore, currentBestMovesResult, evaluationResult] =
        await Promise.all([
          analyzeFen(fenBefore),
          analyzeFen(fenAfter),
          getFenEvaluation(fenAfter),
        ]);
      if (bestMovesBefore == null && currentBestMovesResult == null) return;

      setBranches((prev) =>
        prev.map((branch) => {
          if (branch.id !== id) return branch;
          const bestMovesCopy = [...branch.bestMoves];

          if (bestMovesBefore !== null) {
            bestMovesCopy[moveIndex] = bestMovesBefore;
          }
          if (currentBestMovesResult !== null) {
            bestMovesCopy[currentFenIndex] = currentBestMovesResult;
          }

          return {
            ...branch,
            bestMoves: bestMovesCopy,
          };
        }),
      );

      if (evaluationResult == null) return;
      if (bestMovesBefore == null) return;
      if (bestMovesBefore[0] == null) return;

      const bestMoveValue = bestMoveToCentipawn(bestMovesBefore[0]);
      if (bestMoveValue == null) return;
      const playedMoveValue = evaluationToCentipawn(evaluationResult);
      const sideToMove = getSideToMove(fenBefore);

      const classificationsValue = classifyMove(
        bestMoveValue,
        playedMoveValue,
        sideToMove,
      );

      setBranches((prev) =>
        prev.map((branch) => {
          if (branch.id !== id) return branch;
          const evaluationCopy = [...branch.evaluations];
          const classificationsCopy = [...branch.classifications];

          evaluationCopy[moveIndex] = evaluationResult;
          classificationsCopy[moveIndex] = classificationsValue;

          return {
            ...branch,
            evaluations: evaluationCopy,
            classifications: classificationsCopy,
          };
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function analyzeUserMove(
    fenBefore: string,
    fenAfter: string,
    playedMoveIndex: number,
    currentFenIndex: number,
  ) {
    try {
      const [bestMovesBefore, currentBestMovesResult, evaluationResults] =
        await Promise.all([
          analyzeFen(fenBefore),
          analyzeFen(fenAfter),
          getFenEvaluation(fenAfter),
        ]);
      if (bestMovesBefore == null && currentBestMovesResult == null) return;
      setBestMovesArr((prev) => {
        const bestMovesCopy = [...prev];
        if (bestMovesBefore !== null) {
          bestMovesCopy[playedMoveIndex] = bestMovesBefore;
        }
        if (currentBestMovesResult !== null) {
          bestMovesCopy[currentFenIndex] = currentBestMovesResult;
        }
        return bestMovesCopy;
      });

      if (evaluationResults == null) return;
      if (bestMovesBefore == null) return;
      setPlayedMovesEval((prev) => {
        const evaluationCopy = [...prev];
        evaluationCopy[currentFenIndex] = evaluationResults;
        return evaluationCopy;
      });

      const moves = bestMovesBefore[0];
      const playedEval = evaluationResults;

      setMoveClassifications((prev) => {
        const copy = [...prev];
        if (!moves || !playedEval) {
          copy[playedMoveIndex] = null;
          return copy;
        }

        const bestMove = moves;

        if (!bestMove) {
          copy[playedMoveIndex] = null;
          return copy;
        }

        const bestMoveValue = bestMoveToCentipawn(bestMove);
        const playedMoveValue = evaluationToCentipawn(playedEval);
        const sideToMove = getSideToMove(fenBefore);

        if (bestMoveValue === null) {
          copy[playedMoveIndex] = null;
          return copy;
        }

        copy[playedMoveIndex] = classifyMove(
          bestMoveValue,
          playedMoveValue,
          sideToMove,
        );
        return copy;
      });
    } catch (error) {
      console.error(error);
    }
  }

  async function analyzeFen(fen: string): Promise<EngineMove[] | null> {
    try {
      const response = await analyzePosition(fen);
      return response.best_moves;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function analyzeFens(
    fens: string[],
    depth = 15,
    numResults = 3,
  ): Promise<(EngineMove[] | null)[]> {
    try {
      const response = await analyzeFenBatch(fens, depth, numResults);
      return response.best_moves;
    } catch (error) {
      console.error(error);
      return fens.map(() => null);
    }
  }

  async function getFenEvaluation(
    fen: string,
    depth: number = 15,
  ): Promise<EngineEvaluation | null> {
    try {
      const response = await fetchFenEvaluation(fen, depth);
      return response;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async function evaluateFens(
    fens: string[],
    depth: number = 15,
  ): Promise<(EngineEvaluation | null)[]> {
    try {
      const response = await evaluateFensBatch(fens, depth);
      return response.move_evaluations;
    } catch (error) {
      console.error(error);
      return fens.map(() => null);
    }
  }

  function onBackButton() {
    setMainlineMoves([]);
    setMainlineFens([new Chess().fen()]);
    setBestMovesArr([]);
    setBranches([]);
    setPlayedMovesEval([]);
    setCurrentFen(new Chess().fen());
    setCurrentIndex(0);
    setIsOnMainline(true);
    setCurrentBranchId(null);
    setCurrentBranchIndex(-1);
    setImportProgress(null);
    setSidebarView("import");
  }

  function bestMoveToCentipawn(bestMove: EngineMove) {
    if (bestMove.centipawn != null) {
      return bestMove.centipawn;
    }

    if (bestMove.mate != null) {
      return bestMove.mate > 0 ? 10000 : -10000;
    }

    return null;
  }

  function evaluationToCentipawn(evaluation: EngineEvaluation) {
    if (evaluation.type === "cp") {
      return evaluation.value;
    }
    return evaluation.value > 0 ? 10000 : -10000;
  }

  function getSideToMove(fen: string) {
    return fen.split(" ")[1] as "w" | "b";
  }

  function evalToWinPercent(cp: number) {
    return 50 + 50 * (2 / (1 + Math.exp(-0.004 * cp)) - 1);
  }

  function classifyMove(
    bestCp: number,
    playedCp: number,
    sideToMove: "w" | "b",
  ) {
    const bestWin = evalToWinPercent(bestCp);
    const playedWin = evalToWinPercent(playedCp);

    const loss = Math.max(
      0,
      sideToMove === "w" ? bestWin - playedWin : playedWin - bestWin,
    );

    if (loss <= 1) return "best";
    if (loss <= 3.5) return "excellent";
    if (loss <= 6) return "okay";
    if (loss <= 10) return "inaccuracy";
    if (loss <= 20) return "mistake";
    return "blunder";
  }

  function onFlipBoard() {
    setBoardOrientation((prev) => (prev === "white" ? "black" : "white"));
  }

  return (
    <div className="container">
      <div className="boardContainer">
        <EvaluationBar
          branches={branches}
          currentIndex={currentIndex}
          currentBranchIndex={currentBranchIndex}
          currentBranchId={currentBranchId}
          isOnMainline={isOnMainline}
          playedMovesEvaluation={playedMovesEval}
          boardOrientation={boardOrientation}
        />
        <ChessboardPanel
          fen={currentFen}
          mainlineMoves={mainlineMoves}
          onUserMove={handleUserMove}
          branches={branches}
          bestMoves={bestMovesArr}
          currentIndex={currentIndex}
          isOnMainline={isOnMainline}
          currentBranchId={currentBranchId}
          currentBranchIndex={currentBranchIndex}
          moveClassifications={moveClassifications}
          boardOrientation={boardOrientation}
          playerInfo={{
            whiteUsername: whiteUsername,
            blackUsername: blackUsername,
            whiteElo: whiteElo,
            blackElo: blackElo,
          }}
        />
      </div>
      <div className="sidebarWrapper">
        <Sidebar
          pgnState={{
            pgn: pgn,
            setPgn: setPgn,
            isImporting: isImporting,
            importProgress: importProgress,
            sidebarView: sidebarView,
            setSidebarView: setSidebarView,
          }}
          navigation={{
            onNextMove: nextMove,
            onPrevMove: prevMove,
            gotoMainlineMove: gotoMainlineMove,
            gotoBranchMove: gotoBranchMove,
            onBeginning: gotoBeginning,
            onEnd: gotoEnd,
            returnToMainline: returnToMainline,
            onFlipBoard: onFlipBoard,
          }}
          gameState={{
            branches: branches,
            bestMoves: bestMovesArr,
            mainlineMoves: mainlineMoves,
            currentIndex: currentIndex,
            isOnMainline: isOnMainline,
            currentBranchId: currentBranchId,
            currentBranchIndex: currentBranchIndex,
            moveClassification: moveClassifications,
          }}
          actions={{
            onImportPgn: importPgn,
            onBackButton: onBackButton,
          }}
        />
      </div>
    </div>
  );
};

export default App;
