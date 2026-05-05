from fastapi import FastAPI, Depends, HTTPException, status, UploadFile, File, Header, Request
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi.middleware.cors import CORSMiddleware
import models, schemas, crud
from database import engine, get_db
import os
import shutil
import uuid

# Create database tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="JECRC Club Management API")

FRONTEND_URL = os.environ.get("FRONTEND_URL", "http://localhost:3000")

# Configure CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_origin_regex=".*",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Setup static files directory for uploads
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads", "logos")
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")), name="uploads")

@app.post("/api/upload-logo")
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

@app.post("/api/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    # Validate email
    if not user.email.endswith("@jecrcu.edu.in"):
        raise HTTPException(status_code=400, detail="Must be a valid @jecrcu.edu.in email")
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db=db, user=user)

@app.post("/api/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not crud.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    return {"message": "Login successful", "user": {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "roll_no": db_user.roll_no,
        "branch": db_user.branch
    }}

@app.post("/api/change-password")
def change_password(request: schemas.UserChangePassword, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=request.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not crud.verify_password(request.old_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    crud.change_user_password(db=db, db_user=db_user, new_password=request.new_password)
    return {"message": "Password updated successfully"}


@app.put("/api/users/{user_id}", response_model=schemas.User)
def update_user_profile(
    user_id: int,
    user_update: schemas.UserUpdate,
    x_user_id: str = Header(None),
    db: Session = Depends(get_db)
):
    if str(user_id) != x_user_id:
        raise HTTPException(status_code=403, detail="Not authorized to update this profile")
    
    updated_user = crud.update_user(db=db, user_id=user_id, user_update=user_update)
    if not updated_user:
        raise HTTPException(status_code=404, detail="User not found")
    return updated_user

@app.get("/api/clubs", response_model=list[schemas.Club])
def read_clubs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clubs = crud.get_clubs(db, skip=skip, limit=limit)
    return clubs

@app.post("/api/clubs", response_model=schemas.Club)
def create_club(club: schemas.ClubCreate, db: Session = Depends(get_db)):
    try:
        return crud.create_club(db=db, club=club)
    except IntegrityError:
        db.rollback()
        raise HTTPException(status_code=400, detail="An organization with this name already exists")

@app.put("/api/clubs/{club_id}", response_model=schemas.Club)
def update_club(
    club_id: int, 
    club_update: schemas.ClubUpdate, 
    x_user_id: str = Header(None),
    x_user_role: str = Header(None),
    db: Session = Depends(get_db)
):
    # Verify authorization
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

@app.get("/api/events", response_model=list[schemas.Event])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    events = crud.get_events(db, skip=skip, limit=limit)
    return events

@app.post("/api/events", response_model=schemas.Event)
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

@app.put("/api/events/{event_id}", response_model=schemas.Event)
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
        # Ensure event belongs to their club
        db_club = db.query(models.Club).filter(models.Club.id == db_event.club_id).first()
        if not db_club or str(db_club.admin_id) != x_user_id:
             raise HTTPException(status_code=403, detail="Not authorized to edit this event")
             
    return crud.update_event(db=db, event_id=event_id, event_update=event_update)

@app.delete("/api/clubs/{club_id}")
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

@app.delete("/api/events/{event_id}")
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

@app.post("/api/applications", response_model=schemas.Application)
def create_application(application: schemas.ApplicationCreate, db: Session = Depends(get_db)):
    # Check for existing application
    existing_app = db.query(models.Application).filter(
        models.Application.user_id == application.user_id,
        models.Application.club_id == application.club_id
    ).first()
    if existing_app:
        raise HTTPException(status_code=400, detail="You have already applied to this club")
    return crud.create_application(db=db, application=application)

@app.post("/api/event-registrations", response_model=schemas.EventRegistration)
def create_event_registration(registration: schemas.EventRegistrationCreate, db: Session = Depends(get_db)):
    # Check for existing registration
    existing_reg = db.query(models.EventRegistration).filter(
        models.EventRegistration.user_id == registration.user_id,
        models.EventRegistration.event_id == registration.event_id
    ).first()
    if existing_reg:
        raise HTTPException(status_code=400, detail="You have already registered for this event")
    return crud.create_event_registration(db=db, registration=registration)


@app.get("/api/clubs/{club_id}/applications", response_model=list[schemas.ApplicationWithUser])
def get_club_applications(club_id: int, db: Session = Depends(get_db)):
    # Should ideally verify authorization, but for simplicity we return them.
    db_club = db.query(models.Club).filter(models.Club.id == club_id).first()
    if not db_club:
        raise HTTPException(status_code=404, detail="Club not found")
    return db_club.applications

@app.get("/api/events/{event_id}/registrations", response_model=list[schemas.EventRegistrationWithUser])
def get_event_registrations(event_id: int, db: Session = Depends(get_db)):
    db_event = db.query(models.Event).filter(models.Event.id == event_id).first()
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event.registrations
