import { useState, useEffect, useRef } from "react";
import ChessboardPanel from "./ChessboardPanel";
import { Chess } from "chess.js";
import Sidebar from "./Sidebar";
import Analyze from "./Analyze";
import EvaluationBar from "./EvaluationBar";
import { type Branch } from "./types";
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
import { type EngineMove, type EngineEvaluation } from "./types";
import "./App.css";

const App = () => {
  const [mainlineMoves, setMainlineMoves] = useState<string[]>([]);
  const [mainlineFens, setMainlineFens] = useState<string[]>([
    new Chess().fen(),
  ]);
  const [currentFen, setCurrentFen] = useState(
    "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1",
  );

  const [branches, setBranches] = useState<Branch[]>([]);

  const [isOnMainLine, setIsOnMainLine] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentBranchId, setCurrentBranchId] = useState<string | null>(null);
  const [currentBranchIndex, setCurrentBranchIndex] = useState<number>(-1);

  const [bestMoves, setBestMoves] = useState<EngineMove[]>([]);
  const [bestMovesArr, setBestMovesArr] = useState<(EngineMove[] | null)[]>([]);
  const [playedMovesEval, setPlayedMovesEval] = useState<
    (EngineEvaluation | null)[]
  >([]);

  const [pgn, setPgn] = useState("");
  const [isImporting, setIsImporting] = useState(false);
  const isImportingRef = useRef(false);

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

  (useEffect(() => {
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
  }),
    [nextMove, prevMove, mainlineFens.length]);

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

    if (!isOnMainLine) {
      setCurrentBranchIndex(-1);
      setCurrentBranchId(null);
    }
    setIsOnMainLine(true);
  }

  function gotoEnd() {
    const lastIndex = mainlineFens.length - 1;
    setCurrentIndex(lastIndex);
    setCurrentFen(mainlineFens[lastIndex]);
    playSound(mainlineMoves[lastIndex - 1]);

    if (!isOnMainLine) {
      setCurrentBranchIndex(-1);
      setCurrentBranchId(null);
    }
    setIsOnMainLine(true);
  }

  function gotoMainlineMove(move: number) {
    if (move < 0 || move >= mainlineFens.length) return;

    setIsOnMainLine(true);
    setCurrentBranchId(null);
    setCurrentBranchIndex(-1);

    setCurrentIndex(move);
    setCurrentFen(mainlineFens[move]);
    if (move > 0) {
      playSound(mainlineMoves[move - 1]);
    }
  }

  function gotoBranchMove(branchId: string, move: number) {
    const branch = branches.find((branch) => branch.id === branchId);
    if (!branch) return;
    if (move < 0 || move >= branch.fens.length) return;

    setIsOnMainLine(false);
    setCurrentBranchId(branchId);
    setCurrentBranchIndex(move);
    setCurrentFen(branch.fens[move]);

    if (move > 0) {
      playSound(branch.moves[move - 1]);
    }
  }

  function nextMove() {
    if (isOnMainLine) {
      gotoMainlineMove(currentIndex + 1);
      return;
    }
    if (!currentBranchId) return;
    gotoBranchMove(currentBranchId, currentBranchIndex + 1);
  }

  function prevMove() {
    if (isOnMainLine) {
      gotoMainlineMove(currentIndex - 1);
      return;
    }

    if (!currentBranchId) return;

    if (currentBranchIndex > 0) {
      gotoBranchMove(currentBranchId, currentBranchIndex + 1);
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

  async function analyzeAndEvaluateRemainingMoves(
    startIndex: number,
    fens: string[],
    chunkSize = 3,
  ) {
    try {
      for (let i = startIndex; i < fens.length; i += chunkSize) {
        const chunk = fens.slice(i, i + chunkSize);
        console.log(
          `index ${i}, import status: ${isImporting}, ref status ${isImportingRef.current}`,
        );

        const analyzeResults = await analyzeFens(chunk);
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

        const evaluationResults = await evaluateFens(chunk);
        if (evaluationResults === null) {
          return null;
        }

        setPlayedMovesEval((prev) => {
          const evaluationCopy = [...prev];

          evaluationResults.forEach((result, j) => {
            if (result !== null) {
              evaluationCopy[i + j] = result;
            }
          });
          return evaluationCopy;
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
      getUsernameAndElo(pgn);

      const history = temp.history();
      const replay = new Chess();
      const fens: string[] = [replay.fen()];

      for (const move of history) {
        replay.move(move);
        fens.push(replay.fen());
      }

      const firstBranchSize = Math.min(5, fens.length);
      const chunk = fens.slice(0, firstBranchSize);

      const tempBestMoves: (EngineMove[] | null)[] = new Array(
        fens.length,
      ).fill(null);
      const tempUserMovesEval: (EngineEvaluation | null)[] = new Array(
        fens.length,
      ).fill(null);

      const analyzeResults = await analyzeFens(chunk);
      if (analyzeResults === null) {
        return;
      }
      analyzeResults.forEach((result, i) => {
        if (result !== null) {
          tempBestMoves[i] = result;
        }
      });

      const evaluationResults = await evaluateFens(chunk);
      if (evaluationResults === null) {
        return;
      }
      evaluationResults.forEach((result, i) => {
        if (result !== null) {
          tempUserMovesEval[i] = result;
        }
      });

      setPlayedMovesEval(tempUserMovesEval);
      setBestMovesArr(tempBestMoves);
      setMainlineMoves(history);
      setMainlineFens(fens);
      setCurrentIndex(0);
      await analyzeAndEvaluateRemainingMoves(firstBranchSize, fens);
    } catch (error) {
      console.error("Import failed:", error);
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
      if (isOnMainLine && isAtEndOfMainline) {
        const nextIndex = currentIndex + 1;
        setMainlineMoves((prev) => [...prev, move.san]);
        setMainlineFens((prev) => [...prev, game.fen()]);

        setCurrentIndex(nextIndex);
        setCurrentFen(game.fen());

        setCurrentBranchId(null);
        setCurrentBranchIndex(-1);
        setIsOnMainLine(true);

        playSound(move.san);
        void analyzeUserMove(game.fen(), nextIndex);
        return true;
      }

      if (isOnMainLine) {
        const branchId = crypto.randomUUID();
        const newBranch: Branch = {
          id: branchId,
          startIndex: currentIndex,
          moves: [move.san],
          fens: [currentFen, game.fen()],
          evaluations: [null],
          bestMoves: [null],
        };

        setBranches((prev) => [...prev, newBranch]);

        setCurrentBranchId(branchId);
        setCurrentBranchIndex(1);
        setCurrentFen(game.fen());
        setIsOnMainLine(false);

        playSound(move.san);
        void analyzeBranchMove(branchId, game.fen(), 0);
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
            moves: [...branch.moves.slice(0, nextMoveIndex), move.san],
            fens: [...branch.fens.slice(0, nextFenIndex), game.fen()],
            evaluations: [...branch.evaluations.slice(0, nextMoveIndex), null],
            bestMoves: [...branch.bestMoves.slice(0, nextMoveIndex), null],
          };
        }),
      );
      setCurrentBranchIndex(nextFenIndex);
      setCurrentFen(game.fen());
      setIsOnMainLine(false);

      playSound(move.san);
      void analyzeBranchMove(currentBranchId, game.fen(), nextMoveIndex);
      return true;
    } catch {
      console.log("invalid move");
      return false;
    }
  }

  async function analyzeBranchMove(id: string, fen: string, index: number) {
    try {
      const bestMovesResult = await analyzeFen(fen);
      const evaluationResult = await getFenEvaluation(fen);

      setBranches((prev) =>
        prev.map((branch) => {
          if (branch.id !== id) return branch;
          const bestMovesCopy = [...branch.bestMoves];
          const evaluationCopy = [...branch.evaluations];

          bestMovesCopy[index] = bestMovesResult;
          evaluationCopy[index] = evaluationResult;

          return {
            ...branch,
            bestMoves: bestMovesCopy,
            evaluations: evaluationCopy,
          };
        }),
      );
    } catch (error) {
      console.error(error);
    }
  }

  async function analyzeUserMove(fen: string, index: number) {
    try {
      const bestMovesResult = await analyzeFen(fen);
      setBestMovesArr((prev) => {
        const bestMovesCopy = [...prev];
        bestMovesCopy[index] = bestMovesResult;
        return bestMovesCopy;
      });

      const evaluationResult = await getFenEvaluation(fen);
      setPlayedMovesEval((prev) => {
        const evaluationCopy = [...prev];
        evaluationCopy[index] = evaluationResult;
        return evaluationCopy;
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

  async function handleAnalyze(): Promise<void> {
    try {
      const response = await analyzePosition(currentFen);
      setBestMoves(response.best_moves);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="container">
      <div className="boardContainer">
        <EvaluationBar
          currentIndex={currentIndex}
          playedMovesEvaluation={playedMovesEval}
        />
        <ChessboardPanel
          fen={currentFen}
          onUserMove={handleUserMove}
          playerInfo={{
            whiteUsername: whiteUsername,
            blackUsername: blackUsername,
            whiteElo: whiteElo,
            blackElo: blackElo,
          }}
        />
      </div>
      <div>
        <Sidebar
          pgnState={{
            pgn,
            setPgn,
            isImporting,
          }}
          navigation={{
            onNextMove: nextMove,
            onPrevMove: prevMove,
            gotoMainlineMove: gotoMainlineMove,
            gotoBranchMove: gotoBranchMove,
            onBeginning: gotoBeginning,
            onEnd: gotoEnd,
            returnToMainline: returnToMainline,
          }}
          gameState={{
            branches: branches,
            mainlineMoves: mainlineMoves,
            currentIndex: currentIndex,
            onMainLine: isOnMainLine,
            currentBranchId: currentBranchId,
            currentBranchIndex: currentBranchIndex,
          }}
          actions={{
            onImportPgn: importPgn,
          }}
        />
        <Analyze
          bestMoves={bestMovesArr}
          currentIndex={currentIndex}
          onAnalyze={handleAnalyze}
        />
      </div>
    </div>
  );
};

export default App;
