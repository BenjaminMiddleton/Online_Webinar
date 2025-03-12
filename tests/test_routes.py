import os
import json
import pytest
from io import BytesIO
import tempfile
from pydub import AudioSegment

@pytest.fixture(autouse=True)
def setup_models():
    """Initialize models before running tests"""
    from backend.speaker_diarization import load_models
    load_models()

def test_health_endpoint(client):
    """Test the health check endpoint."""
    response = client.get('/health')
    assert response.status_code == 200
    data = json.loads(response.data)
    assert data['status'] == 'healthy'

def test_export_endpoint(client):
    """Test the document export endpoint."""
    test_data = {
        "title": "Test Meeting",
        "summary": "Test summary",
        "action_points": ["Point 1", "Point 2"],
        "transcription": "Test transcript",
        "duration": "300"  # Confirmed correct as string
    }
    
    # Test PDF export
    response = client.post(
        '/export/pdf',
        json=test_data,  # Use json parameter instead of manually serializing
        content_type='application/json'
    )
    assert response.status_code == 200
    assert response.headers['Content-Type'] == 'application/pdf'

def test_upload_vtt(client, app):
    """Test VTT file upload and processing."""
    test_vtt = b"""WEBVTT

1
00:00:00.000 --> 00:00:05.000
Speaker 1: This is a test transcript.

2
00:00:05.000 --> 00:00:10.000
Speaker 2: Testing the upload functionality."""

    response = client.post(
        '/upload',
        data={
            'file': (BytesIO(test_vtt), 'test.vtt')
        },
        content_type='multipart/form-data'
    )
    
    assert response.status_code == 200
    data = json.loads(response.data)
    assert 'summary' in data
    assert 'action_points' in data
    assert 'transcription' in data

def test_meeting_minutes_generation():
    """Test meeting minutes generation"""
    from backend.meeting_minutes import generate_meeting_minutes
    test_transcript = "This is a test meeting transcript"
    result = generate_meeting_minutes(test_transcript)
    assert "title" in result
    assert "summary" in result
    assert "action_points" in result

def test_speaker_diarization():
    """Test speaker diarization"""
    from backend.speaker_diarization import diarize_audio
    # Create temporary directory with write permissions
    with tempfile.TemporaryDirectory() as temp_dir:
        audio_path = os.path.join(temp_dir, "test.wav")
        # Create test audio file
        audio = AudioSegment.silent(duration=1000)
        audio.export(audio_path, format='wav')
        # Test diarization
        transcript, speakers = diarize_audio(audio_path)
        assert isinstance(transcript, str)
        assert isinstance(speakers, list)

def test_upload_endpoint(client):
    """Test file upload endpoint"""
    # Test VTT upload
    with open('sample_data/sample_meeting_10min.vtt', 'rb') as f:
        data = {'file': (BytesIO(f.read()), 'test.vtt')}
        response = client.post('/upload', data=data)
        assert response.status_code == 200
        result = json.loads(response.data)
        assert 'summary' in result
        assert 'action_points' in result

    # Test invalid file
    data = {'file': (BytesIO(b'invalid'), 'test.txt')}
    response = client.post('/upload', data=data)
    assert response.status_code == 400