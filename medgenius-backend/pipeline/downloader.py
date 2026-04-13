"""
pipeline/downloader.py
Downloads audio from YouTube using yt-dlp.
Returns the path to the downloaded audio file.
"""

import os
import re
import uuid
import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

DOWNLOADS_DIR = Path("tmp/downloads")
DOWNLOADS_DIR.mkdir(parents=True, exist_ok=True)

YOUTUBE_REGEX = re.compile(
    r"(https?://)?(www\.)?"
    r"(youtube\.com/(watch\?v=|embed/|v/|shorts/)|youtu\.be/)"
    r"([a-zA-Z0-9_-]{11})"
)


def is_youtube_url(url: str) -> bool:
    return bool(YOUTUBE_REGEX.search(url))


def download_audio(url: str, job_id: str) -> str:
    """
    Download the best audio stream from a YouTube URL using yt-dlp.
    Returns the path to the downloaded .webm/.m4a file.
    Raises ValueError for invalid URLs, RuntimeError for download failures.
    """
    if not is_youtube_url(url):
        raise ValueError(f"Not a valid YouTube URL: {url}")

    output_template = str(DOWNLOADS_DIR / f"{job_id}.%(ext)s")

    cmd = [
        "yt-dlp",
        "--no-playlist",           # Only download the single video, not full playlist
        "--extract-audio",         # Audio only
        "--audio-format", "best",  # Best available audio quality
        "--audio-quality", "0",    # Best quality
        "--output", output_template,
        "--no-warnings",
        url,
    ]

    logger.info(f"[{job_id}] Downloading: {url}")
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=600,  # 10-minute timeout for long lectures
        )
        if result.returncode != 0:
            logger.error(f"[{job_id}] yt-dlp error: {result.stderr}")
            raise RuntimeError(f"yt-dlp failed: {result.stderr[:300]}")
    except subprocess.TimeoutExpired:
        raise RuntimeError("Download timed out after 10 minutes. Try a shorter video.")
    except FileNotFoundError:
        raise RuntimeError("yt-dlp not found. Install it: pip install yt-dlp")

    # Find the downloaded file (yt-dlp may use different extensions)
    for ext in ["webm", "m4a", "mp4", "opus", "ogg", "wav"]:
        candidate = DOWNLOADS_DIR / f"{job_id}.{ext}"
        if candidate.exists():
            logger.info(f"[{job_id}] Downloaded to {candidate}")
            return str(candidate)

    raise RuntimeError("Download appeared to succeed but output file not found.")


def save_upload(file_bytes: bytes, filename: str, job_id: str) -> str:
    """
    Save an uploaded video/audio file to disk.
    Returns the path to the saved file.
    """
    suffix = Path(filename).suffix or ".mp4"
    out_path = DOWNLOADS_DIR / f"{job_id}{suffix}"
    out_path.write_bytes(file_bytes)
    logger.info(f"[{job_id}] Saved upload to {out_path}")
    return str(out_path)
