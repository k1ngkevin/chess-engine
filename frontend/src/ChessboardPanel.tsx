import { useMemo, useState, useEffect, useRef } from "react";
import styles from "./ChessboardPanel.module.css";
import { Chess, type Square } from "chess.js";
import {
  Chessboard,
  type PieceDropHandlerArgs,
  type SquareHandlerArgs,
} from "react-chessboard";

import {
  type Branch,
  type EngineMove,
  type Arrow,
  type MoveClassification,
  type GameMove,
} from "./types";

import bestIcon from "./assets/Classification-Icons/best_64x.png";
import excellentIcon from "./assets/Classification-Icons/excellent_64x.png";
import okayIcon from "./assets/Classification-Icons/okay_64x.png";
import inaccuracyIcon from "./assets/Classification-Icons/inaccuracy_64x.png";
import mistakeIcon from "./assets/Classification-Icons/mistake_64x.png";
import blunderIcon from "./assets/Classification-Icons/blunder_64x.png";

type ChessboardProps = {
  fen: string;
  mainlineMoves: GameMove[];
  onUserMove: (from: string, to: string) => boolean;
  branches: Branch[];
  bestMoves: (EngineMove[] | null)[];
  currentIndex: number;
  isOnMainline: boolean;
  currentBranchId: string | null;
  currentBranchIndex: number;
  moveClassifications: MoveClassification[];
  playerInfo: {
    whiteUsername: string;
    blackUsername: string;
    whiteElo: number | undefined;
    blackElo: number | undefined;
  };
};

function ChessboardPanel({
  fen,
  mainlineMoves,
  onUserMove,
  branches,
  bestMoves,
  currentIndex,
  isOnMainline,
  currentBranchId,
  currentBranchIndex,
  moveClassifications,
  playerInfo,
}: ChessboardProps) {
  const { whiteUsername, blackUsername, whiteElo, blackElo } = playerInfo;
  const chessGame = fen ? new Chess(fen) : new Chess();
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});
  const [squareColor, setSquareColor] = useState<
    Record<string, React.CSSProperties>
  >({});

  const [boardSize, setBoardSize] = useState(0);
  const boardRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function updateBoardSize() {
      if (boardRef.current) {
        setBoardSize(boardRef.current.offsetWidth);
      }
    }

    updateBoardSize();

    window.addEventListener("resize", updateBoardSize);

    return () => {
      window.removeEventListener("resize", updateBoardSize);
    };
  }, []);

  const classificationToIcon: Record<string, string> = {
    best: bestIcon,
    excellent: excellentIcon,
    okay: okayIcon,
    inaccuracy: inaccuracyIcon,
    mistake: mistakeIcon,
    blunder: blunderIcon,
  };

  const classificationToSquareColor: Record<string, string> = {
    best: "rgba(129, 182, 76, 0.50)",
    excellent: "rgba(129, 182, 76, 0.50)",
    okay: "rgba(129, 182, 76, 0.42)",
    inaccuracy: "rgba(245, 196, 66, 0.50)",
    mistake: "rgba(245, 130, 49, 0.50)",
    blunder: "rgba(214, 79, 79, 0.55)",
  };

  const mainlineClassification = moveClassifications[currentIndex - 1];

  const currentBranch = branches.find(
    (branch) => branch.id === currentBranchId,
  );

  const currentBranchClassification =
    currentBranchIndex > 0
      ? currentBranch?.classifications[currentBranchIndex - 1]
      : null;

  const currentClassification = isOnMainline
    ? mainlineClassification
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

  useEffect(() => {
    const newSquareColor: Record<string, React.CSSProperties> = {};

    if (currentMove && currentClassification) {
      const color = classificationToSquareColor[currentClassification];

      if (color) {
        newSquareColor[currentMove.from] = {
          background: color,
        };

        newSquareColor[currentMove.to] = {
          background: color,
        };
      }
    }

    setSquareColor(newSquareColor);
  }, [currentMove, currentClassification]);

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

  function getIconPosition(square: string, boardSize: number) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const file = square[0];
    const rank = Number(square[1]);

    const col = files.indexOf(file);
    const row = 8 - rank;

    const squareSize = boardSize / 8;
    return {
      left: `${col * squareSize + squareSize * 0.58}px`,
      top: `${row * squareSize + squareSize * 0.05}px`,
    };
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
    id: "click-or-drag-to-move",
    squareStyles: {
      ...squareColor,
      ...optionSquares,
    },
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

      <div className={styles.boardWrapper} ref={boardRef}>
        <Chessboard options={chessboardOptions} />
        {currentIconClassification.map((icon) => {
          if (!icon.square) return null;
          return (
            <img
              key={icon.square}
              src={icon.src}
              className={styles.classificationIcon}
              style={getIconPosition(icon.square, boardSize)}
            />
          );
        })}
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
