from flask import Flask, request, jsonify, send_from_directory
from flask_cors import CORS
from dotenv import load_dotenv
import os
import requests
import random
import string
from datetime import datetime, timezone, timedelta
from flask_mail import Mail, Message
from openai import OpenAI
import json
import sqlite3
from pathlib import Path
import time
from werkzeug.utils import secure_filename
from tasks import start_meeting_recording, process_completed_recording
from queue_manager import QueueManager
from recording_tasks import cleanup_old_recordings
from recording_manager import RecordingManager

# Initialize Flask app
app = Flask(__name__)

print("Initializing Flask application...")

# Configure CORS to allow both ports
CORS(app, resources={r"/api/*": {"origins": ["http://localhost:3000"]}})

print("Configured CORS...")

# Load environment variables
load_dotenv()

# Initialize database
def init_db():
    conn = sqlite3.connect('meetings.db')
    cursor = conn.cursor()
    
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS meetings (
            meeting_id INTEGER PRIMARY KEY,
            meeting_name TEXT NOT NULL,
            description TEXT,
            start_time INTEGER,
            end_time INTEGER,
            duration INTEGER,
            agenda TEXT,
            attendees TEXT,
            room_name TEXT,
            room_url TEXT,
            created_at INTEGER,
            transcription_status TEXT DEFAULT 'pending',
            transcription_text TEXT,
            transcription_error TEXT,
            recording_file_path TEXT
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize the database when the app starts
init_db()

print("Initialized database...")

# Debug logging for environment variables
print("Environment Variables Check:")
print(f"DAILY_API_KEY loaded: {'Yes' if os.getenv('DAILY_API_KEY') else 'No'}")
print(f"OPENAI_API_KEY loaded: {'Yes' if os.getenv('OPENAI_API_KEY') else 'No'}")
if os.getenv('OPENAI_API_KEY'):
    print(f"OPENAI_API_KEY starts with: {os.getenv('OPENAI_API_KEY')[:5]}...")
print(f"CORS_ORIGIN: {os.getenv('CORS_ORIGIN', 'http://localhost:3000')}")

# Validate required environment variables
if not os.getenv('DAILY_API_KEY'):
    raise ValueError("DAILY_API_KEY environment variable is not set")
if not os.getenv('OPENAI_API_KEY'):
    raise ValueError("OPENAI_API_KEY environment variable is not set")

# Configuration
DAILY_API_KEY = os.getenv('DAILY_API_KEY')
DAILY_API_URL = 'https://api.daily.co/v1'  # Change back to domain name
CORS_ORIGIN = os.getenv('CORS_ORIGIN', 'http://localhost:3000')
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY')

# Initialize OpenAI client
client = OpenAI(api_key=OPENAI_API_KEY)

print("Initialized OpenAI client...")

# Email configuration
app.config['MAIL_SERVER'] = os.getenv('MAIL_SERVER')
app.config['MAIL_PORT'] = int(os.getenv('MAIL_PORT', 587))
app.config['MAIL_USE_TLS'] = os.getenv('MAIL_USE_TLS', 'True').lower() == 'true'
app.config['MAIL_USERNAME'] = os.getenv('MAIL_USERNAME')
app.config['MAIL_PASSWORD'] = os.getenv('MAIL_PASSWORD')
app.config['MAIL_DEFAULT_SENDER'] = os.getenv('MAIL_DEFAULT_SENDER')

mail = Mail(app)

# Initialize queue manager
queue_manager = QueueManager()

# Register task handlers
queue_manager.register_handler('start_recording', start_meeting_recording)
queue_manager.register_handler('process_recording', process_completed_recording)
queue_manager.register_handler('cleanup_recordings', cleanup_old_recordings)

# Start queue manager
queue_manager.start()

# Initialize recording manager
recording_manager = RecordingManager()

# Helper function to generate random room name
def generate_room_name(length=12):
    """Generate a random room name using letters and numbers"""
    characters = string.ascii_letters + string.digits
    return ''.join(random.choice(characters) for _ in range(length))

def create_room(name, properties=None):
    if properties is None:
        properties = {}

    # Extract meeting metadata (not to be sent to Daily.co API)
    meeting_metadata = {
        'meeting_name': properties.get('meeting_name', 'Untitled Meeting'),
        'start_time': properties.get('start_time'),
        'end_time': properties.get('end_time'),
        'duration': properties.get('duration')
    }

    # Daily.co API supported properties only
    room_data = {
        'name': name,
        'properties': {
            'exp': int(time.time()) + 24 * 60 * 60,  # 24 hours from now
            'enable_screenshare': True,
            'enable_chat': True,
            'start_video_off': False,
            'start_audio_off': False,
            'max_participants': 20,
            'enable_prejoin_ui': True,
            'enable_knocking': False,
            'enable_network_ui': True,
            'enable_recording': 'cloud',  # Enable cloud recording
            'recording_resolution': '1920x1080',  # Full HD recording
            'recording_audio_only': False,  # Ensure both audio and video are recorded
            'recording_layout': {
                'preset': 'gallery',  # Use gallery layout for recording
                'max_participants': 9  # Show up to 9 participants in the recording
            }
        }
    }

    try:
        # Get current UTC timestamp
        current_time = int(datetime.now(timezone.utc).timestamp())

        # Calculate expiration time
        duration = meeting_metadata['duration'] or 24  # Default 24 hours
        end_timestamp = current_time + (int(duration) * 3600)

        # API request data
        data = room_data

        print(f"Creating room with data: {data}")  # Debug log

        # Add retry logic
        max_retries = 3
        retry_delay = 2  # seconds
        
        for attempt in range(max_retries):
            try:
                # Make API request to Daily.co
                response = requests.post(
                    f"{DAILY_API_URL}/rooms",
                    headers={
                        "Authorization": f"Bearer {DAILY_API_KEY}",
                        "Content-Type": "application/json"
                    },
                    json=data,
                    timeout=10,  # Add timeout
                    verify=True  # Ensure SSL verification
                )

                print(f"Daily.co API response: {response.status_code} - {response.text}")  # Debug log

                if response.status_code == 200:
                    room_data = response.json()
                    return {
                        "success": True,
                        "data": {
                            "name": room_data["name"],
                            "url": room_data["url"],
                            "meeting_name": meeting_metadata['meeting_name'],
                            "start_time": current_time,
                            "end_time": end_timestamp,
                        }
                    }
                elif response.status_code == 429:  # Rate limit
                    if attempt < max_retries - 1:
                        time.sleep(retry_delay)
                        continue
                    else:
                        return {
                            "success": False,
                            "error": "Rate limit exceeded. Please try again later."
                        }
                else:
                    return {
                        "success": False,
                        "error": f"Failed to create room: {response.text}"
                    }
                    
            except requests.exceptions.RequestException as e:
                if attempt < max_retries - 1:
                    print(f"Attempt {attempt + 1} failed: {str(e)}")
                    time.sleep(retry_delay)
                    continue
                else:
                    return {
                        "success": False,
                        "error": f"Error creating room after {max_retries} attempts: {str(e)}"
                    }

    except Exception as e:
        print(f"Error creating room: {str(e)}")  # Debug log
        return {
            "success": False,
            "error": f"Error creating room: {str(e)}"
        }

def join_room(room_name):
    """
    Get details for joining an existing room
    :param room_name: Name of the room to join
    :return: Room details including URL and validation status
    """
    try:
        # Validate room existence with Daily.co API
        response = requests.get(
            f"{DAILY_API_URL}/rooms/{room_name}",
            headers={
                "Authorization": f"Bearer {DAILY_API_KEY}",
                "Content-Type": "application/json"
            }
        )

        if response.status_code == 200:
            room_data = response.json()
            return {
                "success": True,
                "data": {
                    "name": room_data["name"],
                    "url": room_data["url"],
                    "exists": True
                }
            }
        elif response.status_code == 404:
            return {
                "success": False,
                "error": "Room not found"
            }
        else:
            return {
                "success": False,
                "error": f"Failed to validate room: {response.text}"
            }

    except Exception as e:
        return {
            "success": False,
            "error": f"Error joining room: {str(e)}"
        }

def invite_to_room(room_url, invitee_email, host_name="A user"):
    """
    Send an email invitation to join a room
    :param room_url: URL of the room
    :param invitee_email: Email address of the person to invite
    :param host_name: Name of the person sending the invitation
    :return: Success/failure status of sending invitation
    """
    try:
        msg = Message(
            subject="Invitation to Join Video Meeting",
            recipients=[invitee_email],
            html=f"""
            <h2>Video Meeting Invitation</h2>
            <p>{host_name} has invited you to join a video meeting.</p>
            <p>Click the link below to join:</p>
            <p><a href="{room_url}">{room_url}</a></p>
            <p>This is a secure, peer-to-peer video chat.</p>
            """
        )
        mail.send(msg)
        return {
            "success": True,
            "message": f"Invitation sent to {invitee_email}"
        }
    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to send invitation: {str(e)}"
        }

