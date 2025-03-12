import os
import pytest
from flask.testing import FlaskClient
from io import BytesIO

def test_upload_and_processing_flow(client: FlaskClient):
    """Test the complete flow from file upload through processing."""
    # Create a mock audio file
    audio_data = BytesIO(b"mock audio data")
    audio_data.name = "test_meeting.wav"
    
    # Upload the file
    response = client.post(
        '/upload',
        data={
            'file': (audio_data, 'test_meeting.wav')
        },
        content_type='multipart/form-data'
    )
    
    assert response.status_code == 200
    json_data = response.get_json()
    assert 'job_id' in json_data
    assert json_data['status'] == 'processing'
    
    job_id = json_data['job_id']
    
    # Now check job status (would need polling in a real test)
    status_response = client.get(f'/job_status/{job_id}')
    assert status_response.status_code == 200
    
    # Verify some job data is returned
    job_data = status_response.get_json()
    assert 'status' in job_data
    assert job_data['job_id'] == job_id