import { useMemo, useState } from "react";
import styles from "./ChessboardPanel.module.css";
import { Chess, type Square } from "chess.js";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";

import { type Branch, type EngineMove, type Arrow } from "./types";

type ChessboardProps = {
  fen: string;
  onUserMove: (from: string, to: string) => boolean;
  branches: Branch[];
  bestMoves: (EngineMove[] | null)[];
  currentIndex: number;
  isOnMainline: boolean;
  currentBranchId: string | null;
  currentBranchIndex: number;
  playerInfo: {
    whiteUsername: string;
    blackUsername: string;
    whiteElo: number | undefined;
    blackElo: number | undefined;
  };
};

function ChessboardPanel({
  fen,
  onUserMove,
  branches,
  bestMoves,
  currentIndex,
  isOnMainline,
  currentBranchId,
  currentBranchIndex,
  playerInfo,
}: ChessboardProps) {
  const { whiteUsername, blackUsername, whiteElo, blackElo } = playerInfo;
  const chessGame = fen ? new Chess(fen) : new Chess();
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});

  const engineArrows = useMemo(() => {
    const currentMainlineBestMoves = bestMoves[currentIndex];
    const currentBranch = currentBranchId
      ? branches.find((branch) => branch.id === currentBranchId)
      : null;
    const currentBranchBestMoves =
      currentBranch?.bestMoves[currentBranchIndex] ?? null;

    const currentBestMoves = isOnMainline
      ? currentMainlineBestMoves
      : currentBranchBestMoves;
    if (currentBestMoves == null) {
      return [];
    }
    return currentBestMoves
      .slice(0, 3)
      .map((move, idx) => {
        const bestMoveUci = move.uci;
        if (bestMoveUci.length < 4) return undefined;
        const opacities = [1, 0.65, 0.25];

        return {
          startSquare: bestMoveUci.slice(0, 2),
          endSquare: bestMoveUci.slice(2, 4),
          color: `rgba(76, 175, 80, ${opacities[idx]})`,
        };
      })
      .filter((arrow): arrow is Arrow => arrow !== undefined);
  }, [
    branches,
    bestMoves,
    currentIndex,
    isOnMainline,
    currentBranchId,
    currentBranchIndex,
  ]);

  function getMoveOptions(square: Square) {
    const moves = chessGame.moves({
      square,
      verbose: true,
    });

    if (moves.length === 0) {
      setOptionSquares({});
      return false;
    }

    const newSquares: Record<string, React.CSSProperties> = {};

    for (const move of moves) {
      newSquares[move.to] = {
        background:
          chessGame.get(move.to) &&
          chessGame.get(move.to)?.color !== chessGame.get(square)?.color
            ? "radial-gradient(circle, rgba(0,0,0,.1) 85%, transparent 85%)"
            : "radial-gradient(circle, rgba(0,0,0,.1) 25%, transparent 25%)",
        borderRadius: "50%",
      };
    }

    newSquares[square] = {
      background: "rgba(255, 255, 0, 0.4)",
    };
    setOptionSquares(newSquares);

    return true;
  }

  function onSquareClick({ square, piece }: SquareHandlerArgs) {
    if (!moveFrom && piece) {
      const hasMoveOptions = getMoveOptions(square as Square);
      if (hasMoveOptions) {
        setMoveFrom(square);
      }
      return;
    }

    const moves = chessGame.moves({
      square: moveFrom as Square,
      verbose: true,
    });

    const foundMove = moves.find((m) => m.from === moveFrom && m.to === square);

    if (!foundMove) {
      const hasMoveOptions = getMoveOptions(square as Square);
      setMoveFrom(hasMoveOptions ? square : "");
      return;
    }

    const didMove = onUserMove(moveFrom, square);
    if (didMove) {
      setMoveFrom("");
      setOptionSquares({});
      return;
    }
  }

  function onPieceDrop({ sourceSquare, targetSquare }: PieceDropHandlerArgs) {
    if (!targetSquare) {
      return false;
    }
    const didMove = onUserMove(sourceSquare, targetSquare);
    if (didMove) {
      setMoveFrom("");
      setOptionSquares({});
      return true;
    }
    return false;
  }

  const arrowOptions = {
    color: "#ffaa00",
    secondaryColor: "#4caf50",
    tertiaryColor: "#4caf50",
    arrowLengthReducerDenominator: 8,
    sameTargetArrowLengthReducerDenominator: 4,
    arrowWidthDenominator: 7,
    activeArrowWidthMultiplier: 0.9,
    activeOpacity: 0.5,
    arrowStartOffset: 0,
    opacity: 1,
  };

  const chessboardOptions = {
    onPieceDrop,
    onSquareClick,
    arrowOptions,
    arrows: engineArrows,
    position: fen,
    squareStyles: optionSquares,
    id: "click-or-drag-to-move",
  };

  return (
    <div className={styles.chessboardContainer}>
      <div className={`${styles.playerContainer} ${styles.blackPlayer}`}>
        <img src="src/assets/chess_black_king.png" alt="chess king piece" />
        <span className={styles.playerText}>
          {blackUsername}
          {blackElo !== undefined ? ` (${blackElo})` : ""}
        </span>
      </div>

      <div>
        <Chessboard options={chessboardOptions} />
      </div>

      <div className={`${styles.playerContainer} ${styles.whitePlayer}`}>
        <img src="src/assets/chess_white_king.png" alt="chess king piece" />
        <span className={styles.playerText}>
          {whiteUsername}
          {whiteElo !== undefined ? ` (${whiteElo})` : ""}
        </span>
      </div>
    </div>
  );
}

export default ChessboardPanel;