# Route to create a new room
@app.route('/api/rooms', methods=['POST'])
def create_room_endpoint():
    """Endpoint to create a new room with meeting details"""
    try:
        data = request.get_json()
        # Generate a unique room name by appending a timestamp
        timestamp = int(time.time())
        base_name = data.get('name', 'meeting').lower().replace(' ', '-')
        unique_room_name = f"{base_name}-{timestamp}"
        
        meeting_details = {
            'meeting_name': data.get('meeting_name'),
            'description': data.get('description'),
            'start_time': data.get('start_time'),
            'end_time': data.get('end_time'),
            'duration': data.get('duration'),
            'agenda': data.get('agenda', []),
            'attendees': data.get('attendees', [])
        }

        # Create the room with Daily.co
        result = create_room(unique_room_name, meeting_details)
        
        if result['success']:
            # Store meeting details in database
            conn = sqlite3.connect('meetings.db')
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT INTO meetings (
                    meeting_id, meeting_name, description, start_time, 
                    end_time, duration, agenda, attendees, 
                    room_name, room_url, created_at
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                timestamp,
                meeting_details['meeting_name'],
                meeting_details['description'],
                meeting_details['start_time'],
                meeting_details['end_time'],
                meeting_details['duration'],
                json.dumps(meeting_details['agenda']),
                json.dumps(meeting_details['attendees']),
                result['data']['name'],
                result['data']['url'],
                timestamp
            ))
            
            conn.commit()
            conn.close()

            # Queue recording task
            queue_manager.enqueue('start_recording', {
                'meeting_id': result['data']['name'],
                'room_url': result['data']['url']
            })
            
            return jsonify({
                'success': True,
                'url': result['data']['url'],
                'meeting_id': timestamp
            })
        else:
            return jsonify({
                'success': False,
                'error': result['error']
            }), 400
            
    except Exception as e:
        print(f"Error in create_room_endpoint: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

# Route to join an existing room
@app.route('/api/rooms/<room_name>', methods=['GET'])
def join_room_endpoint(room_name):
    """Endpoint to join an existing room"""
    result = join_room(room_name)
    
    if result["success"]:
        return jsonify(result["data"]), 200
    else:
        return jsonify({"error": result["error"]}), 404 if "not found" in result["error"].lower() else 500

# Route to send room invitation
@app.route('/api/rooms/invite', methods=['POST'])
def invite_to_room_endpoint():
    """Endpoint to send room invitation"""
    data = request.get_json()
    
    if not data or 'email' not in data or 'room_url' not in data:
        return jsonify({"error": "Missing required fields"}), 400
        
    result = invite_to_room(
        room_url=data['room_url'],
        invitee_email=data['email'],
        host_name=data.get('host_name', 'A user')
    )
    
    if result["success"]:
        return jsonify({"message": result["message"]}), 200
    else:
        return jsonify({"error": result["error"]}), 500

@app.route('/api/meetings', methods=['POST'])
def create_meeting_endpoint():
    try:
        meeting_details = request.json
        print(f"Creating meeting with details: {meeting_details}")
        
        # Create a Daily.co room
        response = requests.post(
            f"{DAILY_API_URL}/rooms",
            headers={
                "Authorization": f"Bearer {DAILY_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                'properties': {
                    'enable_chat': True,
                    'enable_knocking': False,
                    'start_video_off': False,
                    'start_audio_off': False,
                    'max_participants': 50,
                    'enable_prejoin_ui': True,
                    'enable_screenshare': True,
                    'enable_recording': "cloud",
                    'enable_network_ui': True
                }
            }
        )
        
        print(f"Daily.co API response: {response.status_code} - {response.text}")
        
        if response.status_code != 200:
            raise Exception(f"Failed to create Daily.co room: {response.text}")
            
        room_data = response.json()
        result = {
            'url': room_data['url'],
            'name': meeting_details.get('title', 'Untitled Meeting')
        }
        
        print(f"Returning meeting data: {result}")
        return jsonify(result)
        
    except Exception as e:
        print(f"Error creating meeting: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/test', methods=['GET'])
def test():
    return jsonify({"message": "API is working"})

@app.route('/api/process-description', methods=['POST'])
def process_description():
    """Process meeting description with OpenAI"""
    try:
        data = request.get_json()
        description = data.get('description')

        if not description:
            return jsonify({'error': 'No description provided'}), 400

        print(f"Processing description: {description}")

        # OpenAI API call
        response = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {
                    "role": "system",
                    "content": """You are a meeting assistant. Your task is to always generate a structured meeting from any input, no matter how brief. If the input lacks details, use reasonable defaults and expand on the topic creatively while staying relevant.

For example, if given just "team meeting", you might create a general team sync meeting with standard agenda items.

Always return a valid JSON object with these exact keys:
{
    "title": "string",
    "description": "string (minimum 50 words, expand the topic creatively if needed)",
    "duration": number (in minutes, default to 30 if not specified),
    "agenda": ["string"] (at least 3 items, use standard meeting items if not specified),
    "attendees": ["string"] (suggest relevant team members based on the context)
}

Never return an error message or invalid JSON. Always provide a valid meeting structure."""
                },
                {
                    "role": "user",
                    "content": description
                }
            ],
            max_tokens=1500,
            temperature=0.7
        )

        # Get the response content
        result_str = response.choices[0].message.content.strip()
        print(f"Raw OpenAI response: {result_str}")

        # Parse the response
        try:
            result = json.loads(result_str)
            print(f"Processed result: {result}")
            
            # Validate and ensure minimum requirements
            validated_result = {
                "title": result.get("title", "Team Meeting"),
                "description": result.get("description", "A team meeting to discuss project updates and align on objectives."),
                "duration": result.get("duration", 30),
                "agenda": result.get("agenda", ["Project Updates", "Team Discussion", "Action Items"]),
                "attendees": result.get("attendees", ["Team Lead", "Team Members"])
            }
            
            return jsonify(validated_result)
        except json.JSONDecodeError as e:
            print(f"Error parsing OpenAI response: {e}")
            print(f"Failed to parse: {result_str}")
            # Return a default meeting structure instead of an error
            default_meeting = {
                "title": "Team Meeting",
                "description": "A team meeting to discuss " + description + ". We will review current progress, address any challenges, and align on next steps. This meeting will help ensure everyone is on the same page and has clear action items.",
                "duration": 30,
                "agenda": ["Project Updates", "Team Discussion", "Action Items"],
                "attendees": ["Team Lead", "Team Members"]
            }
            return jsonify(default_meeting)

    except Exception as e:
        print(f"Error processing description: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({'status': 'healthy'})

@app.route('/api/test-openai', methods=['GET'])
def test_openai():
    try:
        print("Testing OpenAI connection...")
        completion = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "user", "content": "Say hello"}
            ]
        )
        response = completion.choices[0].message.content
        print(f"OpenAI response: {response}")
        return jsonify({"response": response})
    except Exception as e:
        error_msg = str(e)
        print(f"OpenAI Test Error: {error_msg}")
        return jsonify({"error": error_msg}), 500

