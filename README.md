# Meeting Minutes Generator

A powerful AI-assisted application that transforms audio recordings of meetings into complete, structured meeting minutes with action points and summaries.

## Features

- **Audio Processing**: Automatic speech recognition for transcription
- **Speaker Diarization**: Identifies different speakers in recordings
- **AI-Generated Summaries**: Extracts key discussion points
- **Action Point Extraction**: Identifies and lists actionable tasks
- **PDF & DOCX Generation**: Creates formatted documents of meeting minutes
- **Real-time Processing**: Socket.IO integration for live status updates
- **Modern UI**: Clean React-based interface with real-time updates

## System Requirements

- Python 3.10+
- Node.js 16+ and NPM
- FFmpeg (for audio processing)
- 8GB+ RAM (16GB recommended for larger audio files)
- NVIDIA GPU with CUDA support (optional but recommended for faster processing)

## Installation

### 1. Clone the repository

```bash
git clone [repository-url]
cd CURRENT_Meeting_Management_Project_Prototype_Root
```

### 2. Install backend dependencies

```bash
# Create and activate a virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt
```

### 3. Install frontend dependencies

```bash
cd UI
npm install
```

### 4. Set up environment variables

Create a `.env` file in the project root with the following variables:

```
# API Keys
OPENAI_API_KEY=your_openai_api_key
HF_TOKEN=your_huggingface_token

# App Configuration
SECRET_KEY=your_secret_key
UPLOAD_FOLDER=uploads
FLASK_DEBUG=false
LOG_LEVEL=INFO
OPENAI_MODEL=gpt-4o

# File Cleanup Settings
COMPLETED_JOB_RETENTION_HOURS=24
INTERRUPTED_JOB_RETENTION_MINUTES=30
ENABLE_SCHEDULED_CLEANUP=true
ENABLE_IMMEDIATE_UPLOADS_CLEANUP=true
CLEANUP_INTERVAL_HOURS=4.0

# Optional Azure Storage (if using cloud storage)
AZURE_STORAGE_CONNECTION_STRING=your_azure_storage_connection_string
AZURE_CONTAINER_NAME=meeting-uploads
```

## Running the Application

### Option 1: Unified Development Server (Recommended for Local Development)

Run both backend and frontend with a single command:

```bash
# From the project root
python run_dev.py
```

This script will:
- Start the Flask backend server on port 5000
- Start the Vite development server for the UI on port 5173
- Open your browser to the application automatically
- Show backend and frontend logs in the terminal

### Option 2: Run Backend and Frontend Separately

#### 1. Start the backend server

From the project root:

```bash
# Start with Flask development server
python backend/app.py

# Or with Gunicorn for production
gunicorn -w 2 -t 120 --chdir backend app:app
```

#### 2. Start the frontend development server

In a separate terminal:

```bash
cd UI
npm start
```

The application should now be running at http://localhost:5173/

## Usage Guide

1. **Upload Audio**: Click the upload button in the navbar to select an audio file (.mp3, .wav, .m4a, etc.)
2. **Processing**: The system will automatically transcribe, identify speakers, and generate minutes
3. **Review Minutes**: Once processing is complete, review the summary and action points
4. **Edit Content**: Make adjustments to the action points as needed
5. **Download**: Export the meeting minutes as PDF or DOCX as needed

## Architecture

The application consists of two main components:

### Backend (Flask)

- **Audio Processing**: Uses faster-whisper and pyannote.audio for transcription and speaker diarization
- **AI Processing**: OpenAI API integration for generating summaries and action points
- **Document Generation**: Creates PDF and DOCX output files
- **Socket.IO**: Provides real-time processing updates

### Frontend (React)

- **Modern UI**: Built with React and TypeScript
- **Real-time Updates**: Socket.IO client integration for live processing status
- **Responsive Design**: Works on desktop and tablets
- **Component-based**: Modular architecture for easy extension

## Deployment to GitHub Pages

To deploy the React UI to GitHub Pages, follow these steps:

1. Install the gh-pages package in the UI folder:
   ```
   cd UI
   npm install gh-pages --save-dev
   ```
2. Update the "homepage" field and add "predeploy" and "deploy" scripts in `package.json` (see changes above).
3. Build and deploy by running:
   ```
   npm run deploy
   ```
4. Your UI will be available at the URL specified in the homepage field.

## Maintenance

### Automatic File Cleanup

The system includes automated cleanup of temporary files to prevent disk space issues:

1. **Scheduled Cleanup**: Runs every 4 hours (configurable via `CLEANUP_INTERVAL_HOURS`)
   - Removes completed jobs older than 24 hours (configurable via `COMPLETED_JOB_RETENTION_HOURS`)
   - Removes failed/interrupted jobs older than 30 minutes (configurable via `INTERRUPTED_JOB_RETENTION_MINUTES`)
   - Cleans up associated files (PDFs, audio files, etc.)

2. **Immediate Cleanup**: 
   - Uploaded files are removed immediately after processing
   - Empty files in the uploads directory are cleaned after each processing job

3. **Manual Cleanup**:
   - Run `python -m backend.cleanup --dry-run` to see what would be deleted
   - Run `python -m backend.cleanup` to perform the actual cleanup

All cleanup operations are logged for auditing and debugging purposes.

## Troubleshooting

### Common Issues

1. **Audio Processing Fails**:
   - Ensure FFmpeg is properly installed and in your PATH
   - Check that the audio file format is supported
   - For large files, ensure sufficient memory is available

2. **Slow Processing**:
   - GPU acceleration is recommended for optimal performance
   - Consider chunking large audio files into smaller segments

3. **API Key Issues**:
   - Verify your OpenAI and HuggingFace API keys are valid and have sufficient credits
   - Check your `.env` file has the correct values

4. **Connection Issues**:
   - Verify both backend and frontend servers are running
   - Check console logs for Socket.IO connection errors

## License

[Your License Information Here]

## Contributors

[Your Contributor Information Here]