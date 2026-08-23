import json

from app.services.summarization.gemini import (
    GeminiSummarizationProvider,
)


with open(
    "storage/transcription_results/0.json",
    "r",
    encoding="utf-8",
) as file:
    data = json.load(file)


transcript = data["transcript"]

print(f"Transcript length: {len(transcript)} characters")


provider = GeminiSummarizationProvider()

result = provider.summarize(transcript)


print("\nSUMMARY")
print(result.summary)


print("\nKEY POINTS")

for point in result.key_points:
    print("-", point)


print("\nACTION ITEMS")

for item in result.action_items:
    print("-", item.task)
    print("  Assignee:", item.assignee)
    print("  Deadline:", item.deadline)