@app.route('/api/test-meeting-processing', methods=['POST'])
def test_meeting_processing():
    try:
        data = request.get_json()
        description = data.get('description', '')
        
        # Process with OpenAI
        response = client.chat.completions.create(
            model="gpt-3.5-turbo",
            messages=[
                {"role": "system", "content": "You are a meeting assistant. Extract key details from meeting descriptions."},
                {"role": "user", "content": f"Process this meeting description: {description}"}
            ]
        )
        
        return jsonify({
            "success": True,
            "response": response.choices[0].message.content
        })
    except Exception as e:
        print(f"Error processing meeting: {str(e)}")
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500

# Create database directory if it doesn't exist
db_dir = Path('database')
db_dir.mkdir(exist_ok=True)

# Initialize database
def init_db():
    conn = sqlite3.connect('database/recordings.db')
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS recordings (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            meeting_id TEXT,
            recording_url TEXT,
            recording_file_path TEXT,
            participants TEXT,
            transcript TEXT,
            chat_messages TEXT,
            end_time TEXT,
            created_at TEXT,
            transcription_status TEXT DEFAULT 'pending',
            transcription_text TEXT,
            transcription_error TEXT
        )
    ''')
    conn.commit()
    conn.close()

# Initialize database on startup
init_db()

@app.route('/api/save-recording-metadata', methods=['POST'])
def save_recording_metadata():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = ['participants', 'transcript', 'chatMessages', 'recordingUrl', 'endTime']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        # Generate a unique meeting ID
        meeting_id = f"meeting_{datetime.now().strftime('%Y%m%d_%H%M%S')}"

        # Connect to database
        conn = sqlite3.connect('database/recordings.db')
        c = conn.cursor()

        # Insert recording metadata
        c.execute('''
            INSERT INTO recordings (
                meeting_id,
                recording_url,
                participants,
                transcript,
                chat_messages,
                end_time,
                created_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            meeting_id,
            data['recordingUrl'],
            json.dumps(data['participants']),
            json.dumps(data['transcript']),
            json.dumps(data['chatMessages']),
            data['endTime'],
            datetime.now().isoformat()
        ))

        conn.commit()
        conn.close()

        return jsonify({
            'message': 'Recording metadata saved successfully',
            'meeting_id': meeting_id
        }), 200

    except Exception as e:
        print(f"Error saving recording metadata: {str(e)}")
        return jsonify({'error': 'Failed to save recording metadata'}), 500

