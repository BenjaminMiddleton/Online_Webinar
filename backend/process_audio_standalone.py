"""
Standalone script to process audio files through the backend without using the UI.
Simply run: python process_audio_standalone.py path/to/your/audio/file.mp3
"""

import os
import sys
import uuid
import time
import traceback
from datetime import datetime
from pathlib import Path

# Add the parent directory to the Python path
project_root = os.path.abspath(os.path.dirname(os.path.dirname(__file__)))
sys.path.insert(0, project_root)

# Import necessary backend modules directly to avoid app initialization conflicts
from backend.speaker_diarization import load_models, diarize_audio
from backend.meeting_minutes import generate_meeting_minutes
from backend.pdf_generator import generate_pdf
from backend.audio_utils import allowed_file
from backend.docx_generator import auto_save_docx

# Define allowed audio extensions directly instead of relying on Config
ALLOWED_AUDIO_EXTENSIONS = {'mp3', 'wav', 'ogg', 'flac', 'm4a', 'mp4', 'aac', 'wma'}

def create_fallback_pdf(minutes, pdf_path):
    """
    Create a PDF using FPDF as fallback when ReportLab fails.
    This is a more reliable method when dealing with stylesheet conflicts.
    
    Args:
        minutes: Dictionary containing meeting minutes data
        pdf_path: Path where PDF should be saved
        
    Returns:
        bool: True if PDF was created successfully, False otherwise
    """
    try:
        from fpdf import FPDF
        
        pdf = FPDF()
        pdf.add_page()
        
        # Set font for title
        pdf.set_font('Arial', 'B', 16)
        pdf.cell(0, 10, minutes['title'], 0, 1, 'C')
        
        # Set font for content
        pdf.set_font('Arial', '', 12)
        pdf.cell(0, 10, f"Duration: {minutes['duration']}", 0, 1)
        
        # Add summary
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, "Summary:", 0, 1)
        pdf.set_font('Arial', '', 12)
        pdf.multi_cell(0, 10, minutes['summary'])
        
        # Add action points
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, "Action Points:", 0, 1)
        pdf.set_font('Arial', '', 12)
        for point in minutes['action_points']:
            pdf.multi_cell(0, 10, f"• {point}")
        
        # Add transcript
        pdf.set_font('Arial', 'B', 14)
        pdf.cell(0, 10, "Transcript:", 0, 1)
        pdf.set_font('Arial', '', 10)
        
        # Split transcript into smaller parts to avoid buffer issues
        transcript_parts = [minutes['transcription'][i:i+1000] for i in range(0, len(minutes['transcription']), 1000)]
        for part in transcript_parts:
            pdf.multi_cell(0, 10, part)
        
        # Save PDF
        pdf.output(pdf_path)
        print(f"Created fallback PDF file: {pdf_path}")
        return True
    except Exception as pdf_err:
        print(f"Error creating fallback PDF: {pdf_err}")
        return False


