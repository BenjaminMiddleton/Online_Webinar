"""Utility for cleaning up stale job results and temporary files."""

import os
import json
import logging
import time
from datetime import datetime, timedelta
from pathlib import Path
from typing import Dict, List, Tuple, Optional
import shutil

logger = logging.getLogger(__name__)

class JobCleaner:
    """Handles cleanup of old job results and temporary files."""
    
    def __init__(
        self, 
        job_results_dir: str,
        completed_job_retention_hours: int = 168,  # 7 days by default
        interrupted_job_retention_minutes: int = 10,
        dry_run: bool = False
    ):
        """
        Initialize the job cleaner.
        
        Args:
            job_results_dir: Directory containing job result JSON files
            completed_job_retention_hours: How long to keep completed jobs (in hours)
            interrupted_job_retention_minutes: How long to keep interrupted jobs (in minutes)
            dry_run: If True, only log what would be deleted without actually deleting
        """
        self.job_results_dir = Path(job_results_dir)
        self.completed_job_retention = timedelta(hours=completed_job_retention_hours)
        self.interrupted_job_retention = timedelta(minutes=interrupted_job_retention_minutes)
        self.dry_run = dry_run
        self.pdf_output_dir = Path(job_results_dir).parent / "pdf_output_files"
        self.docx_output_dir = Path(job_results_dir).parent / "docx_output_files"
        self.uploads_dir = Path(job_results_dir).parent / "backend" / "uploads"
    
    def scan_job_files(self) -> List[Dict]:
        """
        Scan the job results directory and classify jobs by status and age.
        
        Returns:
            List of dictionaries containing job info
        """
        job_files = []
        
        if not self.job_results_dir.exists():
            logger.warning(f"Job results directory does not exist: {self.job_results_dir}")
            return job_files
            
        for file_path in self.job_results_dir.glob("*.json"):
            try:
                # Read the job data from the JSON file
                with open(file_path, 'r') as f:
                    job_data = json.load(f)
                
                # Parse the timestamp
                timestamp_str = job_data.get("timestamp", "")
                if not timestamp_str:
                    logger.warning(f"Job file missing timestamp: {file_path}")
                    continue
                    
                try:
                    timestamp = datetime.fromisoformat(timestamp_str)
                except ValueError:
                    logger.warning(f"Invalid timestamp format in {file_path}: {timestamp_str}")
                    continue
                
                # Get job status
                status = job_data.get("status", "unknown")
                job_id = job_data.get("job_id", file_path.stem)
                
                # Related file paths
                pdf_path = None
                if "pdf_path" in job_data:
                    pdf_path = job_data["pdf_path"]
                elif "minutes" in job_data and "pdf_path" in job_data["minutes"]:
                    pdf_path = job_data["minutes"]["pdf_path"]
                
                # Calculate age
                age = datetime.now() - timestamp
                
                job_files.append({
                    "job_id": job_id,
                    "file_path": file_path,
                    "status": status,
                    "timestamp": timestamp,
                    "age": age,
                    "pdf_path": pdf_path
                })
                
            except Exception as e:
                logger.warning(f"Error processing job file {file_path}: {str(e)}")
        
        return job_files
    
    def get_files_to_delete(self) -> Tuple[List[Path], List[Path]]:
        """
        Identify job files that should be deleted based on retention policies.
        
        Returns:
            Tuple of (job_files_to_delete, related_files_to_delete)
        """
        job_files = self.scan_job_files()
        job_files_to_delete = []
        related_files_to_delete = []
        
        now = datetime.now()
        
        for job in job_files:
            delete_job = False
            retention_period = None
            
            # Apply different retention policies based on job status
            if job["status"] == "completed":
                retention_period = self.completed_job_retention
                if job["age"] > retention_period:
                    delete_job = True
                    reason = "completed job exceeding retention period"
            elif job["status"] in ["error", "started", "processing"]:
                retention_period = self.interrupted_job_retention
                if job["age"] > retention_period:
                    delete_job = True
                    reason = f"stale {job['status']} job exceeding retention period"
            else:
                # For unknown statuses, use the interrupted job retention
                retention_period = self.interrupted_job_retention
                if job["age"] > retention_period:
                    delete_job = True
                    reason = f"job with unknown status ({job['status']}) exceeding retention period"
            
            if delete_job:
                logger.info(f"Marking job {job['job_id']} for deletion: {reason}")
                job_files_to_delete.append(job["file_path"])
                
                # Find related files (PDF, DOCX, uploads)
                if job["pdf_path"]:
                    pdf_path = Path(job["pdf_path"])
                    if pdf_path.exists():
                        related_files_to_delete.append(pdf_path)
                
                # Look for PDF files with job_id in the name
                for pdf_file in self.pdf_output_dir.glob(f"*{job['job_id']}*.pdf"):
                    related_files_to_delete.append(pdf_file)
                
                # Look for TXT files with job_id in the name
                for txt_file in self.pdf_output_dir.glob(f"*{job['job_id']}*.txt"):
                    related_files_to_delete.append(txt_file)
                
                # Look for DOCX files with job_id in the name
                for docx_file in self.docx_output_dir.glob(f"*{job['job_id']}*.docx"):
                    related_files_to_delete.append(docx_file)
                
                # Look for uploads with job_id in the name
                for upload_file in self.uploads_dir.glob(f"*{job['job_id']}*"):
                    related_files_to_delete.append(upload_file)
        
        return job_files_to_delete, related_files_to_delete
    
    def cleanup(self) -> Dict[str, int]:
        """
        Perform the cleanup operation.
        
        Returns:
            Statistics dictionary with counts of deleted files
        """
        job_files, related_files = self.get_files_to_delete()
        
        stats = {
            "job_files_deleted": 0,
            "related_files_deleted": 0,
            "errors": 0
        }
        
        # Delete job files
        for file_path in job_files:
            try:
                if not self.dry_run:
                    os.remove(file_path)
                    stats["job_files_deleted"] += 1
                else:
                    logger.info(f"[DRY RUN] Would delete job file: {file_path}")
            except Exception as e:
                logger.error(f"Error deleting job file {file_path}: {str(e)}")
                stats["errors"] += 1
        
        # Delete related files
        for file_path in related_files:
            try:
                if not self.dry_run:
                    os.remove(file_path)
                    stats["related_files_deleted"] += 1
                else:
                    logger.info(f"[DRY RUN] Would delete related file: {file_path}")
            except Exception as e:
                logger.error(f"Error deleting related file {file_path}: {str(e)}")
                stats["errors"] += 1
        
        logger.info(f"Cleanup completed: {stats['job_files_deleted']} job files and "
                   f"{stats['related_files_deleted']} related files deleted "
                   f"({stats['errors']} errors)")
        
        return stats
    
    def cleanup_empty_uploads(self) -> int:
        """
        Remove empty files from the uploads directory.
        
        Returns:
            Number of empty files deleted
        """
        if not self.uploads_dir.exists():
            return 0
            
        count = 0
        for file_path in self.uploads_dir.glob("*"):
            if file_path.is_file() and file_path.stat().st_size == 0:
                try:
                    if not self.dry_run:
                        os.remove(file_path)
                        count += 1
                    else:
                        logger.info(f"[DRY RUN] Would delete empty upload: {file_path}")
                except Exception as e:
                    logger.error(f"Error deleting empty file {file_path}: {str(e)}")
        
        if count > 0:
            logger.info(f"Removed {count} empty files from uploads directory")
        
        return count

