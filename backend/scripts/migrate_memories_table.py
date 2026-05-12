"""
Migration script: Add club_memories table.

Run once: py -3.13 scripts/migrate_memories_table.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "jecrc_clubs.db")

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    # Create club_memories table
    cur.execute('''
        CREATE TABLE IF NOT EXISTS club_memories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            club_id INTEGER,
            club_name TEXT,
            media_url TEXT,
            media_type TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(club_id) REFERENCES clubs(id)
        )
    ''')
    
    # Create index on club_id for faster lookups
    cur.execute('CREATE INDEX IF NOT EXISTS ix_club_memories_club_id ON club_memories (club_id)')
    
    print("Added 'club_memories' table")

    conn.commit()
    conn.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    migrate()
