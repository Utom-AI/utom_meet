import os
import boto3
import requests
import json
from datetime import datetime
from dotenv import load_dotenv
from recording_manager import RecordingManager

# Load environment variables
load_dotenv()

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('s3_access_key'),
    aws_secret_access_key=os.getenv('s3_secret_access_key'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
DAILY_API_KEY = os.getenv('DAILY_API_KEY')

# Initialize recording manager
recording_manager = RecordingManager()

def start_meeting_recording(meeting_id: str, room_url: str):
    """
    Start recording a meeting when it begins
    """
    try:
        # Create recording entry and get unique ID
        recording_info = recording_manager.create_recording(
            meeting_id=meeting_id,
            room_name=meeting_id,
            room_url=room_url
        )
        
        # Start Daily.co recording with enhanced settings
        response = requests.post(
            f"https://api.daily.co/v1/rooms/{meeting_id}/recordings",
            headers={
                "Authorization": f"Bearer {DAILY_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "recording_id": recording_info['recording_id'],
                "options": {
                    "format": "mp4",
                    "resolution": "1920x1080",
                    "fps": 30,
                    "video_bitrate": 3000000,
                    "audio_bitrate": 128000,
                    "layout": {
                        "preset": "gallery",
                        "max_participants": 9
                    },
                    "include_chat": True,
                    "include_audio": True,
                    "include_video": True,
                    "include_participant_audio": True
                }
            }
        )
        
        if response.status_code != 200:
            recording_manager.update_recording_status(
                recording_info['unique_id'],
                'failed',
                {'error': f"Failed to start recording: {response.text}"}
            )
            raise Exception(f"Failed to start recording: {response.text}")
            
        # Store recording metadata in S3
        metadata = {
            "meeting_id": meeting_id,
            "recording_id": recording_info['recording_id'],
            "unique_id": recording_info['unique_id'],
            "start_time": datetime.now().isoformat(),
            "status": "recording",
            "room_url": room_url,
            "recording_settings": {
                "resolution": "1920x1080",
                "format": "mp4",
                "has_video": True,
                "has_audio": True,
                "layout": "gallery"
            }
        }
        
        s3_client.put_object(
            Bucket=BUCKET_NAME,
            Key=f"recordings/{recording_info['unique_id']}/metadata.json",
            Body=json.dumps(metadata)
        )
        
        # Update recording status
        recording_manager.update_recording_status(
            recording_info['unique_id'],
            'recording',
            metadata
        )
        
        return recording_info['unique_id']
        
    except Exception as e:
        print(f"Error starting recording: {str(e)}")
        raise

def process_completed_recording(recording_id: str):
    """
    Process a completed recording
    """
    try:
        # Get recording metadata from database
        recording_info = recording_manager.get_recording_metadata(recording_id)
        if not recording_info:
            raise Exception(f"Recording not found: {recording_id}")
        
        # Get recording from Daily.co
        response = requests.get(
            f"https://api.daily.co/v1/recordings/{recording_info['recording_id']}",
            headers={"Authorization": f"Bearer {DAILY_API_KEY}"}
        )
        
        if response.status_code != 200:
            recording_manager.update_recording_status(
                recording_id,
                'failed',
                {'error': f"Failed to get recording: {response.text}"}
            )
            raise Exception(f"Failed to get recording: {response.text}")
            
        recording_data = response.json()
        
        # Download recording
        recording_url = recording_data.get('download_url')
        if recording_url:
            recording_response = requests.get(recording_url)
            
            # Upload to S3
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=f"recordings/{recording_id}/recording.mp4",
                Body=recording_response.content
            )
            
            # Update metadata
            metadata = recording_info.get('metadata', {})
            metadata.update({
                "status": "completed",
                "end_time": datetime.now().isoformat(),
                "s3_path": f"recordings/{recording_id}/recording.mp4"
            })
            
            # Update S3 metadata
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=f"recordings/{recording_id}/metadata.json",
                Body=json.dumps(metadata)
            )
            
            # Update recording status in database
            recording_manager.update_recording_status(
                recording_id,
                'completed',
                metadata
            )
            
            return {
                "unique_id": recording_id,
                "s3_path": f"recordings/{recording_id}/recording.mp4"
            }
    
    except Exception as e:
        print(f"Error processing recording: {str(e)}")
        recording_manager.update_recording_status(
            recording_id,
            'failed',
            {'error': str(e)}
        )
        raise

def cleanup_old_recordings(days_old: int = 30):
    """
    Clean up old recordings from S3
    """
    try:
        # List objects in the recordings folder
        response = s3_client.list_objects_v2(
            Bucket=BUCKET_NAME,
            Prefix="recordings/"
        )
        
        for obj in response.get('Contents', []):
            # Check if object is older than days_old
            if (datetime.now() - obj['LastModified']).days > days_old:
                # Get unique_id from path
                path_parts = obj['Key'].split('/')
                if len(path_parts) >= 2:
                    unique_id = path_parts[1]
                    
                    # Update recording status
                    recording_manager.update_recording_status(
                        unique_id,
                        'deleted',
                        {'deleted_at': datetime.now().isoformat()}
                    )
                
                # Delete from S3
                s3_client.delete_object(
                    Bucket=BUCKET_NAME,
                    Key=obj['Key']
                )
                
    except Exception as e:
        print(f"Error cleaning up recordings: {str(e)}")
        raise 