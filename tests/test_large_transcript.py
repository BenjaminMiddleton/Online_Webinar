import pytest
from backend.meeting_minutes import generate_meeting_minutes

def fake_call_openai_api_fail(client, params):
    # Simulate API failure by always raising an exception
    raise Exception("Simulated API failure for large transcript")

def fake_call_openai_api_success(client, params):
    # Return a valid JSON response (simulate a successful API call)
    return '{"summary": "This is a large transcript summary generated from a very large transcript. It covers all the major discussion points.", "action_points": ["Action 1", "Action 2"]}'

def test_large_transcript_api_error(monkeypatch):
    # Create an extremely large transcript (simulate many sentences)
    large_transcript = "This is a test sentence. " * 10000  # large transcript
    
    # Monkeypatch call_openai_api to use the failing version
    from backend import meeting_minutes
    monkeypatch.setattr(meeting_minutes, "call_openai_api", fake_call_openai_api_fail)
    
    # Generate meeting minutes with the large transcript
    minutes = generate_meeting_minutes(large_transcript, speakers=["Speaker 1"], duration_seconds=3600)
    
    # Print summary output for debugging
    print("Summary output:", minutes["summary"])
    
    # Verify that fallback minutes are returned: empty summary and empty action_points
    assert minutes["summary"] == ""
    assert minutes["action_points"] == []
    assert minutes["transcription"] == large_transcript
    assert minutes["duration"] == "01:00:00"

def test_large_transcript_summary(monkeypatch):
    # Create a very large valid fake transcript
    large_transcript = ("In today's meeting, we discussed important strategies for growth. " * 5000).strip()
    
    # Monkeypatch call_openai_api to use the successful version
    from backend import meeting_minutes
    monkeypatch.setattr(meeting_minutes, "call_openai_api", fake_call_openai_api_success)
    
    # Generate meeting minutes with the large transcript
    minutes = generate_meeting_minutes(large_transcript, speakers=["Speaker 1"], duration_seconds=7200)
    
    # Print summary output for debugging
    print("Summary output:", minutes["summary"])
    
    # Assert that the returned summary matches the fake response data
    assert minutes["summary"] == "This is a large transcript summary generated from a very large transcript. It covers all the major discussion points."
    assert minutes["action_points"] == ["Action 1", "Action 2"]
    assert minutes["duration"] == "02:00:00"
