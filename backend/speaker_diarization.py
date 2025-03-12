import os
from dotenv import load_dotenv
import uuid
import traceback
from faster_whisper import WhisperModel
from pydub import AudioSegment
from pyannote.audio import Pipeline
import numpy as np
import threading
from concurrent.futures import ThreadPoolExecutor
import logging
import tempfile
import subprocess
import wave
import soundfile as sf

# Add this function at the top of the file
def format_duration(seconds):
    """Format duration in seconds to HH:MM:SS or MM:SS format."""
    minutes, seconds = divmod(seconds, 60)
    hours, minutes = divmod(minutes, 60)
    if hours > 0:
        return f"{int(hours):02d}:{int(minutes):02d}:{int(seconds):02d}"
    else:
        return f"{int(minutes):02d}:{int(seconds):02d}"

# Add this function to format duration in HH:MM:SS format
def format_duration_hh_mm_ss(seconds):
    """Format seconds into HH:MM:SS format."""
    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    seconds_int = int(seconds % 60)
    return f"{hours:02d}:{minutes:02d}:{seconds_int:02d}"

# Load environment variables
load_dotenv()
HF_TOKEN = os.getenv("HF_TOKEN")

whisper_model = None  # Initialize as None
diarization_pipeline = None

# Create a logger for this module
logger = logging.getLogger(__name__)

def load_models():
    """Loads the Whisper and Pyannote models."""
    global whisper_model, diarization_pipeline
    try:
        # Try CUDA with float16 first
        print("Attempting CUDA with float16...")
        whisper_model = WhisperModel("medium.en", device="cuda", compute_type="float16")
        print("Successfully loaded model with CUDA float16")
    except ValueError:
        try:
            # Try CUDA with float32
            print("Attempting CUDA with float32...")
            whisper_model = WhisperModel("medium.en", device="cuda", compute_type="float32")
            print("Successfully loaded model with CUDA float32")
        except:
            # CPU fallback
            print("Falling back to CPU with int8...")
            whisper_model = WhisperModel("medium.en", device="cpu", compute_type="int8")
            print("Successfully loaded model with CPU int8")

    diarization_pipeline = Pipeline.from_pretrained(
        "pyannote/speaker-diarization",
        use_auth_token=HF_TOKEN  # Use token from environment
    )
    print("Diarization pipeline loaded.")

def transcribe_segment(segment_audio, language="en", beam_size=1, best_of=1):
    """Transcribes a single audio segment using Faster Whisper."""
    global whisper_model
    temp_filename = f"temp_segment_{uuid.uuid4()}.wav"
    segment_audio.export(temp_filename, format="wav")

    try:
        transcribed_segments, _ = whisper_model.transcribe(
            temp_filename,
            language=language,
            beam_size=beam_size,
            best_of=best_of
        )
        text_segment = " ".join([seg.text for seg in transcribed_segments]).strip()
        return text_segment
    except Exception as e:
        print(f"Error transcribing segment: {e}")
        return ""  # Return an empty string in case of error
    finally:
        # Cleanup temp file
        if os.path.exists(temp_filename):
            try:
                os.remove(temp_filename)
            except OSError as e:
                print(f"Error deleting temp file: {e}")

