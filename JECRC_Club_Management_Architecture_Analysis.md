# JECRC Club Management System — Comprehensive Architecture & Functionality Analysis

This document provides a deep, granular breakdown of every component in the JECRC Club Management Portal. It is divided into three main sections: **Database**, **Backend**, and **Frontend**, explaining how data flows from the underlying storage all the way to the user interface.

---

## 🗄️ 1. Database Architecture (SQLite + SQLAlchemy)

The system uses a relational SQLite database (`jecrc_clubs.db`). The database schema is defined using SQLAlchemy ORM in `backend/app/models.py`.

### 1.1 Tables & Models

#### **`users` Table**
Stores all registered accounts (Students, Club Admins, Super Admins).
*   **`id`**: Primary Key.
*   **`email`**: Must be a `@jecrcu.edu.in` address (enforced by backend validation). Unique identifier for login.
*   **`hashed_password`**: Bcrypt-hashed password for security.
*   **`name`, `roll_no`, `branch`**: Student profile details.
*   **`role`**: Determines permissions. Can be:
    *   `student`: Default role. Can view clubs, apply, and register for events.
    *   `club_admin`: Dynamically granted. Can manage specific clubs they head.
    *   `admin`: Super-admin. Has full CRUD capabilities across the entire system.
*   **Relationships**: Links to `applications` (clubs they applied to) and `event_registrations` (events they registered for).

#### **`clubs` Table**
Stores organizations. Differentiates between "Clubs" and "Initiations" via the `category` field.
*   **`id`, `name`, `description`, `logo`, `banner_image`**: Basic presentation data.
*   **`faculty_head`, `student_head`, `core_team`**: Display names for leadership.
*   **`faculty_email`**: Contact info for the faculty.
*   **`student_email`**: **CRITICAL FIELD**. The backend checks this field. If it matches a registered user's email, that user is granted `club_admin` rights over this specific club.
*   **`admin_id`**: Foreign Key linking to `users.id`. Automatically populated based on the `student_email` match. Represents the owner/admin of the club.
*   **`member_count`**: Integer tracking approved members. Automatically increments/decrements when applications are approved/rejected.
*   **`category`**: Distinguishes "Club" vs. "Initiation".
*   **Relationships**: Links to `events` (events hosted by this club), `applications` (student join requests), and `club_memories` (gallery images/videos).

#### **`events` Table**
Stores activities hosted by clubs.
*   **`id`, `title`, `description`, `date`, `end_date`, `venue`**: Event details.
*   **`type`**: Usually "upcoming" or "past".
*   **`club_id`**: Foreign Key linking to the `clubs` table. An event belongs to a specific club.
*   **Relationships**: Links to `registrations` (students attending this event).

#### **`applications` Table**
Acts as a join table for Many-to-Many relationships between Users and Clubs for membership requests.
*   **`id`, `user_id`, `club_id`**: Links a specific student to a specific club.
*   **`status`**: Starts as `pending`. Can be updated to `approved` or `rejected` by an admin.
*   **`message`**: Optional pitch from the student on why they want to join.
*   **`created_at`**: Timestamp.

#### **`event_registrations` Table**
Acts as a join table between Users and Events.
*   **`id`, `user_id`, `event_id`**: Links a student to an event.
*   **`name`, `roll_no`, `branch`**: Snapshots of the student's details at the time of registration.
*   **`status`**: Starts as `pending`. Admin changes to `approved` or `rejected`.
*   **`message`**: Optional query/message from the registrant.

#### **`club_memories` Table**
Stores media (images/videos) for club galleries.
*   **`id`, `club_id`**: Links media to a club.
*   **`club_name`**: Denormalized (stored redundantly) to allow the homepage carousel to display the club name without needing complex JOIN queries.
*   **`media_url`, `media_type`**: The path to the uploaded file and whether it's an image or video.

---

## ⚙️ 2. Backend Architecture (FastAPI)

The backend serves as the brain, enforcing rules, handling business logic, and talking to the database.

### 2.1 Core Modules