def process_audio_file_standalone(audio_file_path):
    """
    Process an audio file directly through the backend pipeline
    and return the path to the generated PDF.
    
    Args:
        audio_file_path: Path to the audio file to process
        
    Returns:
        str: Path to the generated PDF file, or None if processing failed
    """
    # Check if the file exists first
    if not os.path.exists(audio_file_path):
        print(f"Error: File not found at {audio_file_path}")
        return None
        
    # Use hardcoded allowed extensions
    allowed_audio_extensions = ALLOWED_AUDIO_EXTENSIONS
    
    # Load models once before processing
    print("Loading models...")
    load_models()
    
    # Generate a job ID
    job_id = str(uuid.uuid4())
    
    # Get the original filename
    original_filename = os.path.basename(audio_file_path)
    
    # Check if file type is allowed
    if not allowed_file(original_filename, allowed_audio_extensions):
        print(f"Error: File type not supported. Allowed types: {allowed_audio_extensions}")
        return None
    
    print(f"Processing file: {original_filename}")
    print(f"Job ID: {job_id}")
    
    try:
        # Extract base filename for title
        base_filename = os.path.splitext(original_filename)[0]
        base_filename = base_filename.replace("_", " ").replace("-", " ").title()
        
        print(f"Running audio diarization...")
        start_time = time.time()
        
        # Run diarization
        transcript, speakers, audio_duration = diarize_audio(audio_file_path)
        
        print(f"Diarization complete in {time.time() - start_time:.2f} seconds")
        print(f"Found {len(speakers)} speakers, transcript length: {len(transcript)}")
        print(f"Audio duration: {audio_duration}")
        
        print("Generating meeting minutes...")
        
        # Generate minutes using LLM
        minutes = generate_meeting_minutes(transcript)
        minutes["title"] = base_filename
        minutes["duration"] = audio_duration
        minutes["speakers"] = speakers
        minutes["transcription"] = transcript
        
        print("Minutes generated successfully!")
        
        # Ensure PDF output directory exists
        pdf_output_dir = os.path.join(project_root, 'pdf_output_files')
        os.makedirs(pdf_output_dir, exist_ok=True)
        print(f"PDF output directory: {pdf_output_dir}")
        
        # Generate PDF filename
        base_name = os.path.splitext(original_filename)[0]
        pdf_filename = f"{base_name}_{job_id}.pdf"
        pdf_path = os.path.join(pdf_output_dir, pdf_filename)
        
        # Generate PDF from minutes
        print("Generating PDF...")
        
        # First attempt: Try the standard PDF generator
        pdf_generated = False
        try:
            generated_path = generate_pdf(minutes, job_id, original_filename)
            if generated_path and os.path.exists(generated_path):
                pdf_path = generated_path
                pdf_generated = True
                print(f"PDF generated using standard method at: {pdf_path}")
        except Exception as e:
            print(f"Standard PDF generation failed: {str(e)}")
        
        # Second attempt: Use fallback method if the first one failed
        if not pdf_generated:
            print("Trying fallback PDF generation method...")
            if create_fallback_pdf(minutes, pdf_path):
                pdf_generated = True
            else:
                # Last resort: Create a simple text file
                txt_path = os.path.join(pdf_output_dir, f"{base_name}_{job_id}.txt")
                print(f"Creating text file instead at: {txt_path}")
                
                with open(txt_path, 'w', encoding='utf-8') as f:
                    f.write(f"Title: {minutes['title']}\n\n")
                    f.write(f"Duration: {minutes['duration']}\n\n")
                    f.write(f"Summary: {minutes['summary']}\n\n")
                    f.write("Action Points:\n")
                    for point in minutes['action_points']:
                        f.write(f"- {point}\n")
                    f.write("\n\nTranscription:\n")
                    f.write(minutes['transcription'])
                
                print(f"Created text file with content: {txt_path}")
                pdf_path = txt_path
        
        # Generate DOCX document too
        print("Generating DOCX document...")
        try:
            docx_path = auto_save_docx(minutes, original_filename, job_id)
            print(f"DOCX generated successfully at: {docx_path}")
        except Exception as e:
            print(f"Error generating DOCX: {str(e)}")

        print("\nProcessing completed successfully!")
        print(f"Output file: {pdf_path}")
        print("Processing completed successfully!")
        return pdf_path
            
    except Exception as e:
        print(f"Error processing file: {str(e)}")
        traceback.print_exc()
        return None


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python process_audio_standalone.py path/to/your/audio/file.mp3")
        sys.exit(1)
    
    # Handle both absolute and relative paths
    audio_path = sys.argv[1]
    
    # If it's a relative path, make it relative to the project root
    if not os.path.isabs(audio_path):
        audio_path = os.path.join(project_root, audio_path)
    
    print(f"Looking for audio file at: {audio_path}")
    
    if not os.path.exists(audio_path):
        print(f"Error: File not found at {audio_path}")
        
        # Check in sample_data directory
        sample_path = os.path.join(project_root, 'sample_data', os.path.basename(audio_path))
        if os.path.exists(sample_path):
            print(f"Found file in sample_data directory instead!")
            audio_path = sample_path
        # Check in uploads directory as another fallback
        elif os.path.exists(os.path.join(project_root, 'uploads', os.path.basename(audio_path))):
            audio_path = os.path.join(project_root, 'uploads', os.path.basename(audio_path))
            print(f"Found file in uploads directory!")
        else:
            print("File not found in any directories. Please check the path.")
            sys.exit(1)
    
    print(f"Processing file: {audio_path}")
    result = process_audio_file_standalone(audio_path)
    
    if result:
        print("\nProcessing completed successfully!")
        print(f"Output file: {result}")
        print(f"You can find the file at: {os.path.abspath(result)}")
    else:
        print("\nProcessing failed. See errors above.")