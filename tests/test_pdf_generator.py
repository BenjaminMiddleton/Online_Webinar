import pytest
from backend.pdf_generator import sanitize_text, generate_pdf
from unittest.mock import patch

def test_sanitize_text():
    """Test the sanitize_text function to remove problematic characters."""
    # Test with a problematic character
    text_with_problematic_char = "This is a test with a bullet: \u2022"
    sanitized_text = sanitize_text(text_with_problematic_char)
    assert "\u2022" not in sanitized_text

    # Test with control characters
    text_with_control_chars = "This is a test with control chars: \x01\x02\x03"
    sanitized_text = sanitize_text(text_with_control_chars)
    assert not any(c in sanitized_text for c in "\x00-\x1F")

    # Test with long words
    long_word = "A" * 50
    text_with_long_word = f"This is a test with a very long word: {long_word}"
    sanitized_text = sanitize_text(text_with_long_word)
    assert len(sanitized_text) > 0

def test_generate_pdf_no_original_filename():
    """Test generate_pdf function without original_filename."""
    test_data = {
        "title": "Test Meeting",
        "summary": "Test summary",
        "action_points": ["Point 1", "Point 2"],
        "transcription": "Test transcript",
        "duration": "300"
    }
    
    # Mock secure_filename to avoid actual file system operations
    with patch('backend.pdf_generator.secure_filename', return_value='safe_filename'):
        # Mock FPDF class to prevent actual PDF creation
        with patch('backend.pdf_generator.FPDF') as MockFPDF:
            mock_pdf = MockFPDF.return_value
            mock_pdf.output.return_value = None  # Simulate successful PDF creation
            
            pdf_path = generate_pdf(test_data, job_id="test_job_id")
            
            assert pdf_path is not None
            assert "pdf_output_files" in pdf_path
