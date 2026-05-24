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
  type NullableMoveClassification,
  type GameMove,
  type Settings,
} from "../types/chessTypes";

import {
  classificationToSquareColor,
  classificationToIcon,
} from "../lib/classifications";
import blackKingIcon from "../assets/pieces/chess_black_king.png";
import whiteKingIcon from "../assets/pieces/chess_white_king.png";

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
  moveClassifications: NullableMoveClassification[];
  boardOrientation: "white" | "black";
  playerInfo: {
    whiteUsername: string;
    blackUsername: string;
    whiteElo: number | undefined;
    blackElo: number | undefined;
  };
  settings: Settings;
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
  boardOrientation,
  playerInfo,
  settings,
}: ChessboardProps) {
  const { whiteUsername, blackUsername, whiteElo, blackElo } = playerInfo;
  const chessGame = fen ? new Chess(fen) : new Chess();
  const [moveFrom, setMoveFrom] = useState("");
  const [optionSquares, setOptionSquares] = useState({});

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
  const currentClassificationKey = currentClassification?.classification;

  const currentMove = isOnMainline
    ? mainlineMoves[currentIndex - 1]
    : currentBranch?.moves[currentBranchIndex - 1];

  const currentIconClassification = currentClassificationKey
    ? [
        {
          square: currentMove?.to,
          src: classificationToIcon[currentClassificationKey],
        },
      ]
    : [];

  const topPlayer =
    boardOrientation === "white"
      ? {
          username: blackUsername,
          elo: blackElo,
          icon: blackKingIcon,
        }
      : {
          username: whiteUsername,
          elo: whiteElo,
          icon: whiteKingIcon,
        };

  const bottomPlayer =
    boardOrientation === "white"
      ? {
          username: whiteUsername,
          elo: whiteElo,
          icon: whiteKingIcon,
        }
      : {
          username: blackUsername,
          elo: blackElo,
          icon: blackKingIcon,
        };

  const squareColor: Record<string, React.CSSProperties> = {};

  if (currentMove && currentClassificationKey) {
    const color = classificationToSquareColor[currentClassificationKey];

    if (color) {
      squareColor[currentMove.from] = {
        background: color,
      };

      squareColor[currentMove.to] = {
        background: color,
      };
    }
  }

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

  function getIconPosition(
    square: string,
    boardSize: number,
    boardOrientation: "white" | "black",
  ) {
    const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
    const file = square[0];
    const rank = Number(square[1]);

    let col = files.indexOf(file);
    let row = 8 - rank;

    if (boardOrientation === "black") {
      col = 7 - col;
      row = 7 - row;
    }

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
    boardOrientation,
    arrows: settings.showEngineArrows ? engineArrows : undefined,
    position: fen,
    id: "click-or-drag-to-move",
    squareStyles: {
      ...squareColor,
      ...optionSquares,
    },
  };

  return (
    <div className={styles.chessboardContainer}>
      <div className={`${styles.playerContainer} ${styles.topPlayer}`}>
        <img src={topPlayer.icon} alt="chess king piece" />
        <span className={styles.playerText}>
          {topPlayer.username}
          {topPlayer.elo !== undefined ? ` (${topPlayer.elo})` : ""}
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
              style={getIconPosition(icon.square, boardSize, boardOrientation)}
            />
          );
        })}
      </div>

      <div className={`${styles.playerContainer} ${styles.bottomPlayer}`}>
        <img src={bottomPlayer.icon} alt="chess king piece" />
        <span className={styles.playerText}>
          {bottomPlayer.username}
          {bottomPlayer.elo !== undefined ? ` (${bottomPlayer.elo})` : ""}
        </span>
      </div>
    </div>
  );
}

export default ChessboardPanel;
