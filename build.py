#!/usr/bin/env python
"""
Build script for Railway deployment. This script:
1. Builds the frontend React app
2. Copies the built assets to the backend's static directory
"""

import os
import subprocess
import shutil
import sys
from pathlib import Path

def run_command(command, cwd=None):
    """Run a shell command and return the status code."""
    print(f"Running: {command}")
    result = subprocess.run(command, shell=True, cwd=cwd)
    if result.returncode != 0:
        print(f"Command failed with exit code {result.returncode}: {command}")
        return False
    return True

def build_frontend():
    """Build the frontend React application."""
    ui_dir = os.path.join(os.path.dirname(__file__), 'UI')
    
    # Check if UI directory exists
    if not os.path.exists(ui_dir):
        print(f"UI directory not found at {ui_dir}")
        return False
    
    # Install dependencies
    if not run_command("npm install", cwd=ui_dir):
        return False
    
    # Build the application
    build_command = "npm run build"
    if not run_command(build_command, cwd=ui_dir):
        return False
    
    print("Frontend built successfully.")
    return True

def copy_frontend_to_static():
    """Copy the built frontend to the backend static directory."""
    ui_build_dir = os.path.join(os.path.dirname(__file__), 'UI', 'dist')
    backend_static_dir = os.path.join(os.path.dirname(__file__), 'backend', 'static')
    
    # Create static directory if it doesn't exist
    os.makedirs(backend_static_dir, exist_ok=True)
    
    # Check if build directory exists
    if not os.path.exists(ui_build_dir):
        print(f"Frontend build directory not found at {ui_build_dir}")
        return False
    
    # Copy files
    try:
        for item in os.listdir(ui_build_dir):
            source = os.path.join(ui_build_dir, item)
            dest = os.path.join(backend_static_dir, item)
            
            if os.path.isdir(source):
                shutil.copytree(source, dest, dirs_exist_ok=True)
            else:
                shutil.copy2(source, dest)
                
        print(f"Frontend assets copied to {backend_static_dir}")
        return True
    except Exception as e:
        print(f"Error copying frontend assets: {str(e)}")
        return False

def main():
    """Main build function."""
    print("Starting build process...")
    
    # Build frontend
    if not build_frontend():
        sys.exit(1)
    
    # Copy frontend to static
    if not copy_frontend_to_static():
        sys.exit(1)
    
    print("Build completed successfully!")

if __name__ == "__main__":
    main()
