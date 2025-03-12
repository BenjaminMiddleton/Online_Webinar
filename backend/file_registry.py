import os
import json
import time
from datetime import datetime
from flask import current_app
from typing import Dict, Any, List, Optional

class FileRegistry:
    """Simple registry to track files through processing pipeline"""
    
    def __init__(self, app=None):
        self.registry = {}
        self.app = app
    
    def register_file(self, job_id, original_path, file_type):
        self.registry[job_id] = {
            'original_path': original_path,
            'file_type': file_type,
            'registered_at': datetime.now().isoformat()
        }
        if self.app:
            self.app.logger.info(f"Registered file for job {job_id}: {original_path}")
    
    def get_path(self, job_id):
        if job_id in self.registry:
            path = self.registry[job_id]['original_path']
            if os.path.exists(path):
                return path
        return None

# Initialize with Flask app
file_registry = FileRegistry()

def init_file_registry(app):
    """Initialize file registry with Flask app."""
    global file_registry
    file_registry.app = app
    return file_registry