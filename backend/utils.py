from typing import Type, Dict, Any, Callable
from functools import wraps
from flask import jsonify, current_app, request
import traceback
import time

class APIError(Exception):
    """Custom API exception with status code."""
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)

def handle_errors(f: Callable) -> Callable:
    """
    Decorator to handle API errors consistently.
    Catches exceptions and returns JSON error responses.
    """
    @wraps(f)
    def wrapper(*args, **kwargs):
        try:
            return f(*args, **kwargs)
        except APIError as e:
            current_app.logger.warning(f"API Error: {e.message}")
            response = jsonify({"error": e.message})
            response.status_code = e.status_code
            return response
        except Exception as e:
            # Log full stack trace for unexpected errors
            current_app.logger.error(f"Unexpected error: {str(e)}")
            current_app.logger.error(traceback.format_exc())
            response = jsonify({"error": "Internal server error"})
            response.status_code = 500
            return response
    return wrapper

def log_request_info(app):
    """Log basic request information."""
    @app.before_request
    def before_request():
        request.start_time = time.time()
        app.logger.debug(f"Request: {request.method} {request.path}")
        
    @app.after_request
    def after_request(response):
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
            app.logger.debug(f"Response: {response.status_code} ({duration:.2f}s)")
        return response

# Error codes
ERROR_CODES = {
    "FILE_NOT_FOUND": 1001,
    "INVALID_FILE_FORMAT": 1002,
    "PROCESSING_ERROR": 1003,
    "TRANSCRIPTION_ERROR": 1004,
    "DIARIZATION_ERROR": 1005,
    "MINUTES_GENERATION_ERROR": 1006,
    "PDF_GENERATION_ERROR": 1007,
    "STORAGE_ERROR": 1008,
    "MODEL_LOADING_ERROR": 1009,
    "SOCKET_ERROR": 1010
}

# Status mapping for UI display
PROCESS_STATUS_MAP = {
    "started": "Processing started...",
    "processing_audio": "Processing audio file...",
    "processing_vtt": "Processing transcript file...",
    "diarizing": "Identifying speakers...",
    "transcribing": "Transcribing audio...",
    "generating_minutes": "Generating meeting minutes...",
    "generating_pdf": "Creating PDF document...",
    "completed": "Processing complete!",
    "error": "Processing error!"
}

def get_error_info(error_type, message=None):
    """Get standardized error information."""
    code = ERROR_CODES.get(error_type, 1000)  # Default to 1000 for unknown errors
    return {
        "error_code": code,
        "error_type": error_type,
        "message": message or f"An error of type {error_type} occurred"
    }

def get_user_friendly_status(status_key):
    """Get user-friendly status message."""
    return PROCESS_STATUS_MAP.get(status_key, status_key)

def estimate_tokens(text: str) -> int:
    """
    Estimate the number of tokens in a text string.
    This is a rough estimation: ~4 characters per token for English text.
    
    Args:
        text: The input text
        
    Returns:
        Estimated token count
    """
    if not text:
        return 0
        
    # Count characters and divide by average chars per token
    # This is an approximation - actual tokenization varies by model
    char_count = len(text)
    return char_count // 4  # ~4 chars per token in English