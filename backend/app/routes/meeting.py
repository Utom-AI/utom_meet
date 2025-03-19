from flask import Blueprint, request, jsonify
import requests
from ..config import Config
import time

meeting_bp = Blueprint('meeting', __name__)

headers = {
    "Authorization": f"Bearer {Config.DAILY_API_KEY}",
    "Content-Type": "application/json"
}

@meeting_bp.route('/rooms', methods=['POST'])
def create_room():
    """Create a new Daily.co room"""
    try:
        data = request.get_json()
        
        # Generate a unique room name by appending a timestamp
        timestamp = int(time.time())
        base_name = data.get('name', 'meeting').lower().replace(' ', '-')
        room_name = f"{base_name}-{timestamp}"
        
        # Room configuration
        room_data = {
            'name': room_name,
            'properties': {
                'exp': int(time.time()) + 24 * 60 * 60,  # 24 hours from now
                'enable_screenshare': True,
                'enable_chat': True,
                'start_video_off': False,
                'start_audio_off': False,
                'max_participants': 20,
                'enable_prejoin_ui': True,
                'enable_knocking': False,
                'enable_recording': 'cloud',
                'enable_network_ui': True
            }
        }
        
        print(f"Creating room with data: {room_data}")
        response = requests.post(
            'https://api.daily.co/v1/rooms',
            headers={'Authorization': f'Bearer {Config.DAILY_API_KEY}'},
            json=room_data
        )
        
        print(f"Daily.co API response: {response.status_code} - {response.text}")
        
        if response.status_code == 200:
            room_details = response.json()
            return jsonify({
                'url': room_details['url'],
                'name': room_details['name']
            })
        else:
            error_msg = f"Room creation failed: {response.text}"
            print(error_msg)
            return jsonify({'error': error_msg}), 500
            
    except Exception as e:
        print(f"Error creating room: {str(e)}")
        return jsonify({'error': str(e)}), 500

@meeting_bp.route('/rooms/<room_name>', methods=['GET'])
def get_room(room_name):
    """Get information about a specific room"""
    try:
        response = requests.get(
            f"{Config.DAILY_API_URL}/rooms/{room_name}",
            headers=headers
        )
        response.raise_for_status()
        return jsonify(response.json())
    except requests.exceptions.RequestException as e:
        return jsonify({"error": str(e)}), 500 