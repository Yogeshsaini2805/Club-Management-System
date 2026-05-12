"""
Migration script: Add end_date column to events table.

Run once: py -3.13 scripts/migrate_event_end_date.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "jecrc_clubs.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    try:
        # Check if end_date already exists
        cur.execute("PRAGMA table_info(events)")
        columns = [col[1] for col in cur.fetchall()]
        
        if 'end_date' not in columns:
            cur.execute("ALTER TABLE events ADD COLUMN end_date TEXT")
            print("Added 'end_date' column to 'events' table.")
        else:
            print("'end_date' column already exists in 'events' table.")
            
        conn.commit()
    except Exception as e:
        print(f"Error during migration: {e}")
        conn.rollback()
    finally:
        conn.close()
        print("\nMigration complete!")

if __name__ == "__main__":
    migrate()
