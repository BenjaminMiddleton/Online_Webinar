import os
import sys
import pytest
from unittest.mock import patch, MagicMock

# Add the project root directory to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Now import can find the backend module
from backend.meeting_minutes import generate_meeting_minutes

# Mock the OpenAI API client for testing
@pytest.fixture
def mock_openai():
    with patch('backend.meeting_minutes.OpenAI') as mock_openai:
        # Configure the mock to return appropriate responses
        mock_client = MagicMock()
        mock_response = MagicMock()
        mock_response.choices = [MagicMock()]
        mock_response.choices[0].message.content = '{"summary": "Test summary", "action_points": ["Test action"]}'
        mock_client.chat.completions.create.return_value = mock_response
        mock_openai.return_value = mock_client
        yield mock_openai

def test_meeting_minutes_generation(mock_openai):
    """Test meeting minutes generation with mock API"""
    # Set an environment variable for the test
    os.environ['OPENAI_MODEL'] = 'gpt-4o'
    
    test_transcript = """
    Speaker 1: Let's discuss the project timeline.
    Speaker 2: We need to finish by next week.
    Speaker 1: I'll assign tasks tomorrow.
    """
    
    result = generate_meeting_minutes(test_transcript)
    assert 'title' in result
    assert 'summary' in result
    assert 'action_points' in result
    assert isinstance(result['action_points'], list)

def test_meeting_minutes_error_handling():
    """Test error handling in minutes generation"""
    # Test empty transcript
    empty_result = generate_meeting_minutes("")
    assert empty_result['summary'] == ""
    assert empty_result['action_points'] == []
    
    # Test None input
    none_result = generate_meeting_minutes(None)
    assert none_result['summary'] == ""
    assert none_result['action_points'] == []

def test_get_token_param_name():
    """Test get_token_param_name function"""
    from backend.meeting_minutes import get_token_param_name
    assert get_token_param_name("gpt-3.5-turbo") == "max_tokens"
    assert get_token_param_name("gpt-4o") == "max_completion_tokens"