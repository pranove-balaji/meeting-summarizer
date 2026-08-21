from fastapi import APIRouter
from app.schemas.meeting import MeetingResponse

router = APIRouter(
    prefix="/api/v1/meetings",
    tags=["Meetings"]               
    )

@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id:str):
    return MeetingResponse(
        id=meeting_id,
        filename = "example.mp3",
        status = "processing"
    )