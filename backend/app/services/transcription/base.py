from abc import ABC, abstractmethod
from pathlib import Path


class TranscriptionProvider(ABC):

    @abstractmethod
    def transcribe(self, audio_path: Path) -> str:
        """Convert an audio file into text."""
        raise NotImplementedError