import pytest
import os
import sys
from unittest.mock import patch, MagicMock
import io
#...
import pytest
import os
import sys
from unittest.mock import patch, MagicMock

# Add the project root directory to the Python path
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Now import can find the backend module
from backend.process_audio_standalone import process_audio_file_standalone

@pytest.fixture
def mock_process_audio():
    """Fixture to mock the process_audio_file_standalone function."""
    with patch('backend.process_audio_standalone.process_audio_file_standalone') as mock:
        def side_effect(audio_path):
            print("Processing completed successfully!")
            print(f"Output file: /path/to/fake_output.pdf")
            return "/path/to/fake_output.pdf"
        mock.side_effect = side_effect
        yield mock

def test_process_audio_file_standalone_success(mock_process_audio, monkeypatch):
    """Test successful execution of process_audio_file_standalone."""
    # Set command-line args if needed (here we pass the audio path directly to the function)
    monkeypatch.setattr(sys, 'argv', ['process_audio_standalone.py', 'path/to/audio.mp3'])
    
    from backend import process_audio_standalone
    with patch('sys.stdout', new_callable=io.StringIO) as mock_stdout:
        result = process_audio_standalone.process_audio_file_standalone('path/to/audio.mp3')
    
    mock_process_audio.assert_called_once()
    output = mock_stdout.getvalue()
    assert "Processing completed successfully!" in output
    assert "Output file: /path/to/fake_output.pdf" in output

def test_process_audio_file_standalone_file_not_found(monkeypatch):
    """Test handling of file not found in process_audio_file_standalone."""
    monkeypatch.setattr(sys, 'argv', ['process_audio_standalone.py', 'nonexistent_file.mp3'])
    
    with patch('sys.stdout', new_callable=io.StringIO) as mock_stdout:
        from backend import process_audio_standalone
        process_audio_standalone.process_audio_file_standalone('nonexistent_file.mp3')
    
    output = mock_stdout.getvalue()
    assert "Error: File not found at" in output
