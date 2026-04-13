"""
MEDGENIUS Backend — FastAPI entrypoint
Handles CORS for the Vite dev server and mounts all routers.
"""

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from routers import lecture, anatomy

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="MEDGENIUS Backend",
    description="Video/Audio lecture processing pipeline for MEDGENIUS medical learning platform",
    version="1.0.0"
)

# Allow the Vite frontend (default port 5173) and any localhost origin
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(lecture.router, prefix="/api/lecture", tags=["lecture"])
app.include_router(anatomy.router, prefix="/api/anatomy", tags=["anatomy"])


@app.get("/")
async def root():
    return {"status": "MEDGENIUS backend running", "docs": "/docs"}


@app.get("/health")
async def health():
    return {"status": "ok"}
