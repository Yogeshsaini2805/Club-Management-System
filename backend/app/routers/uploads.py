"""
Upload routes — file upload endpoint.
"""

from fastapi import APIRouter, HTTPException, UploadFile, File, Request
import os
import shutil
import uuid

from ..config import UPLOAD_DIR

router = APIRouter(prefix="/api", tags=["uploads"])


@router.post("/upload-logo")
async def upload_logo(request: Request, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Generate unique filename to prevent overwriting
    ext = os.path.splitext(file.filename)[1]
    unique_filename = f"{uuid.uuid4()}{ext}"
    file_location = os.path.join(UPLOAD_DIR, unique_filename)
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    base_url = str(request.base_url).rstrip("/")
    return {"logo_url": f"{base_url}/uploads/logos/{unique_filename}"}

@router.post("/upload-media")
async def upload_media(request: Request, file: UploadFile = File(...)):
    if not file.filename:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    # Check extension
    ext = os.path.splitext(file.filename)[1].lower()
    allowed_image_exts = ['.jpg', '.jpeg', '.png', '.webp', '.gif']
    allowed_video_exts = ['.mp4', '.webm', '.ogg']
    
    if ext not in allowed_image_exts and ext not in allowed_video_exts:
        raise HTTPException(status_code=400, detail="Unsupported file format")
        
    media_type = "video" if ext in allowed_video_exts else "image"
    
    # Generate unique filename
    unique_filename = f"{uuid.uuid4()}{ext}"
    media_dir = os.path.join(UPLOAD_DIR, "media")
    os.makedirs(media_dir, exist_ok=True)
    
    file_location = os.path.join(media_dir, unique_filename)
    
    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)
        
    base_url = str(request.base_url).rstrip("/")
    return {
        "media_url": f"{base_url}/uploads/media/{unique_filename}",
        "media_type": media_type
    }
