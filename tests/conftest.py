import os
import sys
import pytest
from flask import Flask

# Add the parent directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from backend.app import create_app
from backend.config import Config

class TestConfig(Config):
    """Test configuration."""
    def __init__(self):
        # Override required vars for testing
        self.required_vars = []  # No required vars in test mode
        self.SECRET_KEY = 'test-key'
        self.UPLOAD_FOLDER = 'test-uploads'
        self.DEBUG = True
        self.TESTING = True
        self.LOG_LEVEL = 'DEBUG'
        # Create test upload folder
        os.makedirs(self.UPLOAD_FOLDER, exist_ok=True)

@pytest.fixture
def app():
    """Create and configure a Flask app for testing."""
    app, socketio = create_app(TestConfig())
    
    # Create a test context
    with app.app_context():
        yield app
        
    # Clean up test upload folder
    test_upload_folder = app.config['UPLOAD_FOLDER']
    if os.path.exists(test_upload_folder):
        for file in os.listdir(test_upload_folder):
            os.remove(os.path.join(test_upload_folder, file))
        os.rmdir(test_upload_folder)

@pytest.fixture
def client(app):
    """A test client for the app."""
    return app.test_client()

@pytest.fixture(autouse=True)
def cleanup_jobs():
    yield
    from backend.cleanup import run_cleanup
    run_cleanup(
        job_results_dir='job_results',
        completed_job_retention_hours=0,
        interrupted_job_retention_minutes=0
    )