def preprocess_audio_file(filepath: str) -> str:
    """
    Preprocess audio file to ensure it's in a compatible format for diarization.
    Returns path to the processed file that should be used instead.
    """
    logger.info(f"Preprocessing audio file: {filepath}")
    
    try:
        # Create a temporary file with standardized WAV format that pyannote can handle
        temp_dir = tempfile.gettempdir()
        processed_filepath = os.path.join(temp_dir, f"processed_{uuid.uuid4()}.wav")
        
        # First try to load with pydub which is more forgiving of formats
        try:
            audio = AudioSegment.from_file(filepath)
            logger.info(f"Successfully loaded audio with pydub: {len(audio)/1000:.2f} seconds, {audio.channels} channels, {audio.frame_rate} Hz")
            
            # Export with standard parameters: WAV, 16-bit PCM, 16kHz mono
            audio = audio.set_channels(1)  # Convert to mono
            audio = audio.set_frame_rate(16000)  # Convert to 16kHz (standard for many speech models)
            audio = audio.set_sample_width(2)  # Set to 16-bit
            
            logger.info(f"Exporting processed audio to {processed_filepath}")
            audio.export(processed_filepath, format="wav", parameters=["-ac", "1", "-ar", "16000"])
        except Exception as pydub_error:
            logger.error(f"Failed to load/convert audio with pydub: {str(pydub_error)}")
            
            # Try FFMPEG directly as a fallback 
            try:
                logger.info(f"Attempting direct ffmpeg conversion for {filepath}")
                ffmpeg_cmd = [
                    "ffmpeg", "-y", "-i", filepath, 
                    "-acodec", "pcm_s16le", 
                    "-ac", "1", 
                    "-ar", "16000",
                    processed_filepath
                ]
                subprocess.run(ffmpeg_cmd, check=True, capture_output=True)
                logger.info(f"FFMPEG conversion successful to {processed_filepath}")
            except Exception as ffmpeg_error:
                logger.error(f"FFMPEG conversion failed: {str(ffmpeg_error)}")
                # If both pydub and ffmpeg fail, re-raise the original error
                raise pydub_error
        
        # Verify the processed file exists and has content
        if os.path.exists(processed_filepath) and os.path.getsize(processed_filepath) > 0:
            # Additional validation - try to open with soundfile to confirm it will work with pyannote
            try:
                with sf.SoundFile(processed_filepath) as sf_file:
                    logger.info(f"Verified processed file with soundfile: {sf_file.samplerate}Hz, {sf_file.channels} channels")
            except Exception as sf_error:
                logger.error(f"Processed file validation failed with soundfile: {str(sf_error)}")
                # Try to fix the WAV header if soundfile still can't read it
                try:
                    logger.info("Attempting to fix WAV header...")
                    fix_wav_header(processed_filepath)
                    # Verify again
                    with sf.SoundFile(processed_filepath) as sf_file:
                        logger.info(f"Successfully fixed WAV header: {sf_file.samplerate}Hz, {sf_file.channels} channels")
                except Exception as header_error:
                    logger.error(f"Failed to fix WAV header: {str(header_error)}")
                    return filepath  # Return original if we can't fix it
            
            logger.info(f"Successfully created processed audio file: {processed_filepath}")
            return processed_filepath
        else:
            logger.error(f"Failed to create processed audio file or file is empty")
            # Return the original path as fallback
            return filepath
            
    except Exception as e:
        logger.error(f"Error preprocessing audio: {str(e)}")
        # If preprocessing fails, return the original path and let the caller handle any errors
        return filepath

def fix_wav_header(filepath: str) -> None:
    """
    Attempt to fix WAV header issues by reading and rewriting the file with wave module.
    """
    try:
        # Create a temporary file
        temp_filepath = f"{filepath}.temp.wav"
        
        # Use pydub to read and rewrite the file with standard WAV format
        try:
            audio = AudioSegment.from_file(filepath)
            audio.export(temp_filepath, format="wav")
            
            # Replace the original file with the fixed one
            os.replace(temp_filepath, filepath)
            logger.info(f"WAV header fixed for {filepath}")
        except Exception as decode_error:
            # Wrap original exception with our specific error message for test matching
            error_msg = f"Failed to fix WAV header: {str(decode_error)}"
            logger.error(error_msg)
            raise Exception(error_msg) from decode_error
            
    except Exception as e:
        # Don't rewrap exceptions that already have our "Failed to fix" message
        if "Failed to fix" not in str(e):
            logger.error(f"Error fixing WAV header: {str(e)}")
        # Clean up temp file if it exists
        if os.path.exists(f"{filepath}.temp.wav"):
            try:
                os.remove(f"{filepath}.temp.wav")
            except:
                pass
        raise

