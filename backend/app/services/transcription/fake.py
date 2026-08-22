from pathlib import Path

from app.services.transcription.base import TranscriptionProvider


class FakeTranscriptionProvider(TranscriptionProvider):

    def transcribe(self, audio_path: Path) -> str:
        return (
            "This is a placeholder transcript. "
            "The meeting discussed project progress, "
            "upcoming tasks, and responsibilities."
        )