import pytest
from unittest.mock import patch, MagicMock
import os
import sys

# Add the project root directory to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Now import can find the backend module
from backend.teams_integration import get_active_meetings, get_meeting_details

@pytest.fixture
def mock_access_token():
    """Fixture to mock the get_access_token function."""
    with patch('backend.teams_integration.get_access_token') as mock:
        mock.return_value = "test_access_token"
        yield mock

def test_get_active_meetings_success(mock_access_token):
    """Test successful retrieval of active meetings."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"value": [{"id": "123", "subject": "Test Meeting"}]}
    
    with patch('requests.get', return_value=mock_response) as mock_get:
        meetings = get_active_meetings()
        assert len(meetings) == 1
        assert meetings[0]["id"] == "123"
        assert meetings[0]["subject"] == "Test Meeting"
        mock_get.assert_called_once()

def test_get_active_meetings_failure(mock_access_token):
    """Test handling of failed retrieval of active meetings."""
    mock_response = MagicMock()
    mock_response.status_code = 400
    
    with patch('requests.get', return_value=mock_response) as mock_get:
        meetings = get_active_meetings()
        assert len(meetings) == 0
        mock_get.assert_called_once()

def test_get_meeting_details_success(mock_access_token):
    """Test successful retrieval of meeting details."""
    mock_response = MagicMock()
    mock_response.status_code = 200
    mock_response.json.return_value = {"id": "123", "subject": "Test Meeting Details"}
    
    with patch('requests.get', return_value=mock_response) as mock_get:
        details = get_meeting_details("123")
        assert details["id"] == "123"
        assert details["subject"] == "Test Meeting Details"
        mock_get.assert_called_once()

def test_get_meeting_details_failure(mock_access_token):
    """Test handling of failed retrieval of meeting details."""
    mock_response = MagicMock()
    mock_response.status_code = 404
    
    with patch('requests.get', return_value=mock_response) as mock_get:
        details = get_meeting_details("123")
        assert details is None
        mock_get.assert_called_once()
