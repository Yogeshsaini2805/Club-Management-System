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
- **Vanilla CSS** — Custom design system with CSS variables

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
├── backend/                    # Python FastAPI backend
│   ├── main.py                 # API routes & app config
│   ├── models.py               # SQLAlchemy database models
│   ├── schemas.py              # Pydantic request/response schemas
│   ├── crud.py                 # Database operations (CRUD)
│   ├── database.py             # Database connection setup
│   ├── requirements.txt        # Python dependencies
│   └── uploads/logos/          # User-uploaded club logos
│
├── club-management/            # React frontend
│   ├── public/
│   │   └── assets/             # Static images & illustrations
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── Navbar.jsx      # Navigation bar
│   │   │   └── Footer.jsx      # Site footer
│   │   ├── context/
│   │   │   └── AuthContext.js  # Authentication state management
│   │   ├── pages/              # Route-level page components
│   │   │   ├── Home.jsx        # Landing page
│   │   │   ├── Login.jsx       # Authentication
│   │   │   ├── Register.jsx    # New user registration
│   │   │   ├── Clubs.jsx       # Club listing
│   │   │   ├── Initiations.jsx # Initiations listing
│   │   │   ├── ClubDetails.jsx # Individual club page
│   │   │   ├── Events.jsx      # Events listing & registration
│   │   │   ├── AdminDashboard.jsx # Admin CRUD panel
│   │   │   └── Profile.jsx     # User profile & settings
│   │   ├── config.js           # API URL configuration
│   │   ├── App.js              # Root component & routing
│   │   └── index.css           # Global design system
│   └── .env.example            # Environment variable template
│
├── setup_admin.py              # One-time admin account setup script
├── start.bat                   # One-click startup (Windows)
├── start_backend.bat           # Backend-only startup
├── .gitignore                  # Git ignore rules
└── README.md                   # This file
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
| POST | `/api/event-registrations` | Register for an event |
| GET | `/api/events/{id}/registrations` | View event registrations |

---

## 👥 User Roles

| Role | Capabilities |
|------|-------------|
| `student` | Browse clubs/events, apply/register, manage profile |
| `club_admin` | All student capabilities + manage their own club & events |
| `admin` | Full access — manage all clubs, events, and view all registrations |

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
