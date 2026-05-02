import os
from dotenv import load_dotenv
from stockfish import Stockfish
import chess
import chess.engine

load_dotenv()

stockfish_path = os.getenv("STOCKFISH_PATH")
if stockfish_path is None:
    raise ValueError("stockfish path is not set")

engine = chess.engine.SimpleEngine.popen_uci(stockfish_path)


def get_best_moves(fen: str, depth: int, num_results: int = 3):
    try:
        board = chess.Board(fen)
    except Exception:
        raise ValueError("fen is not valid")

    if board.is_game_over():
        return []

    try:
        infos = engine.analyse(
            board,
            chess.engine.Limit(depth=depth),
            multipv=num_results
        )
    except Exception as e:
        print(f"Stockfish analysis failed for fen {fen}: {e}")
        return []

    result = []

    for info in infos:
        pv = info.get("pv", [])

        if not pv:
            continue

        first_move = pv[0]

        if not board.is_legal(first_move):
            continue

        temp_board = board.copy()
        san_line = []

        for move in pv:
            if not temp_board.is_legal(move):
                break

            san_line.append(temp_board.san(move))
            temp_board.push(move)

        score_info = info.get("score")
        if score_info is None:
            return None
        score = score_info.white()

        centipawn = None
        mate = None

        if score.is_mate():
            mate = score.mate()
        else:
            centipawn = score.score()

        result.append({
            "uci": first_move.uci(),
            "san": board.san(first_move),
            "centipawn": centipawn,
            "mate": mate,
            "line": san_line,
        })

    return result


def evaluate_position(fen: str, depth: int):
    try:
        board = chess.Board(fen)
    except Exception:
        raise ValueError("fen is not valid")

    if board.is_game_over():
        return {
            "type": "mate_over",
            "value": -1 if board.turn == chess.WHITE else 1
        }

    try:
        info = engine.analyse(
            board,
            chess.engine.Limit(depth=depth)
        )
    except Exception as e:
        print(f"Stockfish evaluation failed for fen {fen}: {e}")
        return {
            "type": "cp",
            "value": 0
        }

    score_info = info.get("score")
    if score_info is None:
        return None

    score = score_info.white()

    if score.is_mate():
        return {
            "type": "mate",
            "value": score.mate()
        }

    return {
        "type": "cp",
        "value": score.score()
    }
