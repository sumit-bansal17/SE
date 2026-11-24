# TIET-Sync — Thapar Academic OS (Full-Stack)

A university consultation scheduler, classroom locator, and academic workstation platform built for **Thapar Institute of Engineering & Technology (TIET)**. The platform features three distinct user roles (**Student**, **Professor**, and **Admin**) and is backed by a Node.js + Express + TypeScript server with Prisma ORM and SQLite/PostgreSQL.

---

## 🚀 Tech Stack

- **Frontend**: React 18, React Router v6, Tailwind CSS, Lucide Icons, Vite
- **Backend**: Node.js, Express 5, TypeScript (`tsx`)
- **Database & ORM**: Prisma ORM with SQLite (`dev.db` for local dev; easily configurable for PostgreSQL)
- **Auth & Security**: JWT (Bearer tokens & `httpOnly` cookies), bcrypt password hashing, helmet, CORS, rate limiting
- **Validation**: Zod schemas on request bodies and queries
- **File Uploads & Storage**: Multer storage into `/uploads` with 10 MB per-file limits and 20 MB cumulative per-user quota enforcement

---

## 📋 Table of Contents
1. [Quick Start & Setup](#-quick-start--setup)
2. [Environment Variables](#-environment-variables)
3. [Database Migrations & Seeding](#-database-migrations--seeding)
4. [Demo Credentials](#-demo-credentials)
5. [Complete API Endpoints Reference](#-complete-api-endpoints-reference)
6. [Business Rules Enforced on Server](#-business-rules-enforced-on-server)
7. [Verification & Testing Checklist](#-verification--testing-checklist)

---

## 🛠️ Quick Start & Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

### 3. Generate Database Client & Seed Database
```bash
npx prisma db push
npm run seed
```

### 4. Run the Full Application
Start both the backend API server (`http://localhost:5050`) and the Vite frontend (`http://localhost:3000`):
```bash
npm run dev
```

Alternatively, run them separately:
```bash
# Terminal 1: Backend Server (Port 5050)
npm run server

# Terminal 2: Frontend Client (Port 3000)
npm run client
```

### 5. Run Verification Test Suite
```bash
npm run test
```

---

## ⚙️ Environment Variables

Create `.env` in the root directory (and/or `/server/.env`):

| Variable | Description | Default / Example |
| :--- | :--- | :--- |
| `DATABASE_URL` | SQLite file path or PostgreSQL connection URI | `"file:./dev.db"` |
| `JWT_SECRET` | Secret key used for signing and verifying JWT tokens | `"tiet_sync_super_secret_jwt_key_2026_academic_secure"` |
| `CLIENT_URL` | Frontend origin for CORS policy | `"http://localhost:3000"` |
| `PORT` | Port for the Express backend server | `5050` |
| `MAX_USER_STORAGE_BYTES` | Maximum file storage quota per user in bytes (20 MB) | `20971520` |

---

## 🗄️ Database Migrations & Seeding

The database schema is defined in `prisma/schema.prisma`.

### Key Prisma Models:
- `User`: Base account model with roles `STUDENT`, `PROFESSOR`, `ADMIN` and status `ACTIVE`, `INACTIVE`
- `StudentProfile`: Roll number, branch, academic year
- `ProfessorProfile`: Teacher code, department relation, designation, office location, office hours
- `Department`: Academic departments (CSED, Physics, Mathematics, Electronics, Mechanical, etc.)
- `Classroom`: Lecture halls and computing labs with capacity, block, floor, and amenities
- `TimetableEntry`: Academic weekly periods (0-12) for student or faculty schedule
- `OfficeHour` & `BlockedDate`: Professor consultation availability configuration
- `MeetingRequest`: Full lifecycle requests (`PENDING`, `ACCEPTED`, `REJECTED`, `CANCELLED`, `RESCHEDULE_PROPOSED`)
- `Task`, `Note`, `Link`, `FileUpload`: User workspace workstation resources
- `Notification` & `AuditLog`: Automatic notification dispatch and system-wide audit trail

### Run Migration & Seed:
```bash
# Push schema changes to SQLite dev.db
npx prisma db push

# Run the comprehensive seed script
npm run seed
```
*Seeds 10 departments, 12 classrooms, 10 professors, 3 students, 1 administrator, timetables, office hours, and sample consultation requests.*

---

## 🔑 Demo Credentials

All demo accounts use the standard password: `demo123`

| Role | Email | Password | Description |
| :--- | :--- | :--- | :--- |
| **Student** | `student@demo.com` | `demo123` | Sumit Bansal (Roll: 102303492, CSE 3rd Year) |
| **Professor** | `professor@demo.com` | `demo123` | Dr. Rajesh Kumar (CSED, Associate Professor, Cabin C-314) |
| **Admin** | `admin@demo.com` | `demo123` | Dean Academic Administration |

*Additional Seeded Accounts:*
- `student2@demo.com`, `student3@demo.com`
- `sunitabansal@demo.com`, `singh@demo.com`, `sharma@demo.com`, `gupta@demo.com`, `kaur@demo.com`

---

## 📡 Complete API Endpoints Reference

All endpoints are prefixed with `/api`.

### 1. Authentication (`/api/auth`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `POST` | `/auth/register` | Public | Register new student or professor (institutional email required) |
| `POST` | `/auth/login` | Public | Authenticate user, set `httpOnly` cookie and return Bearer token |
| `POST` | `/auth/logout` | Authenticated | Clears auth session and cookie |
| `GET` | `/auth/me` | Authenticated | Fetch current user session profile |
| `PATCH` | `/auth/change-password` | Authenticated | Change account password (validates old password) |

### 2. Professors Directory & Profile (`/api/professors`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/professors` | Public / Auth | Search by name or code, filter by department, sort `az` or `dept` |
| `GET` | `/professors/:id` | Public / Auth | Get complete professor profile with office hours & bio |
| `PATCH` | `/professors/me` | Professor | Professor updates their own profile details |

### 3. Classrooms Directory (`/api/classrooms`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/classrooms` | Public / Auth | Search by room name/code, filter by block and room type |
| `GET` | `/classrooms/:id` | Public / Auth | Get classroom details, capacity, and amenities |

### 4. Timetable & Availability Engine (`/api/timetable`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/timetable/me` | Authenticated | Get current user's weekly timetable entries |
| `PUT` | `/timetable/me/cell` | Authenticated | Upsert a single class block (day 0-6, period 0-12) |
| `DELETE` | `/timetable/me/cell/:id` | Authenticated | Delete a specific timetable period cell |
| `POST` | `/timetable/me/import` | Authenticated | Batch import timetable periods via CSV or JSON array |
| `GET` | `/timetable/professors/:id/timetable` | Authenticated | Public timetable for a professor |
| `GET` | `/timetable/professors/:id/availability` | Authenticated | **Dynamic Slot Availability**: computes free/busy slots based on classes, office hours, accepted meetings, and blocked dates |
| `POST` | `/timetable/office-hours` | Professor | Configure professor recurring office hours |
| `DELETE`| `/timetable/office-hours/:id` | Professor | Delete configured office hour slot |
| `POST` | `/timetable/blocked-dates` | Professor | Block dates for conferences, leaves, or academic duties |
| `DELETE`| `/timetable/blocked-dates/:id` | Professor | Remove a blocked date |

### 5. Meeting Requests (`/api/requests`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/requests` | Authenticated | List requests with filters (`userId`, `role`, `status`) |
| `GET` | `/requests/mine` | Student | List logged-in student's own requests |
| `GET` | `/requests/incoming` | Professor | List requests addressed to logged-in professor |
| `POST` | `/requests` | Student | Submit meeting request with conflict check and optional file upload |
| `PATCH` | `/requests/:id/accept` | Professor | **Accept request (locks slot with transactional double-booking prevention)** |
| `PATCH` | `/requests/:id/reject` | Professor | Reject request with mandatory or optional professor remark |
| `PATCH` | `/requests/:id/suggest-time` | Professor | Propose alternative date and slot |
| `PATCH` | `/requests/:id/respond-reschedule` | Student | Student accepts or declines proposed rescheduled time |
| `PATCH` | `/requests/:id/reschedule` | Student | Student updates time while request is still pending |
| `PATCH` | `/requests/:id/cancel` | Student/Admin | Cancel meeting request |
| `GET` | `/requests/:id/attachment` | Participants/Admin | Securely download uploaded project synopsis or attachment |

### 6. Workspace Workstation (`/api/workspace`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/workspace/:ownerId` | Authenticated | Get tasks, notes, links, files, and 20 MB storage meter info |
| `GET` | `/workspace/storage-used` | Authenticated | Get authenticated user storage consumption breakdown |
| `POST` | `/workspace/:ownerId/tasks` | Authenticated | Create coursework task |
| `PATCH` | `/workspace/tasks/:id` | Authenticated | Toggle task completion (`done`) or update label |
| `DELETE`| `/workspace/tasks/:id` | Authenticated | Delete task |
| `POST` | `/workspace/:ownerId/notes` | Authenticated | Create academic note |
| `PATCH` | `/workspace/notes/:id` | Authenticated | Update note title and content |
| `DELETE`| `/workspace/notes/:id` | Authenticated | Delete note |
| `POST` | `/workspace/:ownerId/links` | Authenticated | Save academic resource URL link |
| `DELETE`| `/workspace/links/:id` | Authenticated | Remove link |
| `POST` | `/workspace/:ownerId/files` | Authenticated | **Upload file with 20 MB cumulative quota validation** |
| `DELETE`| `/workspace/files/:id` | Authenticated | Delete file and reclaim storage quota |

### 7. Notifications & Audit Logs
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/notifications/:userId` | Authenticated | Get notifications for user |
| `PATCH` | `/notifications/:id/read` | Authenticated | Mark notification as read |
| `POST` | `/notifications/:userId/read-all`| Authenticated | Mark all notifications read |
| `GET` | `/admin/audit-logs` | Admin | Chronological log of meeting transitions & admin actions |

### 8. Dashboards (`/api/dashboard`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/dashboard/student` | Student | Aggregated next class, today's schedule, pending tasks, recent activity |
| `GET` | `/dashboard/professor` | Professor | Aggregated today's lectures, confirmed consultations, pending requests |
| `GET` | `/dashboard/admin` | Admin | University-wide counts of students, faculty, rooms, and request status metrics |

### 9. Admin Operations (`/api/admin`)
| Method | Endpoint | Access | Description |
| :--- | :--- | :--- | :--- |
| `GET` | `/admin/students` | Admin | List all registered students |
| `POST` | `/admin/students` | Admin | Add student record |
| `DELETE`| `/admin/students/:id` | Admin | Delete student record |
| `POST` | `/admin/students/import` | Admin | Batch import students via CSV |
| `POST` | `/admin/students/:id/reset-password` | Admin | Reset student password |
| `GET` | `/admin/professors` | Admin | List all faculty profiles |
| `POST` | `/admin/professors` | Admin | Add new faculty profile |
| `PUT` | `/admin/professors/:id` | Admin | Update faculty profile details |
| `DELETE`| `/admin/professors/:id` | Admin | **Soft-deletes (INACTIVE) if professor has request history; hard-deletes otherwise** |
| `POST` | `/admin/classrooms` | Admin | Add new classroom or lab |
| `DELETE`| `/admin/classrooms/:id` | Admin | Delete classroom |
| `GET` | `/admin/departments` | Admin | List academic departments |
| `POST` | `/admin/departments` | Admin | Create department |
| `DELETE`| `/admin/departments/:id` | Admin | Delete department |
| `GET` | `/admin/requests` | Admin | Master consultation log across all users |
| `POST` | `/admin/requests/:id/override-cancel` | Admin | Administrative override to cancel any request |
| `GET` | `/admin/timetables/:userId` | Admin | Inspect any user's weekly timetable |

---

## 🛡️ Business Rules Enforced on Server

1. **Transactional Double-Booking Prevention**: A consultation slot can have only one `ACCEPTED` meeting for a professor. Acceptance runs within a Prisma database transaction that checks for existing confirmed bookings and atomically updates the request.
2. **Conflict Validation Engine**:
   - Booking dates must be in the future (past dates rejected with 409).
   - Slot must not conflict with professor's scheduled classes.
   - Slot must not fall on professor's blocked dates.
   - Slot must not conflict with an already accepted meeting.
   - Slot must not conflict with the student's own scheduled classes.
3. **Role & Ownership Authorization**:
   - Only the student who created a request can reschedule or cancel it.
   - Only the addressed professor (or Admin) can accept, reject, or propose alternative times.
   - Students cannot access `/api/admin/*` endpoints.
4. **Lifecycle State Machine**: Valid transitions strictly enforced:
   - `PENDING` → `ACCEPTED` / `REJECTED` / `CANCELLED` / `RESCHEDULE_PROPOSED`
   - `RESCHEDULE_PROPOSED` → `PENDING` / `CANCELLED`
5. **Storage Quota (20 MB)**: Cumulative file size per user is checked on every upload. If an upload would push the user's storage above 20 MB, it is blocked with 400 Bad Request.
6. **Professor Deletion Policy**:
   - If a professor has any consultation request history, deleting them performs a **soft-delete** (status `INACTIVE`), canceling any pending requests and notifying affected students.
   - If a professor has no consultation history, they are **hard-deleted**.
7. **Privacy & Security**:
   - Student timetables are private to the student and admins; professor timetables are visible to all authenticated users.
   - `passwordHash` is stripped from all user responses.
   - Attachments can only be downloaded by the student, the professor, or an admin.

---

## ✅ Verification & Testing Checklist

The system has been verified through automated end-to-end tests (`npm run test`):

| Test Case | Status | Verified Outcome |
| :--- | :---: | :--- |
| **Student Login** | `PASS` | Authenticated with `student@demo.com` / `demo123`, issued JWT token, passwordHash omitted |
| **Professor Login** | `PASS` | Authenticated with `professor@demo.com` / `demo123`, issued JWT token |
| **Admin Login** | `PASS` | Authenticated with `admin@demo.com` / `demo123`, issued JWT token |
| **Classroom Directory** | `PASS` | Fetched 12 seeded classrooms and computing labs with capacity & block info |
| **Professor Directory** | `PASS` | Fetched 10 seeded professors across CSED, Physics, Mathematics, Electronics, Mechanical |
| **Availability Engine** | `PASS` | Evaluated 13 daily slots against classes, office hours, and existing bookings |
| **Create Meeting Request** | `PASS` | Student created request with date validation and conflict checks |
| **Student Class Conflict** | `PASS` | Server blocked consultation overlapping student's lecture with `STUDENT_CLASS_CONFLICT` |
| **Past Date Prevention** | `PASS` | Server rejected requests for dates in the past with `PAST_DATE` |
| **Accept Meeting Request** | `PASS` | Professor accepted request, locking slot and issuing notification to student |
| **Double Booking Prevention**| `PASS` | Transactional check blocked second request on the same slot with 409 Conflict |
| **Automated Notifications** | `PASS` | Notification created for student upon acceptance |
| **System Audit Logging** | `PASS` | Audit log record created for request submission and acceptance |
| **Admin Add Professor** | `PASS` | Admin created new professor profile |
| **Hard-Delete Professor** | `PASS` | Admin deleted professor with no history -> Hard deleted from DB |
| **Soft-Delete Professor** | `PASS` | Admin deleted professor with history -> Soft-deleted (`status: INACTIVE`), history preserved |
| **20 MB Storage Meter** | `PASS` | Quota calculation verified against uploaded files |
| **Frontend Production Build**| `PASS` | `npm run build` completed cleanly in 1.2s with zero errors |
| **TypeScript Compilation** | `PASS` | `tsc --noEmit` passed with 0 errors across server and client |