*   **`config.py` & `database.py`**: Initializes the SQLite connection and sets up CORS (Cross-Origin Resource Sharing) allowing the React frontend (`localhost:3000`) to communicate with FastAPI (`localhost:8000`).
*   **`schemas.py` (Pydantic)**: Defines strict data structures. When the frontend sends JSON, FastAPI validates it against these schemas. If the frontend forgets a required field (like `email`), FastAPI automatically returns a 422 Error before the code even runs.
*   **`crud.py`**: Contains all direct database queries. Abstracting queries here keeps the router files clean.
    *   *Key Function:* `recalculate_user_role()`. Checks if a user is the `admin_id` of any club. If they are, they get `club_admin`. If not, they are demoted to `student`.

### 2.2 API Routers (The Endpoints)

#### **Auth Router (`/api/auth`)**
*   **`POST /register`**: Checks if email ends in `@jecrcu.edu.in`. Hashes password using bcrypt. Saves to `users`.
*   **`POST /login`**: Verifies password. **Crucially**, it runs `recalculate_user_role()` right before returning success. This ensures if an admin revoked a student's club head status while they were offline, they log in with the correct `student` role, not the stale `club_admin` role.
*   **`GET /me`**: A session refresh endpoint. Returns the latest user profile and role from the DB.

#### **Clubs Router (`/api/clubs`)**
*   **`GET /clubs`**: Fetches all clubs. Publicly accessible.
*   **`POST /clubs` & `PUT /clubs/{id}`**: (Admin only). Creates/updates clubs.
    *   *Logic Engine:* If `student_email` is provided, the backend searches for a user with that email. If found, sets `admin_id` to that user's ID and promotes them to `club_admin`. It also recalculates the *old* admin's role to see if they should be demoted.
*   **`DELETE /clubs/{id}`**: (Super Admin only). Deletes a club and demotes the club's head if they don't lead any other clubs.
*   **Applications (`POST`, `PUT /status`, `DELETE`)**: Handles club join requests. When a status changes to `approved`, the backend triggers a logic hook that automatically increments the `member_count` on the Club model.

#### **Events Router (`/api/events`)**
*   **`GET`, `POST`, `PUT`, `DELETE`**: Standard operations. When a `club_admin` tries to edit an event, the backend first checks `db_event.club_id` -> finds the parent club -> verifies that `db_club.admin_id == current_user_id`. This prevents Club Admin A from editing Club Admin B's events.
*   **Registrations (`POST`, `PUT /status`)**: Handles event sign-ups. Prevents duplicate registrations based on `roll_no` + `event_id`.

#### **Uploads & Users**
*   Endpoints to handle multipart file uploads (saving images to `uploads/logos/`) and updating basic user profile info.

---

## 💻 3. Frontend Architecture (React.js)

The frontend is a React Single Page Application (SPA) that consumes the FastAPI backend.

### 3.1 Global State & Routing

#### **`AuthContext.js` (State Management)**
*   Acts as the central truth for "Who is logged in?".
*   **App Mount**: When the app loads, `AuthContext` checks `localStorage` for saved user data. If found, it immediately fires a background request to `GET /api/me`. This asks the backend, "Is this user's role still accurate?". If the backend says the user was demoted to `student`, the context silently updates the local state and `localStorage`, immediately revoking frontend admin privileges without requiring a hard refresh.
*   Provides `login()`, `logout()`, and `user` state to any component that needs it.

#### **`App.js` (Routing)**
*   Uses `react-router-dom`.
*   **`ProtectedRoute` Component**: A wrapper around routes.
    *   If no user -> Redirects to `/login`.
    *   If a route requires admin (`requireAdmin={true}`) and the user is a `student` -> Redirects to `/home`. This is what locks down the `/admin` dashboard.

### 3.2 Pages & Core Components

#### **Authentication (`Login.jsx`, `Register.jsx`)**
*   Forms with local validation. They communicate with `AuthContext.js` to trigger backend login/registration calls.

#### **`Home.jsx`**
*   The landing page. Contains sub-components like `HeroSection` (animated banner), `StatsBar`, and `FeaturedClubs`.
*   Fetches recent `ClubMemories` to display an animated masonry/carousel gallery of campus life.

