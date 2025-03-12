"""Simple PDF generator for meeting minutes using FPDF."""

import os
import logging
import io
import re
from datetime import datetime
from typing import Dict, Any, BinaryIO
from werkzeug.utils import secure_filename
from flask import send_file
from fpdf import FPDF

# Configure logging
logger = logging.getLogger(__name__)

def sanitize_text(text):
    """Clean text to avoid PDF encoding issues"""
    if not text:
        return ""
    
    # Remove control characters
    text = re.sub(r'[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', text)
    
    # Handle encoding issues
    text = text.encode('utf-8', errors='ignore').decode('utf-8')
    
    # Break very long words to prevent FPDF layout issues
    # Split words longer than 40 characters by inserting soft hyphens
    words = text.split()
    result = []
    for word in words:
        if len(word) > 40:
            # Insert soft breaks for very long words
            chunks = [word[i:i+40] for i in range(0, len(word), 40)]
            result.append(' '.join(chunks))
        else:
            result.append(word)
    
    return ' '.join(result)

def generate_pdf(data: Dict[str, Any], job_id: str = None, original_filename: str = None) -> str:
    """Generate a PDF document using FPDF."""
    logger.info("Generating PDF with FPDF...")
    
    # Setup output directory
    pdf_dir = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'pdf_output_files'))
    os.makedirs(pdf_dir, exist_ok=True)
    
    # Define safe_title early to ensure it exists for error handling
    safe_title = "meeting_minutes"
    
    # Generate filename
    if original_filename:
        base_name = os.path.splitext(os.path.basename(original_filename))[0]
        safe_name = secure_filename(base_name)
        pdf_filename = f"{safe_name}.pdf"
    else:
        job_id_safe = job_id or datetime.now().strftime("%Y%m%d_%H%M%S")
        title_text = data.get("title", "meeting_minutes")
        safe_title = secure_filename(title_text)
        pdf_filename = f"{job_id_safe}_{safe_title}.pdf"
    
    filepath = os.path.join(pdf_dir, pdf_filename)
    
    try:
        # Create PDF
        pdf = FPDF()
        pdf.set_auto_page_break(True, margin=15)
        pdf.add_page()
        
        # Add title
        title = sanitize_text(data.get('title', 'Meeting Minutes'))
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, title, 0, 1, 'C')
        pdf.ln(5)
        
        # Add metadata (date, duration)
        pdf.set_font('Arial', '', 11)
        pdf.cell(0, 6, f"Date: {datetime.now().strftime('%d/%m/%Y')}", 0, 1)
        if data.get('duration'):
            pdf.cell(0, 6, f"Duration: {sanitize_text(data['duration'])}", 0, 1)
        pdf.ln(5)
        
        # Add summary section
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, "Summary", 0, 1)
        pdf.set_font('Arial', '', 11)
        
        # Handle multi-line summary with proper wrapping
        summary = sanitize_text(data.get('summary', 'No summary available'))
        pdf.multi_cell(0, 6, summary)
        pdf.ln(5)
        
        # Add action points
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, "Action Points", 0, 1)
        pdf.set_font('Arial', '', 11)
        
        action_points = data.get('action_points', [])
        if action_points:
            for point in action_points:
                if point and point.strip():
                    # Sanitize text to avoid FPDF errors
                    point_text = sanitize_text(point)
                    try:
                        pdf.cell(10, 6, chr(127), 0, 0)  # Bullet point
                        pdf.multi_cell(0, 6, point_text)
                    except Exception as cell_err:
                        logger.warning(f"Skipping problematic action point: {str(cell_err)}")
                        # Try with plain text without bullet
                        try:
                            pdf.multi_cell(0, 6, f"- {point_text}")
                        except:
                            # If still fails, just skip this item
                            pass
        else:
            pdf.cell(0, 6, "No action points recorded", 0, 1)
        pdf.ln(5)
        
        # Add transcript if available
        if data.get('transcription'):
            pdf.set_font('Arial', 'B', 14)
            pdf.cell(0, 10, "Transcript", 0, 1)
            pdf.set_font('Courier', '', 9)  # Use monospace font for transcript
            
            # Handle transcript with line breaks
            transcript = sanitize_text(data['transcription'])
            lines = transcript.split('\n')
            for line in lines:
                if line.strip():
                    try:
                        pdf.multi_cell(0, 5, line)
                    except Exception as line_err:
                        logger.warning(f"Skipping problematic transcript line: {str(line_err)}")
                        # Try a shorter version of the line
                        try:
                            pdf.multi_cell(0, 5, line[:100] + "...")
                        except:
                            # If still fails, just skip this line
                            pass
        
        # Save the PDF
        pdf.output(filepath)
        logger.info(f"PDF successfully generated at {filepath}")
        
        return filepath
        
    except Exception as e:
        logger.error(f"Error generating PDF: {str(e)}")
        
        # Create text file as fallback
        txt_path = os.path.join(pdf_dir, f"{job_id or 'fallback'}_{safe_title}.txt")
        try:
            with open(txt_path, 'w', encoding='utf-8') as f:
                f.write(f"TITLE: {data.get('title', 'Meeting Minutes')}\n\n")
                f.write(f"DATE: {datetime.now().strftime('%d/%m/%Y')}\n")
                f.write(f"DURATION: {data.get('duration', 'N/A')}\n\n")
                f.write(f"SUMMARY:\n{data.get('summary', 'No summary available')}\n\n")
                f.write("ACTION POINTS:\n")
                for point in data.get('action_points', []):
                    f.write(f"- {point}\n")
                f.write("\n\nTRANSCRIPT:\n")
                f.write(data.get('transcription', 'No transcript available'))
            logger.info(f"Created fallback text file: {txt_path}")
            return txt_path
        except Exception as txt_err:
            logger.error(f"Error creating fallback text file: {txt_err}")
            raise

def generate_downloadable_pdf(data: Dict[str, Any]) -> BinaryIO:
    """Generate a PDF for direct download."""
    try:
        buffer = io.BytesIO()
        filepath = generate_pdf(data)
        with open(filepath, 'rb') as f:
            buffer.write(f.read())
        buffer.seek(0)
        return buffer
    except Exception as e:
        logger.error(f"Error creating downloadable PDF: {str(e)}")
        raise

def get_pdf_response(data: Dict[str, Any], filename: str = None) -> Any:
    """Helper to generate PDF and return appropriate Flask response"""
    try:
        pdf_buffer = generate_downloadable_pdf(data)
        safe_filename = secure_filename(filename or data.get('title', 'meeting_minutes')) + '.pdf'
        
        return send_file(
            pdf_buffer,
            mimetype='application/pdf',
            as_attachment=True,
            download_name=safe_filename
        )
    except Exception as e:
        logger.error(f"Error sending PDF: {str(e)}")
        raise

# Example usage
if __name__ == "__main__":
    from flask import Flask
    app = Flask(__name__)
    
    minutes = {
        "title": "Team Meeting",
        "duration": "1 hour",
        "summary": "Discussed project updates and next steps.",
        "action_points": ["Complete the report by Friday.", "Schedule the next meeting."],
        "transcription": "Meeting started at 10 AM. Discussed project updates..."
    }
    job_id = "12345"
    
    pdf_path = generate_pdf(minutes, job_id)
    app.logger.info(f"PDF generated at {pdf_path}")