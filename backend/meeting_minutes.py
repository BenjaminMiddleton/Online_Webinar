import os
import re
import sys
import json
import logging
import time
from datetime import datetime
from openai import OpenAI
from dotenv import load_dotenv
from flask import Flask
from tenacity import retry, stop_after_attempt, wait_exponential, retry_if_exception_type

try:
    import tiktoken  # Ensure you have installed 'tiktoken' via your requirements (pip install tiktoken)
    TIKTOKEN_AVAILABLE = True
except ImportError:
    TIKTOKEN_AVAILABLE = False

load_dotenv()

# Change default model to use gpt-4o instead of gpt-4-turbo
DEFAULT_MODEL = os.getenv("OPENAI_MODEL", "gpt-4o")
MODEL_CONTEXT_LIMIT = int(os.getenv("MODEL_CONTEXT_LIMIT", "8000"))
MAX_OUTPUT_TOKENS = int(os.getenv("MAX_OUTPUT_TOKENS", "800"))

app = Flask(__name__)
logger = logging.getLogger(__name__)
MAX_RETRIES = 3

PROMPT_TEMPLATE = """
You are an expert AI assistant that extracts the summary and action points from a meeting transcript with exceptional accuracy and clarity.
Always respond in British English.
### **Rules:**
- **Strictly return valid JSON.** The JSON object must contain two keys: "summary" and "action_points".
- **No extra text, explanations, or formatting errors.** The output should contain ONLY the JSON object.
- **Ensure proper JSON syntax.** The JSON object must be well-formed and parsable.
- **Action Points:**
    - **Extract ALL clear, actionable tasks directly derived from the transcript.** Do not miss any potential action points.
    - **Action points should be specific, measurable, achievable, relevant, and time-bound (SMART).**
    - **Action points should reflect actions to be taken AFTER the meeting, not requirements or qualifications.**
    - **Do not include names, assignments, or roles.** Action points should be generic tasks.
    - **Do not limit the number of action points.** Include as many as exist in the transcript.
    - **Avoid vague or non-actionable items** like 'discussing' or 'considering'. Use strong verbs that indicate clear actions (e.g., 'Prepare the quarterly sales report', 'Submit the marketing campaign plan', 'Finalise the project timeline').
    - **If the meeting focuses on defining requirements or gathering information, identify potential next steps or follow-up actions that should be taken.**
    - **Use British English spelling and terminology.**
    - **Ensure action points are standalone tasks** without references to specific individuals or assignments.
    - **If no action points are found, return an empty list: `[]`**
- **Summary:**
    - **The summary must be a concise overview of key discussions**, capturing the essence of the meeting without verbatim transcript text.
    - **The summary should focus on the purpose, key decisions, and outcomes of the meeting.**
    - **The summary should be no more than 150 words.**
    - **If no summary can be created, return an empty string: `""`**
### **Example Transcripts and Expected Outputs:**
**The following examples are for demonstration purposes ONLY and should NOT be used as a template for the actual output.**
**Example 1: Project Status Meeting**
Speaker 1: Good morning, everyone. Let's start with project Alpha.
Speaker 2: We're on track, but we need more testing resources.
Speaker 3: I'll assign two more testers to the project.
Speaker 1: Great. Next, let's discuss the marketing campaign.
Speaker 4: We're planning a social media blitz next week.
Speaker 1: Fantastic. Finally, let's review the budget.
Speaker 5: We're slightly over budget, but we can make adjustments.
```json
{
    "summary": "The meeting covered the status of project Alpha, the marketing campaign, and the budget. Project Alpha needs more testing resources. The marketing campaign is planning a social media blitz. The budget is slightly over, but adjustments can be made.",
    "action_points": [
        "Assign two more testers to project Alpha",
        "Plan a social media blitz next week",
        "Review the budget and make adjustments"
    ]
}
```""".strip()

