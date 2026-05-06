"""
SQLAlchemy ORM models.
"""

from sqlalchemy import Column, Integer, String, Text, ForeignKey, DateTime
from sqlalchemy.orm import relationship
import datetime
from .database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True)
    hashed_password = Column(String)
    name = Column(String)
    roll_no = Column(String)
    branch = Column(String)
    role = Column(String, default="student") # student, admin

    applications = relationship("Application", back_populates="user")
    event_registrations = relationship("EventRegistration", back_populates="user")

class Club(Base):
    __tablename__ = "clubs"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)
    description = Column(Text)
    logo = Column(String)
    faculty_head = Column(String)
    student_head = Column(String)
    core_team = Column(String, nullable=True)
    faculty_email = Column(String, nullable=True)
    student_email = Column(String, nullable=True)
    banner_image = Column(String, nullable=True)
    member_count = Column(Integer, default=0)
    category = Column(String, default="Club") # Club, Initiation
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=True)

    events = relationship("Event", back_populates="club")
    applications = relationship("Application", back_populates="club")
    admin = relationship("User")

class Event(Base):
    __tablename__ = "events"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, index=True)
    date = Column(String)
    description = Column(Text)
    venue = Column(String, nullable=True)
    type = Column(String) # upcoming, past
    club_id = Column(Integer, ForeignKey("clubs.id"))

    club = relationship("Club", back_populates="events")
    registrations = relationship("EventRegistration", back_populates="event")

class Application(Base):
    __tablename__ = "applications"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    club_id = Column(Integer, ForeignKey("clubs.id"))
    status = Column(String, default="pending") # pending, approved, rejected
    message = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="applications")
    club = relationship("Club", back_populates="applications")

class EventRegistration(Base):
    __tablename__ = "event_registrations"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    event_id = Column(Integer, ForeignKey("events.id"))
    message = Column(Text, nullable=True)
    
    user = relationship("User", back_populates="event_registrations")
    event = relationship("Event", back_populates="registrations")
