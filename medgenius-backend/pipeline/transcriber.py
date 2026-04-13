"""
pipeline/transcriber.py
Uses OpenAI Whisper (local model, no API key needed) to transcribe audio.
Automatically detects language. Handles long lectures via Whisper's
built-in chunking (word-level timestamps and chunked VAD).
"""

import logging
import threading
from pathlib import Path
from typing import Optional, Dict, Any

logger = logging.getLogger(__name__)

# Whisper model is loaded once and reused across requests
_model = None
_model_lock = threading.Lock()

# Change to "medium" or "large" for better accuracy on long medical lectures
# small = faster, less accurate | medium = balanced | large = most accurate
WHISPER_MODEL_SIZE = "base"


def load_model():
    """Load Whisper model into memory (lazy-loaded on first use)."""
    global _model
    with _model_lock:
        if _model is None:
            logger.info(f"Loading Whisper '{WHISPER_MODEL_SIZE}' model…")
            try:
                import whisper
                _model = whisper.load_model(WHISPER_MODEL_SIZE)
                logger.info("Whisper model loaded.")
            except ImportError:
                raise RuntimeError(
                    "openai-whisper not installed. Run: pip install openai-whisper"
                )
    return _model


def transcribe(audio_path: str, job_id: str, language: Optional[str] = None) -> str:
    """
    Transcribe audio file to text using local Whisper model.

    Args:
        audio_path: Path to 16kHz mono WAV file
        job_id: Used for logging
        language: ISO 639-1 code (e.g. 'en', 'hi') or None for auto-detect

    Returns:
        Full transcript as a single string.
    """
    import whisper

    model = load_model()

    if not Path(audio_path).exists():
        raise FileNotFoundError(f"Audio file not found: {audio_path}")

    logger.info(f"[{job_id}] Transcribing {audio_path} (lang={language or 'auto'})…")

    # ── Key fix: explicitly load & pad/trim audio ──────────────
    # Whisper's mel-spectrogram expects audio padded to 30-second
    # multiples. Short clips cause "tensor size mismatch" errors.
    # Loading explicitly and calling pad_or_trim fixes this.
    audio = whisper.load_audio(audio_path)
    audio = whisper.pad_or_trim(audio)  # pads/trims to exactly 30s chunks

    options: Dict[str, Any] = {
        "fp16": False,                    # fp32 for CPU compatibility
        "beam_size": 3,                   # beam_size and best_of are mutually exclusive
        "verbose": False,
        "condition_on_previous_text": False,  # Prevents tensor mismatches on short clips
        "no_speech_threshold": 0.6,           # Skip near-silent segments
        "compression_ratio_threshold": 2.4,
        "logprob_threshold": -1.0,
    }
    if language:
        options["language"] = language

    # For short audio (≤ 30s after pad_or_trim), transcribe the padded chunk directly
    audio_duration_s = len(audio) / whisper.audio.SAMPLE_RATE

    try:
        if audio_duration_s <= 30:
            # Short audio: use the padded chunk directly via decode
            mel = whisper.log_mel_spectrogram(audio).to(model.device)
            _, probs = model.detect_language(mel)
            detected_lang = language or max(probs, key=probs.get)
            decode_options = whisper.DecodingOptions(
                language=detected_lang,
                fp16=False,
                beam_size=3,  # beam_size only — best_of is for sampling, not beam search
            )
            result_obj = whisper.decode(model, mel, decode_options)
            full_text = result_obj.text.strip() if hasattr(result_obj, 'text') else str(result_obj)
            logger.info(f"[{job_id}] Short-clip transcription done. Length: {len(full_text)} chars.")
        else:
            # Long audio: use the standard transcribe() pipeline (handles chunking internally)
            result = model.transcribe(audio_path, **options)
            segments = result.get("segments", [])
            full_text = " ".join(seg["text"].strip() for seg in segments) if segments else result.get("text", "").strip()
            detected_lang = result.get("language", "unknown")
            logger.info(f"[{job_id}] Long-clip transcription done. Lang: {detected_lang}. Segments: {len(segments)}.")
    except RuntimeError as e:
        if "sizes of tensors must match" in str(e).lower():
            logger.warning(f"[{job_id}] Tensor size mismatch — retrying with raw file path…")
            # Last-resort fallback: let Whisper handle the file directly
            result = model.transcribe(
                audio_path,
                fp16=False,
                condition_on_previous_text=False,
                no_speech_threshold=0.6,
            )
            full_text = result.get("text", "").strip()
        else:
            raise

    return full_text

