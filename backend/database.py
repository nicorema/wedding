import sqlite3
import os
from datetime import datetime
from contextlib import contextmanager

# Database path
DB_PATH = os.path.join(os.path.dirname(__file__), 'matrimonio.db')

@contextmanager
def get_db_connection():
    """Context manager to handle database connections"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row  # Allows access by column name
    try:
        yield conn
        conn.commit()
    except Exception:
        conn.rollback()
        raise
    finally:
        conn.close()

def init_db():
    """Initializes the database and creates tables if they don't exist"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        
        # Scores table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS scores (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                time INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Messages table
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS messages (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Indexes to improve performance
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_scores_time ON scores(time ASC)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status)')
        cursor.execute('CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)')

def get_best_score():
    """Gets the score with the lowest time (best time)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT name, time, created_at
            FROM scores
            ORDER BY time ASC
            LIMIT 1
        ''')
        row = cursor.fetchone()
        if row:
            return {
                'name': row['name'],
                'time': row['time'],
                'created_at': row['created_at']
            }
        return None

def create_score(name, time):
    """Creates a new score"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO scores (name, time)
            VALUES (?, ?)
        ''', (name, time))
        
        # Get the created score
        cursor.execute('''
            SELECT id, name, time, created_at
            FROM scores
            WHERE id = ?
        ''', (cursor.lastrowid,))
        
        row = cursor.fetchone()
        return {
            'id': row['id'],
            'name': row['name'],
            'time': row['time'],
            'created_at': row['created_at']
        }

def get_all_scores():
    """Gets all scores ordered by time (best first) for ranking"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name, time, created_at
            FROM scores
            ORDER BY time ASC, created_at ASC
        ''')
        
        rows = cursor.fetchall()
        return [
            {
                'id': row['id'],
                'name': row['name'],
                'time': row['time'],
                'created_at': row['created_at']
            }
            for row in rows
        ]

def get_approved_messages():
    """Gets only messages with 'Approved' status"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name, message, status, created_at
            FROM messages
            WHERE status = 'Approved'
            ORDER BY created_at DESC
        ''')
        
        rows = cursor.fetchall()
        return [
            {
                'id': row['id'],
                'name': row['name'],
                'message': row['message'],
                'status': row['status'],
                'created_at': row['created_at']
            }
            for row in rows
        ]

def create_message(name, message):
    """Creates a new message with 'Pending' status"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO messages (name, message, status)
            VALUES (?, ?, 'Pending')
        ''', (name, message))
        
        # Get the created message
        cursor.execute('''
            SELECT id, name, message, status, created_at
            FROM messages
            WHERE id = ?
        ''', (cursor.lastrowid,))
        
        row = cursor.fetchone()
        return {
            'id': row['id'],
            'name': row['name'],
            'message': row['message'],
            'status': row['status'],
            'created_at': row['created_at']
        }

# Helper functions for administration (optional, for future use)
def get_all_messages():
    """Gets all messages (for administration)"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name, message, status, created_at
            FROM messages
            ORDER BY created_at DESC
        ''')
        
        rows = cursor.fetchall()
        return [
            {
                'id': row['id'],
                'name': row['name'],
                'message': row['message'],
                'status': row['status'],
                'created_at': row['created_at']
            }
            for row in rows
        ]

def get_pending_messages():
    """Gets only messages with 'Pending' status"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT id, name, message, status, created_at
            FROM messages
            WHERE status = 'Pending'
            ORDER BY created_at DESC
        ''')
        
        rows = cursor.fetchall()
        return [
            {
                'id': row['id'],
                'name': row['name'],
                'message': row['message'],
                'status': row['status'],
                'created_at': row['created_at']
            }
            for row in rows
        ]

def delete_message(message_id):
    """Deletes a message by ID"""
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('DELETE FROM messages WHERE id = ?', (message_id,))
        
        if cursor.rowcount == 0:
            raise ValueError(f"Message with id {message_id} not found")
        
        return True

def update_message_status(message_id, status):
    """Updates the status of a message (for administration)"""
    valid_statuses = ['Pending', 'Approved', 'Denied']
    if status not in valid_statuses:
        raise ValueError(f"Status must be one of {valid_statuses}")
    
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('''
            UPDATE messages
            SET status = ?
            WHERE id = ?
        ''', (status, message_id))
        
        if cursor.rowcount == 0:
            raise ValueError(f"Message with id {message_id} not found")
        
        cursor.execute('''
            SELECT id, name, message, status, created_at
            FROM messages
            WHERE id = ?
        ''', (message_id,))
        
        row = cursor.fetchone()
        return {
            'id': row['id'],
            'name': row['name'],
            'message': row['message'],
            'status': row['status'],
            'created_at': row['created_at']
        }
