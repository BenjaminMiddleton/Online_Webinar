# auth.py
import msal
import os

CLIENT_ID = os.getenv("TEAMS_CLIENT_ID")
CLIENT_SECRET = os.getenv("TEAMS_CLIENT_SECRET")
TENANT_ID = os.getenv("TEAMS_TENANT_ID")
AUTHORITY = os.getenv("AUTHORITY", f"https://login.microsoftonline.com/{TENANT_ID}")
SCOPES = ["https://graph.microsoft.com/.default"]

def get_access_token():
    app = msal.ConfidentialClientApplication(CLIENT_ID, CLIENT_SECRET, authority=AUTHORITY)
    result = app.acquire_token_for_client(scopes=SCOPES)
    if "access_token" in result:
        return result["access_token"]
    else:
        raise Exception("Could not acquire access token")