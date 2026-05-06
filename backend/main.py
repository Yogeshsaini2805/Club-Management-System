"""
JECRC Club Management API — Entry Point
=========================================
Thin entry point that creates the app from the factory.

Usage:
  python -m uvicorn main:app --reload
"""

from app import create_app

app = create_app()
