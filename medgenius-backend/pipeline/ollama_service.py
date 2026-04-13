"""
pipeline/ollama_service.py
Uses a locally running Ollama LLM (Mistral/LLaMA) to extract structured
medical learning content from transcript chunks.

Generates:
  - High-yield notes (headings + bullets)
  - Flashcards (Q&A pairs)
  - MCQ quiz questions with explanations

Requires Ollama running on localhost:11434.
Install: https://ollama.com  then: ollama pull mistral
"""

import json
import logging
import re
import requests
from typing import Any

logger = logging.getLogger(__name__)

OLLAMA_URL = "http://localhost:11434/api/generate"
MODEL = "mistral"  # Or "llama3", "llama3.2", etc. — whatever you have pulled


def _call_ollama(prompt: str, system: str = "", max_tokens: int = 2048) -> str:
    """
    Call the Ollama REST API for a single generation.
    Returns the generated text string.
    """
    payload = {
        "model": MODEL,
        "prompt": prompt,
        "system": system,
        "stream": False,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.3,
            "top_p": 0.9,
        },
    }
    try:
        resp = requests.post(OLLAMA_URL, json=payload, timeout=300)
        resp.raise_for_status()
        data = resp.json()
        return data.get("response", "").strip()
    except requests.ConnectionError:
        raise RuntimeError(
            "Cannot connect to Ollama. Make sure Ollama is running:\n"
            "  1. Install: https://ollama.com\n"
            "  2. Run:     ollama serve\n"
            "  3. Pull:    ollama pull mistral"
        )
    except requests.Timeout:
        raise RuntimeError("Ollama request timed out. Try a shorter transcript chunk.")


# ── Notes generation ─────────────────────────────────────────


def generate_notes_from_chunk(chunk: str, chunk_index: int, total_chunks: int) -> dict:
    """
    Generate structured high-yield notes from a single transcript chunk.
    Returns a dict with 'heading' and 'bullets'.
    """
    system = (
        "You are a medical educator extracting high-yield study notes for medical students. "
        "Be concise, clinically accurate, and use proper medical terminology."
    )
    prompt = (
        f"This is part {chunk_index + 1} of {total_chunks} from a medical lecture transcript.\n\n"
        f"TRANSCRIPT:\n{chunk}\n\n"
        "Extract HIGH-YIELD MEDICAL NOTES in this EXACT JSON format:\n"
        '{\n'
        '  "heading": "Main topic of this section",\n'
        '  "bullets": [\n'
        '    "Key point 1",\n'
        '    "Key point 2",\n'
        '    "Clinical pearl 3"\n'
        '  ]\n'
        '}\n\n'
        "Output ONLY valid JSON, no extra text."
    )
    raw = _call_ollama(prompt, system, max_tokens=1024)

    # Extract JSON from response (Ollama sometimes adds extra text)
    json_match = re.search(r'\{.*\}', raw, re.DOTALL)
    if json_match:
        try:
            return json.loads(json_match.group())
        except json.JSONDecodeError:
            pass

    # Fallback: build a simple structure from raw text
    lines = [l.strip().lstrip("•-* ") for l in raw.split("\n") if l.strip()]
    return {
        "heading": f"Section {chunk_index + 1}",
        "bullets": lines[:8],
    }


# ── Summary generation ────────────────────────────────────────


def generate_summary(full_transcript: str) -> str:
    """Generate a 3-paragraph summary of the full lecture."""
    system = "You are a medical educator summarizing a lecture for study purposes."
    # Use first 3000 chars to keep within context for summary
    snippet = full_transcript[:3000]
    prompt = (
        f"Summarize this medical lecture in 3 concise paragraphs covering:\n"
        f"1. Main topic and why it matters clinically\n"
        f"2. Key concepts covered\n"
        f"3. Clinical takeaways and exam-relevant points\n\n"
        f"TRANSCRIPT (excerpt):\n{snippet}"
    )
    return _call_ollama(prompt, system, max_tokens=600)


# ── Flashcard generation ──────────────────────────────────────


