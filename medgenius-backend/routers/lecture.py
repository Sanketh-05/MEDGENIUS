"""
routers/lecture.py
FastAPI routes for the lecture processing pipeline.

Endpoints:
  POST /api/lecture/youtube  — submit a YouTube URL for processing
  POST /api/lecture/upload   — upload a video/audio file for processing
  GET  /api/lecture/status/{job_id} — poll job status (SSE stream)
"""

import uuid
import asyncio
import json
import logging
from pathlib import Path

from fastapi import APIRouter, HTTPException, UploadFile, File
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, HttpUrl

from pipeline.downloader import save_upload, is_youtube_url
from pipeline.runner import start_youtube_job, start_upload_job, get_job, JobStatus

logger = logging.getLogger(__name__)
router = APIRouter()

# Supported upload formats
ALLOWED_EXTENSIONS = {".mp4", ".mp3", ".wav", ".m4a", ".webm", ".mkv", ".mov", ".ogg", ".flac"}
MAX_UPLOAD_MB = 500


# ── Request models ──────────────────────────────────────────────

class YoutubeRequest(BaseModel):
    url: str


# ── YouTube endpoint ────────────────────────────────────────────

@router.post("/youtube")
async def process_youtube(body: YoutubeRequest):
    """
    Submit a YouTube URL for processing.
    Returns a job_id to poll for status.
    """
    url = body.url.strip()
    if not url:
        raise HTTPException(status_code=400, detail="URL is required.")
    if not is_youtube_url(url):
        raise HTTPException(
            status_code=400,
            detail="Invalid or unsupported YouTube URL. "
                   "Accepted formats: youtube.com/watch?v=..., youtu.be/..."
        )

    job_id = str(uuid.uuid4())
    start_youtube_job(job_id, url)
    logger.info(f"YouTube job created: {job_id} for {url}")
    return {"job_id": job_id, "status": "queued"}


# ── File upload endpoint ────────────────────────────────────────

@router.post("/upload")
async def process_upload(file: UploadFile = File(...)):
    """
    Upload a video or audio file for processing.
    Returns a job_id to poll for status.
    """
    suffix = Path(file.filename or "file.mp4").suffix.lower()
    if suffix not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=415,
            detail=f"Unsupported file format '{suffix}'. "
                   f"Accepted: {', '.join(sorted(ALLOWED_EXTENSIONS))}"
        )

    contents = await file.read()
    size_mb = len(contents) / (1024 * 1024)
    if size_mb > MAX_UPLOAD_MB:
        raise HTTPException(
            status_code=413,
            detail=f"File too large ({size_mb:.1f} MB). Maximum is {MAX_UPLOAD_MB} MB."
        )

    job_id = str(uuid.uuid4())
    saved_path = save_upload(contents, file.filename or f"{job_id}.mp4", job_id)
    start_upload_job(job_id, saved_path)
    logger.info(f"Upload job created: {job_id} — {file.filename} ({size_mb:.1f} MB)")
    return {"job_id": job_id, "status": "queued"}


# ── Status endpoint (Server-Sent Events stream) ─────────────────

@router.get("/status/{job_id}")
async def job_status(job_id: str):
    """
    Stream Server-Sent Events with job progress.
    Frontend polls this until status == 'done' or 'error'.
    """
    async def event_generator():
        while True:
            job = get_job(job_id)
            if job is None:
                yield _sse({"error": "Job not found", "status": "error"})
                return

            payload = {
                "status": job.get("status", "queued"),
                "stage": job.get("stage", ""),
                "progress": job.get("progress", 0),
            }

            if job.get("status") == JobStatus.DONE:
                payload["result"] = job.get("result", {})
                yield _sse(payload)
                return

            if job.get("status") == JobStatus.ERROR:
                payload["error"] = job.get("error", "Unknown error")
                yield _sse(payload)
                return

            yield _sse(payload)
            await asyncio.sleep(1.5)  # Poll every 1.5 seconds

    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "X-Accel-Buffering": "no",   # Disable nginx buffering
        },
    )


# ── Simple poll endpoint (alternative to SSE) ──────────────────

@router.get("/poll/{job_id}")
async def poll_status(job_id: str):
    """
    Simple JSON polling alternative to SSE for environments that don't support it.
    """
    job = get_job(job_id)
    if job is None:
        raise HTTPException(status_code=404, detail="Job not found.")

    response = {
        "status": job.get("status"),
        "stage": job.get("stage", ""),
        "progress": job.get("progress", 0),
    }
    if job.get("status") == JobStatus.DONE:
        response["result"] = job.get("result", {})
    if job.get("status") == JobStatus.ERROR:
        response["error"] = job.get("error", "")

    return response


def _sse(data: dict) -> str:
    return f"data: {json.dumps(data)}\n\n"
