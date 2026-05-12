"""
CRUD operations for database models.
"""

from sqlalchemy.orm import Session
from . import models, schemas
import bcrypt

def get_password_hash(password: str) -> str:
    pwd_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    hashed_password = bcrypt.hashpw(password=pwd_bytes, salt=salt)
    return hashed_password.decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    password_byte_enc = plain_password.encode('utf-8')
    hashed_password_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password=password_byte_enc, hashed_password=hashed_password_bytes)

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = get_password_hash(user.password)
    db_user = models.User(
        email=user.email,
        name=user.name,
        roll_no=user.roll_no,
        branch=user.branch,
        hashed_password=hashed_password
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def change_user_password(db: Session, db_user: models.User, new_password: str):
    hashed_password = get_password_hash(new_password)
    db_user.hashed_password = hashed_password
    db.commit()
    db.refresh(db_user)
    return db_user

def get_clubs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Club).offset(skip).limit(limit).all()

def create_club(db: Session, club: schemas.ClubCreate):
    db_club = models.Club(**club.dict())
    
    # Check if student_email matches a user, if so, make them club_admin
    if db_club.student_email:
        user = get_user_by_email(db, db_club.student_email)
        if user:
            db_club.admin_id = user.id
            if user.role == 'student':
                user.role = 'club_admin'
                
    db.add(db_club)
    db.commit()
    db.refresh(db_club)
    return db_club

def update_club(db: Session, club_id: int, club_update: schemas.ClubUpdate):
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        return None
    
    update_data = club_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_club, key, value)
        
    # Check if student_email was updated and matches a user
    if 'student_email' in update_data and update_data['student_email']:
        user = get_user_by_email(db, update_data['student_email'])
        if user:
            db_club.admin_id = user.id
            if user.role == 'student':
                user.role = 'club_admin'
    
    db.commit()
    db.refresh(db_club)
    return db_club

def update_event(db: Session, event_id: int, event_update: schemas.EventUpdate):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        return None
        
    update_data = event_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_event, key, value)
        
    db.commit()
    db.refresh(db_event)
    return db_event

def get_events(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Event).offset(skip).limit(limit).all()

def create_event(db: Session, event: schemas.EventCreate):
    db_event = models.Event(**event.dict())
    db.add(db_event)
    db.commit()
    db.refresh(db_event)
    return db_event

def delete_club(db: Session, club_id: int):
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if db_club:
        db.delete(db_club)
        db.commit()
    return db_club

def delete_event(db: Session, event_id: int):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if db_event:
        db.delete(db_event)
        db.commit()
    return db_event

def create_application(db: Session, application: schemas.ApplicationCreate):
    db_app = models.Application(**application.dict())
    db.add(db_app)
    db.commit()
    db.refresh(db_app)
    return db_app

def create_event_registration(db: Session, registration: schemas.EventRegistrationCreate):
    db_reg = models.EventRegistration(**registration.dict())
    db.add(db_reg)
    db.commit()
    db.refresh(db_reg)
    return db_reg


def update_user(db: Session, user_id: int, user_update: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        return None
    
    update_data = user_update.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_user, key, value)
        
    db.commit()
    db.refresh(db_user)
    return db_user


def update_application_status(db: Session, application_id: int, new_status: str):
    """Update an application's status and adjust club member_count accordingly."""
    db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if not db_app:
        return None
    
    old_status = db_app.status
    db_app.status = new_status
    
    # Adjust member_count on the club
    db_club = db.query(models.Club).filter(models.Club.id == db_app.club_id).first()
    if db_club:
        if new_status == "approved" and old_status != "approved":
            db_club.member_count = (db_club.member_count or 0) + 1
        elif old_status == "approved" and new_status != "approved":
            db_club.member_count = max((db_club.member_count or 1) - 1, 0)
    
    db.commit()
    db.refresh(db_app)
    return db_app


def update_event_registration_status(db: Session, registration_id: int, new_status: str):
    """Update an event registration's status."""
    db_reg = db.query(models.EventRegistration).filter(models.EventRegistration.id == registration_id).first()
    if not db_reg:
        return None
    
    db_reg.status = new_status
    db.commit()
    db.refresh(db_reg)
    return db_reg


def get_club_members(db: Session, club_id: int):
    """Get all approved members of a club."""
    return db.query(models.Application).filter(
        models.Application.club_id == club_id,
        models.Application.status == "approved"
    ).all()


def get_club_event_registrations(db: Session, club_id: int):
    """Get all event registrations for events belonging to a specific club."""
    event_ids = [e.id for e in db.query(models.Event).filter(models.Event.club_id == club_id).all()]
    if not event_ids:
        return []
    return db.query(models.EventRegistration).filter(
        models.EventRegistration.event_id.in_(event_ids)
    ).all()


# --- Club Memories ---

def create_club_memory(db: Session, memory: schemas.ClubMemoryCreate):
    db_memory = models.ClubMemory(**memory.model_dump())
    db.add(db_memory)
    db.commit()
    db.refresh(db_memory)
    return db_memory

def get_club_memories(db: Session, club_id: int):
    return db.query(models.ClubMemory).filter(models.ClubMemory.club_id == club_id).order_by(models.ClubMemory.created_at.desc()).all()

def get_recent_memories(db: Session, limit: int = 15):
    return db.query(models.ClubMemory).order_by(models.ClubMemory.created_at.desc()).limit(limit).all()

def delete_club_memory(db: Session, memory_id: int):
    db_memory = db.query(models.ClubMemory).filter(models.ClubMemory.id == memory_id).first()
    if db_memory:
        db.delete(db_memory)
        db.commit()
        return True
    return False

def delete_application(db: Session, application_id: int):
    """Delete a club membership application."""
    db_app = db.query(models.Application).filter(models.Application.id == application_id).first()
    if db_app:
        # If it was approved, decrease club member_count
        if db_app.status == "approved":
            db_club = db.query(models.Club).filter(models.Club.id == db_app.club_id).first()
            if db_club:
                db_club.member_count = max((db_club.member_count or 1) - 1, 0)
        
        db.delete(db_app)
        db.commit()
        return True
    return False

def delete_event_registration(db: Session, registration_id: int):
    """Delete an event registration."""
    db_reg = db.query(models.EventRegistration).filter(models.EventRegistration.id == registration_id).first()
    if db_reg:
        db.delete(db_reg)
        db.commit()
        return True
    return False
