from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
from typing import Dict, Optional, Any
import time
import json
from datetime import datetime, timedelta
from flask_mail import Mail, Message
from .config import Config

# Load environment variables
env_path = os.path.join(os.path.dirname(os.path.dirname(__file__)), '.env')
print(f"\nLoading .env from: {env_path}")

if not os.path.exists(env_path):
    print(f"Error: .env file not found at {env_path}")
else:
    print("Found .env file")
    with open(env_path, 'r') as f:
        print("Raw .env contents:")
        print(f.read())

load_dotenv(env_path)

app = Flask(__name__)

# Debug environment variables
print("\nEnvironment Variables Debug:")
print(f"Raw DAILY_API_KEY: {os.getenv('DAILY_API_KEY')}")
print(f"DAILY_API_KEY length: {len(os.getenv('DAILY_API_KEY', ''))}")
print(f"Current working directory: {os.getcwd()}")
print("-" * 50)

# Configure CORS
CORS(app, resources={
    r"/*": {
        "origins": Config.CORS_ORIGIN,
        "methods": ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
        "allow_headers": ["Content-Type", "Authorization"]
    }
})

# Configure Flask-Mail
app.config.update(
    MAIL_SERVER=Config.MAIL_SERVER,
    MAIL_PORT=Config.MAIL_PORT,
    MAIL_USE_TLS=Config.MAIL_USE_TLS,
    MAIL_USERNAME=Config.MAIL_USERNAME,
    MAIL_PASSWORD=Config.MAIL_PASSWORD,
    MAIL_DEFAULT_SENDER=Config.MAIL_DEFAULT_SENDER
)
mail = Mail(app)

# Daily.co API configuration
DAILY_API_KEY = "81f9b81da6402e0ec1732bac6d19cf8c454e7ee1d6948757cd0e9a455f8f123a"  # Temporary for testing
DAILY_API_URL = "https://api.daily.co/v1"

print("\nAPI Configuration Debug:")
print(f"API URL: {DAILY_API_URL}")
print(f"API Key length: {len(DAILY_API_KEY)}")
print("-" * 50)

headers = {
    "Authorization": f"Bearer {DAILY_API_KEY}",
    "Content-Type": "application/json"
}

def create_meeting_room(room_name: Optional[str] = None, privacy: str = "private") -> Dict[str, Any]:
    """
    Create a new Daily.co meeting room
    """
    try:
        data = {}
        
        if room_name:
            data["name"] = room_name
            
        if privacy:
            data["privacy"] = privacy
            
        data["properties"] = {
            "enable_chat": True,
            "enable_screenshare": True,
            "enable_recording": "cloud",
            "start_audio_off": False,
            "start_video_off": False,
            "enable_knocking": True,
            "enable_prejoin_ui": True
        }
            
        print(f"Request headers: {json.dumps(headers, indent=2)}")  # Debug print
        print(f"Request data: {json.dumps(data, indent=2)}")  # Debug print
            
        response = requests.post(
            f"{DAILY_API_URL}/rooms",
            headers=headers,
            json=data
        )
        
        if not response.ok:
            print(f"Room creation failed. Status: {response.status_code}")
            print(f"Response: {response.text}")
            response.raise_for_status()
            
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Room creation error: {str(e)}")  # Debug print
        if hasattr(e.response, 'text'):
            print(f"Error response: {e.response.text}")  # Debug print
        raise Exception(f"Failed to create room: {str(e)}")

def get_meeting_room(room_name: str) -> Dict[str, Any]:
    """
    Get details of a specific Daily.co meeting room
    
    Args:
        room_name: Name of the room to retrieve
        
    Returns:
        Dictionary containing room details
    """
    try:
        response = requests.get(
            f"{DAILY_API_URL}/rooms/{room_name}",
            headers=headers
        )
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        raise Exception(f"Failed to get room: {str(e)}")

def create_meeting_token(
    room_name: str, 
    participant_name: str, 
    is_owner: bool = False,
    expires_in_hours: int = 24
) -> Dict[str, Any]:
    """
    Create a meeting token for secure room access
    """
    try:
        # Calculate expiration time based on user input
        exp = int(time.time()) + (expires_in_hours * 60 * 60)
        
        data = {
            "properties": {
                "room_name": room_name,
                "user_name": participant_name,
                "is_owner": is_owner,
                "exp": exp
            }
        }
        
        print(f"Creating token with data: {json.dumps(data, indent=2)}")  # Debug print
        
        response = requests.post(
            f"{DAILY_API_URL}/meeting-tokens",
            headers=headers,
            json=data
        )
        
        if not response.ok:
            print(f"Token creation failed. Status: {response.status_code}")
            print(f"Response: {response.text}")
            response.raise_for_status()
            
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Token creation error: {str(e)}")  # Debug print
        if hasattr(e.response, 'text'):
            print(f"Error response: {e.response.text}")  # Debug print
        raise Exception(f"Failed to create meeting token: {str(e)}")

