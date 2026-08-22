from fastapi import HTTPException, status

from app.constants.meeting import ALLOWED_STATUS_TRANSITIONS


def validate_status_transition(
    current_status: str,
    new_status: str,
) -> None:
    allowed_statuses = ALLOWED_STATUS_TRANSITIONS.get(current_status)

    if allowed_statuses is None:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Meeting has an invalid current status.",
        )

    if new_status not in allowed_statuses:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                f"Invalid meeting status transition: "
                f"{current_status} -> {new_status}"
            ),
        )