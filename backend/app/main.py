from fastapi import FastAPI
from app.api.meetings import router as meetings_router

app = FastAPI(title="meeting summarizer",version="1.0.0")
app.include_router(meetings_router)
@app.get("/health")
def health_check():
    return {"status": "ok"}