def send_meeting_invitation(
    room_name: str, 
    participant_email: str, 
    host_name: str,
    expires_in_hours: int = 24
) -> Dict[str, Any]:
    """
    Send a meeting invitation to a participant
    
    Args:
        room_name: Name of the room
        participant_email: Email of the invited participant
        host_name: Name of the meeting host
        expires_in_hours: Number of hours until token expires (default: 24)
        
    Returns:
        Dictionary containing invitation details
    """
    try:
        # Create a meeting token for the participant
        token = create_meeting_token(room_name, "", False, expires_in_hours)
        
        # Get the room details
        room = get_meeting_room(room_name)
        
        # Calculate expiration time
        expires_at = datetime.utcnow() + timedelta(hours=expires_in_hours)
        
        # Create the join URL with the token
        join_url = f"{room['url']}?token={token['token']}"
        
        # Create invitation data
        invitation = {
            "email": participant_email,
            "room_url": room["url"],
            "token": token["token"],
            "host_name": host_name,
            "room_name": room_name,
            "created_at": datetime.utcnow().isoformat(),
            "expires_at": expires_at.isoformat()
        }
        
        # Send the email invitation
        msg = Message(
            subject=f"{host_name} has invited you to a Utom Meet video call",
            recipients=[participant_email]
        )
        
        # Render the HTML template with the invitation details
        msg.html = render_template(
            'meeting_invitation.html',
            host_name=host_name,
            room_name=room_name,
            join_url=join_url,
            expires_at=expires_at.strftime("%Y-%m-%d %H:%M UTC")
        )
        
        # Send the email
        mail.send(msg)
        
        return invitation
    except Exception as e:
        raise Exception(f"Failed to create invitation: {str(e)}")

@app.route("/")
def health_check():
    return jsonify({"status": "healthy", "message": "Utom Meet API is running"})

@app.route("/api/rooms", methods=["POST"])
def create_room():
    try:
        data = request.get_json() or {}
        print(f"Creating room with data: {json.dumps(data, indent=2)}")  # Debug print
        
        room = create_meeting_room(
            room_name=data.get("name"),
            privacy=data.get("privacy", "private")
        )
        
        print(f"Room created: {json.dumps(room, indent=2)}")  # Debug print
        
        # If host name is provided, create a host token
        if data.get("host_name"):
            try:
                token = create_meeting_token(
                    room_name=room["name"],
                    participant_name=data["host_name"],
                    is_owner=True
                )
                room["host_token"] = token["token"]
            except Exception as token_error:
                print(f"Token creation failed: {str(token_error)}")  # Debug print
                # Continue even if token creation fails
                room["token_error"] = str(token_error)
        
        return jsonify(room)
    except Exception as e:
        print(f"Room creation error: {str(e)}")  # Debug print
        return jsonify({"error": str(e)}), 500

@app.route("/api/rooms/<room_name>", methods=["GET"])
def get_room(room_name: str):
    try:
        room = get_meeting_room(room_name)
        return jsonify(room)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/rooms/<room_name>/tokens", methods=["POST"])
def create_token(room_name: str):
    try:
        data = request.get_json() or {}
        token = create_meeting_token(
            room_name=room_name,
            participant_name=data.get("participant_name", ""),
            is_owner=data.get("is_owner", False),
            expires_in_hours=data.get("expires_in_hours", 24)
        )
        return jsonify(token)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/rooms/<room_name>/invitations", methods=["POST"])
def send_invitation(room_name: str):
    try:
        data = request.get_json() or {}
        
        # Validate required fields
        required_fields = ["participant_email", "host_name"]
        missing_fields = [field for field in required_fields if not data.get(field)]
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400
            
        # Validate email format
        if "@" not in data["participant_email"]:
            return jsonify({
                "error": "Invalid email address"
            }), 400
            
        invitation = send_meeting_invitation(
            room_name=room_name,
            participant_email=data["participant_email"],
            host_name=data["host_name"],
            expires_in_hours=data.get("expires_in_hours", 24)
        )
        return jsonify(invitation)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=8000, debug=True) 