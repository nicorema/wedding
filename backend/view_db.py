#!/usr/bin/env python3
"""
Simple script to view database tables
Usage: python3 view_db.py
"""

import sqlite3
import os
from datetime import datetime

DB_PATH = os.path.join(os.path.dirname(__file__), 'matrimonio.db')

def print_table(table_name, conn):
    """Print all rows from a table"""
    # Skip sqlite internal tables
    if table_name.startswith('sqlite_'):
        return
    
    cursor = conn.cursor()
    
    # Try to order by id, if it exists
    try:
        cursor.execute(f'SELECT * FROM {table_name} ORDER BY id DESC')
    except sqlite3.OperationalError:
        # If no id column, just select all
        cursor.execute(f'SELECT * FROM {table_name}')
    
    rows = cursor.fetchall()
    
    if not rows:
        print(f"\n{table_name}: (empty)")
        return
    
    # Get column names
    cursor.execute(f'PRAGMA table_info({table_name})')
    columns = [col[1] for col in cursor.fetchall()]
    
    print(f"\n{'='*80}")
    print(f"Table: {table_name}")
    print(f"{'='*80}")
    print(f"Total rows: {len(rows)}\n")
    
    # Print header
    header = " | ".join([f"{col:15}" for col in columns])
    print(header)
    print("-" * len(header))
    
    # Print rows
    for row in rows:
        row_str = " | ".join([f"{str(val):15}" for val in row])
        print(row_str)

def main():
    if not os.path.exists(DB_PATH):
        print(f"Database not found at: {DB_PATH}")
        print("Start the backend server first to create the database.")
        return
    
    conn = sqlite3.connect(DB_PATH)
    
    print("\n" + "="*80)
    print("MATRIMONIO DATABASE VIEWER")
    print("="*80)
    
    # Show all tables
    cursor = conn.cursor()
    cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
    tables = [row[0] for row in cursor.fetchall()]
    
    if not tables:
        print("No tables found in database.")
        conn.close()
        return
    
    print(f"\nFound {len(tables)} table(s): {', '.join(tables)}\n")
    
    # Print each table
    for table in tables:
        print_table(table, conn)
    
    print("\n" + "="*80)
    print("End of database view")
    print("="*80 + "\n")
    
    conn.close()

if __name__ == '__main__':
    main()
