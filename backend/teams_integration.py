# teams_integration.py
import requests
from backend.auth import get_access_token

GRAPH_API_BASE = "https://graph.microsoft.com/v1.0"
MEETINGS_ENDPOINT = f"{GRAPH_API_BASE}/me/onlineMeetings"

def get_active_meetings():
    token = get_access_token()
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(MEETINGS_ENDPOINT, headers=headers)
    if response.status_code == 200:
        meetings = response.json().get("value", [])
        return meetings
    return []

def get_meeting_details(meeting_id):
    token = get_access_token()
    url = f"{GRAPH_API_BASE}/me/onlineMeetings/{meeting_id}"
    headers = {"Authorization": f"Bearer {token}"}
    response = requests.get(url, headers=headers)
    if response.status_code == 200:
        return response.json()
    return None