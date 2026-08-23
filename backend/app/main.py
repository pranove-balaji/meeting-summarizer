from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.api.meetings import router as meetings_router

app = FastAPI(title="meeting summarizer",version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(meetings_router)
@app.get("/health")
def health_check():
    return {"status": "ok"}