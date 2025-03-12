# MacBook Pro M3 Installation Guide

This guide provides specific instructions for installing and running the Meeting Minutes Generator on MacBook Pro with Apple Silicon (M1/M2/M3 chips).

## Prerequisites

1. **Install Homebrew**
   ```bash
   /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
   ```

2. **Install Python 3.10+**
   ```bash
   brew install python@3.10
   ```

3. **Install FFmpeg**
   ```bash
   brew install ffmpeg
   ```

4. **Install Node.js**
   ```bash
   brew install node
   ```

5. **Install system audio libraries**
   ```bash
   brew install portaudio
   brew install libsndfile
   ```

## Installation Steps

### 1. Clone the repository

```bash
git clone [repository-url]
cd CURRENT_Meeting_Management_Project_Prototype_Root
```

### 2. Create and activate a virtual environment

```bash
python3 -m venv venv
source venv/bin/activate
```

### 3. Install PyTorch for Apple Silicon

PyTorch needs to be installed specifically for Apple Silicon to leverage the M-series GPU:

```bash
# Install PyTorch with MPS (Metal Performance Shaders) support
pip install torch==2.0.1 torchvision==0.15.2 --index-url https://download.pytorch.org/whl/cpu
```

### 4. Install faster-whisper and other dependencies

```bash
# Install faster-whisper
pip install faster-whisper==1.1.1

# Install the rest of the requirements
pip install -r requirements_mac.in
```

### 5. Install frontend dependencies

```bash
cd UI
npm install
```

### 6. Set up environment variables

Create a `.env` file in the project root:

```
# API Keys
OPENAI_API_KEY=your_openai_api_key
HF_TOKEN=your_huggingface_token

# App Configuration
SECRET_KEY=your_secret_key
UPLOAD_FOLDER=uploads
FLASK_DEBUG=false
LOG_LEVEL=INFO
OPENAI_MODEL=o3-mini
```

## Running the Application on macOS

### 1. Start the backend server

From the project root:

```bash
# Start with Flask development server
python backend/app.py
```

### 2. Start the frontend development server

In a separate terminal:

```bash
cd UI
npm start
```

The application should now be running at http://localhost:5173/

## Troubleshooting Mac-specific Issues

### Python-magic Installation Issues

If you encounter problems with python-magic:

```bash
brew install libmagic
pip install python-magic
```

### FFmpeg Issues

If you encounter problems with FFmpeg processing:

```bash
# Reinstall FFmpeg with additional codecs
brew reinstall ffmpeg --with-opus --with-fdk-aac
```

### Metal Performance Shaders (MPS) Device Issues

If you encounter errors related to MPS:

```python
# Add this to your Python code or modify app.py
import torch
if torch.backends.mps.is_available():
    device = torch.device("mps")
    print("Using MPS (Metal Performance Shaders)")
else:
    device = torch.device("cpu")
    print("MPS not available, falling back to CPU")
```

### Audio Input/Output Issues

If you encounter permission issues with audio devices:

1. Go to System Preferences → Security & Privacy → Privacy → Microphone
2. Ensure your Terminal application or IDE has permission to access the microphone
