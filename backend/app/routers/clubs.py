"""
Club routes — CRUD operations + applications.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from .. import schemas, crud, models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["clubs"])


@router.get("/clubs", response_model=list[schemas.Club])
def read_clubs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clubs = crud.get_clubs(db, skip=skip, limit=limit)
    return clubs


@router.post("/clubs", response_model=schemas.Club)
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_club(db=db, club=club)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="An organization with this name already exists")


@router.put("/clubs/{club_id}", response_model=schemas.Club)
def update_club(
    club_id: int, 
    club_update: schemas.ClubUpdate, 
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    if x_user_role == "club_admin" and str(db_club.admin_id) != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to edit this club")

    try:
        updated_club = crud.update_club(db=db, club_id=club_id, club_update=club_update)
        return updated_club
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="An organization with this name already exists")


@router.delete("/clubs/{club_id}")
def delete_club(
    club_id: int, 
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    if x_user_role != "admin":
        raise HTTPException(status_code=403, detail="Only main admin can delete clubs")
        
    db_club = crud.delete_club(db=db, club_id=club_id)
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    return {"message": "Club deleted successfully"}


@router.post("/applications", response_model=schemas.Application)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    existing_app = db.query(models.Application).filter(
        models.Application.user_id == application.user_id,
        models.Application.club_id == application.club_id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this club")
    return crud.create_application(db=db, application=application)


@router.get("/clubs/{club_id}/applications", response_model=list[schemas.ApplicationWithUser])
def get_club_applications(club_id: int, db: Session = Depends(get_db)):
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    return db_club.applications


@router.put("/applications/{application_id}/status", response_model=schemas.ApplicationWithUser)
def update_application_status(
    application_id: int,
    status_update: schemas.ApplicationStatusUpdate,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Accept or reject a club membership application."""
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if status_update.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    # Verify club_admin owns the club
    db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if x_user_role == "club_admin":
        db_club = db.query(models.Club).filter(models.Club.id == db_app.club_id).first()
        if not db_club or str(db_club.admin_id) != x_user_id:
            raise HTTPException(status_code=403, detail="Not authorized for this club")
    
    updated = crud.update_application_status(db, application_id, status_update.status)
    return updated
    

@router.delete("/applications/{application_id}")
def delete_application(
    application_id: int,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a club membership application."""
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not db_app:
        raise HTTPException(status_code=404, detail="Application not found")
    
    if x_user_role == "club_admin":
        db_club = db.query(models.Club).filter(models.Club.id == db_app.club_id).first()
        if not db_club or str(db_club.admin_id) != x_user_id:
            raise HTTPException(status_code=403, detail="Not authorized for this club")
            
    success = crud.delete_application(db, application_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete application")
    return {"message": "Application deleted successfully"}


@router.get("/clubs/{club_id}/members", response_model=list[schemas.ApplicationWithUser])
def get_club_members(
    club_id: int,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get all approved members of a club."""
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if x_user_role == "club_admin" and str(db_club.admin_id) != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this club")
    
    return crud.get_club_members(db, club_id)


@router.get("/clubs/{club_id}/event-registrations", response_model=list[schemas.EventRegistrationWithUserAndEvent])
def get_club_event_registrations(
    club_id: int,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Get all event registrations for events belonging to a specific club."""
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if x_user_role == "club_admin" and str(db_club.admin_id) != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this club")
    
    return crud.get_club_event_registrations(db, club_id)

# --- Club Memories ---

@router.get("/memories/recent", response_model=list[schemas.ClubMemory])
def get_recent_memories(limit: int = 15, db: Session = Depends(get_db)):
    """Get recent memories across all clubs for the home page."""
    return crud.get_recent_memories(db, limit)

@router.get("/clubs/{club_id}/memories", response_model=list[schemas.ClubMemory])
def get_club_memories(club_id: int, db: Session = Depends(get_db)):
    """Get all memories for a specific club."""
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    return crud.get_club_memories(db, club_id)

@router.post("/clubs/{club_id}/memories", response_model=schemas.ClubMemory)
def add_club_memory(
    club_id: int,
    memory_in: schemas.ClubMemoryCreate,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Add a new memory (image/video URL) for a club."""
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
        
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if x_user_role == "club_admin" and str(db_club.admin_id) != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized for this club")
        
    return crud.create_club_memory(db, memory_in)

@router.delete("/memories/{memory_id}")
def delete_club_memory(
    memory_id: int,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete a memory."""
    db_memory = db.query(models.ClubMemory).filter(models.ClubMemory.id == memory_id).first()
    if not db_memory:
        raise HTTPException(status_code=404, detail="Memory not found")
        
    # Check auth
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if x_user_role == "club_admin":
        db_club = db.query(models.Club).filter(models.Club.id == db_memory.club_id).first()
        if not db_club or str(db_club.admin_id) != x_user_id:
            raise HTTPException(status_code=403, detail="Not authorized for this club's memories")
            
    success = crud.delete_club_memory(db, memory_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete memory")
        
    return {"message": "Memory deleted successfully"}
