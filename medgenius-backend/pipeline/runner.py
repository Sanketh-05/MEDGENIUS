"""
pipeline/runner.py
Orchestrates the full processing pipeline and tracks job status.
Each job runs in a background thread to avoid blocking FastAPI.
"""

import threading
import logging
import time
from enum import Enum
from typing import Any, Callable, Optional

from pipeline.downloader import download_audio, save_upload
from pipeline.audio import extract_audio, cleanup_files
from pipeline.transcriber import transcribe
from pipeline.cleaner import clean_transcript
from pipeline.ollama_service import process_transcript

logger = logging.getLogger(__name__)


class JobStatus(str, Enum):
    QUEUED = "queued"
    DOWNLOADING = "downloading"
    EXTRACTING = "extracting"
    TRANSCRIBING = "transcribing"
    CLEANING = "cleaning"
    ANALYSING = "analysing"
    DONE = "done"
    ERROR = "error"


# In-memory job store (replace with Redis for production multi-worker setup)
_jobs: dict[str, dict] = {}
_jobs_lock = threading.Lock()


def get_job(job_id: str) -> Optional[dict]:
    with _jobs_lock:
        return _jobs.get(job_id)


def _set_job(job_id: str, **kwargs):
    with _jobs_lock:
        if job_id not in _jobs:
            _jobs[job_id] = {}
        _jobs[job_id].update(kwargs)


def _run_pipeline(
    job_id: str,
    source_type: str,   # "youtube" | "upload"
    source: str,        # URL or file path
    filename: str = "",
):
    try:
        # ─── 1. Download / save ───────────────────────────────
        _set_job(job_id, status=JobStatus.DOWNLOADING, stage="Downloading lecture…", progress=5)
        if source_type == "youtube":
            raw_path = download_audio(source, job_id)
        else:
            # source is already saved bytes path
            raw_path = source

        # ─── 2. Extract audio ─────────────────────────────────
        _set_job(job_id, status=JobStatus.EXTRACTING, stage="Extracting audio…", progress=20)
        wav_path = extract_audio(raw_path, job_id)

        # ─── 3. Transcribe ────────────────────────────────────
        _set_job(job_id, status=JobStatus.TRANSCRIBING, stage="Generating transcript…", progress=35)
        raw_transcript = transcribe(wav_path, job_id)

        # ─── 4. Clean transcript ──────────────────────────────
        _set_job(job_id, status=JobStatus.CLEANING, stage="Cleaning transcript…", progress=55)
        clean = clean_transcript(raw_transcript)

        # ─── 5. AI analysis via Ollama ────────────────────────
        _set_job(job_id, status=JobStatus.ANALYSING, stage="Analysing with AI…", progress=60)

        def status_cb(stage: str, pct: int):
            status_map = {
                60: "Generating summary…",
                70: "Extracting high-yield notes…",
                85: "Creating flashcards…",
                93: "Generating quiz questions…",
                100: "Finishing up…",
            }
            _set_job(job_id, stage=status_map.get(pct, f"Analysing… ({pct}%)"), progress=pct)

        result = process_transcript(clean, status_callback=status_cb)

        # ─── 6. Done ──────────────────────────────────────────
        _set_job(
            job_id,
            status=JobStatus.DONE,
            stage="Complete",
            progress=100,
            result={
                "transcript": clean,
                "raw_transcript": raw_transcript,
                "summary": result["summary"],
                "notes": result["notes"],
                "flashcards": result["flashcards"],
                "quiz": result["quiz"],
            },
        )
        logger.info(f"[{job_id}] Pipeline complete.")

        # Clean up temp files
        cleanup_files(raw_path, wav_path)

    except Exception as exc:
        logger.exception(f"[{job_id}] Pipeline failed: {exc}")
        _set_job(
            job_id,
            status=JobStatus.ERROR,
            stage="Error",
            progress=0,
            error=str(exc),
        )


def start_youtube_job(job_id: str, url: str) -> str:
    """Start background processing for a YouTube URL. Returns job_id."""
    _set_job(job_id, status=JobStatus.QUEUED, stage="Queued…", progress=0, started_at=time.time())
    thread = threading.Thread(
        target=_run_pipeline,
        args=(job_id, "youtube", url),
        daemon=True,
    )
    thread.start()
    return job_id


def start_upload_job(job_id: str, saved_path: str) -> str:
    """Start background processing for an uploaded file. Returns job_id."""
    _set_job(job_id, status=JobStatus.QUEUED, stage="Queued…", progress=0, started_at=time.time())
    thread = threading.Thread(
        target=_run_pipeline,
        args=(job_id, "upload", saved_path),
        daemon=True,
    )
    thread.start()
    return job_id
