# SnapLocate — Thapar Academic OS
hi
A restrained, institutional university platform designed exclusively for the **Overview** and **Academic** operations of Thapar Institute of Engineering & Technology (TIET).

---

## 🏛️ Theme: Thapar Academic Red

Designed strictly to the **Thapar Academic Red** specification:
- **Palette**:
  - `primary`: `#640000` (Deep Academic Maroon for institutional marks, section headings, active accents)
  - `secondary`: `#333333` (Charcoal body reading text)
  - `tertiary`: `#313131` (Darker charcoal for solid buttons and utility controls)
  - `neutral`: `#E5E7EB` (Subtle 1px architectural lines and dividers)
  - `surface` & `background`: `#FFFFFF` (Airy, crisp white canvas with generous whitespace)
  - `muted`: `#F5F1EA` (Warm institutional off-white for soft content bands)
  - `error`: `#B00020` (Semantic red for alerts)
- **Typography**:
  - Sole Typeface: **Roboto** (`300` light weight for headings and body; `400` for labels and controls; `700` for display headlines).
- **Shapes & Components**:
  - Intentionally sharp, disciplined, and squared-off (`rounded.none` / 0px radius for buttons, inputs, chips; `rounded.md` / 8px for cards).
  - No playful rounded pills, bright gradients, or glossy blurs.

---

## 🔐 Separate Student & Professor Portals (Distinct Login & Signup Pages)

The platform provides dedicated, role-specific authentication portals:

| Portal | Login Route | Signup Route | Specific Fields |
| :--- | :--- | :--- | :--- |
| **Gateway Hub** | `/auth` | — | Portal selection screen between Student and Faculty |
| **Student Portal** | `/auth/student-login` | `/auth/student-signup` | Roll Number, Thapar Student Email (`@thapar.edu`), Branch, Batch Year |
| **Professor / Faculty** | `/auth/professor-login` | `/auth/professor-signup` | Faculty ID (`FAC-XXXX`), Official Email, Academic Designation, Cabin Location |

*Both portals include **One-Click Instant Demo Login** buttons for instant testing and review.*

---

## 📚 Scope: Overview & Academic Section Only

In accordance with institutional requirements, all non-academic "Campus Life" modules (Marketplace, Lost & Found, Societies, Shops, Wi-Fi) have been completely removed. The system is dedicated exclusively to:

### 1. **Overview**
- **Student Dashboard (`/dashboard`)**: Time-aware greeting, next class card with live status ("In Progress" / "Up Next"), 44px bold start time, room location card with directional link, assignment checklist, dual-view schedule switcher (Day timeline & Week grid), and official academic circulars.
- **Faculty Portal (`/faculty/dashboard`)**: Today's lecture assignments, cabin status indicator (🟢 Available in Cabin / 🟡 In Class), student consultation requests, and course slide publishing.

### 2. **Academic**
- **Classroom Locator (`/classroom`)**: Search by room codes (`LT 101`, `LT 102`, `LP 104`, `CS Lab 3`, `B-Block 204`), floor plans, seat capacity, AV amenities, and step-by-step corridor directions.
- **Workspace (`/workspace`)**:
  - Coursework & lab assignment checklist with task adder.
  - Mandatory **75% Attendance Criteria Monitor** for semester eligibility.
  - **Pomodoro Study Timer** (25 min focus / 5 min recess) with session counters.
- **Academic Calendar (`/calendar`)**: Dean Academic Affairs approved milestones, Mid-Semester Tests (MST), End-Semester Tests (EST), practical file deadlines, and recesses.
- **Academic Resources & PYQs (`/resources`)**: Subject-wise lecture slides, Previous Year Question (PYQ) banks with solutions, Tanenbaum networking handouts, and lab manuals.
- **My Requests (`/requests`)**: Student consultation bookings and real-time approval desk between students and professors.
- **Faculty Directory (`/professors`)**: Complete faculty cabins, consultation office hours, and interactive **"Schedule Consultation"** slot booking modal.

---

## 💻 Running in VS Code

```bash
# Install dependencies (if not already installed)
npm install

# Start the Vite development server
npm run dev

# Build for production
npm run build
```

Open `http://localhost:3500` (or the port indicated in your terminal) in your browser.
