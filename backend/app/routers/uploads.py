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
