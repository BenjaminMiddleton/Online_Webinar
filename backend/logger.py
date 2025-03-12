import os
import logging
from logging.handlers import RotatingFileHandler
import sys
from flask import Flask

class SocketIOFilter(logging.Filter):
    """Filter to exclude noisy socketio messages."""
    
    def filter(self, record):
        """Filter out common socketio debug messages."""
        if not hasattr(record, 'message'):
            return True
        
        # Filter out common noisy messages
        noisy_patterns = [
            "socket.io",
            "engineio",
            "transport selected",
            "upgrade to",
            "handle ping",
            "handle pong",
            "websocket received",
            "websocket sending",
            "received packet",
            "emitting event",
        ]
        
        # Check if message contains any of the noisy patterns
        for pattern in noisy_patterns:
            if pattern in record.getMessage().lower():
                return False
        
        return True

def configure_logger(app: Flask) -> None:
    """Configure application logging with file and console handlers."""
    log_dir = 'logs'
    if not os.path.exists(log_dir):
        os.makedirs(log_dir)
        
    log_level = getattr(logging, app.config.get('LOG_LEVEL', 'INFO'))
    log_file = os.path.join(log_dir, 'app.log')
    
    # Configure the root logger
    root_logger = logging.getLogger()
    root_logger.setLevel(log_level)
    
    # Clear any existing handlers
    for handler in root_logger.handlers[:]:
        root_logger.removeHandler(handler)
    
    # Create and configure file handler
    file_handler = RotatingFileHandler(log_file, maxBytes=10485760, backupCount=10)
    file_formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    file_handler.setFormatter(file_formatter)
    file_handler.setLevel(log_level)
    
    # Create and configure console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_formatter = logging.Formatter(
        '%(levelname)s - %(message)s'
    )
    console_handler.setFormatter(console_formatter)
    console_handler.setLevel(log_level)
    
    # Add custom filter to console handler to filter out socketio noise
    console_handler.addFilter(SocketIOFilter())
    
    # Add handlers to root logger
    root_logger.addHandler(file_handler)
    root_logger.addHandler(console_handler)
    
    # Set Flask logger to use the same configuration
    app.logger.handlers = root_logger.handlers
    app.logger.setLevel(log_level)
    
    app.logger.info(f"Logging configured at level {logging.getLevelName(log_level)}")