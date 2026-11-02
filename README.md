# SnapLocate — Unified Campus Operating System Clone

A pixel-faithful, feature-complete clone of [SnapLocate](https://www.snaplocate.in/dashboard) — the unified Campus OS built for university students (originally for Thapar Institute of Engineering & Technology).

---

## 🌟 Key Features & Replicated Modules

### 1. **Student Dashboard (`/dashboard`)**
- **Personalized Header:** Dynamic time-of-day greeting (*"Good morning / afternoon / evening, <Name> 👋"*), live date & ticking clock badge.
- **Hero Next Class Card:** Real-time indicator (*"In Progress"* vs *"Up Next"*), 44px bold start time, course code, instructor, and clickable location card navigating directly to the classroom floorplan.
- **Tasks Hub Widget:** Real-time synced assignment & study checklist with interactive checkboxes and inline quick-task adder.
- **Dual-View Schedule Switcher:**
  - **Day View:** Vertical chronological timeline with indicator beads, formatted AM/PM hours, lecture/lab pills, and active status tags.
  - **Weekly Overview:** Day-by-day timetable grid with color presets (indigo, orange, green, red, violet, amber).
- **Recent Activity Feed:** Campus notifications, datesheet updates, and marketplace alerts.
- **Explore Quick-Shortcuts:** Quick navigation pills to all campus services.

### 2. **Campus Navigation & Classroom Finder (`/classroom`)**
- Search by room code (e.g. `LT 101`, `LP 104`, `CS Lab 3`, `B-Block 204`).
- Filters by building complex: Block B, Block C, Lecture Pavilion (LP), Tan Auditorium.
- Interactive detail panel with seat capacity, AC & smart projector amenities, step-by-step directions, and architectural floor plan preview.

### 3. **Faculty Directory & Cabin Locator (`/professors`)**
- Faculty directory with designations, verified emails, phone numbers, and cabin locations.
- Live cabin availability indicator (🟢 In Cabin / 🟡 In Lecture Hall).
- Interactive **"Book Appointment"** modal with preferred date/time and agenda submission.

### 4. **Study Workspace & Tools (`/workspace`)**
- **Assignment Board:** Filter by All, Active, and Completed tasks with category badges.
- **Pomodoro Study Timer:** 25-minute focus intervals and 5-minute break timers with sound tick and session counters.
- **Quick Notes Scratchpad:** Jot down exam tips and reminders with local persistence.
- **Attendance Monitor:** 75% mandatory attendance calculator with visual progress bars.

### 5. **Peer-to-Peer Campus Marketplace (`/marketplace`)**
- Buy and sell textbooks, scientific calculators, mini-drafters, bicycles, and electronics.
- Filter by category and search.
- **"List Item For Sale"** creation modal.
- **Live In-App Buyer-Seller Chat Simulator:** Click *"Chat with Seller"* to open a real-time messaging drawer with realistic campus peer responses.

### 6. **Campus Lost & Found Hub (`/lost-found`)**
- Filter by *Lost* vs *Found* items.
- Report notices with photo, location found, and security desk contact.
- Interactive **"Claim This Item"** action.

### 7. **Societies & Clubs (`/society`)**
- Technical chapters, cultural teams, and sports clubs (CCS, Rotaract, OWASP, Mudra).
- Flagship events and recruitment links.

### 8. **Campus Food & Shops (`/shops`)**
- Canteens and cafes (Cosmo Hub, Nescafe Library, Main Canteen, Reprographics & Xerox).
- Timings, ratings, menu highlights, and hostel delivery contact.

### 9. **Campus Wi-Fi Hub (`/wifi`)**
- Real-time Wi-Fi speed & signal strength across hostels, library, and lecture pavilion.
- Interactive **"Run Wi-Fi Speedtest"** simulator.
- Connection guides for `TIET-Student` (PEAP / MSCHAPV2) and `eduroam`.

### 10. **Emergency & Health Center (`/campus-support`)**
- 24/7 Health Center & ambulance hotline (+91 175 239 3333).
- Security control room, women helpline desk, psychological counseling cell.
- Interactive campus grievance ticket logging form.

### 11. **Interactive Campus Map (`/campus-map`)**
- 2D campus vector map with landmark coordinates, category filter pins, and zoom controls.

### 12. **Academic Calendar & Events (`/calendar`)**
- Mid-semester test (MST) and end-semester test (EST) schedules, holidays, and cultural festivals.

### 13. **Multi-Role Experience (Student, Faculty, Admin)**
- Easily switch between **Student OS**, **Faculty OS**, and **Admin OS** from the quick switcher pill in the top header or settings!
  - **Faculty View (`/faculty/dashboard`):** Manage lecture schedule, approve/reschedule student appointment slots, and upload lecture slides.
  - **Admin View (`/admin/dashboard`):** Real-time analytics, university audit log, and broadcast campus announcements.

---

## 🎨 Design System

Matches SnapLocate's exact typography and palette:
- **Typography:** `Plus Jakarta Sans` for headings & UI tags; `Inter` for body & descriptions.
- **Theme Support:** Instant Dark Mode and Light Mode toggle with smooth color transitions and `localStorage` persistence.
- **Colors:**
  - Brand Primary: `#4F46E5` (Indigo)
  - Surface Card: `#FFFFFF` (Light) / `#111A2E` (Dark)
  - Surface Muted: `#F1F5F9` (Light) / `#1E293B` (Dark)

---

## 🚀 Running the App

The development server is already running on port 3000:

```bash
# Start Vite development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

Open [http://localhost:3000](http://localhost:3000) in your browser.
