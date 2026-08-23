from google import genai

from app.core.config import settings
from app.schemas.summary import MeetingSummary


class GeminiSummarizationProvider:

    def __init__(self) -> None:
        self.client = genai.Client(
            api_key=settings.gemini_api_key
        )

    def summarize(self, transcript: str) -> MeetingSummary:

        prompt = f"""
You are a professional meeting analysis assistant.

Analyze the meeting transcript below.

Extract:

1. A concise meeting summary.
2. The most important key points.
3. Concrete action items.

Rules:

- Only use information explicitly supported by the transcript.
- Do not invent people.
- Do not invent deadlines.
- Do not invent decisions.
- Do not invent action items.
- If an assignee is not explicitly mentioned, return null.
- If a deadline is not explicitly mentioned, return null.
- Do not convert general discussion into an action item.
- Keep the output factual and concise.

Meeting transcript:

{transcript}
"""

        try:
            response = self.client.models.generate_content(
                model="gemini-3.6-flash",
                contents=prompt,
                config={
                    "response_mime_type": "application/json",
                    "response_schema": MeetingSummary,
                },
            )

            return MeetingSummary.model_validate_json(
                response.text
            )

        except Exception as exc:
            print(f"Gemini error: {type(exc).__name__}: {exc}")

            raise RuntimeError(
                "Gemini meeting summarization failed."
            ) from exc