# Add endpoint to retrieve recording metadata
@app.route('/api/recording/<meeting_id>', methods=['GET'])
def get_recording_metadata(meeting_id):
    try:
        conn = sqlite3.connect('database/recordings.db')
        c = conn.cursor()
        
        c.execute('SELECT * FROM recordings WHERE meeting_id = ?', (meeting_id,))
        record = c.fetchone()
        
        if not record:
            return jsonify({'error': 'Recording not found'}), 404

        # Convert record to dictionary
        columns = ['id', 'meeting_id', 'recording_url', 'participants', 'transcript', 
                  'chat_messages', 'end_time', 'created_at']
        record_dict = dict(zip(columns, record))

        # Parse JSON strings back to objects
        record_dict['participants'] = json.loads(record_dict['participants'])
        record_dict['transcript'] = json.loads(record_dict['transcript'])
        record_dict['chat_messages'] = json.loads(record_dict['chat_messages'])

        return jsonify(record_dict), 200

    except Exception as e:
        print(f"Error retrieving recording metadata: {str(e)}")
        return jsonify({'error': 'Failed to retrieve recording metadata'}), 500

# Add endpoint to retrieve all recordings
@app.route('/api/recordings', methods=['GET'])
def get_all_recordings():
    try:
        conn = sqlite3.connect('database/recordings.db')
        c = conn.cursor()
        
        c.execute('SELECT * FROM recordings ORDER BY created_at DESC')
        records = c.fetchall()
        
        if not records:
            return jsonify([]), 200

        # Convert records to list of dictionaries
        columns = ['id', 'meeting_id', 'recording_url', 'participants', 'transcript', 
                  'chat_messages', 'end_time', 'created_at']
        meetings = []
        
        for record in records:
            record_dict = dict(zip(columns, record))
            # Parse JSON strings back to objects
            record_dict['participants'] = json.loads(record_dict['participants'])
            record_dict['transcript'] = json.loads(record_dict['transcript'])
            record_dict['chat_messages'] = json.loads(record_dict['chat_messages'])
            meetings.append(record_dict)

        return jsonify(meetings), 200

    except Exception as e:
        print(f"Error retrieving recordings: {str(e)}")
        return jsonify({'error': 'Failed to retrieve recordings'}), 500

