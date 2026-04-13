"""
pipeline/cleaner.py
Cleans and segments raw Whisper transcripts:
- Removes filler words (um, uh, you know, like...)
- Normalises whitespace and punctuation
- Segments into logical paragraphs (~150 words each)
"""

import re
import logging

logger = logging.getLogger(__name__)

# Common spoken filler words/phrases
FILLER_PATTERNS = [
    r"\b(um+|uh+|er+|ah+)\b",
    r"\byou know\b",
    r"\bkind of\b",
    r"\bsort of\b",
    r"\blike,?\s+(?=[a-z])",  # "like" used as filler before another word
    r"\bbasically\b",
    r"\bliterally\b",
    r"\bactually,\s",
    r"\bright\?\s",
    r"\bokay so\b",
    r"\balright so\b",
]

FILLER_RE = re.compile("|".join(FILLER_PATTERNS), re.IGNORECASE)

# Whisper sometimes inserts brackets like [Music] [Applause]
BRACKET_RE = re.compile(r"\[.*?\]|\(.*?\)")


def clean_transcript(raw: str) -> str:
    """
    Remove fillers, brackets, normalize whitespace.
    Returns cleaned single-string transcript.
    """
    text = raw.strip()

    # Remove non-speech annotations
    text = BRACKET_RE.sub("", text)

    # Remove filler words
    text = FILLER_RE.sub("", text)

    # Collapse multiple spaces / newlines
    text = re.sub(r"[ \t]+", " ", text)
    text = re.sub(r"\n{2,}", "\n\n", text)

    # Fix spacing after punctuation
    text = re.sub(r"([.!?])\s*([A-Z])", r"\1 \2", text)

    return text.strip()


def segment_transcript(text: str, words_per_segment: int = 800) -> list[str]:
    """
    Split a long transcript into manageable segments for the LLM.
    Splits on sentence (period) boundaries rather than mid-sentence.
    Returns a list of text chunks.
    """
    words = text.split()
    if len(words) <= words_per_segment:
        return [text]

    # Split into sentences first
    sentences = re.split(r"(?<=[.!?])\s+", text)
    chunks = []
    current_chunk: list[str] = []
    current_word_count = 0

    for sentence in sentences:
        sw = len(sentence.split())
        if current_word_count + sw > words_per_segment and current_chunk:
            chunks.append(" ".join(current_chunk))
            current_chunk = [sentence]
            current_word_count = sw
        else:
            current_chunk.append(sentence)
            current_word_count += sw

    if current_chunk:
        chunks.append(" ".join(current_chunk))

    logger.info(f"Segmented transcript into {len(chunks)} chunks")
    return chunks
