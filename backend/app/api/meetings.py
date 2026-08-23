from uuid import UUID

from fastapi import (
    APIRouter,
    Depends,
    File,
    UploadFile,
    status,
    BackgroundTasks,
)

from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.schemas.meeting import MeetingResponse
from app.schemas.summary import MeetingResultResponse
from app.services.meeting_service import MeetingService
from app.tasks.meeting_tasks import process_meeting_task


router = APIRouter(
    prefix="/api/v1/meetings",
    tags=["Meetings"],
)


@router.post(
    "",
    response_model=MeetingResponse,
    status_code=status.HTTP_201_CREATED,
)
async def upload_meeting(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    service = MeetingService(db)

    meeting = await service.upload_meeting(file)

    background_tasks.add_task(
        process_meeting_task,
        meeting.id,
    )

    return MeetingResponse(
        id=str(meeting.id),
        filename=meeting.original_filename,
        status=meeting.status,
    )


@router.get(
    "/{meeting_id}/result",
    response_model=MeetingResultResponse,
)
def get_meeting_result(
    meeting_id: UUID,
    db: Session = Depends(get_db),
):
    service = MeetingService(db)

    result = service.get_meeting_result(meeting_id)

    return MeetingResultResponse(
        id=str(result.id),
        meeting_id=str(result.meeting_id),
        transcript=result.transcript,
        summary=result.summary,
        key_points=result.key_points,
        action_items=result.action_items,
    )


@router.get(
    "/{meeting_id}",
    response_model=MeetingResponse,
)
def get_meeting(
    meeting_id: UUID,
    db: Session = Depends(get_db),
):
    service = MeetingService(db)

    meeting = service.get_meeting(meeting_id)

    return MeetingResponse(
        id=str(meeting.id),
        filename=meeting.original_filename,
        status=meeting.status,
    )