import dramatiq
from dramatiq.brokers.redis import RedisBroker
import boto3
import os
from datetime import datetime
import requests
import json
from botocore.exceptions import ClientError

# Initialize broker
redis_broker = RedisBroker(host="localhost", port=6379)
dramatiq.set_broker(redis_broker)

# Initialize S3 client
s3_client = boto3.client(
    's3',
    aws_access_key_id=os.getenv('AWS_ACCESS_KEY_ID'),
    aws_secret_access_key=os.getenv('AWS_SECRET_ACCESS_KEY'),
    region_name=os.getenv('AWS_REGION', 'us-east-1')
)

BUCKET_NAME = os.getenv('S3_BUCKET_NAME')
DAILY_API_KEY = os.getenv('DAILY_API_KEY')

@dramatiq.actor(max_retries=3)
def start_meeting_recording(meeting_id: str, room_url: str):
    """
    Start recording a meeting when it begins
    """
    try:
        # Create a unique recording ID
        recording_id = f"rec_{meeting_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        # Start Daily.co recording with enhanced settings
        response = requests.post(
            f"https://api.daily.co/v1/rooms/{meeting_id}/recordings",
            headers={
                "Authorization": f"Bearer {DAILY_API_KEY}",
                "Content-Type": "application/json"
            },
            json={
                "recording_id": recording_id,
                "options": {
                    "format": "mp4",
                    "resolution": "1920x1080",  # Full HD
                    "fps": 30,  # 30 frames per second
                    "video_bitrate": 3000000,  # 3 Mbps for good quality
                    "audio_bitrate": 128000,  # 128 kbps for clear audio
                    "layout": {
                        "preset": "gallery",
                        "max_participants": 9
                    },
                    "include_chat": True,
                    "include_audio": True,
                    "include_video": True,
                    "include_participant_audio": True  # Record all participants' audio
                }
            }
        )
        
        if response.status_code != 200:
            raise Exception(f"Failed to start recording: {response.text}")
            
        # Store recording metadata in S3
        metadata = {
            "meeting_id": meeting_id,
            "recording_id": recording_id,
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
            Key=f"recordings/{recording_id}/metadata.json",
            Body=json.dumps(metadata)
        )
        
        return recording_id
        
    except Exception as e:
        print(f"Error starting recording: {str(e)}")
        raise

@dramatiq.actor(max_retries=3)
def process_completed_recording(recording_id: str):
    """
    Process a completed recording
    """
    try:
        # Get recording metadata from S3
        metadata_obj = s3_client.get_object(
            Bucket=BUCKET_NAME,
            Key=f"recordings/{recording_id}/metadata.json"
        )
        metadata = json.loads(metadata_obj['Body'].read())
        
        # Get recording from Daily.co
        response = requests.get(
            f"https://api.daily.co/v1/recordings/{recording_id}",
            headers={"Authorization": f"Bearer {DAILY_API_KEY}"}
        )
        
        if response.status_code != 200:
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
            metadata.update({
                "status": "completed",
                "end_time": datetime.now().isoformat(),
                "s3_path": f"recordings/{recording_id}/recording.mp4"
            })
            
            s3_client.put_object(
                Bucket=BUCKET_NAME,
                Key=f"recordings/{recording_id}/metadata.json",
                Body=json.dumps(metadata)
            )
            
            return {
                "recording_id": recording_id,
                "s3_path": f"recordings/{recording_id}/recording.mp4"
            }
    
    except Exception as e:
        print(f"Error processing recording: {str(e)}")
        raise

@dramatiq.actor(max_retries=3)
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
                s3_client.delete_object(
                    Bucket=BUCKET_NAME,
                    Key=obj['Key']
                )
                
    except Exception as e:
        print(f"Error cleaning up recordings: {str(e)}")
        raise 