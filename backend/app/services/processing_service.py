from pathlib import Path
from uuid import UUID

from sqlalchemy.exc import SQLAlchemyError
from sqlalchemy.orm import Session

from app.constants.meeting import (
    MEETING_STATUS_COMPLETED,
    MEETING_STATUS_PROCESSING,
    MEETING_STATUS_SUMMARIZING,
    MEETING_STATUS_TRANSCRIBED,
    MEETING_STATUS_FAILED,
)
from app.models.meeting import Meeting
from app.services.meeting_service import save_meeting_result
from app.services.meeting_status import validate_status_transition
from app.services.summarization.gemini import (
    GeminiSummarizationProvider,
)
from app.services.transcription.sarvam import (
    SarvamTranscriptionProvider,
)
from app.services.transcription.service import (
    TranscriptionService,
)


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

            # Step 2: transcription
            transcription_service = TranscriptionService(
                db=self.db,
                provider=SarvamTranscriptionProvider(),
            )

            transcript_record = transcription_service.transcribe(
                meeting_id=meeting.id,
                audio_path=Path(meeting.file_path),
            )

            transcript = transcript_record.text

            meeting.status = MEETING_STATUS_TRANSCRIBED
            self.db.commit()

            print(
                f"Transcript saved: {len(transcript)} characters"
            )

            # Step 3: summarization
            validate_status_transition(
                meeting.status,
                MEETING_STATUS_SUMMARIZING,
            )

            meeting.status = MEETING_STATUS_SUMMARIZING
            self.db.commit()

            print("Starting Gemini summarization...")

            gemini = GeminiSummarizationProvider()

            result = gemini.summarize(transcript)

            print("Gemini summarization completed.")

            # Step 4: save AI result
            save_meeting_result(
                db=self.db,
                meeting_id=meeting.id,
                transcript=transcript,
                result=result,
            )

            print("Meeting result saved.")

            # Step 5: completed
            validate_status_transition(
                meeting.status,
                MEETING_STATUS_COMPLETED,
            )

            meeting.status = MEETING_STATUS_COMPLETED
            self.db.commit()

            print(
                f"Meeting {meeting.id} completed successfully."
            )

        except Exception:
            self.db.rollback()

            try:
                meeting = self.db.get(
                    Meeting,
                    meeting_id,
                )

                if meeting is not None:
                    meeting.status = MEETING_STATUS_FAILED
                    self.db.commit()

            except Exception:
                self.db.rollback()

            raise