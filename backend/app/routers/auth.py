"""
Auth routes — register, login, change-password.
"""

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/api", tags=["auth"])


@router.post("/register", response_model=schemas.User)
def register(user: schemas.UserCreate, db: Session = Depends(get_db)):
    if not user.email.endswith("@jecrcu.edu.in"):
        raise HTTPException(status_code=400, detail="Must be a valid @jecrcu.edu.in email")
    
    db_user = crud.get_user_by_email(db, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    return crud.create_user(db=db, user=user)


@router.post("/login")
def login(user: schemas.UserLogin, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=user.email)
    if not db_user:
        raise HTTPException(status_code=400, detail="Invalid email or password")
    if not crud.verify_password(user.password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Invalid email or password")
    
    # Recalculate role to ensure it reflects current club head status
    crud.recalculate_user_role(db, db_user.id)
    db.commit()
    db.refresh(db_user)
    
    return {"message": "Login successful", "user": {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "roll_no": db_user.roll_no,
        "branch": db_user.branch
    }}


@router.post("/change-password")
def change_password(request: schemas.UserChangePassword, db: Session = Depends(get_db)):
    db_user = crud.get_user_by_email(db, email=request.email)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if not crud.verify_password(request.old_password, db_user.hashed_password):
        raise HTTPException(status_code=400, detail="Incorrect current password")
    
    crud.change_user_password(db=db, db_user=db_user, new_password=request.new_password)
    return {"message": "Password updated successfully"}


@router.get("/me")
def get_current_user(user_id: int, db: Session = Depends(get_db)):
    """Return the latest user data with recalculated role.
    Called by frontend on app mount to refresh cached session."""
    from .. import models
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Recalculate role
    crud.recalculate_user_role(db, db_user.id)
    db.commit()
    db.refresh(db_user)
    
    return {
        "id": db_user.id,
        "name": db_user.name,
        "email": db_user.email,
        "role": db_user.role,
        "roll_no": db_user.roll_no,
        "branch": db_user.branch
    }
