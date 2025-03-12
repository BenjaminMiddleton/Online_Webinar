"""
Scheduled tasks for maintenance operations like cleaning up old files.
"""

import time
import logging
import threading
import os
import datetime
from pathlib import Path
from typing import Callable, Dict, Any

# Import cleanup utilities
from backend.cleanup import run_cleanup

# Configure logging
logger = logging.getLogger(__name__)

class ScheduledTask:
    """Base class for tasks that need to run on a schedule."""
    
    def __init__(self, 
                 interval_hours: float, 
                 task_function: Callable, 
                 task_args: Dict[str, Any] = None,
                 run_on_start: bool = False):
        """
        Initialize a scheduled task.
        
        Args:
            interval_hours: How often to run the task (in hours)
            task_function: Function to call when running the task
            task_args: Arguments to pass to the task function
            run_on_start: Whether to run the task immediately on startup
        """
        self.interval_seconds = interval_hours * 3600
        self.task_function = task_function
        self.task_args = task_args or {}
        self.run_on_start = run_on_start
        self.stop_flag = threading.Event()
        self.thread = None
        
    def _run_periodically(self):
        """Run the task periodically until stopped."""
        if self.run_on_start:
            self._run_task_with_error_handling()
        
        next_run = time.time() + self.interval_seconds
        
        while not self.stop_flag.is_set():
            if time.time() >= next_run:
                self._run_task_with_error_handling()
                next_run = time.time() + self.interval_seconds
            
            # Sleep for a bit to avoid busy waiting
            time.sleep(min(10, next_run - time.time()))
    
    def _run_task_with_error_handling(self):
        """Run the task with error handling."""
        try:
            logger.info(f"Running scheduled task: {self.task_function.__name__}")
            result = self.task_function(**self.task_args)
            logger.info(f"Task {self.task_function.__name__} completed. Result: {result}")
        except Exception as e:
            logger.error(f"Error in scheduled task {self.task_function.__name__}: {str(e)}")
    
    def start(self):
        """Start the scheduled task in a background thread."""
        if self.thread is None or not self.thread.is_alive():
            self.stop_flag.clear()
            self.thread = threading.Thread(target=self._run_periodically)
            self.thread.daemon = True
            self.thread.start()
            logger.info(f"Started scheduled task: {self.task_function.__name__}")
    
    def stop(self):
        """Stop the scheduled task."""
        if self.thread and self.thread.is_alive():
            self.stop_flag.set()
            self.thread.join(timeout=5.0)
            logger.info(f"Stopped scheduled task: {self.task_function.__name__}")

def cleanup_task(job_results_dir: str = None, 
                completed_job_retention_hours: int = 24, 
                interrupted_job_retention_minutes: int = 10,
                empty_upload_cleanup: bool = True) -> Dict[str, int]:
    """
    Scheduled task to clean up old job results and uploads.
    
    Args:
        job_results_dir: Directory containing job result JSON files
        completed_job_retention_hours: How long to keep completed jobs (in hours)
        interrupted_job_retention_minutes: How long to keep interrupted jobs (in minutes)
        empty_upload_cleanup: Whether to clean up empty files in the uploads directory
    
    Returns:
        Dictionary with cleanup statistics
    """
    # Call the existing cleanup function
    result = run_cleanup(
        job_results_dir=job_results_dir,
        completed_job_retention_hours=completed_job_retention_hours,
        interrupted_job_retention_minutes=interrupted_job_retention_minutes
    )
    
    # Log summary of cleanup
    logger.info(
        f"Cleanup completed: {result['job_files_deleted']} job files, "
        f"{result['related_files_deleted']} related files, "
        f"{result.get('empty_files_removed', 0)} empty uploads removed"
    )
    
    # Format for easy logging
    current_time = datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    return {
        "timestamp": current_time,
        **result
    }

def schedule_cleanup_task(app=None):
    """Set up and start the cleanup scheduled task."""
    # Get configuration from app if provided
    config = {}
    if app:
        config = {
            "job_results_dir": os.path.join(app.root_path, "..", "job_results"),
            "completed_job_retention_hours": app.config.get("COMPLETED_JOB_RETENTION_HOURS", 24),
            "interrupted_job_retention_minutes": app.config.get("INTERRUPTED_JOB_RETENTION_MINUTES", 10)
        }
    else:
        # Default configuration
        config = {
            "job_results_dir": None,  # Auto-detect
            "completed_job_retention_hours": 24,
            "interrupted_job_retention_minutes": 10
        }
    
    # Create and start the scheduled task
    cleanup_scheduler = ScheduledTask(
        interval_hours=4,  # Run every 4 hours
        task_function=cleanup_task,
        task_args=config,
        run_on_start=True  # Run immediately on startup
    )
    
    cleanup_scheduler.start()
    return cleanup_scheduler
