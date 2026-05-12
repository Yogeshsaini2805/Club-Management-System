"""
Pydantic request/response schemas.
"""

from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    email: str
    name: str
    roll_no: str
    branch: str

class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    roll_no: Optional[str] = None
    branch: Optional[str] = None

class UserLogin(BaseModel):
    email: str
    password: str

class UserChangePassword(BaseModel):
    email: str
    old_password: str
    new_password: str

class User(UserBase):
    id: int
    role: str

    class Config:
        from_attributes = True

class EventBase(BaseModel):
    title: str
    date: str
    end_date: Optional[str] = None
    description: str
    venue: Optional[str] = None
    type: str
    club_id: int

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int

    class Config:
        from_attributes = True

class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    end_date: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    type: Optional[str] = None

class ClubMemoryBase(BaseModel):
    club_id: int
    club_name: str
    media_url: str
    media_type: str

class ClubMemoryCreate(ClubMemoryBase):
    pass

class ClubMemory(ClubMemoryBase):
    id: int
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True
    club_id: Optional[int] = None

class ClubBase(BaseModel):
    name: str
    description: str
    logo: str
    faculty_head: str
    student_head: str
    core_team: Optional[str] = None
    faculty_email: Optional[str] = None
    student_email: Optional[str] = None
    banner_image: Optional[str] = None
    member_count: Optional[int] = 0
    category: str
    admin_id: Optional[int] = None

class ClubCreate(ClubBase):
    pass

class ClubUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    logo: Optional[str] = None
    faculty_head: Optional[str] = None
    student_head: Optional[str] = None
    core_team: Optional[str] = None
    faculty_email: Optional[str] = None
    student_email: Optional[str] = None
    banner_image: Optional[str] = None
    member_count: Optional[int] = None
    category: Optional[str] = None
    admin_id: Optional[int] = None

class Club(ClubBase):
    id: int
    events: List[Event] = []

    class Config:
        from_attributes = True

class ApplicationCreate(BaseModel):
    user_id: int
    club_id: int
    message: Optional[str] = None

class ApplicationStatusUpdate(BaseModel):
    status: str  # "approved" or "rejected"

class Application(ApplicationCreate):
    id: int
    status: str
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ApplicationWithUser(Application):
    user: UserBase

class EventRegistrationCreate(BaseModel):
    user_id: int
    event_id: int
    name: Optional[str] = None
    roll_no: Optional[str] = None
    branch: Optional[str] = None
    message: Optional[str] = None

class EventRegistrationStatusUpdate(BaseModel):
    status: str  # "approved" or "rejected"

class EventRegistration(EventRegistrationCreate):
    id: int
    status: str = "pending"
    created_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class EventRegistrationWithUser(EventRegistration):
    user: UserBase

class EventRegistrationWithUserAndEvent(EventRegistration):
    user: UserBase
    event: Event