def estimate_tokens(text: str) -> int:
    if not text:
        return 0
    if TIKTOKEN_AVAILABLE:
        try:
            encoding = tiktoken.get_encoding("cl100k_base")
            return len(encoding.encode(text))
        except Exception as e:
            logger.warning(f"Error using tiktoken: {str(e)}. Falling back.")
    return len(text) // 4

def get_token_param_name(model: str) -> str:
    newer_models = ['o3', 'gpt-4o', 'gpt-4.5']
    if any(m in model for m in newer_models):
        return "max_completion_tokens"
    else:
        return "max_tokens"

def model_supports_temperature(model_name: str) -> bool:
    return not ('o3-mini' in model_name.lower())

def parse_teams_vtt(vtt_file: str) -> tuple[str, list[str]]:
    if not os.path.isfile(vtt_file):
        logger.error(f"File '{vtt_file}' does not exist.")
        return "", []
    transcript_lines = []
    speakers = set()
    speaker_patterns = [
        re.compile(r"^(Speaker \d+):\s*(.*)$"),
        re.compile(r"^(Person [A-Z].*?):\s*(.*)$"),
        re.compile(r"^([^:]+):\s*(.*)$")
    ]
    with open(vtt_file, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or "-->" in line or line.isdigit() or line == "WEBVTT":
                continue
            matched = False
            for pattern in speaker_patterns:
                match = pattern.match(line)
                if match:
                    speaker, dialogue = match.groups()
                    speakers.add(speaker.strip())
                    transcript_lines.append(f"{speaker}: {dialogue}")
                    matched = True
                    break
            if not matched:
                transcript_lines.append(line)
    transcript_text = " ".join(l for l in transcript_lines if l.strip())
    return transcript_text, sorted(list(speakers))

def chunk_transcript(transcript_text: str, max_chunk_tokens: int = 6000, overlap_tokens: int = 250) -> list[str]:
    logger.info(f"Chunking transcript of {len(transcript_text)} chars (est. {estimate_tokens(transcript_text)} tokens)")
    estimated_total_tokens = estimate_tokens(transcript_text)
    if estimated_total_tokens <= max_chunk_tokens:
        logger.info("Transcript fits in single chunk")
        return [transcript_text]
    paragraphs = transcript_text.split('\n')
    chunks = []
    current_chunk = []
    current_length = 0
    overlap_text = ""
    for paragraph in paragraphs:
        if not paragraph.strip():
            continue
        tokens = estimate_tokens(paragraph)
        if current_length + tokens > max_chunk_tokens and current_chunk:
            chunks.append('\n'.join(current_chunk))
            if overlap_tokens > 0 and overlap_text:
                current_chunk = [overlap_text]
                current_length = estimate_tokens(overlap_text)
            else:
                current_chunk = []
                current_length = 0
            current_chunk.append(paragraph)
            current_length += tokens
            overlap_text = paragraph
        elif tokens > max_chunk_tokens:
            sentences = re.split(r'(?<=[.!?])\s+', paragraph)
            for sentence in sentences:
                s_tokens = estimate_tokens(sentence)
                if current_length + s_tokens <= max_chunk_tokens:
                    current_chunk.append(sentence)
                    current_length += s_tokens
                    overlap_text = sentence
                else:
                    if current_chunk:
                        chunks.append('\n'.join(current_chunk))
                    current_chunk = [sentence]
                    current_length = s_tokens
                    overlap_text = sentence
        else:
            current_chunk.append(paragraph)
            current_length += tokens
            if estimate_tokens(paragraph) <= overlap_tokens:
                overlap_text = paragraph
            else:
                sentences = re.split(r'(?<=[.!?])\s+', paragraph)
                candidate = ""
                for s in reversed(sentences):
                    if estimate_tokens(s + " " + candidate) <= overlap_tokens:
                        candidate = s + " " + candidate
                    else:
                        break
                if candidate:
                    overlap_text = candidate.strip()
    if current_chunk:
        chunks.append('\n'.join(current_chunk))
    max_chunks = 12
    if len(chunks) > max_chunks:
        logger.warning(f"Consolidating {len(chunks)} chunks to {max_chunks}")
        target = len(chunks) // max_chunks + (1 if len(chunks) % max_chunks > 0 else 0)
        consolidated = []
        for i in range(0, len(chunks), target):
            group = chunks[i:i+target]
            consolidated.append('\n'.join(group))
            if len(consolidated) >= max_chunks:
                break
        return consolidated
    return chunks

@retry(stop=stop_after_attempt(MAX_RETRIES), wait=wait_exponential(multiplier=1, min=2, max=30),
       retry=retry_if_exception_type((json.JSONDecodeError, ValueError)))
def call_openai_api(client, params):
    # ...existing cache code omitted for brevity...
    try:
        response = client.chat.completions.create(**params)
        content = response.choices[0].message.content.strip()
        logger.debug(f"API response preview: {content[:100]}...")
        return content
    except Exception as e:
        logger.error(f"API call error: {type(e).__name__}: {str(e)}")
        raise

def parse_json_response(content):
    try:
        logger.debug(f"Parsing JSON response of length: {len(content)}")
        json_match = re.search(r'(\{.*\})', content, re.DOTALL)
        if json_match:
            json_str = json_match.group(1)
            return json.loads(json_str)
        return json.loads(content)
    except json.JSONDecodeError as je:
        logger.error(f"JSON decode error: {str(je)}; content: {content[:200]}")
        return {}
    except Exception as e:
        logger.error(f"Error parsing response: {type(e).__name__}: {str(e)}")
        return {}

def create_fallback_meeting_minutes(transcript: str, speakers: list = None, duration_seconds: float = 0) -> dict:
    return {
        "title": "",
        "duration": format_duration(duration_seconds),
        "summary": "",
        "action_points": [],
        "transcription": transcript,
        "speakers": speakers if speakers else []
    }

def format_duration(duration_seconds: float) -> str:
    try:
        if (duration_seconds >= 3600):
            hours = int(duration_seconds // 3600)
            minutes = int((duration_seconds % 3600) // 60)
            seconds = int(duration_seconds % 60)
            return f"{hours:02d}:{minutes:02d}:{seconds:02d}"
        else:
            minutes = int(duration_seconds // 60)
            seconds = int(duration_seconds % 60)
            return f"{minutes:02d}:{seconds:02d}"
    except Exception as e:
        logger.error(f"Error formatting duration: {str(e)}")
        return "00:00"

def format_timestamp_for_title():
    return datetime.now().strftime("%d %b %Y %H:%M")

def generate_meeting_minutes(transcript: str, speakers: list = None, duration_seconds: float = 0) -> dict:
    try:
        if not transcript:
            return create_fallback_meeting_minutes(transcript, speakers, duration_seconds)
        api_key = os.getenv("OPENAI_API_KEY")
        if not api_key:
            logger.error("OpenAI API key not found")
            return create_fallback_meeting_minutes(transcript, speakers, duration_seconds)
        model_name = DEFAULT_MODEL
        estimated_transcript_tokens = estimate_tokens(transcript)
        token_param = get_token_param_name(model_name)
        client = OpenAI(api_key=api_key)
        
        # Extract title using a small sample of the transcript
        title_params = {
            "model": model_name,
            "messages": [
                {"role": "system", "content": "Extract a concise title from this transcript (max 8 words)."},
                {"role": "user", "content": transcript[:1000]}
            ],
            token_param: 20,
        }
        if model_supports_temperature(model_name):
            title_params["temperature"] = 0.3
        try:
            title_content = call_openai_api(client, title_params)
            title = title_content.strip().strip('"')
        except Exception as title_err:
            logger.error(f"Title generation failed: {str(title_err)}")
            title = f"Meeting {format_timestamp_for_title()}"
        
        duration = format_duration(duration_seconds)
        safe_chunk_size = min(MODEL_CONTEXT_LIMIT - MAX_OUTPUT_TOKENS, 3000)
        if estimated_transcript_tokens > safe_chunk_size:
            logger.info(f"Transcript too large ({estimated_transcript_tokens} tokens) – processing in two stages...")
            chunks = chunk_transcript(transcript, max_chunk_tokens=safe_chunk_size, overlap_tokens=250)
            per_chunk_summaries = []
            chunk_actions = []
            for i, chunk in enumerate(chunks):
                chunk_position = "beginning" if i == 0 else ("end" if i == len(chunks)-1 else "middle")
                params = {
                    "model": model_name,
                    "messages": [
                        {"role": "system", "content": f"Extract a brief summary and any action points from this {chunk_position} part of transcript. Return JSON with 'summary' and 'action_points'."},
                        {"role": "user", "content": chunk}
                    ],
                    token_param: MAX_OUTPUT_TOKENS,
                }
                if model_supports_temperature(model_name):
                    params["temperature"] = 0.3
                try:
                    content = call_openai_api(client, params)
                    result = parse_json_response(content)
                    if result:
                        chunk_summary = result.get("summary", "").strip()
                        if chunk_summary:
                            per_chunk_summaries.append(chunk_summary)
                        if isinstance(result.get("action_points"), list):
                            chunk_actions.extend(result.get("action_points"))
                except Exception as e:
                    logger.error(f"Error processing chunk {i+1}: {str(e)}")
            if not per_chunk_summaries:
                # Fallback: return empty summary and action points
                return create_fallback_meeting_minutes(transcript, speakers, duration_seconds)
            joined_summary = " ".join(per_chunk_summaries)
            final_params = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": "Based on the following aggregated chunk summaries, generate the final meeting minutes. Return JSON with 'summary' and 'action_points'."},
                    {"role": "user", "content": joined_summary}
                ],
                token_param: MAX_OUTPUT_TOKENS,
            }
            if model_supports_temperature(model_name):
                final_params["temperature"] = 0.3
            final_content = call_openai_api(client, final_params)
            final_result = parse_json_response(final_content)
            final_summary = final_result.get("summary", "").strip()
            final_actions = final_result.get("action_points", [])
            if not final_summary:
                final_summary = "A summary could not be generated due to API limitations. Please check the transcript for meeting content."
            final_data = {
                "title": title,
                "duration": duration,
                "summary": final_summary,
                "action_points": list(dict.fromkeys(chunk_actions)) if chunk_actions else final_actions,
                "transcription": transcript,
                "speakers": speakers if speakers else []
            }
            return final_data
        else:
            params = {
                "model": model_name,
                "messages": [
                    {"role": "system", "content": "Extract meeting summary and action points. Return JSON with 'summary' and 'action_points'."},
                    {"role": "user", "content": transcript}
                ],
                token_param: MAX_OUTPUT_TOKENS,
            }
            if model_supports_temperature(model_name):
                params["temperature"] = 0.3
            content = call_openai_api(client, params)
            res = parse_json_response(content)
            final_data = {
                "title": title,
                "duration": duration,
                "summary": res.get("summary", ""),
                "action_points": res.get("action_points", []),
                "transcription": transcript,
                "speakers": speakers if speakers else []
            }
            return final_data
    except Exception as e:
        logger.error(f"Error generating meeting minutes: {str(e)}", exc_info=True)
        return create_fallback_meeting_minutes(transcript, speakers, duration_seconds)

def main():
    if len(sys.argv) < 2:
        print("Usage: meeting_minutes.py <vtt_file>")
        return
    vtt_file = sys.argv[1]
    transcript, speakers = parse_teams_vtt(vtt_file)
    minutes = generate_meeting_minutes(transcript, speakers=speakers, duration_seconds=0)
    print(json.dumps(minutes, indent=2))

if __name__ == "__main__":
    main()

