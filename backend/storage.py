"""File storage utilities for local and cloud storage."""

import os
import uuid  # Add missing uuid import
from flask import current_app
from azure.storage.blob import BlobServiceClient
from werkzeug.utils import secure_filename
from typing import Optional, Tuple, Any

def save_file(app, file, filename):
    """Save file locally with proper error handling."""
    upload_folder = app.config['UPLOAD_FOLDER']
    os.makedirs(upload_folder, exist_ok=True)
    
    filepath = os.path.join(upload_folder, filename)
    
    # Reset file pointer to beginning before saving
    file.seek(0)
    file.save(filepath)
    
    # Verify file was saved properly
    if os.path.exists(filepath) and os.path.getsize(filepath) > 0:
        app.logger.info(f"File saved successfully: {filepath}")
    else:
        app.logger.error(f"File save verification failed: {filepath}")
        raise Exception(f"Failed to save file: {filename}")
        
    return filepath

def save_to_local(app: Any, file: Any, filename: str) -> str:
    """
    Save file to local storage.
    
    Args:
        app: Flask application instance
        file: File object to save
        filename: Name to use for the saved file
        
    Returns:
        Path to the saved file
    """
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)
    return filepath

def save_to_azure(app: Any, file: Any, filename: str) -> str:
    """
    Save file to Azure Blob Storage.
    
    Args:
        app: Flask application instance
        file: File object to save
        filename: Name to use for the saved file
        
    Returns:
        URL or path to the saved file
    """
    try:
        blob_service_client = BlobServiceClient.from_connection_string(
            app.config['AZURE_STORAGE_CONNECTION_STRING']
        )
        container_client = blob_service_client.get_container_client(
            app.config['AZURE_CONTAINER_NAME']
        )
        
        # Create container if it doesn't exist
        if not container_client.exists():
            container_client.create_container()
        
        # Upload file
        blob_client = container_client.get_blob_client(filename)
        file_data = file.read()
        blob_client.upload_blob(file_data)
        
        # Return the blob URL
        return blob_client.url
        
    except Exception as e:
        app.logger.error(f"Error saving to Azure: {str(e)}")
        # Fallback to local storage
        return save_to_local(app, file, filename)

def cleanup_file(app: Any, filepath: str) -> None:
    """
    Remove a temporary file from disk with error handling.
    
    Args:
        app: Flask application instance
        filepath: Path to the file to remove
    """
    if not filepath:
        return
        
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            app.logger.info(f"Cleaned up file: {os.path.basename(filepath)}")
    except Exception as e:
        app.logger.error(f"Error cleaning up file {filepath}: {str(e)}")

def generate_unique_filename(original_filename: str) -> Tuple[str, str]:
    """
    Generate a unique filename based on the original filename.
    
    Args:
        original_filename: Original filename
        
    Returns:
        Tuple of (unique_filename, base_name_without_extension)
    """
    job_id = str(uuid.uuid4())
    base_filename = os.path.splitext(original_filename)[0]
    base_filename = base_filename.replace("_", " ").replace("-", " ").title()
    safe_filename = secure_filename(f"{job_id}_{original_filename}")
    
    return safe_filename, base_filename