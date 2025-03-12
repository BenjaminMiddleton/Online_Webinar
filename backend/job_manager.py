"""Job status management module for tracking processing jobs."""

import os
import json
from datetime import datetime
from flask import current_app
from typing import Dict, Any, Optional, List
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

def ensure_complete_minutes(minutes):
    """Ensure minutes has all required fields, adding empty values for any missing fields."""
    required_fields = {
        "title": "",
        "duration": "00:00",
        "summary": "",
        "action_points": [],
        "transcription": "",
        "speakers": []
    }
    
    for field, default_value in required_fields.items():
        if field not in minutes or minutes[field] is None:
            minutes[field] = default_value
    
    return minutes

def update_job_status(job_id: str, status: str, minutes: Optional[Dict[str, Any]] = None,
                     error: Optional[str] = None, pdf_path: Optional[str] = None) -> None:
    """
    Update the status of a processing job and save the details as a JSON file.
    
    Args:
        job_id: The job ID
        status: Status string ("started", "processing", "completed", "error")
        minutes: Optional meeting minutes data
        error: Optional error message
        pdf_path: Optional path to the generated PDF
    """
    try:
        # Create results directory if it doesn't exist
        results_dir = Path(__file__).parent.parent / "job_results"
        results_dir.mkdir(exist_ok=True)
        
        # Create the results file path
        result_file = results_dir / f"{job_id}.json"
        
        # Build the result data
        result_data = {
            "job_id": job_id,
            "status": status,
            "timestamp": datetime.now().isoformat()
        }
        
        # Add minutes data if provided
        if minutes is not None:
            complete_minutes = ensure_complete_minutes(minutes)
            result_data["minutes"] = complete_minutes
            
        # Add error message if provided
        if error is not None:
            result_data["error"] = str(error)
            
        # Add PDF path if provided
        if pdf_path is not None:
            result_data["pdf_path"] = pdf_path
            
        # Write to file
        with open(result_file, 'w', encoding='utf-8') as f:
            json.dump(result_data, f, ensure_ascii=False, indent=2)
            
        logger.info(f"Updated job status: {job_id} -> {status}")
        
        if status in ["completed", "error"]:
            from backend.cleanup import run_cleanup
            run_cleanup(
                job_results_dir=str(results_dir),
                completed_job_retention_hours=0,
                interrupted_job_retention_minutes=0
            )
        
    except Exception as e:
        logger.error(f"Error updating job status: {str(e)}")

def get_job_status(job_id: str) -> Dict[str, Any]:
    """
    Get the current status and data for a job.
    
    Args:
        job_id: The job ID to check
        
    Returns:
        Dictionary with job status and data
    """
    try:
        results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'job_results'))
        result_file = os.path.join(results_dir, f"{job_id}.json")
        
        if os.path.exists(result_file):
            with open(result_file, 'r') as f:
                job_data = json.load(f)
            
            # Create a response with the job data
            response_data = {
                "status": job_data.get("status", "unknown"),
                "job_id": job_id,
                "timestamp": job_data.get("timestamp", "")
            }
            
            # Include minutes data if available
            if "minutes" in job_data:
                response_data["minutes"] = job_data["minutes"]
                
            # Include PDF path if available
            if "pdf_path" in job_data:
                response_data["pdf_path"] = job_data["pdf_path"]
                
            # Include error if available
            if "error" in job_data:
                response_data["error"] = job_data["error"]
                
            return response_data
        else:
            return {
                "status": "processing",
                "job_id": job_id,
                "message": "Job is still processing or does not exist"
            }
    
    except Exception as e:
        current_app.logger.error(f"Error checking job status: {str(e)}")
        return {
            "status": "error",
            "message": str(e)
        }

def list_jobs() -> List[Dict[str, Any]]:
    """
    List all jobs and their statuses.
    
    Returns:
        List of job data dictionaries
    """
    try:
        results_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'job_results'))
        
        if not os.path.exists(results_dir):
            return []
            
        jobs = []
        
        for filename in os.listdir(results_dir):
            if filename.endswith('.json'):
                job_id = filename[:-5]  # Remove .json extension
                
                try:
                    with open(os.path.join(results_dir, filename), 'r') as f:
                        job_data = json.load(f)
                        
                    jobs.append({
                        "job_id": job_id,
                        "status": job_data.get("status", "unknown"),
                        "timestamp": job_data.get("timestamp", ""),
                        "title": job_data.get("minutes", {}).get("title", "Untitled Meeting")
                    })
                except Exception as e:
                    current_app.logger.error(f"Error reading job file {filename}: {str(e)}")
        
        # Sort by timestamp (newest first)
        jobs.sort(key=lambda x: x.get("timestamp", ""), reverse=True)
        
        return jobs
    except Exception as e:
        current_app.logger.error(f"Error listing jobs: {str(e)}")
        return []