"""
User routes — profile update.
"""

from fastapi import APIRouter, Depends, HTTPException, Header
from sqlalchemy.orm import Session

from .. import schemas, crud
from ..database import get_db

router = APIRouter(prefix="/api", tags=["users"])


@router.put("/users/{user_id}", response_model=schemas.User)
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
