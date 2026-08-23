import shutil
from pathlib import Path
from app.database.connection import SessionLocal
from app.models.meeting_result import MeetingResult
from app.models.transcript import Transcript
from app.models.meeting import Meeting

def reset_database(clear_storage: bool = True):
    print("Connecting to database...")
    db = SessionLocal()
    try:
        results_deleted = db.query(MeetingResult).delete()
        transcripts_deleted = db.query(Transcript).delete()
        meetings_deleted = db.query(Meeting).delete()
        db.commit()
        print(f"✅ Deleted {meetings_deleted} meetings, {transcripts_deleted} transcripts, {results_deleted} meeting results from DB.")
    except Exception as e:
        db.rollback()
        print(f"❌ Error deleting database records: {e}")
        return
    finally:
        db.close()

    if clear_storage:
        storage_dir = Path(__file__).resolve().parent / "storage"
        uploads_dir = storage_dir / "uploads"
        results_dir = storage_dir / "transcription_results"

        for directory in (uploads_dir, results_dir):
            if directory.exists():
                for item in directory.iterdir():
                    if item.is_file():
                        item.unlink(missing_ok=True)
                    elif item.is_dir():
                        shutil.rmtree(item, ignore_errors=True)
                print(f"✅ Cleared storage folder: {directory}")

    print("\n🎉 Fresh start ready!")

if __name__ == "__main__":
    reset_database()
