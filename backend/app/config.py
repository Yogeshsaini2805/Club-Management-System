"""
JECRC Club Management API — Application Config
================================================
Centralized settings for the backend application.
"""

import os

# Base directory of the backend package
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Database
DATABASE_URL = f"sqlite:///{os.path.join(BASE_DIR, 'jecrc_clubs.db')}"

# Uploads
UPLOAD_DIR = os.path.join(BASE_DIR, "uploads", "logos")

# CORS
FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")
ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://127.0.0.1:3000",
]