def run_cleanup(
    job_results_dir: Optional[str] = None,
    completed_job_retention_hours: int = 168,  # 7 days by default
    interrupted_job_retention_minutes: int = 10,
    dry_run: bool = False
) -> Dict[str, int]:
    """
    Run the cleanup process with the specified parameters.
    
    Args:
        job_results_dir: Directory containing job result JSON files (default: auto-detect)
        completed_job_retention_hours: How long to keep completed jobs (in hours)
        interrupted_job_retention_minutes: How long to keep interrupted jobs (in minutes)
        dry_run: If True, only log what would be deleted without actually deleting
        
    Returns:
        Statistics dictionary with counts of deleted files
    """
    # Auto-detect job_results_dir if not specified
    if job_results_dir is None:
        # If running from the backend directory
        if os.path.exists('../job_results'):
            job_results_dir = '../job_results'
        # If running from the project root
        elif os.path.exists('job_results'):
            job_results_dir = 'job_results'
        else:
            raise ValueError("Could not detect job_results_dir. Please specify it explicitly.")
    
    cleaner = JobCleaner(
        job_results_dir=job_results_dir,
        completed_job_retention_hours=completed_job_retention_hours,
        interrupted_job_retention_minutes=interrupted_job_retention_minutes,
        dry_run=dry_run
    )
    
    stats = cleaner.cleanup()
    
    # Also clean up empty uploads
    empty_files_removed = cleaner.cleanup_empty_uploads()
    stats["empty_files_removed"] = empty_files_removed
    
    return stats

if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Clean up old job results")
    parser.add_argument("--job-results-dir", help="Directory containing job result JSON files")
    parser.add_argument("--completed-retention", type=int, default=168,
                       help="How long to keep completed jobs (in hours, default: 168 = 7 days)")
    parser.add_argument("--interrupted-retention", type=int, default=10,
                       help="How long to keep interrupted jobs (in minutes, default: 10)")
    parser.add_argument("--dry-run", action="store_true",
                       help="Don't actually delete files, just show what would be deleted")
    
    args = parser.parse_args()
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    
    try:
        stats = run_cleanup(
            job_results_dir=args.job_results_dir,
            completed_job_retention_hours=args.completed_retention,
            interrupted_job_retention_minutes=args.interrupted_retention,
            dry_run=args.dry_run
        )
        
        print(f"\nCleanup {'simulation ' if args.dry_run else ''}completed:")
        print(f"- Job files deleted: {stats['job_files_deleted']}")
        print(f"- Related files deleted: {stats['related_files_deleted']}")
        print(f"- Empty upload files removed: {stats.get('empty_files_removed', 0)}")
        print(f"- Errors encountered: {stats['errors']}")
    except Exception as e:
        print(f"Error running cleanup: {str(e)}")
        exit(1)
