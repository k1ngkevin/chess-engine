from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import DateTime, Integer, JSON, String, func
from sqlalchemy.orm import Mapped, mapped_column

from database import Base

JsonObject = dict[str, Any]

class Game(Base):
    __tablename__ = "games"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, index=True)
    white_player: Mapped[str | None] = mapped_column(String(100))
    black_player: Mapped[str | None] = mapped_column(String(100))
    white_elo: Mapped[int | None] = mapped_column(Integer)
    black_elo: Mapped[int | None] = mapped_column(Integer)

    mainline_fens: Mapped[list[str]] = mapped_column(JSON, default=list)
    mainline_best_moves: Mapped[list[list[JsonObject] | None]] = mapped_column(
        JSON,
        default=list,
    )
    branches: Mapped[list[JsonObject]] = mapped_column(JSON, default=list)
    mainline_move_evaluations: Mapped[list[JsonObject | None]] = mapped_column(
        JSON,
        default=list,
    )
    mainline_move_classifications: Mapped[list[JsonObject | None]] = (
        mapped_column(JSON, default=list)
    )

    created_at: Mapped[datetime] = mapped_column(DateTime, server_default=func.now())