# Add webhook endpoint for Daily.co recording notifications
@app.route('/api/webhooks/daily-recording', methods=['POST'])
def daily_recording_webhook():
    try:
        data = request.get_json()
        print(f"Received Daily.co webhook: {data}")
        
        # Verify webhook signature (you should implement this)
        # For now, we'll trust the webhook
        
        if data.get('type') == 'recording.completed':
            recording_data = data.get('data', {})
            room_name = recording_data.get('room_name')
            recording_url = recording_data.get('recording_url')
            
            if not room_name or not recording_url:
                return jsonify({'error': 'Missing required fields'}), 400
                
            # Store recording URL in database
            conn = sqlite3.connect('database/recordings.db')
            c = conn.cursor()
            
            # Update or insert recording record
            c.execute('''
                INSERT OR REPLACE INTO recordings 
                (meeting_id, recording_url, transcription_status, created_at)
                VALUES (?, ?, 'pending', datetime('now'))
            ''', (room_name, recording_url))
            
            conn.commit()
            conn.close()
            
            # Trigger transcription process
            process_recording_transcription(room_name, recording_url)
            
            return jsonify({'message': 'Recording webhook processed successfully'}), 200
            
        return jsonify({'message': 'Ignored webhook type'}), 200
        
    except Exception as e:
        print(f"Error processing webhook: {str(e)}")
        return jsonify({'error': str(e)}), 500

