import uuid
from datetime import datetime
import json
import sqlite3
from pathlib import Path
from typing import Dict, Any, Optional

class RecordingManager:
    def __init__(self, db_path: str = 'database/recordings.db'):
        self.db_path = db_path
        self._init_db()

    def _init_db(self):
        """Initialize the recordings database with enhanced schema"""
        Path(self.db_path).parent.mkdir(parents=True, exist_ok=True)
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Enhanced schema with unique ID and additional metadata
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS recordings (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                unique_id TEXT UNIQUE NOT NULL,
                meeting_id TEXT NOT NULL,
                recording_id TEXT NOT NULL,
                room_name TEXT,
                room_url TEXT,
                recording_url TEXT,
                recording_file_path TEXT,
                status TEXT DEFAULT 'pending',
                metadata TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                UNIQUE(unique_id)
            )
        ''')
        
        conn.commit()
        conn.close()

    def generate_unique_id(self) -> str:
        """Generate a unique ID for a recording"""
        return f"rec_{uuid.uuid4().hex}"

    def create_recording(self, meeting_id: str, room_name: str, room_url: str) -> Dict[str, str]:
        """Create a new recording entry with a unique ID"""
        unique_id = self.generate_unique_id()
        recording_id = f"rec_{meeting_id}_{datetime.now().strftime('%Y%m%d_%H%M%S')}"
        
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                INSERT INTO recordings (
                    unique_id, meeting_id, recording_id, room_name, room_url, status, metadata
                ) VALUES (?, ?, ?, ?, ?, ?, ?)
            ''', (
                unique_id,
                meeting_id,
                recording_id,
                room_name,
                room_url,
                'pending',
                json.dumps({
                    'created_at': datetime.now().isoformat(),
                    'room_name': room_name,
                    'room_url': room_url
                })
            ))
            
            conn.commit()
            
            return {
                'unique_id': unique_id,
                'recording_id': recording_id,
                'meeting_id': meeting_id
            }
            
        finally:
            conn.close()

    def update_recording_status(self, unique_id: str, status: str, metadata: Optional[Dict[str, Any]] = None):
        """Update the status and metadata of a recording"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            if metadata:
                cursor.execute('''
                    UPDATE recordings 
                    SET status = ?, metadata = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE unique_id = ?
                ''', (status, json.dumps(metadata), unique_id))
            else:
                cursor.execute('''
                    UPDATE recordings 
                    SET status = ?, updated_at = CURRENT_TIMESTAMP 
                    WHERE unique_id = ?
                ''', (status, unique_id))
            
            conn.commit()
            
        finally:
            conn.close()

    def get_recording_metadata(self, unique_id: str) -> Optional[Dict[str, Any]]:
        """Get recording metadata by unique ID"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            cursor.execute('''
                SELECT unique_id, meeting_id, recording_id, room_name, room_url, 
                       recording_url, recording_file_path, status, metadata,
                       created_at, updated_at
                FROM recordings 
                WHERE unique_id = ?
            ''', (unique_id,))
            
            row = cursor.fetchone()
            if not row:
                return None
                
            return {
                'unique_id': row[0],
                'meeting_id': row[1],
                'recording_id': row[2],
                'room_name': row[3],
                'room_url': row[4],
                'recording_url': row[5],
                'recording_file_path': row[6],
                'status': row[7],
                'metadata': json.loads(row[8]) if row[8] else {},
                'created_at': row[9],
                'updated_at': row[10]
            }
            
        finally:
            conn.close()

    def list_recordings(self, status: Optional[str] = None) -> list:
        """List all recordings, optionally filtered by status"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        try:
            if status:
                cursor.execute('''
                    SELECT unique_id, meeting_id, recording_id, status, metadata, created_at
                    FROM recordings 
                    WHERE status = ?
                    ORDER BY created_at DESC
                ''', (status,))
            else:
                cursor.execute('''
                    SELECT unique_id, meeting_id, recording_id, status, metadata, created_at
                    FROM recordings 
                    ORDER BY created_at DESC
                ''')
            
            recordings = []
            for row in cursor.fetchall():
                recordings.append({
                    'unique_id': row[0],
                    'meeting_id': row[1],
                    'recording_id': row[2],
                    'status': row[3],
                    'metadata': json.loads(row[4]) if row[4] else {},
                    'created_at': row[5]
                })
            
            return recordings
            
        finally:
            conn.close() 