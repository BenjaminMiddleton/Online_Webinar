import pytest
from unittest.mock import patch
from backend.auth import get_access_token

def test_auth():
    """Test Teams authentication"""
    with patch('msal.ConfidentialClientApplication') as mock_msal:
        mock_msal.return_value.acquire_token_for_client.return_value = {
            "access_token": "test-token"
        }
        token = get_access_token()
        assert token == "test-token"