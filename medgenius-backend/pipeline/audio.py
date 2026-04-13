"""
pipeline/audio.py
Uses FFmpeg to extract and convert audio to 16kHz mono WAV —
the format Whisper requires for best accuracy.
"""

import subprocess
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

AUDIO_DIR = Path("tmp/audio")
AUDIO_DIR.mkdir(parents=True, exist_ok=True)


def extract_audio(input_path: str, job_id: str) -> str:
    """
    Convert any video/audio file to 16kHz mono WAV using FFmpeg.
    Returns the path to the WAV file.
    Raises RuntimeError if FFmpeg fails.
    """
    output_path = str(AUDIO_DIR / f"{job_id}.wav")

    cmd = [
        "ffmpeg",
        "-y",                   # Overwrite output if exists
        "-i", input_path,       # Input file
        "-vn",                  # No video stream
        "-acodec", "pcm_s16le", # 16-bit PCM
        "-ar", "16000",         # 16kHz sample rate
        "-ac", "1",             # Mono channel
        output_path,
    ]

    logger.info(f"[{job_id}] Extracting audio: {input_path} → {output_path}")
    try:
        result = subprocess.run(
            cmd,
            capture_output=True,
            text=True,
            timeout=300,  # 5-minute timeout
        )
        if result.returncode != 0:
            logger.error(f"[{job_id}] FFmpeg error: {result.stderr[-500:]}")
            raise RuntimeError(f"FFmpeg audio extraction failed: {result.stderr[-300:]}")
    except subprocess.TimeoutExpired:
        raise RuntimeError("Audio extraction timed out.")
    except FileNotFoundError:
        raise RuntimeError(
            "FFmpeg not found. Install it:\n"
            "  Windows: choco install ffmpeg\n"
            "  Linux:   apt install ffmpeg\n"
            "  macOS:   brew install ffmpeg"
        )

    logger.info(f"[{job_id}] Audio extracted to {output_path}")
    return output_path


def cleanup_files(*paths: str):
    """Remove temporary files after processing."""
    for path in paths:
        try:
            p = Path(path)
            if p.exists():
                p.unlink()
                logger.debug(f"Cleaned up: {path}")
        except Exception as e:
            logger.warning(f"Could not clean up {path}: {e}")
