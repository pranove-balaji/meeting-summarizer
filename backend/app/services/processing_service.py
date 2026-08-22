from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session
from pathlib import Path

from app.services.transcription.fake import FakeTranscriptionProvider
from app.services.transcription.service import TranscriptionService

from app.constants.meeting import (
    MEETING_STATUS_COMPLETED,
    MEETING_STATUS_PROCESSING,
    MEETING_STATUS_SUMMARIZING,
    MEETING_STATUS_TRANSCRIBED,
    MEETING_STATUS_FAILED,
)
from app.models.meeting import Meeting
from app.services.meeting_status import validate_status_transition


class ProcessingService:
    def __init__(self, db: Session):
        self.db = db

    def process_meeting(self, meeting_id: UUID) -> None:
        meeting = self.db.get(Meeting, meeting_id)

        if meeting is None:
            return

        try:
            # Step 1: processing
            validate_status_transition(
                meeting.status,
                MEETING_STATUS_PROCESSING,
            )

            meeting.status = MEETING_STATUS_PROCESSING
            self.db.commit()

            transcription_service = TranscriptionService(
                db=self.db,
                provider=FakeTranscriptionProvider(),
            )

            transcription_service.transcribe(
                meeting_id=meeting.id,
                audio_path=Path(meeting.file_path),
            )

            meeting.status = MEETING_STATUS_TRANSCRIBED
            self.db.commit()

            # Step 3: placeholder summarization
            validate_status_transition(
                meeting.status,
                MEETING_STATUS_SUMMARIZING,
            )

            meeting.status = MEETING_STATUS_SUMMARIZING
            self.db.commit()

            # Step 4: placeholder completion
            validate_status_transition(
                meeting.status,
                MEETING_STATUS_COMPLETED,
            )

            meeting.status = MEETING_STATUS_COMPLETED
            self.db.commit()

        except SQLAlchemyError:
            self.db.rollback()

            meeting = self.db.get(Meeting, meeting_id)

            if meeting is not None:
                meeting.status = MEETING_STATUS_FAILED
                self.db.commit()

            raise