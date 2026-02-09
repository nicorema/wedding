#!/usr/bin/env python3
"""
Script to flush (empty) all tables in the database
Usage: python3 flush_db.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(__file__), 'matrimonio.db')

def flush_database():
    """Delete all data from all tables but keep table structure"""
    if not os.path.exists(DB_PATH):
        print(f"Database not found at: {DB_PATH}")
        return False
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()
    
    try:
        # Get all user tables (exclude sqlite internal tables)
        cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name NOT LIKE 'sqlite_%'")
        tables = [row[0] for row in cursor.fetchall()]
        
        if not tables:
            print("No tables found in database.")
            conn.close()
            return False
        
        print(f"\nFlushing {len(tables)} table(s): {', '.join(tables)}\n")
        
        # Delete all rows from each table
        for table in tables:
            cursor.execute(f'DELETE FROM {table}')
            deleted_count = cursor.rowcount
            print(f"✓ {table}: Deleted {deleted_count} row(s)")
        
        # Reset auto-increment counters
        cursor.execute("DELETE FROM sqlite_sequence")
        
        # Commit changes
        conn.commit()
        
        print("\n✓ Database flushed successfully!")
        print("All tables are now empty but structure is preserved.\n")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Error flushing database: {str(e)}")
        conn.rollback()
        return False
    finally:
        conn.close()

if __name__ == '__main__':
    print("="*80)
    print("DATABASE FLUSH")
    print("="*80)
    
    # Confirm before flushing
    response = input("\n⚠️  WARNING: This will delete ALL data from all tables!\nAre you sure you want to continue? (yes/no): ")
    
    if response.lower() in ['yes', 'y']:
        success = flush_database()
        if success:
            print("="*80)
        else:
            print("\nFlush cancelled or failed.")
    else:
        print("\nFlush cancelled.")
