#!/usr/bin/env python
"""
Command-line utility for cleaning up old files in the job_results and uploads directories.

Usage:
  python cleanup_files.py [--dry-run] [--hours=24] [--minutes=30]

Options:
  --dry-run            Only show what would be deleted, don't actually delete files
  --hours=HOURS        How long to keep completed jobs in hours (default: 24)
  --minutes=MINUTES    How long to keep interrupted jobs in minutes (default: 30)
"""

import sys, os, argparse, logging
from datetime import datetime
from backend.cleanup import run_cleanup

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("cleanup.log")
    ]
)
logger = logging.getLogger("cleanup")

def main():
    """Run the cleanup process with command-line arguments."""
    parser = argparse.ArgumentParser(description="Clean up old job results and uploaded files")
    parser.add_argument("--dry-run", action="store_true", help="Don't actually delete files, just show what would be deleted")
    parser.add_argument("--hours", type=int, default=24, help="How long to keep completed jobs (in hours)")
    parser.add_argument("--minutes", type=int, default=30, help="How long to keep interrupted jobs (in minutes)")
    parser.add_argument("--verbose", action="store_true", help="Show detailed information about each file")
    
    args = parser.parse_args()
    
    if args.verbose:
        logger.setLevel(logging.DEBUG)
    
    logger.info(f"Starting cleanup process at {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    logger.info(f"Settings: completed_retention={args.hours}h, interrupted_retention={args.minutes}m, dry_run={args.dry_run}")
    
    try:
        stats = run_cleanup(
            job_results_dir=None,  # Auto-detect
            completed_job_retention_hours=args.hours,
            interrupted_job_retention_minutes=args.minutes,
            dry_run=args.dry_run
        )
        
        logger.info("Cleanup completed successfully:")
        logger.info(f"- Job files deleted: {stats['job_files_deleted']}")
        logger.info(f"- Related files deleted: {stats['related_files_deleted']}")
        logger.info(f"- Empty files removed: {stats.get('empty_files_removed', 0)}")
        logger.info(f"- Errors: {stats.get('errors', 0)}")
        
        return 0
    except Exception as e:
        logger.error(f"Error during cleanup: {str(e)}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
