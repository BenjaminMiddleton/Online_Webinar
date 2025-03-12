import pytest
import os
from backend.config import Config

def test_config_loading():
    """Test config validation and loading"""
    # Set required env vars
    os.environ["HF_TOKEN"] = "test_token"
    os.environ["OPENAI_API_KEY"] = "test_key"
    os.environ["FLASK_DEBUG"] = "true"
    os.environ["FLASK_TESTING"] = "true"
    
    config = Config()
    
    # Test basic attributes
    assert hasattr(config, 'SECRET_KEY')
    assert hasattr(config, 'UPLOAD_FOLDER')
    assert hasattr(config, 'DEBUG')
    assert hasattr(config, 'TESTING')

    # Test values
    assert config.DEBUG is True
    assert config.TESTING is True
    assert config.UPLOAD_FOLDER == "uploads"

def test_config_validation():
    """Test environment variable validation"""
    # Set required vars to empty strings
    os.environ["HF_TOKEN"] = ""
    os.environ["OPENAI_API_KEY"] = ""
    os.environ["FLASK_TESTING"] = "false"  # Ensure not in testing mode

    # Add debug output
    print(f"FLASK_TESTING value: {os.environ.get('FLASK_TESTING')}")
    print(f"Required vars present: HF_TOKEN={os.environ.get('HF_TOKEN')}, OPENAI_API_KEY={os.environ.get('OPENAI_API_KEY')}")

    with pytest.raises(ValueError, match="Missing required environment variables"):
        Config()