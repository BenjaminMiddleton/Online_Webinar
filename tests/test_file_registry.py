import os
import pytest
from backend.file_registry import FileRegistry
from flask import current_app

@pytest.fixture
def file_registry(app):
    """Fixture for creating a FileRegistry instance."""
    return FileRegistry(app)

def test_register_and_get_path(file_registry, app, tmpdir):
    """Test registering a file and retrieving its path."""
    job_id = "test_job"
    # Create a temporary file so that it actually exists
    temp_file = tmpdir.join("test_file.txt")
    temp_file.write("test content")
    original_path = str(temp_file)
    file_type = "txt"
    file_registry.register_file(job_id, original_path, file_type)
    retrieved_path = file_registry.get_path(job_id)
    assert retrieved_path == original_path

def test_get_path_nonexistent_job(file_registry):
    """Test retrieving path for a nonexistent job."""
    retrieved_path = file_registry.get_path("nonexistent_job")
    assert retrieved_path is None

def test_get_path_file_not_exists(file_registry, tmpdir):
    """Test retrieving path when the file no longer exists."""
    job_id = "test_job"
    original_path = str(tmpdir.join("temp_file.txt"))
    file_type = "txt"
    # Create a temporary file
    with open(original_path, "w") as f:
        f.write("test content")
    file_registry.register_file(job_id, original_path, file_type)
    # Remove the file
    os.remove(original_path)
    retrieved_path = file_registry.get_path(job_id)
    assert retrieved_path is None
