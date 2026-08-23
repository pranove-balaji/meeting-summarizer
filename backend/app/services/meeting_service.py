from pathlib import Path
from uuid import UUID, uuid4

from fastapi import HTTPException, UploadFile, status
from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.core.config import (
    ALLOWED_AUDIO_EXTENSIONS,
    MAX_AUDIO_FILE_SIZE,
    UPLOAD_DIRECTORY,
)
from app.models.meeting import Meeting
from app.models.meeting_result import MeetingResult
from app.schemas.summary import MeetingSummary


class MeetingService:

    def __init__(self, db: Session):
        self.db = db

    async def upload_meeting(self, file: UploadFile) -> Meeting:

        if not file.filename:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="A file must be provided.",
            )

        extension = Path(file.filename).suffix.lower()

        if extension not in ALLOWED_AUDIO_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Unsupported audio format.",
            )

        UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)

        meeting_id = uuid4()
        stored_filename = f"{meeting_id}{extension}"
        file_path = UPLOAD_DIRECTORY / stored_filename

        total_size = 0
        chunk_size = 1024 * 1024

        try:
            with file_path.open("wb") as buffer:

                while chunk := await file.read(chunk_size):

                    total_size += len(chunk)

                    if total_size > MAX_AUDIO_FILE_SIZE:
                        file_path.unlink(missing_ok=True)

                        raise HTTPException(
                            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                            detail="File size exceeds the 100 MB limit.",
                        )

                    buffer.write(chunk)

        except OSError as exc:

            file_path.unlink(missing_ok=True)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to store the uploaded file.",
            ) from exc

        meeting = Meeting(
            id=meeting_id,
            original_filename=file.filename,
            stored_filename=stored_filename,
            file_path=str(file_path),
            status="uploaded",
        )

        try:
            self.db.add(meeting)
            self.db.commit()
            self.db.refresh(meeting)

        except SQLAlchemyError as exc:

            self.db.rollback()
            file_path.unlink(missing_ok=True)

            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Unable to create the meeting record.",
            ) from exc

        return meeting

    def get_meeting(self, meeting_id: UUID) -> Meeting:

        meeting = self.db.get(Meeting, meeting_id)

        if meeting is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Meeting not found.",
            )

        return meeting


def save_meeting_result(
    db: Session,
    meeting_id: UUID,
    transcript: str,
    result: MeetingSummary,
) -> MeetingResult:

    meeting_result = MeetingResult(
        meeting_id=meeting_id,
        transcript=transcript,
        summary=result.summary,
        key_points=result.key_points,
        action_items=[
            item.model_dump()
            for item in result.action_items
        ],
    )

    db.add(meeting_result)
    db.commit()
    db.refresh(meeting_result)

    return meeting_result