import os
import sys
import json
import time
import traceback
import logging
from typing import Dict, Any, Optional
from dotenv import load_dotenv

# Add project root to Python path to allow imports
project_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..'))
sys.path.insert(0, project_root)

# Configure logging for detailed output
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("openai_debug.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger('openai_debug')

def validate_api_key() -> bool:
    """Validate that the OpenAI API key exists and has the correct format."""
    load_dotenv()  # Load environment variables from .env file
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("OpenAI API key not found in environment variables")
        return False
    
    # Check basic format (starts with "sk-" and has sufficient length)
    if not api_key.startswith("sk-") or len(api_key) < 20:
        logger.error("OpenAI API key has invalid format (should start with 'sk-' and be at least 20 chars)")
        return False
    
    logger.info("OpenAI API key found and has valid format")
    return True

def get_token_param_name(model: str) -> str:
    """
    Get the correct token parameter name based on model type.
    Newer models like o3-mini use max_completion_tokens instead of max_tokens.
    """
    newer_models = ['o3', 'gpt-4o', 'gpt-4.5']
    
    # Check if the model name contains any of the newer model identifiers
    if any(model_id in model for model_id in newer_models):
        return "max_completion_tokens"
    else:
        return "max_tokens"

def test_openai_connection(model: str = "o3-mini") -> Dict[str, Any]:
    """Test connection to OpenAI API with a simple request."""
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        return {"success": False, "error": "API key not found"}
    
    try:
        # Import here to avoid issues if OpenAI package not installed
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        logger.info(f"Testing connection with model: {model}")
        start_time = time.time()
        
        # Use the correct token parameter based on model
        token_param = get_token_param_name(model)
        params = {
            "model": model,
            "messages": [{"role": "system", "content": "Respond with 'OpenAI API is working'"}],
            token_param: 10
        }
        
        logger.info(f"Using token parameter: {token_param}")
        response = client.chat.completions.create(**params)
        
        elapsed_time = time.time() - start_time
        
        logger.info(f"OpenAI API response received in {elapsed_time:.2f}s")
        logger.info(f"Model used: {model}")
        logger.info(f"Response: {response.choices[0].message.content}")
        
        return {
            "success": True,
            "response": response.choices[0].message.content,
            "response_time": elapsed_time,
            "model": model
        }
    except ImportError:
        logger.error("OpenAI package not installed. Run: pip install openai")
        return {"success": False, "error": "OpenAI package not installed"}
    except Exception as e:
        logger.error(f"Error testing OpenAI API: {str(e)}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }

def debug_openai_request(
    prompt: str, 
    model: str = None, 
    temperature: float = 0.3,
    max_tokens: int = 100
) -> Optional[Dict[str, Any]]:
    """
    Debug an OpenAI API request with detailed logging.
    
    Args:
        prompt: The prompt text to send
        model: OpenAI model to use (defaults to env var or o3-mini)
        temperature: Temperature parameter (0.0-1.0)
        max_tokens: Maximum tokens in response
        
    Returns:
        Dictionary with response information or None if error
    """
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("OpenAI API key not found")
        return None
    
    if not model:
        model = os.getenv("OPENAI_MODEL", "o3-mini")
    
    # Log request parameters
    logger.info(f"OpenAI API request:")
    logger.info(f"  Model: {model}")
    logger.info(f"  Temperature: {temperature}")
    logger.info(f"  Token limit: {max_tokens}")
    logger.info(f"  Prompt length: {len(prompt)} chars")
    logger.info(f"  Prompt preview: {prompt[:100]}...")
    
    try:
        # Import here to avoid issues if OpenAI package not installed
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        # Time the API call
        start_time = time.time()
        
        # Use the correct token parameter based on model
        token_param = get_token_param_name(model)
        params = {
            "model": model,
            "messages": [{"role": "user", "content": prompt}],
            "temperature": temperature,
            token_param: max_tokens
        }
        
        logger.info(f"Using token parameter: {token_param}")
        logger.info("Sending request to OpenAI API...")
        
        response = client.chat.completions.create(**params)
        
        elapsed_time = time.time() - start_time
        
        # Log response information
        logger.info(f"API Response received in {elapsed_time:.2f}s")
        content = response.choices[0].message.content
        logger.info(f"Response length: {len(content)} chars")
        logger.info(f"Response preview: {content[:100]}...")
        
        return {
            "success": True,
            "response": content,
            "elapsed_time": elapsed_time,
            "model": model,
            "prompt_tokens": len(prompt) // 4,  # rough estimate
            "completion_tokens": len(content) // 4  # rough estimate
        }
    except ImportError:
        logger.error("OpenAI package not installed. Run: pip install openai")
        return None
    except Exception as e:
        logger.error(f"OpenAI API error: {str(e)}")
        logger.error(f"Error type: {type(e).__name__}")
        traceback.print_exc()
        return {
            "success": False,
            "error": str(e),
            "error_type": type(e).__name__
        }

def test_meeting_minutes_generation():
    """
    Test the meeting minutes generation with a sample transcript.
    This function directly tests the generate_meeting_minutes function.
    """
    try:
        from backend.meeting_minutes import generate_meeting_minutes
        
        # Simple test transcript
        test_transcript = """
        [00:01] Speaker 1: Good morning everyone. Let's discuss our project timeline.
        [00:10] Speaker 2: We need to push the deadline by two weeks due to technical issues.
        [00:18] Speaker 1: Can you elaborate on these issues?
        [00:25] Speaker 2: The payment system integration is more complex than anticipated.
        [00:42] Speaker 1: Let's schedule another meeting to address this.
        """
        
        logger.info("Testing generate_meeting_minutes with sample transcript")
        logger.info(f"Transcript length: {len(test_transcript)} chars")
        
        # Track time for the full operation
        start_time = time.time()
        
        # Generate minutes
        minutes = generate_meeting_minutes(test_transcript)
        
        elapsed_time = time.time() - start_time
        
        # Log results
        logger.info(f"Minutes generated in {elapsed_time:.2f}s")
        logger.info(f"Title: {minutes.get('title', 'No title')}")
        logger.info(f"Summary: {minutes.get('summary', 'No summary')}")
        logger.info(f"Action points: {json.dumps(minutes.get('action_points', []), indent=2)}")
        
        return minutes
    except Exception as e:
        logger.error(f"Error in test_generate_meeting_minutes: {str(e)}")
        traceback.print_exc()
        return None

def inspect_openai_models():
    """List available OpenAI models to verify API access."""
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("OpenAI API key not found")
        return None
    
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        logger.info("Requesting available models from OpenAI API...")
        response = client.models.list()
        
        model_ids = [model.id for model in response.data]
        logger.info(f"Available models count: {len(model_ids)}")
        logger.info(f"First 5 models: {model_ids[:5]}")
        
        # Check specifically for o3-mini
        o3_mini_available = any(model.id == "o3-mini" for model in response.data)
        logger.info(f"o3-mini model available: {o3_mini_available}")
        
        return model_ids
    except Exception as e:
        logger.error(f"Error listing OpenAI models: {str(e)}")
        traceback.print_exc()
        return None

def check_api_billing():
    """
    Check if there might be billing issues with the OpenAI API key.
    This performs a simple test request to detect billing problems.
    """
    load_dotenv()
    api_key = os.getenv("OPENAI_API_KEY")
    
    if not api_key:
        logger.error("OpenAI API key not found")
        return {"success": False, "error": "API key not found"}
    
    try:
        from openai import OpenAI
        
        client = OpenAI(api_key=api_key)
        
        # Try a very small request first
        logger.info("Testing API with minimal request to check for billing issues...")
        
        # Use the correct token parameter for o3-mini
        token_param = get_token_param_name("o3-mini")
        params = {
            "model": "o3-mini",
            "messages": [{"role": "user", "content": "Hello"}],
            token_param: 1  # Request just one token
        }
        
        logger.info(f"Using token parameter: {token_param}")
        response = client.chat.completions.create(**params)
        
        return {
            "success": True,
            "message": "API billing appears to be working correctly"
        }
    except Exception as e:
        error_str = str(e).lower()
        
        if "billing" in error_str or "payment" in error_str or "quota" in error_str:
            logger.error(f"Likely billing issue detected: {str(e)}")
            return {
                "success": False,
                "error": str(e),
                "likely_cause": "billing",
                "suggestion": "Check your OpenAI account for billing issues or exceeded quotas"
            }
        else:
            logger.error(f"Error in API request: {str(e)}")
            return {
                "success": False,
                "error": str(e)
            }

if __name__ == "__main__":
    print("===== OpenAI API Debugging Tool =====")
    
    # Set log level to DEBUG for more detailed output
    logger.setLevel(logging.DEBUG)
    
    print("\n1. Validating API Key...")
    valid_key = validate_api_key()
    print(f"API Key validation: {'✅ Passed' if valid_key else '❌ Failed'}")
    
    if not valid_key:
        print("\nAPI key validation failed. Please check:")
        print("- Your .env file contains OPENAI_API_KEY=sk-...")
        print("- The key starts with 'sk-' and is complete")
        print("- The API key hasn't been revoked or expired")
        sys.exit(1)
    
    print("\n2. Testing API Connection...")
    connection_result = test_openai_connection()
    print(f"Connection test: {'✅ Passed' if connection_result.get('success') else '❌ Failed'}")
    
    if not connection_result.get('success'):
        print(f"\nConnection failed: {connection_result.get('error')}")
        print("\nChecking billing status...")
        billing_result = check_api_billing()
        if not billing_result.get('success'):
            print(f"Billing check failed: {billing_result.get('suggestion') or billing_result.get('error')}")
    else:
        print(f"Response: {connection_result.get('response')}")
        print(f"Response time: {connection_result.get('response_time'):.2f}s")
    
    print("\n3. Listing Available Models...")
    models = inspect_openai_models()
    if models:
        print(f"Successfully retrieved {len(models)} available models")
        o3_mini_available = "o3-mini" in models
        print(f"o3-mini model available: {'✅ Yes' if o3_mini_available else '❌ No'}")
    else:
        print("Failed to retrieve models")
    
    print("\n4. Testing Meeting Minutes Generation...")
    minutes_result = test_meeting_minutes_generation()
    if minutes_result:
        print("✅ Meeting minutes generation successful")
        print(f"Summary: {minutes_result.get('summary', '')[:100]}...")
        print(f"Action points: {len(minutes_result.get('action_points', []))} items")
    else:
        print("❌ Meeting minutes generation failed")
    
    print("\nComplete log information available in openai_debug.log")