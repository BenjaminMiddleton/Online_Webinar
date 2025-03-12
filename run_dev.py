#!/usr/bin/env python
"""
Development server script that runs both the backend and frontend simultaneously.

Usage:
    python run_dev.py
"""

import os
import sys
import subprocess
import time
import webbrowser
import signal
import platform

# Configuration
BACKEND_CMD = ["python", "-m", "backend.app"]
if platform.system() == "Windows":
    FRONTEND_CMD = ["npm.cmd", "start"]
else:
    FRONTEND_CMD = ["npm", "start"]
FRONTEND_DIR = "UI"
FRONTEND_URL = "http://localhost:5173"
BACKEND_URL = "http://localhost:5000"

def is_port_in_use(port):
    """Check if a port is already in use."""
    import socket
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        return s.connect_ex(('localhost', port)) == 0

def print_colored(text, color):
    """Print colored text to the console."""
    colors = {
        "red": "\033[91m",
        "green": "\033[92m",
        "yellow": "\033[93m",
        "blue": "\033[94m",
        "magenta": "\033[95m",
        "cyan": "\033[96m",
        "white": "\033[97m",
        "reset": "\033[0m"
    }
    
    # Windows command prompt doesn't support ANSI color codes by default
    if platform.system() == "Windows":
        print(text)
    else:
        print(f"{colors.get(color, '')}{text}{colors['reset']}")

def run_processes():
    """Run backend and frontend processes concurrently."""
    # Check if ports are already in use
    if is_port_in_use(5000):
        print_colored("Warning: Port 5000 is already in use. Backend may fail to start.", "yellow")
    
    if is_port_in_use(5173):
        print_colored("Warning: Port 5173 is already in use. Frontend may fail to start.", "yellow")
    
    # Set up environment for development
    env = os.environ.copy()
    env["FLASK_ENV"] = "development"
    env["FLASK_DEBUG"] = "1"
    
    print_colored("Starting development server...", "cyan")
    
    # Start backend process
    print_colored("Starting backend server...", "blue")
    backend_process = subprocess.Popen(
        BACKEND_CMD,
        env=env,
        # Use line buffering
        bufsize=1,
        universal_newlines=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    
    # Give the backend a moment to start
    time.sleep(2)
    
    # Start frontend process
    print_colored("Starting frontend development server...", "green")
    frontend_process = subprocess.Popen(
        FRONTEND_CMD,
        cwd=FRONTEND_DIR,
        env=env,
        # Use line buffering
        bufsize=1,
        universal_newlines=True,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT
    )
    
    # Open browser after a delay
    def open_browser():
        time.sleep(5)  # Wait for frontend to be ready
        print_colored("Opening browser...", "cyan")
        webbrowser.open(FRONTEND_URL)
    
    # Start browser in a separate thread so it doesn't block
    import threading
    browser_thread = threading.Thread(target=open_browser)
    browser_thread.daemon = True
    browser_thread.start()
    
    # Function to monitor and print output from a process
    def monitor_output(process, prefix, color):
        while True:
            line = process.stdout.readline()
            if not line and process.poll() is not None:
                break
            if line:
                print_colored(f"{prefix}: {line.rstrip()}", color)
    
    # Monitor both processes in separate threads
    backend_thread = threading.Thread(
        target=monitor_output,
        args=(backend_process, "Backend", "blue")
    )
    backend_thread.daemon = True
    backend_thread.start()
    
    frontend_thread = threading.Thread(
        target=monitor_output, 
        args=(frontend_process, "Frontend", "green")
    )
    frontend_thread.daemon = True
    frontend_thread.start()
    
    # Handle Ctrl+C to gracefully shut down both processes
    try:
        # Keep the main thread alive
        while True:
            time.sleep(0.5)
            # Check if either process has exited
            if backend_process.poll() is not None:
                print_colored("Backend process exited.", "red")
                break
            if frontend_process.poll() is not None:
                print_colored("Frontend process exited.", "red")
                break
    except KeyboardInterrupt:
        print_colored("\nShutting down development servers...", "yellow")
    finally:
        # Terminate processes
        print_colored("Stopping frontend...", "yellow")
        if platform.system() == "Windows":
            # Windows requires a different approach to terminate processes
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(frontend_process.pid)])
        else:
            frontend_process.terminate()
            frontend_process.wait(timeout=5)
        
        print_colored("Stopping backend...", "yellow")
        if platform.system() == "Windows":
            subprocess.call(['taskkill', '/F', '/T', '/PID', str(backend_process.pid)])
        else:
            backend_process.terminate()
            backend_process.wait(timeout=5)
        
        print_colored("Development servers stopped.", "cyan")

if __name__ == "__main__":
    run_processes()
