import os
import logging
from dotenv import load_dotenv
from dataclasses import dataclass, field
from typing import Set, Dict, Any, Optional

load_dotenv()

@dataclass
class AppConfig:
    """Application configuration parameters."""
    SECRET_KEY: str
    UPLOAD_FOLDER: str
    ALLOWED_AUDIO_EXTENSIONS: Set[str] = field(default_factory=lambda: {'wav', 'mp3', 'ogg', 'm4a'})
    ALLOWED_TRANSCRIPT_EXTENSIONS: Set[str] = field(default_factory=lambda: {'vtt'})
    ALLOWED_VTT_EXTENSIONS: Set[str] = field(default_factory=lambda: {'vtt'})  # Added for VTT files
    MAX_CONTENT_LENGTH: int = 100 * 1024 * 1024  # 100MB limit
    CHUNK_LENGTH_MS: int = 30000
    OVERLAP_MS: int = 2000
    LOG_LEVEL: str = "INFO"
    DEBUG: bool = False
    TESTING: bool = False
    CACHE_DIR: str = "cache"  # Directory for caching API responses and transcripts
    CACHE_MAX_AGE: int = 86400  # Cache TTL in seconds (24 hours)
    USE_API_CACHE: bool = True  # Whether to use API response caching
    PARALLEL_CHUNKS: int = 4  # Number of chunks to process in parallel

class Config:
    """Configuration loader with validation."""
    required_vars = ['HF_TOKEN', 'OPENAI_API_KEY']
    
    def __init__(self):
        """Initialize configuration and validate required environment variables."""
        load_dotenv()
        self._validate_env_vars()
        
        self.SECRET_KEY = os.getenv('SECRET_KEY', 'default-secret-key')
        self.UPLOAD_FOLDER = os.getenv('UPLOAD_FOLDER', 'uploads')
        self.DEBUG = os.getenv('FLASK_DEBUG', '').lower() == 'true'
        self.TESTING = os.getenv('FLASK_TESTING', '').lower() == 'true'
        self.LOG_LEVEL = os.getenv('LOG_LEVEL', 'INFO')
        
        # OpenAI configuration
        self.OPENAI_MODEL = os.getenv('OPENAI_MODEL', 'gpt-4o')  # Update to use gpt-4o as default
        self.USE_API_CACHE = os.getenv('USE_API_CACHE', 'true').lower() == 'true'
        self.CACHE_DIR = os.getenv('CACHE_DIR', 'cache')
        self.CACHE_MAX_AGE = int(os.getenv('CACHE_MAX_AGE', '86400'))  # Default 24h
        
        # Processing options
        self.PARALLEL_CHUNKS = int(os.getenv('PARALLEL_CHUNKS', '4'))
        self.MAX_CHUNK_SIZE = int(os.getenv('MAX_CHUNK_SIZE', '0'))  # 0 means auto-calculate
        self.CHUNK_OVERLAP = int(os.getenv('CHUNK_OVERLAP', '250'))  # Overlap in tokens
        
        # Azure Storage settings
        self.AZURE_STORAGE_CONNECTION_STRING = os.getenv('AZURE_STORAGE_CONNECTION_STRING')
        self.AZURE_CONTAINER_NAME = os.getenv('AZURE_CONTAINER_NAME', 'meeting-uploads')
        
        # Add VTT extensions configuration
        self.ALLOWED_VTT_EXTENSIONS = {'vtt'}
        
        # SocketIO logging settings
        self.SOCKETIO_LOGGING = os.environ.get('SOCKETIO_LOGGING', 'False').lower() == 'true'
        
        # Add file cleanup configuration
        self.COMPLETED_JOB_RETENTION_HOURS = int(os.getenv('COMPLETED_JOB_RETENTION_HOURS', '24'))
        self.INTERRUPTED_JOB_RETENTION_MINUTES = int(os.getenv('INTERRUPTED_JOB_RETENTION_MINUTES', '30'))
        self.ENABLE_SCHEDULED_CLEANUP = os.getenv('ENABLE_SCHEDULED_CLEANUP', 'true').lower() == 'true'
        self.ENABLE_IMMEDIATE_UPLOADS_CLEANUP = os.getenv('ENABLE_IMMEDIATE_UPLOADS_CLEANUP', 'true').lower() == 'true'
        self.CLEANUP_INTERVAL_HOURS = float(os.getenv('CLEANUP_INTERVAL_HOURS', '4.0'))
        
    def _validate_env_vars(self):
        """Validate that all required environment variables are present."""
        missing_vars = [var for var in self.required_vars if not os.getenv(var)]
        print(f"Missing vars: {missing_vars}")  # Debug
        if missing_vars:
            message = f"Missing required environment variables: {', '.join(missing_vars)}"
            testing_mode = str(os.getenv('FLASK_TESTING', '')).lower() == 'true'  # Force string comparison
            print(f"Testing mode: {testing_mode}")  # Debug
            if not testing_mode:
                logging.error(message)
                raise ValueError(message)
            else:
                logging.warning(f"{message} (ignored in testing mode)")