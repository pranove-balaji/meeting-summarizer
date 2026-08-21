from pydantic import BaseModel

class MeetingResponse(BaseModel):
    id:str
    filename:str
    status:str