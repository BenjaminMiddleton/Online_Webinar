#!/usr/bin/env python
"""
Development server script to run both backend and frontend for local development.
This script starts:
1. The Flask backend server
2. The Vite/React frontend dev server
"""

import os
import sys
import signal
import subprocess
import time
import webbrowser
from pathlib import Path

# Set encoding for Windows
os.environ['PYTHONIOENCODING'] = 'utf-8'

def find_executable(name):
    """Find an executable in PATH"""
    for path in os.environ["PATH"].split(os.pathsep):
        executable = os.path.join(path, name)
        if os.path.isfile(executable) and os.access(executable, os.X_OK):
            return executable
    return None

# Paths
project_root = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(project_root, "backend")
ui_dir = os.path.join(project_root, "UI")

# Commands
npm_executable = "npm.cmd" if sys.platform == "win32" else "npm"
python_executable = sys.executable

# Check if npm is available
if not find_executable(npm_executable):
    print("Error: npm not found in PATH. Please install Node.js and npm.")
    sys.exit(1)

# Check if project directories exist
if not os.path.exists(backend_dir):
    print(f"Error: Backend directory not found at {backend_dir}")
    sys.exit(1)

if not os.path.exists(ui_dir):
    print(f"Error: UI directory not found at {ui_dir}")
    sys.exit(1)

# Check if package.json exists in UI directory
if not os.path.exists(os.path.join(ui_dir, "package.json")):
    print(f"Error: package.json not found in {ui_dir}")
    sys.exit(1)

# Store process objects
processes = []

def signal_handler(sig, frame):
    """Handle Ctrl+C to gracefully shut down all processes"""
    print("\nShutting down development servers...")
    for process in processes:
        try:
            if sys.platform == "win32":
                process.kill()
            else:
                process.terminate()
        except:
            pass
    sys.exit(0)

def run_backend():
    """Start the Flask backend server"""
    print("Starting backend server...")
    env = os.environ.copy()
    env["FLASK_ENV"] = "development"
    env["FLASK_DEBUG"] = "1"
    
    try:
        backend_process = subprocess.Popen(
            [python_executable, "-m", "backend.app"],
            cwd=project_root,
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        processes.append(backend_process)
        print("Backend server started!")
        return backend_process
    except Exception as e:
        print(f"Error starting backend server: {e}")
        sys.exit(1)

def run_frontend():
    """Start the React/Vite frontend dev server"""
    print("Starting frontend server...")
    try:
        frontend_process = subprocess.Popen(
            [npm_executable, "start"],
            cwd=ui_dir,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            text=True,
            bufsize=1,
            universal_newlines=True
        )
        processes.append(frontend_process)
        print("Frontend server started!")
        return frontend_process
    except Exception as e:
        print(f"Error starting frontend server: {e}")
        sys.exit(1)

def monitor_output(process, prefix):
    """Read and print output from a process"""
    line = process.stdout.readline()
    if line:
        print(f"{prefix}: {line.rstrip()}")
        return True
    return False

if __name__ == "__main__":
    # Register signal handler for graceful shutdown
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    print("=" * 60)
    print("Starting development servers for Meeting Management Project")
    print("=" * 60)
    print(f"Project root: {project_root}")
    print(f"Backend directory: {backend_dir}")
    print(f"UI directory: {ui_dir}")
    print("=" * 60)
    
    # Start servers
    backend_process = run_backend()
    frontend_process = run_frontend()
    
    print("=" * 60)
    print("Monitoring server output. Press Ctrl+C to stop all servers.")
    print("=" * 60)
    
    # Wait a bit before opening browser
    time.sleep(3)
    
    # Open browser
    try:
        print("Opening application in browser...")
        webbrowser.open("http://localhost:5173")
    except:
        print("Could not automatically open browser. Please navigate to http://localhost:5173")
    
    # Monitor output from both processes
    backend_running = True
    frontend_running = True
    
    while backend_running or frontend_running:
        if backend_running:
            backend_running = monitor_output(backend_process, "Backend")
        
        if frontend_running:
            frontend_running = monitor_output(frontend_process, "Frontend")
        
        # Check if processes have terminated
        if backend_process.poll() is not None:
            print("Backend server has stopped.")
            backend_running = False
        
        if frontend_process.poll() is not None:
            print("Frontend server has stopped.")
            frontend_running = False
        
        # Small delay to prevent CPU hogging
        time.sleep(0.01)
    
    print("All servers have stopped. Exiting.")
