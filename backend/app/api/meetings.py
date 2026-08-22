from uuid import UUID, uuid4
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, UploadFile, status, File
from sqlalchemy.orm import Session

from app.database.dependencies import get_db
from app.models.meeting import Meeting
from app.schemas.meeting import MeetingResponse

router = APIRouter(
    prefix="/api/v1/meetings",
    tags=["Meetings"]               
    )
ALLOWED_EXTENSIONS = {".mp3", ".wav", ".m4a", ".webm"}
MAX_FILE_SIZE = 100 * 1024 * 1024

UPLOAD_DIRECTORY = Path("storage/uploads")
UPLOAD_DIRECTORY.mkdir(parents=True, exist_ok=True)


@router.get("/{meeting_id}", response_model=MeetingResponse)
def get_meeting(meeting_id:UUID,db:Session = Depends(get_db)):
    meeting = db.get(Meeting, meeting_id)
    if meeting is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Meeting not found.",
        )
    return MeetingResponse(
        id=str(meeting.id),
        file_name=meeting.original_filename,
        status=meeting.status,
    )

@router.post("",
             response_model=MeetingResponse,
             status_code=status.HTTP_201_CREATED,
             )

async def upload_meeting(file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A file must be provided.",
        )
    extension = Path(file.filename).suffix.lower()
    if extension not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Unsupported audio format.",
        )
    meeting_id = str(uuid4())
    stored_filename = f"{meeting_id}{extension}"
    file_path = UPLOAD_DIRECTORY / stored_filename
    total_size = 0
    chunk_size = 1024 * 1024
    try:
        with file_path.open("wb") as buffer:
            while chunk := await file.read(chunk_size):
                total_size += len(chunk)

                if total_size > MAX_FILE_SIZE:
                    file_path.unlink(missing_ok=True)

                    raise HTTPException(
                        status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                        detail="File size exceeds the 100 MB limit.",
                    )

                buffer.write(chunk)

    except OSError as exc:
        file_path.unlink(missing_ok=True)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Unable to store the uploaded file.",
        ) from exc

    
    finally:
        await file.close()
    return MeetingResponse(
        id=meeting_id,
        filename=file.filename,
        status="uploaded",
        )
    