def diarize_audio(filepath: str) -> tuple[str, list[str], str]:
    """
    Process audio file for speaker diarization and transcription.
    Returns the transcript, list of speakers, and formatted duration.
    """
    global whisper_model, diarization_pipeline
    logger.info(f"Loading audio from {filepath}")
    
    try:
        # Check if file exists before attempting to read
        if not os.path.exists(filepath):
            error_msg = f"File does not exist: {filepath}"
            logger.error(error_msg)
            raise FileNotFoundError(error_msg)
            
        # First try to load the audio with pydub to get basic info and check if it's valid
        try:
            audio_source = AudioSegment.from_file(filepath)
            
            # Get the audio duration in seconds
            duration_seconds = len(audio_source) / 1000.0
            formatted_duration = format_duration_hh_mm_ss(duration_seconds)
            logger.info(f"Audio duration: {formatted_duration} ({duration_seconds:.2f} seconds)")
            
            # Get file size in MB
            file_size_mb = os.path.getsize(filepath) / (1024 * 1024)
            logger.info(f"File size: {file_size_mb:.2f} MB")
        except Exception as pydub_error:
            logger.error(f"Error loading audio with pydub: {str(pydub_error)}")
            # If pydub can't load it, try preprocessing before giving up
            logger.info("Attempting to preprocess the audio file...")
            processed_filepath = preprocess_audio_file(filepath)
            
            if processed_filepath != filepath:
                logger.info(f"Using preprocessed file: {processed_filepath}")
                filepath = processed_filepath
                # Try loading again with the processed file
                audio_source = AudioSegment.from_file(filepath)
                duration_seconds = len(audio_source) / 1000.0
                formatted_duration = format_duration_hh_mm_ss(duration_seconds)
            else:
                # If preprocessing didn't help, raise the original error
                raise
        
        # Always preprocess the audio file to ensure compatibility with pyannote
        # This is critical even if pydub could read it, as soundfile is more strict
        processed_filepath = preprocess_audio_file(filepath)
        if processed_filepath != filepath:
            logger.info(f"Using preprocessed file: {processed_filepath}")
            filepath = processed_filepath
            # Need to reload the audio source with the new file
            audio_source = AudioSegment.from_file(filepath)
        
        # Check if this is a large file (>24MB) that needs chunking
        max_file_size_mb = 24  # 24MB threshold for chunking
        if file_size_mb > max_file_size_mb:
            logger.info(f"Large audio file detected ({file_size_mb:.2f} MB). Processing in chunks...")
            transcript, speakers = diarize_audio_in_chunks(filepath, audio_source, max_file_size_mb)
            logger.info(f"Chunked processing complete. Found {len(speakers)} speakers. Transcript length: {len(transcript)} chars")
            return transcript, speakers, formatted_duration
        
        # For small files, process normally
        logger.info("Processing audio with diarization pipeline...")
        try:
            # Verify file can be opened by soundfile before passing to pipeline
            try:
                with sf.SoundFile(filepath) as sf_file:
                    logger.info(f"File validated with soundfile: {sf_file.samplerate}Hz, {sf_file.channels} channels")
            except Exception as sf_error:
                logger.error(f"File validation failed with soundfile: {str(sf_error)}")
                # Try one more preprocessing attempt with more aggressive parameters
                logger.info("Attempting more aggressive preprocessing...")
                processed_filepath = preprocess_audio_file(filepath)
                if processed_filepath != filepath:
                    filepath = processed_filepath
                    audio_source = AudioSegment.from_file(filepath)
            
            diarization_result = diarization_pipeline(filepath)
        except Exception as diarization_error:
            logger.error(f"Diarization pipeline error: {str(diarization_error)}")
            # If the pipeline fails even with preprocessed audio, try to fall back to just transcription
            logger.info("Falling back to transcription-only processing (no speaker diarization)")
            
            # Export the whole audio to a temp file for transcription
            temp_filename = f"temp_full_{uuid.uuid4()}.wav"
            audio_source.export(temp_filename, format="wav")
            
            try:
                # Transcribe the whole file
                transcribed_segments, _ = whisper_model.transcribe(temp_filename)
                transcript = " ".join([seg.text for seg in transcribed_segments]).strip()
                # No speaker information, so just use "Speaker" as placeholder
                speaker_label = "Speaker"
                speakers = [speaker_label]
                
                # Format without timestamps since we don't have segment info
                full_transcript = f"[00:00] {speaker_label}: {transcript}"
                
                # Clean up
                try:
                    os.remove(temp_filename)
                except:
                    pass
                    
                return full_transcript, speakers, formatted_duration
            except Exception as whisper_error:
                logger.error(f"Whisper transcription error: {str(whisper_error)}")
                # Clean up
                try:
                    os.remove(temp_filename)
                except:
                    pass
                # If both methods fail, re-raise the original error
                raise diarization_error
        
        # Extract segments with speaker information
        segments = []
        for turn, _, speaker_label in diarization_result.itertracks(yield_label=True):
            segments.append((turn.start, turn.end, speaker_label))
        
        # Sort segments by start time
        segments.sort(key=lambda x: x[0])
        logger.info(f"Found {len(segments)} segments with {len(set(s[2] for s in segments))} speakers")
        
        # Get unique speakers
        speakers = sorted(list(set(s[2] for s in segments)))
        
        # Generate transcript with speaker identification
        full_transcript = ""
        
        # Process segments in parallel for faster transcription
        with ThreadPoolExecutor(max_workers=4) as executor:
            futures = []
            for start_time, end_time, speaker_id in segments:
                # Extract segment from audio
                segment_audio = audio_source[start_time * 1000:end_time * 1000]
                futures.append(executor.submit(transcribe_segment, segment_audio))
            
            # Wait for all transcriptions to complete
            transcribed_segments = [future.result() for future in futures]
        
        # Build transcript with speaker identification and timestamps
        for i, text_segment in enumerate(transcribed_segments):
            if text_segment and text_segment.strip():  # Skip empty segments
                start_time, end_time, speaker_id = segments[i]
                timestamp = format_duration(start_time)
                full_transcript += f"[{timestamp}] {speaker_id}: {text_segment}\n"
        
        # Clean up temporary processed file if we created one
        if 'processed_filepath' in locals() and processed_filepath != filepath and os.path.exists(processed_filepath):
            try:
                os.remove(processed_filepath)
                logger.info(f"Removed temporary processed file: {processed_filepath}")
            except Exception as e:
                logger.warning(f"Could not remove temporary file: {str(e)}")
        
        logger.info(f"Transcription complete. Transcript length: {len(full_transcript)} chars")
        return full_transcript, speakers, formatted_duration
        
    except Exception as e:
        logger.error(f"Error in diarize_audio: {str(e)}")
        logger.error(traceback.format_exc())
        
        # Clean up any temporary files
        if 'processed_filepath' in locals() and processed_filepath != filepath and os.path.exists(processed_filepath):
            try:
                os.remove(processed_filepath)
            except:
                pass
                
        raise