def process_recording_transcription(meeting_id, recording_url):
    """Process recording transcription using OpenAI Whisper API"""
    try:
        # Download the recording file
        response = requests.get(recording_url)
        if response.status_code != 200:
            raise Exception(f"Failed to download recording: {response.text}")
            
        # Create a unique filename for the recording
        timestamp = int(time.time())
        recording_filename = f"{meeting_id}_{timestamp}.mp4"
        recording_filepath = os.path.join('recordings', recording_filename)
        
        # Save the recording file
        with open(recording_filepath, 'wb') as f:
            f.write(response.content)
            
        # Transcribe using OpenAI Whisper API
        with open(recording_filepath, 'rb') as f:
            transcript = client.audio.transcriptions.create(
                file=f,
                model="whisper-1"
            )
            
        # Store transcription and recording filepath in database
        conn = sqlite3.connect('database/recordings.db')
        c = conn.cursor()
        
        c.execute('''
            UPDATE recordings 
            SET transcription_status = 'completed',
                transcription_text = ?,
                recording_file_path = ?
            WHERE meeting_id = ?
        ''', (transcript.text, recording_filepath, meeting_id))
        
        conn.commit()
        conn.close()
        
    except Exception as e:
        print(f"Error processing transcription: {str(e)}")
        # Update database with error status
        conn = sqlite3.connect('database/recordings.db')
        c = conn.cursor()
        
        c.execute('''
            UPDATE recordings 
            SET transcription_status = 'error',
                transcription_error = ?
            WHERE meeting_id = ?
        ''', (str(e), meeting_id))
        
        conn.commit()
        conn.close()
        
        # Clean up recording file if it exists
        if 'recording_filepath' in locals() and os.path.exists(recording_filepath):
            os.remove(recording_filepath)

