from uuid import UUID

from app.database.connection import SessionLocal
from app.services.processing_service import ProcessingService


def process_meeting_task(meeting_id: UUID) -> None:
    db = SessionLocal()

    try:
        service = ProcessingService(db)
        service.process_meeting(meeting_id)

    finally:
        db.close()