def diarize_audio_in_chunks(filepath: str, audio_source, max_chunk_duration: int) -> tuple[str, list[str]]:
    """Process longer audio files in manageable chunks."""
    global whisper_model, diarization_pipeline
    
    # Get total duration in seconds
    total_duration_sec = len(audio_source) / 1000
    logger.info(f"Processing audio with total duration: {format_duration(total_duration_sec)}")
    
    chunk_size_ms = max_chunk_duration * 1000
    merged_transcript = ""
    all_speakers = set()
    speaker_mapping = {}  # To ensure consistent speaker IDs across chunks
    last_speaker = None
    
    # Process in chunks
    for chunk_index, start_ms in enumerate(range(0, len(audio_source), chunk_size_ms)):
        end_ms = min(start_ms + chunk_size_ms, len(audio_source))
        logger.info(f"Processing chunk from {format_duration(start_ms/1000)} to {format_duration(end_ms/1000)}")
        
        # Extract audio chunk
        chunk_audio = audio_source[start_ms:end_ms]
        
        # Save chunk to temp file
        chunk_filename = f"temp_chunk_{uuid.uuid4()}.wav"
        chunk_filepath = os.path.join(os.path.dirname(filepath), chunk_filename)
        chunk_audio.export(chunk_filepath, format="wav")
        
        try:
            # Process this chunk
            diarization_result = diarization_pipeline(chunk_filepath)
            segments = []
            
            # Get diarization segments for this chunk
            for turn, _, speaker_label in diarization_result.itertracks(yield_label=True):
                segments.append((turn.start, turn.end, speaker_label))
            segments.sort(key=lambda x: x[0])
            
            # Adjust segment times to account for chunk position
            adjusted_segments = []
            for start_time, end_time, speaker_id in segments:
                # Add the chunk start time to get the actual timestamp in the full audio
                adjusted_start = start_time + (start_ms / 1000)
                adjusted_end = end_time + (start_ms / 1000)
                adjusted_segments.append((adjusted_start, adjusted_end, speaker_id))
            
            # Transcribe each segment within the chunk
            segment_transcripts = []
            
            with ThreadPoolExecutor(max_workers=4) as executor:
                futures = []
                for start_time, end_time, _ in segments:
                    # Extract segment from chunk using original segment times
                    segment_audio = chunk_audio[int(start_time * 1000):int(end_time * 1000)]
                    futures.append(executor.submit(transcribe_segment, segment_audio))
                
                # Collect results as they complete
                for future in futures:
                    try:
                        result = future.result()
                        segment_transcripts.append(result)
                    except Exception as e:
                        logger.error(f"Error transcribing segment: {str(e)}")
                        segment_transcripts.append("")
            
            # Build transcript for this chunk using adjusted timestamps
            chunk_transcript = ""
            for i, (transcript_text, (adjusted_start, adjusted_end, speaker_id)) in enumerate(zip(segment_transcripts, adjusted_segments)):
                if transcript_text and transcript_text.strip():  # Skip empty segments
                    # Ensure consistent speaker mapping across chunks
                    if speaker_id not in speaker_mapping:
                        speaker_mapping[speaker_id] = f"Speaker {len(speaker_mapping) + 1}"
                    
                    speaker_label = speaker_mapping[speaker_id]
                    all_speakers.add(speaker_label)
                    
                    # Format timestamp for the start of each utterance 
                    timestamp = format_duration(adjusted_start)
                    
                    # Add to transcript with timestamp - only include timestamp if speaker changes
                    if last_speaker != speaker_label:
                        chunk_transcript += f"[{timestamp}] {speaker_label}: {transcript_text}\n"
                    else:
                        chunk_transcript += f"{transcript_text}\n"
                    
                    last_speaker = speaker_label
            
            # Add separator between chunks for readability
            if chunk_transcript:
                merged_transcript += chunk_transcript
                # Log progress
                logger.info(f"Completed chunk {chunk_index + 1}. Transcript length so far: {len(merged_transcript)}")
            else:
                logger.warning(f"No transcript generated for chunk {chunk_index + 1}")
                
        except Exception as e:
            logger.error(f"Error processing chunk {chunk_index + 1}: {str(e)}")
            logger.error(traceback.format_exc())
            # Continue with next chunk instead of failing completely
        finally:
            # Clean up temp file
            if os.path.exists(chunk_filepath):
                try:
                    os.remove(chunk_filepath)
                except Exception as e:
                    logger.error(f"Failed to remove temp file {chunk_filepath}: {str(e)}")
    
    # Final cleanup of transcript
    merged_transcript = merged_transcript.strip()
    
    if not merged_transcript:
        logger.error("No transcript was generated for any chunks")
        raise Exception("Failed to generate transcript from audio chunks")
    
    logger.info(f"Final transcript length: {len(merged_transcript)}")
    return merged_transcript, list(all_speakers)