# Add endpoint to serve recording files
@app.route('/api/recordings/<path:filename>')
def serve_recording(filename):
    try:
        return send_from_directory('recordings', filename)
    except Exception as e:
        return jsonify({'error': str(e)}), 404

# Add this after the existing upload_folder definition
RECORDINGS_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'recordings')
os.makedirs(RECORDINGS_FOLDER, exist_ok=True)

@app.route('/api/upload-recording', methods=['POST'])
def upload_recording():
    try:
        if 'recording' not in request.files:
            return jsonify({'error': 'No recording file provided'}), 400
        
        recording_file = request.files['recording']
        meeting_id = request.form.get('meeting_id')
        
        if not meeting_id:
            return jsonify({'error': 'No meeting ID provided'}), 400
        
        if recording_file.filename == '':
            return jsonify({'error': 'No selected file'}), 400
        
        # Generate a unique filename using meeting_id and timestamp
        timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
        filename = f"{meeting_id}_{timestamp}.webm"
        filepath = os.path.join(RECORDINGS_FOLDER, secure_filename(filename))
        
        # Save the recording file
        recording_file.save(filepath)
        
        # Update the database with the recording file path
        conn = sqlite3.connect('database/recordings.db')
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE meetings 
            SET recording_file_path = ? 
            WHERE meeting_id = ?
        ''', (filepath, meeting_id))
        conn.commit()
        conn.close()
        
        return jsonify({
            'message': 'Recording uploaded successfully',
            'filepath': filepath
        }), 200
        
    except Exception as e:
        print(f"Error uploading recording: {str(e)}")
        return jsonify({'error': 'Failed to upload recording'}), 500

# Add new endpoints for recording metadata
@app.route('/api/recordings/<unique_id>', methods=['GET'])
def get_recording(unique_id):
    """Get recording metadata by unique ID"""
    try:
        recording = recording_manager.get_recording_metadata(unique_id)
        if not recording:
            return jsonify({'error': 'Recording not found'}), 404
            
        return jsonify(recording)
        
    except Exception as e:
        print(f"Error getting recording: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/recordings', methods=['GET'])
def list_recordings():
    """List all recordings"""
    try:
        status = request.args.get('status')
        recordings = recording_manager.list_recordings(status)
        return jsonify(recordings)
        
    except Exception as e:
        print(f"Error listing recordings: {str(e)}")
        return jsonify({'error': str(e)}), 500

# Update the recording webhook endpoint
@app.route('/api/webhooks/recording-complete', methods=['POST'])
def recording_complete_webhook():
    try:
        data = request.get_json()
        recording_id = data.get('recording_id')
        
        if not recording_id:
            return jsonify({'error': 'No recording ID provided'}), 400
            
        # Queue processing task
        queue_manager.enqueue('process_recording', {'recording_id': recording_id})
        
        return jsonify({'message': 'Recording queued for processing'}), 200
        
    except Exception as e:
        print(f"Error in recording webhook: {str(e)}")
        return jsonify({'error': str(e)}), 500

print("Routes registered...")

if __name__ == '__main__':
    print("Starting server on port 5000...")
    app.run(host='0.0.0.0', port=5000, debug=False) 