#### **`Clubs.jsx` & `Initiations.jsx`**
*   Fetches the list of all organizations from `GET /api/clubs`.
*   Filters them locally based on the `category` field (`Club` vs `Initiation`).
*   Displays them in grid cards. Clicking a card navigates to `/clubs/:id`.

#### **`ClubDetails.jsx` (Dynamic Detail Page)**
*   Reads the `:id` from the URL. Fetches specific club data, its events, and its memories.
*   **Contextual UI**: Checks the current user's role. If the user is an `admin`, OR if the user is a `club_admin` where `club.admin_id == user.id`, it reveals hidden "Edit", "Upload Memory", and "Manage" buttons right on the detail page.
*   **Registration Modals**: Contains forms for students to apply to the club. Auto-fills `name`, `roll_no`, and `branch` from the `AuthContext` to reduce friction.

#### **`Events.jsx`**
*   Fetches `GET /api/events`. Groups them logically (Upcoming vs Past). Contains direct event registration buttons.

#### **`AdminDashboard.jsx` (The Control Center)**
*   A heavily protected route. It conditionally renders entirely different views based on role.
*   **Super Admin View (`role === 'admin'`)**:
    *   Can see a list of ALL clubs and ALL events.
    *   Can create new clubs.
    *   Can assign `student_email` to designate club heads.
*   **Club Admin View (`role === 'club_admin'`)**:
    *   The frontend filters the fetched clubs so the user ONLY sees clubs where `club.admin_id == user.id`.
    *   Can only create events linked to their specific club.
*   **Sub-Tabs**:
    *   **Manage Entities**: Tables to edit/delete clubs and events.
    *   **Manage Applications**: Fetches `GET /api/clubs/{id}/applications`. Shows lists of students wanting to join. Provides Approve/Reject buttons that call the `PUT /status` endpoint.
    *   **Manage Registrations**: Similar to applications, but for specific events.

### 3.3 Styling Architecture

*   **Vanilla CSS (`src/styles/`)**: Instead of Tailwind, the project uses a modular vanilla CSS approach with a robust `variables.css` file.
*   **Glassmorphism**: Achieved using `background: rgba(255, 255, 255, 0.05)` combined with `backdrop-filter: blur(10px)` to create the frosted glass effect seen on cards and modals.
*   **Dynamic Animations**: Uses CSS `@keyframes` for the floating aurora background shapes (`.animated-bg`) and hover transitions on buttons/cards to create a premium feel.

---

## 🔄 4. Example End-to-End Workflow: Assigning a Club Head

To understand how the layers interact, let's trace exactly what happens when a Super Admin assigns a student to be the head of a club:

1.  **Frontend (Admin Dashboard)**: The Super Admin opens the "Edit Club" modal for "JU Makerspace".
2.  **Frontend Action**: The admin enters `student@jecrcu.edu.in` into the Student Head Email field and clicks Save.
3.  **Network Request**: Frontend sends `PUT /api/clubs/1` with a JSON body containing `{"student_email": "student@jecrcu.edu.in"}`. Include auth headers.
4.  **Backend (Router `clubs.py`)**: Intercepts the request. Verifies the sender is an admin. Forwards data to `crud.update_club()`.
5.  **Backend (CRUD `crud.py`)**:
    *   Saves the *old* admin's ID.
    *   Queries `users` table: Does `student@jecrcu.edu.in` exist?
    *   If yes: It gets their User ID (e.g., 5). It updates the club row: `admin_id = 5`. It updates User 5's row: `role = 'club_admin'`.
    *   It then takes the *old* admin's ID and runs `recalculate_user_role()`. If the old admin heads no other clubs, their row is updated: `role = 'student'`.
6.  **Database**: Executes the SQL `UPDATE` statements and commits to `jecrc_clubs.db`.
7.  **Backend Response**: Returns the updated Club JSON to the frontend.
8.  **Frontend Effect**: Next time User 5 opens the app, `AuthContext.js` calls `/api/me`. The backend returns `"role": "club_admin"`. The frontend updates context, and the "Admin Dashboard" link magically appears in User 5's navbar. Next time the old admin opens the app, their role drops to "student", and the dashboard link disappears.
