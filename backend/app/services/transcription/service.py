from pathlib import Path
from uuid import UUID

from sqlalchemy.orm import Session

from app.models.transcript import Transcript
from app.services.transcription.base import TranscriptionProvider


class TranscriptionService:

    def __init__(
        self,
        db: Session,
        provider: TranscriptionProvider,
    ):
        self.db = db
        self.provider = provider

    def transcribe(
        self,
        meeting_id: UUID,
        audio_path: Path,
    ) -> Transcript:

        transcript_text = self.provider.transcribe(audio_path)

        transcript = Transcript(
            meeting_id=meeting_id,
            text=transcript_text,
        )

        self.db.add(transcript)
        self.db.commit()
        self.db.refresh(transcript)

        return transcript