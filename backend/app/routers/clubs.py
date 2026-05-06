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
