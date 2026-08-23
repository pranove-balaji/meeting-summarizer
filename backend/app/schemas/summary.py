from pydantic import BaseModel, Field


class ActionItem(BaseModel):
    task: str = Field(
        description="The action that needs to be completed."
    )
    assignee: str | None = Field(
        default=None,
        description="Person responsible, if explicitly mentioned."
    )
    deadline: str | None = Field(
        default=None,
        description="Deadline, if explicitly mentioned."
    )


class MeetingSummary(BaseModel):
    summary: str = Field(
        description="A concise summary of the meeting."
    )
    key_points: list[str] = Field(
        description="Important points discussed."
    )
    action_items: list[ActionItem] = Field(
        description="Concrete actions agreed upon in the meeting."
    )


class MeetingResultResponse(BaseModel):
    id: str
    meeting_id: str
    transcript: str
    summary: str
    key_points: list[str]
    action_items: list[ActionItem]

    class Config:
        from_attributes = True