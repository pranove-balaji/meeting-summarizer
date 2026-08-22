from datetime import datetime, timezone
from uuid import UUID, uuid4
from sqlalchemy import UUID
from sqlalchemy import DateTime, String
from sqlalchemy.orm import Mapped, mapped_column

from app.database.connection import Base

class Meeting(Base):
    __tablename__ = "meetings"
    id: Mapped[UUID] = mapped_column(
    UUID(as_uuid=True),
    primary_key=True,
    default=uuid4,
)
    original_filename: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
)
    stored_filename: Mapped[str] = mapped_column(
    String(255),
    nullable=False,
    unique=True,
)
    file_path: Mapped[str] = mapped_column(
    String(500),
    nullable=False,
)
    status: Mapped[str] = mapped_column(
    String(50),
    nullable=False,
    default="uploaded",
)
    created_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    nullable=False,
    default=lambda: datetime.now(timezone.utc),
)
    updated_at: Mapped[datetime] = mapped_column(
    DateTime(timezone=True),
    nullable=False,
    default=lambda: datetime.now(timezone.utc),
    onupdate=lambda: datetime.now(timezone.utc)
)