"""
Admin Setup Script
===================
Creates or resets the admin user account.

Usage:
  cd backend
  python -m scripts.setup_admin
"""

import sys
import os

# Add parent directory (backend/) to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database import SessionLocal
from app import crud, schemas, models

db = SessionLocal()
user = crud.get_user_by_email(db, 'admin@jecrcu.edu.in')
if not user:
    new_user = schemas.UserCreate(name='Admin', email='admin@jecrcu.edu.in', password='admin123', roll_no='000', branch='admin')
    user = crud.create_user(db, new_user)
    user.role = 'admin'
    db.commit()
    print('Admin user created/updated.')
else:
    crud.change_user_password(db, user, 'admin123')
    user.role = 'admin'
    db.commit()
    print('Admin user verified.')
