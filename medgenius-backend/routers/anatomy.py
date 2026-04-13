"""
MEDGENIUS — Anatomy Image Generation Proxy
Routes HuggingFace image generation requests through the backend
to avoid browser CORS restrictions.
"""

import os
import base64
import httpx
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

router = APIRouter()

# Hugging Face model fallback chain (router.huggingface.co — new endpoint)
# SD v1.5 was removed (410 Gone); FLUX Schnell is the fastest free option
HF_MODELS = [
    "black-forest-labs/FLUX.1-schnell",
    "stabilityai/stable-diffusion-xl-base-1.0",
    "stabilityai/stable-diffusion-2-1",
]

# New base URL — api-inference.huggingface.co is no longer supported
HF_BASE_URL = "https://router.huggingface.co/hf-inference/models"

HF_API_KEY = os.environ.get("HF_API_KEY", "")



class AnatomyImageRequest(BaseModel):
    topic: str
    hf_api_key: str = ""  # Allow client to pass key if server env not set



@router.post("/generate-image")
async def generate_anatomy_image(req: AnatomyImageRequest):
    """
    Generate a medical anatomy image using HuggingFace models.
    Returns the image as a base64 encoded string.
    """
    api_key = req.hf_api_key or HF_API_KEY
    if not api_key or api_key == "your_huggingface_api_key_here":
        raise HTTPException(
            status_code=400,
            detail="HuggingFace API key is missing. Set HF_API_KEY in backend .env or provide it in the request."
        )

    # Base prompt describing the style
    enhanced_prompt = (
        f"Create a high-quality medical textbook illustration of {req.topic}. "
        "Requirements:"
        " • Style: professional medical textbook diagram"
        " • Perspective: clear cross-section or anatomical view"
        " • Background: plain white educational background"
        " • Clarity: each structure clearly separated and easy to study"
        " • Color scheme: realistic anatomical colors used in medical textbooks"
        " • Resolution: high resolution educational diagram"
        " • No artistic or stylized rendering"
        " • Do NOT include any textual labels, arrows, or annotations in the image – it must be a clean textbook diagram without text."
    )




    last_error = None

    async with httpx.AsyncClient(timeout=120.0) as client:
        for model in HF_MODELS:
            try:
                num_steps = 4 if "schnell" in model else 25
                response = await client.post(
                    f"{HF_BASE_URL}/{model}",
                    headers={
                        "Authorization": f"Bearer {api_key}",
                        "Content-Type": "application/json",
                    },
                    json={
                        "inputs": enhanced_prompt,
                        "parameters": {
                            "guidance_scale": 7.5,
                            "num_inference_steps": num_steps,
                        },
                    },
                )

                if response.status_code in (503, 429):
                    last_error = f"Model {model} unavailable (status {response.status_code}), trying next..."
                    continue

                if not response.is_success:
                    last_error = f"Model {model} error: {response.status_code} — {response.text[:200]}"
                    continue

                image_bytes = response.content
                if not image_bytes:
                    last_error = f"Model {model} returned empty image"
                    continue

                image_b64 = base64.b64encode(image_bytes).decode("utf-8")

                # Detect MIME type from content-type header
                ct = response.headers.get("content-type", "image/jpeg")
                mime = ct.split(";")[0].strip() if ct else "image/jpeg"

                response_data = {
                    "success": True,
                    "image_b64": image_b64,
                    "mime_type": mime,
                    "model_used": model,
                }
                
                return response_data

            except httpx.TimeoutException:
                last_error = f"Model {model} timed out"
                continue
            except Exception as e:
                last_error = f"Model {model} failed: {str(e)}"
                continue

    raise HTTPException(
        status_code=502,
        detail=f"All image generation models failed. Last error: {last_error}"
    )
