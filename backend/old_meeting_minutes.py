# import subprocess
# import sys
# import os
# import re
# import json
# from flask import Flask, jsonify
# from utils import handle_errors  # Remove 'backend.'
# app = Flask(__name__)

# PROMPT_TEMPLATE = """
# You are an expert AI assistant that extracts the summary and action points from a meeting transcript with exceptional accuracy and clarity.

# ### **Rules:**

# - **Strictly return valid JSON.** The JSON object must contain two keys: "summary" and "action_points".
# - **No extra text, explanations, or formatting errors.** The output should contain ONLY the JSON object.
# - **Ensure proper JSON syntax.** The JSON object must be well-formed and parsable.
# - **Action Points:**
#     - **Extract ALL clear, actionable tasks directly derived from the transcript.** Do not miss any potential action points.
#     - **Action points should be specific, measurable, achievable, relevant, and time-bound (SMART).**
#     - **Action points should reflect actions to be taken AFTER the meeting, not requirements or qualifications.**
#     - **Do not include names, assignments, or roles.** Action points should be generic tasks.
#     - **Do not limit the number of action points.** Include as many as exist in the transcript.
#     - **Avoid vague or non-actionable items** like 'discussing' or 'considering'. Use strong verbs that indicate clear actions (e.g., 'Prepare the quarterly sales report', 'Submit the marketing campaign plan', 'Finalise the project timeline').
#     - **If the meeting focuses on defining requirements or gathering information, identify potential next steps or follow-up actions that should be taken.**
#     - **Use British English spelling and terminology.**
#     - **Ensure action points are standalone tasks** without references to specific individuals or assignments.
#     - **If no action points are found, return an empty list: `[]`**
# - **Summary:**
#     - **The summary must be a concise overview of key discussions**, capturing the essence of the meeting without verbatim transcript text.
#     - **The summary should focus on the purpose, key decisions, and outcomes of the meeting.**
#     - **The summary should be no more than 150 words.**
#     - **If no summary can be created, return an empty string: `""`**

# ### **Example Transcripts and Expected Outputs:**

# **The following examples are for demonstration purposes ONLY and should NOT be used as a template for the actual output.**

# **Example 1: Project Status Meeting**

# Speaker 1: Good morning, everyone. Let's start with project Alpha.
# Speaker 2: We're on track, but we need more testing resources.
# Speaker 3: I'll assign two more testers to the project.
# Speaker 1: Great. Next, let's discuss the marketing campaign.
# Speaker 4: We're planning a social media blitz next week.
# Speaker 1: Fantastic. Finally, let's review the budget.
# Speaker 5: We're slightly over budget, but we can make adjustments.

# ```json
# {
#     "summary": "The meeting covered the status of project Alpha, the marketing campaign, and the budget. Project Alpha needs more testing resources. The marketing campaign is planning a social media blitz. The budget is slightly over, but adjustments can be made.",
#     "action_points": [
#         "Assign two more testers to project Alpha",
#         "Plan a social media blitz next week",
#         "Review the budget and make adjustments"
#     ]
# }
# ```""".strip()


# def parse_teams_vtt(vtt_file: str) -> str:
#     """
#     Parses a Microsoft Teams .vtt file into a single string of plain text.
#     """
#     if not os.path.isfile(vtt_file):
#         print(f"Error: File '{vtt_file}' does not exist.")
#         sys.exit(1)

#     transcript_lines = []
#     speaker_pattern = re.compile(r"^(Speaker \d+):\s*(.*)$")

#     with open(vtt_file, "r", encoding="utf-8") as f:
#         for line in f:
#             line_stripped = line.strip()
#             if not line_stripped or "-->" in line_stripped or line_stripped.isdigit():
#                 continue
#             match = speaker_pattern.match(line_stripped)
#             if match:
#                 speaker, dialogue = match.groups()
#                 transcript_lines.append(f"{dialogue}")  # Only keep dialogue
#             else:
#                 transcript_lines.append(line_stripped)

#     return "\n".join(transcript_lines)


# def remove_ai_reasoning(ai_output: str) -> str:
#     """
#     Removes AI reasoning (<think>...</think>) from DeepSeek's response.
#     Ensures the JSON response starts correctly.
#     """
#     ai_output = re.sub(r"<think>[\s\S]*?</think>", "", ai_output, flags=re.DOTALL).strip()
#     json_match = re.search(r"\{[\s\S]*\}", ai_output)
#     return json_match.group(0) if json_match else "{}"


# def generate_meeting_minutes(transcript_text: str) -> dict:
#     """Runs AI model and extracts structured JSON meeting minutes."""
#     prompt = f"{PROMPT_TEMPLATE}\n\n{transcript_text}"

#     try:
#         result = subprocess.run(
#             ["ollama", "run", "deepseek-r1:1.5b"],
#             input=prompt,
#             text=True,
#             capture_output=True,
#             encoding="utf-8",
#             check=True
#         )
#     except FileNotFoundError:
#         return {}

#     ai_output = result.stdout.strip()
#     cleaned_json = remove_ai_reasoning(ai_output)

#     try:
#         structured_data = json.loads(cleaned_json)
#         structured_data["action_points"] = [
#             re.sub(r"(assigned to|for assistance in|led by) .*", "", item).strip()  # Remove any reference to names or assignments
#             for item in structured_data.get("action_points", [])
#             if isinstance(item, str) and not any(word in item.lower() for word in ["discussing", "considering"])
#         ]
#     except json.JSONDecodeError:
#         structured_data = {}

#     return structured_data


# def main():
#     if len(sys.argv) < 2:
#         sys.exit(1)

#     vtt_file = sys.argv[1]
#     transcript = parse_teams_vtt(vtt_file)
#     minutes_output = generate_meeting_minutes(transcript)
#     print(json.dumps(minutes_output, indent=4))


# if __name__ == "__main__":
#     main()