def generate_flashcards(full_transcript: str, max_cards: int = 15) -> list[dict]:
    """
    Generate Q&A flashcards from the transcript.
    Returns list of { front, back } dicts.
    """
    system = (
        "You are a medical educator creating revision flashcards. "
        "Each card must test a specific, exam-relevant clinical fact."
    )
    snippet = full_transcript[:4000]
    prompt = (
        f"Create {max_cards} high-yield MEDICAL FLASHCARDS from this lecture transcript.\n\n"
        f"TRANSCRIPT:\n{snippet}\n\n"
        f"Output ONLY a JSON array of objects:\n"
        f'[\n'
        f'  {{"front": "What is the first-line treatment for X?", "back": "Drug Y at Z dose"}},\n'
        f'  ...\n'
        f']\n\n'
        f"Each 'front' must be a precise clinical question. Each 'back' must be the concise correct answer. "
        f"Output ONLY valid JSON."
    )
    raw = _call_ollama(prompt, system, max_tokens=2000)

    json_match = re.search(r'\[.*\]', raw, re.DOTALL)
    if json_match:
        try:
            cards = json.loads(json_match.group())
            return [c for c in cards if "front" in c and "back" in c]
        except json.JSONDecodeError:
            pass

    # Fallback: parse "Q: ... A: ..." format
    cards = []
    blocks = re.split(r'\n(?=Q\d*:|front:)', raw, flags=re.IGNORECASE)
    for block in blocks:
        q_match = re.search(r'(?:Q\d*:|front:)\s*(.+)', block, re.IGNORECASE)
        a_match = re.search(r'(?:A\d*:|back:)\s*(.+)', block, re.IGNORECASE)
        if q_match and a_match:
            cards.append({"front": q_match.group(1).strip(), "back": a_match.group(1).strip()})
    return cards[:max_cards]


# ── MCQ Quiz generation ───────────────────────────────────────


def generate_quiz(full_transcript: str, num_questions: int = 10) -> list[dict]:
    """
    Generate MCQ quiz questions from the transcript.
    Returns list of { question, options[4], correct(int 0-3), explanation } dicts.
    """
    system = (
        "You are a medical educator creating challenging MCQ questions for medical students. "
        "All wrong options must be clinically plausible and similar to the correct answer."
    )
    snippet = full_transcript[:4000]
    prompt = (
        f"Create {num_questions} clinical MCQ questions from this medical lecture.\n\n"
        f"TRANSCRIPT:\n{snippet}\n\n"
        f"Output ONLY a JSON array:\n"
        f'[\n'
        f'  {{\n'
        f'    "question": "A patient presents with...",\n'
        f'    "options": ["Option A", "Option B", "Option C", "Option D"],\n'
        f'    "correct": 0,\n'
        f'    "explanation": "Option A is correct because..."\n'
        f'  }}\n'
        f']\n\n'
        f"'correct' is the 0-based index of the correct option. "
        f"Make distractors plausible. Output ONLY valid JSON."
    )
    raw = _call_ollama(prompt, system, max_tokens=3000)

    json_match = re.search(r'\[.*\]', raw, re.DOTALL)
    if json_match:
        try:
            questions = json.loads(json_match.group())
            return [
                q for q in questions
                if "question" in q and "options" in q and "correct" in q
            ]
        except json.JSONDecodeError:
            pass

    logger.warning("Quiz JSON parsing failed, returning empty quiz")
    return []


# ── Full pipeline ─────────────────────────────────────────────


def process_transcript(transcript: str, status_callback=None) -> dict:
    """
    Run the full Ollama content extraction pipeline on a cleaned transcript.
    Returns dict with notes, summary, flashcards, quiz.

    status_callback: optional callable(stage: str, progress: int)
    """
    def update(stage, pct):
        logger.info(f"[ollama] {stage} ({pct}%)")
        if status_callback:
            status_callback(stage, pct)

    from pipeline.cleaner import segment_transcript

    update("Generating summary", 60)
    summary = generate_summary(transcript)

    update("Generating notes", 70)
    chunks = segment_transcript(transcript)
    notes = []
    for i, chunk in enumerate(chunks):
        pct = 70 + int((i + 1) / len(chunks) * 10)
        update(f"Generating notes ({i + 1}/{len(chunks)})", pct)
        note = generate_notes_from_chunk(chunk, i, len(chunks))
        notes.append(note)

    update("Generating flashcards", 85)
    flashcards = generate_flashcards(transcript)

    update("Generating quiz", 93)
    quiz = generate_quiz(transcript)

    update("Done", 100)
    return {
        "summary": summary,
        "notes": notes,
        "flashcards": flashcards,
        "quiz": quiz,
    }
