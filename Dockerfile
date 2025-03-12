# Use an official Python runtime as a parent image
FROM nvidia/cuda:11.8.0-cudnn8-runtime-ubuntu20.04

# Set environment variables
ENV PYTHONUNBUFFERED 1
ENV APP_HOME /app

# Install system dependencies
RUN apt-get update && apt-get install -y --no-install-recommends \
    ffmpeg \
    libmagic1 \
    && rm -rf /var/lib/apt/lists/*

# Install Rust and Cargo
RUN apt-get update && apt-get install -y curl
RUN curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y
ENV PATH="/root/.cargo/bin:${PATH}"

# Install Python and pip
RUN apt-get update && apt-get install -y python3 python3-pip

# Set the Python version explicitly
ENV PYTHON_VERSION 3.12.9

# Update pip
RUN pip3 install --no-cache-dir --upgrade pip

# Reinstall tokenizers
RUN pip3 uninstall -y tokenizers
RUN pip3 install --no-cache-dir tokenizers

# Copy requirements file
COPY requirements.txt .

# Install Python dependencies
RUN pip3 install --no-cache-dir -r requirements.txt

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

# Capture verbose output from npm run build
RUN npm run build --verbose 2>&1 | tee build_log.txt

# Copy static files from UI build to backend static folder
WORKDIR ${APP_HOME}
RUN mkdir -p backend/static
RUN cp -r UI/dist/* backend/static/

# Change working directory back to backend
WORKDIR ${APP_HOME}/backend

# Set the entrypoint command
CMD ["gunicorn", "--worker-tmp-dir", "/tmp", "--bind", "0.0.0.0:${PORT:-5000}", "app:app"]
