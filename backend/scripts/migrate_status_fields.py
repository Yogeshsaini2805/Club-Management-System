"""
Migration script: Add new columns to event_registrations and applications.

Run once: py -3.13 scripts/migrate_status_fields.py
"""

import sqlite3
import os

DB_PATH = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "jecrc_clubs.db")

def column_exists(cursor, table, column):
    cursor.execute(f"PRAGMA table_info({table})")
    return any(row[1] == column for row in cursor.fetchall())

def migrate():
    conn = sqlite3.connect(DB_PATH)
    cur = conn.cursor()

    migrations = [
        ("event_registrations", "status", "TEXT DEFAULT 'pending'"),
        ("event_registrations", "created_at", "DATETIME"),
        ("event_registrations", "name", "TEXT"),
        ("event_registrations", "roll_no", "TEXT"),
        ("event_registrations", "branch", "TEXT"),
        ("applications", "created_at", "DATETIME"),
    ]

    for table, column, col_type in migrations:
        if not column_exists(cur, table, column):
            cur.execute(f"ALTER TABLE {table} ADD COLUMN {column} {col_type}")
            print(f"Added '{column}' to {table}")
        else:
            print(f"'{column}' already exists in {table}")

    conn.commit()
    conn.close()
    print("\nMigration complete!")

if __name__ == "__main__":
    migrate()
