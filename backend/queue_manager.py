import sqlite3
import json
import time
from datetime import datetime
import threading
from pathlib import Path

class QueueManager:
    def __init__(self, db_path='queue.db'):
        self.db_path = db_path
        self.init_db()
        self.running = False
        self.handlers = {}

    def init_db(self):
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS tasks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                task_type TEXT NOT NULL,
                payload TEXT NOT NULL,
                status TEXT DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                started_at TIMESTAMP,
                completed_at TIMESTAMP,
                error TEXT
            )
        ''')
        conn.commit()
        conn.close()

    def enqueue(self, task_type, payload):
        """Add a task to the queue"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        cursor.execute(
            'INSERT INTO tasks (task_type, payload) VALUES (?, ?)',
            (task_type, json.dumps(payload))
        )
        task_id = cursor.lastrowid
        conn.commit()
        conn.close()
        return task_id

    def register_handler(self, task_type, handler):
        """Register a function to handle a specific task type"""
        self.handlers[task_type] = handler

    def process_task(self, task):
        """Process a single task"""
        task_id, task_type, payload = task
        handler = self.handlers.get(task_type)
        
        if not handler:
            return
            
        try:
            # Mark task as started
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            cursor.execute(
                'UPDATE tasks SET status = ?, started_at = CURRENT_TIMESTAMP WHERE id = ?',
                ('processing', task_id)
            )
            conn.commit()
            
            # Execute handler
            result = handler(**json.loads(payload))
            
            # Mark task as completed
            cursor.execute(
                'UPDATE tasks SET status = ?, completed_at = CURRENT_TIMESTAMP WHERE id = ?',
                ('completed', task_id)
            )
            conn.commit()
            
        except Exception as e:
            # Mark task as failed
            cursor.execute(
                'UPDATE tasks SET status = ?, error = ? WHERE id = ?',
                ('failed', str(e), task_id)
            )
            conn.commit()
            print(f"Error processing task {task_id}: {str(e)}")
            
        finally:
            conn.close()

    def run(self, interval=1):
        """Start processing tasks"""
        self.running = True
        
        while self.running:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Get pending tasks
            cursor.execute(
                'SELECT id, task_type, payload FROM tasks WHERE status = ? ORDER BY created_at ASC LIMIT 1',
                ('pending',)
            )
            task = cursor.fetchone()
            
            if task:
                self.process_task(task)
            
            conn.close()
            time.sleep(interval)

    def start(self):
        """Start the queue manager in a background thread"""
        thread = threading.Thread(target=self.run)
        thread.daemon = True
        thread.start()
        return thread

    def stop(self):
        """Stop the queue manager"""
        self.running = False 