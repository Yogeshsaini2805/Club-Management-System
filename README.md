# 🎓 JECRC Club Management Portal

> A modern, full-stack web application for managing university clubs, student initiations, and campus events at JECRC University, Jaipur.

![React](https://img.shields.io/badge/React-19.x-61DAFB?logo=react&logoColor=white)
![FastAPI](https://img.shields.io/badge/FastAPI-0.100+-009688?logo=fastapi&logoColor=white)
![SQLite](https://img.shields.io/badge/SQLite-3-003B57?logo=sqlite&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

---

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🔐 **Authentication** | JECRC-only login/registration with `@jecrcu.edu.in` email validation |
| 🏢 **Club Management** | Browse, search, and apply to university clubs and student initiations |
| 📅 **Event System** | View upcoming/past events, register with one click |
| 👨‍💼 **Admin Dashboard** | Full CRUD for clubs & events, view student registrations |
| 🎨 **Premium UI** | Glassmorphic design, animated aurora backgrounds, micro-animations |
| 📱 **Responsive** | Works on desktop, tablet, and mobile devices |

---

## 🛠️ Tech Stack

### Frontend
- **React 19** — UI framework
- **React Router v7** — Client-side routing
- **Lucide React** — Modern icon library
- **Vanilla CSS** — Modular design system with CSS variables

### Backend
- **FastAPI** — High-performance Python API framework
- **SQLAlchemy** — ORM for database operations
- **SQLite** — Lightweight relational database
- **Uvicorn** — ASGI server with hot-reload

---

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.10+** — [Download](https://www.python.org/downloads/)
- **Node.js 18+** — [Download](https://nodejs.org/)
- **npm** — Comes bundled with Node.js

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/your-username/jecrc-club-portal.git
cd jecrc-club-portal
```

### 2. Backend Setup

```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start the backend server (auto-reloads on changes)
python -m uvicorn main:app --reload
```

The API will be available at `http://localhost:8000`.

### 3. Frontend Setup

```bash
cd club-management

# Install Node.js dependencies
npm install

# Copy environment variables
cp .env.example .env

# Start the development server
npm start
```

The app will open at `http://localhost:3000`.

### 4. Quick Start (Windows)

Simply double-click `start.bat` in the project root — it launches both servers automatically.

---

## 📁 Project Structure

```
Club Management System/
│
├── backend/                        # Python FastAPI backend
│   ├── main.py                     # Thin entry point (creates app)
│   ├── requirements.txt            # Python dependencies
│   ├── uploads/logos/              # User-uploaded images
│   ├── app/                        # Application package
│   │   ├── __init__.py             # App factory (create_app)
│   │   ├── config.py               # Centralized settings
│   │   ├── database.py             # Database connection
│   │   ├── models.py               # SQLAlchemy ORM models
│   │   ├── schemas.py              # Pydantic schemas
│   │   ├── crud.py                 # Database CRUD operations
│   │   └── routers/                # API route handlers
│   │       ├── auth.py             # Authentication endpoints
│   │       ├── clubs.py            # Club CRUD + applications
│   │       ├── events.py           # Event CRUD + registrations
│   │       ├── uploads.py          # File upload endpoint
│   │       └── users.py            # User profile management
│   └── scripts/
│       └── setup_admin.py          # Admin account setup script
│
├── club-management/                # React frontend
│   ├── public/
│   │   └── assets/                 # Static images & illustrations
│   ├── src/
│   │   ├── styles/                 # Modular CSS design system
│   │   │   ├── variables.css       # Design tokens & CSS variables
│   │   │   ├── base.css            # Resets & typography
│   │   │   ├── layout.css          # App container & grid
│   │   │   ├── components.css      # Buttons, forms, cards, badges
│   │   │   └── auth.css            # Auth page styles
│   │   ├── services/
│   │   │   └── api.js              # Centralized API client
│   │   ├── hooks/                  # Custom React hooks
│   │   │   ├── useClubs.js         # Club data fetching
│   │   │   └── useEvents.js        # Event data fetching
│   │   ├── utils/
│   │   │   └── dateUtils.js        # Date formatting helpers
│   │   ├── components/
│   │   │   ├── common/             # Shared UI components
│   │   │   │   ├── Modal.jsx       # Reusable modal overlay
│   │   │   │   ├── ErrorBanner.jsx # Error display with retry
│   │   │   │   ├── LoadingSpinner.jsx
│   │   │   │   └── RegistrationForm.jsx
│   │   │   ├── layout/             # Layout components
│   │   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   │   └── Footer.jsx      # Site footer
│   │   │   └── home/               # Home page sub-components
│   │   │       ├── HeroSection.jsx
│   │   │       ├── StatsBar.jsx
│   │   │       ├── FeaturedClubs.jsx
│   │   │       └── UpcomingEvents.jsx
│   │   ├── context/
│   │   │   └── AuthContext.js      # Auth state management
│   │   ├── pages/                  # Route-level pages
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Clubs.jsx
│   │   │   ├── Initiations.jsx
│   │   │   ├── ClubDetails.jsx
│   │   │   ├── Events.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   └── Profile.jsx
│   │   ├── config.js               # API URL configuration
│   │   ├── App.js                  # Root component & routing
│   │   └── index.css               # Style entry point (imports)
│   └── .env.example                # Environment variable template
│
├── start.bat                       # One-click startup (Windows)
├── .gitignore                      # Git ignore rules
└── README.md                       # This file
```

---

## 🔑 Environment Variables

### Frontend (`club-management/.env`)

| Variable | Default | Description |
|----------|---------|-------------|
| `REACT_APP_API_URL` | `http://localhost:8000/api` | Backend API base URL |

---

## 📡 API Endpoints

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/register` | Register new user |
| POST | `/api/login` | User login |
| POST | `/api/change-password` | Change password |
| GET | `/api/me?user_id={id}` | Get current user with recalculated role |
| PUT | `/api/users/{id}` | Update user profile |

### Clubs & Initiations
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/clubs` | List all clubs |
| POST | `/api/clubs` | Create a club (admin) |
| PUT | `/api/clubs/{id}` | Update a club (admin) |
| DELETE | `/api/clubs/{id}` | Delete a club (admin) |

### Events
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events` | List all events |
| POST | `/api/events` | Create event (admin) |
| PUT | `/api/events/{id}` | Update event (admin) |
| DELETE | `/api/events/{id}` | Delete event (admin) |

### Applications & Registrations
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/applications` | Apply to a club |
| GET | `/api/clubs/{id}/applications` | View club applications |
| PUT | `/api/applications/{id}/status` | Approve/reject application (admin) |
| DELETE | `/api/applications/{id}` | Delete an application (admin) |
| GET | `/api/clubs/{id}/members` | View approved club members (admin) |
| GET | `/api/clubs/{id}/event-registrations` | View all event registrations for a club (admin) |
| POST | `/api/event-registrations` | Register for an event |
| GET | `/api/events/{id}/registrations` | View event registrations |
| PUT | `/api/event-registrations/{id}/status` | Approve/reject registration (admin) |
| DELETE | `/api/event-registrations/{id}` | Delete a registration (admin) |

### Club Memories
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memories/recent` | Get recent memories across all clubs |
| GET | `/api/clubs/{id}/memories` | Get all memories for a club |
| POST | `/api/clubs/{id}/memories` | Add a memory to a club (admin) |
| DELETE | `/api/memories/{id}` | Delete a memory (admin) |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| `student` | Browse clubs/events, apply/register, manage profile |
| `club_admin` | All student capabilities + manage their own club & events |
| `admin` | Full access — manage all clubs, events, and view all registrations |

> **Dynamic Role Assignment:** The `club_admin` role is automatically granted when a user is assigned as the student head (`student_email`) of a club or initiation. It is automatically **revoked** when the user is no longer the head of **any** club — for example, if the admin assigns a different student head or deletes the club. Users who head multiple clubs retain `club_admin` until removed from all of them. The `admin` (super-admin) role is never affected by this mechanism.

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License.

---

**Built with ❤️ for JECRC University**
