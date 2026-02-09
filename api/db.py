import os
import psycopg
from psycopg.rows import dict_row
from contextlib import contextmanager


# Supabase PostgreSQL connection
def get_db_connection():
    """Get PostgreSQL connection from Supabase"""
    # Check if full connection string is provided (preferred for pooler)
    conn_string = os.environ.get("SUPABASE_DB_CONNECTION_STRING")

    if conn_string:
        # Use full connection string if provided (should include pooler hostname)
        # If it's a URL, use it directly; if it's key-value pairs, convert to URL format
        if conn_string.startswith("postgresql://") or conn_string.startswith(
            "postgres://"
        ):
            conn = psycopg.connect(conn_string)
        else:
            # Try parsing as key-value format and convert to URL
            conn = psycopg.connect(conn_string)
        return conn

    # Otherwise, construct connection string
    host = os.environ.get("SUPABASE_DB_HOST")
    dbname = os.environ.get("SUPABASE_DB_NAME", "postgres")
    user = os.environ.get("SUPABASE_DB_USER")
    password = os.environ.get("SUPABASE_DB_PASSWORD")

    if not all([host, user, password]):
        raise ValueError(
            "Missing required environment variables: SUPABASE_DB_HOST, "
            "SUPABASE_DB_USER, and SUPABASE_DB_PASSWORD must be set"
        )

    # Convert direct hostname to pooler hostname for IPv4 compatibility
    # Supabase pooler format: aws-0-[region].pooler.supabase.com
    # Default to us-east-1 if region not specified (most common)
    pooler_region = os.environ.get("SUPABASE_DB_REGION", "us-east-1")

    # Extract project ref from hostname for pooler user format
    project_ref = None
    pooler_host = host
    pooler_user = user

    if host.startswith("db.") and host.endswith(".supabase.co"):
        # Extract project ref: db.PROJECT_REF.supabase.co -> PROJECT_REF
        project_ref = host.replace("db.", "").replace(".supabase.co", "")
        # Use Supabase pooler hostname (IPv4-compatible)
        # Format: aws-0-[region].pooler.supabase.com
        pooler_host = f"aws-0-{pooler_region}.pooler.supabase.com"
        # Pooler requires user format: postgres.PROJECT_REF
        if user == "postgres" and project_ref:
            pooler_user = f"postgres.{project_ref}"
        elif project_ref and not user.startswith("postgres."):
            # If user is not in pooler format but we have project_ref, format it
            pooler_user = (
                f"{user}.{project_ref}"
                if user != "postgres"
                else f"postgres.{project_ref}"
            )
    elif ".pooler.supabase.com" in host:
        # Already using pooler hostname
        # If user doesn't have project ref format, we might need to extract it
        # But if host is already pooler, user should already be formatted correctly
        if user == "postgres" and not user.startswith("postgres."):
            # Try to extract from original host if available
            original_host = os.environ.get("SUPABASE_DB_ORIGINAL_HOST", host)
            if original_host.startswith("db.") and original_host.endswith(
                ".supabase.co"
            ):
                project_ref = original_host.replace("db.", "").replace(
                    ".supabase.co", ""
                )
                pooler_user = f"postgres.{project_ref}"

    # Always use connection pooler port (6543) for Vercel/serverless compatibility
    # Direct connection (5432) causes IPv6 issues in serverless environments
    # If using pooler hostname, force port 6543
    if ".pooler.supabase.com" in pooler_host or (
        project_ref and pooler_host.startswith("aws-0-")
    ):
        port = "6543"
    else:
        port = os.environ.get("SUPABASE_DB_PORT", "5432")

    # Use URL format for connection string (more reliable with psycopg)
    # URL format: postgresql://user:password@host:port/dbname?sslmode=require
    from urllib.parse import quote_plus

    encoded_password = quote_plus(password)
    encoded_user = quote_plus(pooler_user)

    conn_string = f"postgresql://{encoded_user}:{encoded_password}@{pooler_host}:{port}/{dbname}?sslmode=require"

    try:
        conn = psycopg.connect(conn_string)
        return conn
    except Exception as e:
        # Provide helpful error message for debugging (without exposing password)
        error_msg = str(e)
        if (
            "Tenant or user not found" in error_msg
            or "password authentication failed" in error_msg.lower()
        ):
            debug_info = (
                f"Connection attempt failed.\n"
                f"Original host: {host}\n"
                f"Pooler host: {pooler_host}\n"
                f"Port: {port}\n"
                f"User: {pooler_user}\n"
                f"Database: {dbname}\n"
                f"Project Ref: {project_ref or 'not extracted'}\n"
                f"Region: {pooler_region}\n\n"
                f"Troubleshooting:\n"
                f"1. Verify project ref extraction: '{host}' -> '{project_ref or 'FAILED'}' (should be 'bbwfvxmpigugrdeachjs')\n"
                f"2. Verify user format: should be 'postgres.{project_ref}' = 'postgres.{project_ref or 'PROJECT_REF'}'\n"
                f"3. Check if region is correct (current: {pooler_region}). Set SUPABASE_DB_REGION if different.\n"
                f"4. Verify password is correct in Vercel environment variables.\n"
                f"5. Consider using SUPABASE_DB_CONNECTION_STRING from Supabase dashboard instead."
            )
            raise psycopg.OperationalError(f"{error_msg}\n\n{debug_info}") from e
        raise


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
