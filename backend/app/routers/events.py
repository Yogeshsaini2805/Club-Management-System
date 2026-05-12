"""
Event routes — CRUD operations + registrations.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from .. import schemas, crud, models
from ..database import get_db

router = APIRouter(prefix="/api", tags=["events"])


@router.get("/events", response_model=list[schemas.Event])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = crud.get_events(db, skip=skip, limit=limit)
    return events


@router.post("/events", response_model=schemas.Event)
def create_event(
    event: schemas.EventCreate, 
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    if x_user_role == "club_admin":
        db_club = db.query(models.Club).filter(models.Club.id == event.club_id).first()
        if not db_club or str(db_club.admin_id) != x_user_id:
             raise HTTPException(status_code=403, detail="Not authorized to add events for this club")
             
    return crud.create_event(db=db, event=event)


@router.put("/events/{event_id}", response_model=schemas.Event)
def update_event(
    event_id: int,
    event_update: schemas.EventUpdate,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if x_user_role == "club_admin":
        db_club = db.query(models.Club).filter(models.Club.id == db_event.club_id).first()
        if not db_club or str(db_club.admin_id) != x_user_id:
             raise HTTPException(status_code=403, detail="Not authorized to edit this event")
             
    return crud.update_event(db=db, event_id=event_id, event_update=event_update)


@router.delete("/events/{event_id}")
def delete_event(
    event_id: int, 
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
        
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
        
    if x_user_role == "club_admin":
        db_club = db.query(models.Club).filter(models.Club.id == db_event.club_id).first()
        if not db_club or str(db_club.admin_id) != x_user_id:
             raise HTTPException(status_code=403, detail="Not authorized to delete this event")
             
    crud.delete_event(db=db, event_id=event_id)
    return {"message": "Event deleted successfully"}


@router.post("/event-registrations", response_model=schemas.EventRegistration)
def create_event_registration(registration: schemas.EventRegistrationCreate, db: Session = Depends(get_db)):
    # Check duplicate by roll_no + event_id (allows one account to register multiple students)
    if registration.roll_no:
        existing_reg = db.query(models.EventRegistration).filter(
            models.EventRegistration.roll_no == registration.roll_no,
            models.EventRegistration.event_id == registration.event_id
        ).first()
        if existing_reg:
            raise HTTPException(status_code=400, detail=f"Roll number {registration.roll_no} is already registered for this event")
    return crud.create_event_registration(db=db, registration=registration)


@router.get("/events/{event_id}/registrations", response_model=list[schemas.EventRegistrationWithUser])
def get_event_registrations(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event.registrations


@router.put("/event-registrations/{registration_id}/status", response_model=schemas.EventRegistrationWithUser)
def update_event_registration_status(
    registration_id: int,
    status_update: schemas.EventRegistrationStatusUpdate,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Accept or reject an event registration."""
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    if status_update.status not in ["approved", "rejected"]:
        raise HTTPException(status_code=400, detail="Status must be 'approved' or 'rejected'")
    
    db_reg = db.query(models.EventRegistration).filter(models.EventRegistration.id == registration_id).first()
    if not db_reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    # Verify club_admin owns the club that owns this event
    if x_user_role == "club_admin":
        db_event = db.query(models.Event).filter(models.Event.id == db_reg.event_id).first()
        if db_event:
            db_club = db.query(models.Club).filter(models.Club.id == db_event.club_id).first()
            if not db_club or str(db_club.admin_id) != x_user_id:
                raise HTTPException(status_code=403, detail="Not authorized for this event")
    
    updated = crud.update_event_registration_status(db, registration_id, status_update.status)
    return updated
    

@router.delete("/event-registrations/{registration_id}")
def delete_event_registration(
    registration_id: int,
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    """Delete an event registration."""
    if not x_user_role or x_user_role not in ["admin", "club_admin"]:
        raise HTTPException(status_code=403, detail="Not authorized")
    
    db_reg = db.query(models.EventRegistration).filter(models.EventRegistration.id == registration_id).first()
    if not db_reg:
        raise HTTPException(status_code=404, detail="Registration not found")
    
    if x_user_role == "club_admin":
        db_event = db.query(models.Event).filter(models.Event.id == db_reg.event_id).first()
        if db_event:
            db_club = db.query(models.Club).filter(models.Club.id == db_event.club_id).first()
            if not db_club or str(db_club.admin_id) != x_user_id:
                raise HTTPException(status_code=403, detail="Not authorized for this event")
                
    success = crud.delete_event_registration(db, registration_id)
    if not success:
        raise HTTPException(status_code=500, detail="Failed to delete registration")
    return {"message": "Registration deleted successfully"}
