"""
JECRC Club Management API — Application Factory
=================================================
Creates and configures the FastAPI application.
"""

from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.middleware.cors import CORSMiddleware
import os

from .config import ALLOWED_ORIGINS, UPLOAD_DIR, BASE_DIR


def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    
    app = FastAPI(title="JECRC Club Management API")

    # ---- CORS ----
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_origin_regex=".*",
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

    # ---- Static Files ----
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    uploads_dir = os.path.join(BASE_DIR, "uploads")
    app.mount("/uploads", StaticFiles(directory=uploads_dir), name="uploads")

    # ---- Database Tables ----
    from . import models
    from .database import engine
    models.Base.metadata.create_all(bind=engine)

    # ---- Register Routers ----
    from .routers import auth, clubs, events, uploads, users
    app.include_router(auth.router)
    app.include_router(clubs.router)
    app.include_router(events.router)
    app.include_router(uploads.router)
    app.include_router(users.router)

    return app
