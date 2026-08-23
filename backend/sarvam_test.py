from pathlib import Path

from sarvamai import SarvamAI

from app.core.config import settings


audio_path = Path(
    "storage/uploads/meeting.mp3"
)

client = SarvamAI(
    api_subscription_key=settings.sarvam_api_key,
)

try:
    job = client.speech_to_text_job.create_job(
        model="saaras:v3",
        mode="transcribe",
        with_diarization=True,
    )

    print(f"Job created: {job}")

    job.upload_files(
        file_paths=[str(audio_path)]
    )

    print("Audio uploaded.")

    job.start()

    print("Transcription job started.")

    job.wait_until_complete()

    print("Transcription completed.")

    results = job.get_file_results()

    print(results)

    output_dir = Path("storage/transcription_results")
    output_dir.mkdir(parents=True, exist_ok=True)

    job.download_outputs(
        output_dir=str(output_dir)
    )

    print(f"Results downloaded to: {output_dir}")

except Exception as exc:
    print(f"Batch transcription failed: {exc}")
    raise