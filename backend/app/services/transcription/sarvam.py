import json
from pathlib import Path

from sarvamai import SarvamAI

from app.core.config import settings
from app.services.transcription.base import TranscriptionProvider


class SarvamTranscriptionProvider(TranscriptionProvider):

    def __init__(self) -> None:
        self.client = SarvamAI(
            api_subscription_key=settings.sarvam_api_key,
        )

    def transcribe(self, audio_path: Path) -> str:

        if not audio_path.exists():
            raise FileNotFoundError(
                f"Audio file not found: {audio_path}"
            )

        try:
            job = self.client.speech_to_text_job.create_job(
                model="saaras:v3",
                mode="transcribe",
                with_diarization=True,
            )

            print("Sarvam batch job created.")

            job.upload_files(
                file_paths=[str(audio_path)]
            )

            print("Audio uploaded.")

            job.start()

            print("Transcription job started.")

            job.wait_until_complete()

            print("Transcription completed.")

            results = job.get_file_results()

            print("Sarvam results:")
            print(results)

            output_dir = Path(
                "storage/transcription_results"
            )

            output_dir.mkdir(
                parents=True,
                exist_ok=True,
            )

            job.download_outputs(
                output_dir=str(output_dir)
            )

            print(
                f"Results downloaded to: {output_dir}"
            )

            json_files = list(
                output_dir.glob("*.json")
            )

            if not json_files:
                raise RuntimeError(
                    "Sarvam did not produce a JSON output file."
                )

            output_file = json_files[0]

            with output_file.open(
                "r",
                encoding="utf-8",
            ) as file:
                result = json.load(file)

            transcript = result.get("transcript")

            if not transcript:
                raise RuntimeError(
                    "Sarvam output does not contain a transcript."
                )

            print(
                f"Transcript received: {len(transcript)} characters"
            )

            return transcript

        except Exception as exc:
            print(
                "SARVAM BATCH ERROR:",
                repr(exc),
            )
            raise