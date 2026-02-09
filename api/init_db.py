#!/usr/bin/env python3
"""
Script to initialize the database tables in Supabase PostgreSQL
Run this once after setting up Supabase to create the tables
"""
import os
from db import init_db

if __name__ == "__main__":
    print("Initializing database tables...")
    try:
        init_db()
        print("✅ Database tables created successfully!")
    except Exception as e:
        print(f"❌ Error initializing database: {e}")
        import traceback

        traceback.print_exc()
