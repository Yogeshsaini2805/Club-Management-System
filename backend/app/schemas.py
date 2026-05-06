"""
Pydantic request/response schemas.
"""

from pydantic import BaseModel
from typing import List, Optional

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
        orm_mode = True

class EventBase(BaseModel):
    title: str
    date: str
    description: str
    venue: Optional[str] = None
    type: str
    club_id: int

class EventCreate(EventBase):
    pass

class Event(EventBase):
    id: int

    class Config:
        orm_mode = True

class EventUpdate(BaseModel):
    title: Optional[str] = None
    date: Optional[str] = None
    description: Optional[str] = None
    venue: Optional[str] = None
    type: Optional[str] = None
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
        orm_mode = True

class ApplicationCreate(BaseModel):
    user_id: int
    club_id: int
    message: Optional[str] = None

class Application(ApplicationCreate):
    id: int
    status: str

    class Config:
        orm_mode = True

class ApplicationWithUser(Application):
    user: UserBase

class EventRegistrationCreate(BaseModel):
    user_id: int
    event_id: int
    message: Optional[str] = None

class EventRegistration(EventRegistrationCreate):
    id: int

    class Config:
        orm_mode = True

class EventRegistrationWithUser(EventRegistration):
    user: UserBase
