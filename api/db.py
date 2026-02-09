import os
import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager


# Supabase PostgreSQL connection
def get_db_connection():
    """Get PostgreSQL connection from Supabase"""
    host = os.environ.get("SUPABASE_DB_HOST")
    dbname = os.environ.get("SUPABASE_DB_NAME", "postgres")
    user = os.environ.get("SUPABASE_DB_USER")
    password = os.environ.get("SUPABASE_DB_PASSWORD")

    # Always use connection pooler port (6543) for Vercel/serverless compatibility
    # Direct connection (5432) causes IPv6 issues in serverless environments
    port = "6543"

    if not all([host, user, password]):
        raise ValueError(
            "Missing required environment variables: SUPABASE_DB_HOST, "
            "SUPABASE_DB_USER, and SUPABASE_DB_PASSWORD must be set"
        )

    # Use connection string format
    conn_string = f"host={host} dbname={dbname} user={user} password={password} port={port} sslmode=require"

    conn = psycopg.connect(conn_string)
    return conn


@contextmanager
def get_db():
    """Context manager to handle database connections"""
    conn = get_db_connection()
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
    with get_db() as conn:
        cursor = conn.cursor()

        # Scores table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS scores (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                time INTEGER NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Messages table
        cursor.execute(
            """
            CREATE TABLE IF NOT EXISTS messages (
                id SERIAL PRIMARY KEY,
                name TEXT NOT NULL,
                message TEXT NOT NULL,
                status TEXT NOT NULL DEFAULT 'Pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """
        )

        # Indexes to improve performance
        cursor.execute("CREATE INDEX IF NOT EXISTS idx_scores_time ON scores(time ASC)")
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status)"
        )
        cursor.execute(
            "CREATE INDEX IF NOT EXISTS idx_messages_created ON messages(created_at DESC)"
        )


def get_best_score():
    """Gets the score with the lowest time (best time)"""
    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            SELECT name, time, created_at
            FROM scores
            ORDER BY time ASC
            LIMIT 1
        """
        )
        row = cursor.fetchone()
        if row:
            return dict(row)
        return None


def create_score(name, time):
    """Creates a new score"""
    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            INSERT INTO scores (name, time)
            VALUES (%s, %s)
            RETURNING id, name, time, created_at
        """,
            (name, time),
        )

        row = cursor.fetchone()
        return dict(row)


def get_all_scores():
    """Gets all scores ordered by time (best first) for ranking"""
    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            SELECT id, name, time, created_at
            FROM scores
            ORDER BY time ASC, created_at ASC
        """
        )

        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_approved_messages():
    """Gets only messages with 'Approved' status"""
    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            SELECT id, name, message, status, created_at
            FROM messages
            WHERE status = 'Approved'
            ORDER BY created_at DESC
        """
        )

        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def create_message(name, message):
    """Creates a new message with 'Pending' status"""
    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            INSERT INTO messages (name, message, status)
            VALUES (%s, %s, 'Pending')
            RETURNING id, name, message, status, created_at
        """,
            (name, message),
        )

        row = cursor.fetchone()
        return dict(row)


def get_all_messages():
    """Gets all messages (for administration)"""
    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            SELECT id, name, message, status, created_at
            FROM messages
            ORDER BY created_at DESC
        """
        )

        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def get_pending_messages():
    """Gets only messages with 'Pending' status"""
    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            SELECT id, name, message, status, created_at
            FROM messages
            WHERE status = 'Pending'
            ORDER BY created_at DESC
        """
        )

        rows = cursor.fetchall()
        return [dict(row) for row in rows]


def delete_message(message_id):
    """Deletes a message by ID"""
    with get_db() as conn:
        cursor = conn.cursor()
        cursor.execute("DELETE FROM messages WHERE id = %s", (message_id,))

        if cursor.rowcount == 0:
            raise ValueError(f"Message with id {message_id} not found")

        return True


def update_message_status(message_id, status):
    """Updates the status of a message (for administration)"""
    valid_statuses = ["Pending", "Approved", "Denied"]
    if status not in valid_statuses:
        raise ValueError(f"Status must be one of {valid_statuses}")

    with get_db() as conn:
        cursor = conn.cursor(row_factory=dict_row)
        cursor.execute(
            """
            UPDATE messages
            SET status = %s
            WHERE id = %s
            RETURNING id, name, message, status, created_at
        """,
            (status, message_id),
        )

        if cursor.rowcount == 0:
            raise ValueError(f"Message with id {message_id} not found")

        row = cursor.fetchone()
        return dict(row)
