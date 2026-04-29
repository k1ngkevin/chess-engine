import os
from dotenv import load_dotenv
from stockfish import Stockfish
import chess

load_dotenv()

stockfish_path = os.getenv("STOCKFISH_PATH")
if stockfish_path is None:
    raise ValueError("stockfish path is not set")

stockfish = Stockfish(
    path=stockfish_path,
    parameters={
        "Threads": 4,
        "Hash": 256,
    }
)


def get_best_moves(fen: str, depth: int, num_results: int = 3):
    try:
        board = chess.Board(fen)
    except:
        raise ValueError("fen is not valid")

    if board.is_game_over():
        return []

    stockfish.set_fen_position(fen)
    stockfish.set_depth(depth)
    uci_top_moves = stockfish.get_top_moves(num_results)

    result = []

    side_to_move = fen.split()[1]

    for move_info in uci_top_moves:
        move = move_info["Move"]
        if not isinstance(move, str):
            continue

        try:
            uci_move = chess.Move.from_uci(move)
            if not board.is_legal(uci_move):
                continue

            if not isinstance(move_info["Centipawn"], int) and not isinstance(move_info["Mate"], int):
                continue

            centipawn_value = None
            if isinstance(move_info["Centipawn"], int):
                if (side_to_move == "w"):
                    centipawn_value = move_info["Centipawn"]
                else: 
                    centipawn_value = -move_info["Centipawn"]
            
            result.append({
                "uci": move,
                "san": board.san(uci_move),
                "centipawn": centipawn_value,
                "mate": move_info["Mate"]
            })
        except Exception as e:
            print(f"failed to parse move {move} in fen {fen}: {e}")
    return result


def evaluate_position(fen: str, depth: int):
    try:
        board = chess.Board(fen)
    except:
        raise ValueError("fen is not valid")

    side_to_move = fen.split()[1]

    if (board.is_game_over()):
        return {
            "type": "mate_over",
            "value": -1 if side_to_move == "w" else 1
        }

    stockfish.set_fen_position(fen)
    stockfish.set_depth(depth)
    evaluation = stockfish.get_evaluation()

    value = int(evaluation["value"])
    if side_to_move == "b":
        value = -value

    evaluation["value"] = value
    return evaluation
