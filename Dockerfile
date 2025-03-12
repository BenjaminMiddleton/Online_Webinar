# Use an official Python runtime as a parent image
FROM python:3.10-slim-buster

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV APP_HOME /app

# Create app directory
WORKDIR ${APP_HOME}

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Copy the application code
COPY . .

# Install Node.js and npm
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

# Build the React UI
WORKDIR ${APP_HOME}/UI
COPY UI/package*.json ./
RUN npm install
RUN npm run build

# Copy static files from UI build to backend static folder
WORKDIR ${APP_HOME}
RUN mkdir -p backend/static
RUN cp -r UI/dist/* backend/static/

# Change working directory back to backend
WORKDIR ${APP_HOME}/backend

# Set the entrypoint command
CMD ["gunicorn", "--worker-tmp-dir", "/tmp", "--bind", "0.0.0.0:${PORT:-5000}", "app:app"]
