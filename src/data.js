// Default Student Profile
export const defaultStudent = {
  id: 'usr_student_102',
  full_name: 'Aarav Sharma',
  email: 'asharma_be23@thapar.edu',
  role: 'student', // 'student' | 'professor'
  department: 'Computer Science & Engineering',
  batch: '2023-2027',
  roll_no: '102303492',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

// Default Professor Profile
export const defaultProfessor = {
  id: 'usr_prof_314',
  full_name: 'Dr. Rajesh Kumar',
  email: 'rkumar@thapar.edu',
  role: 'professor',
  department: 'Computer Science & Engineering',
  designation: 'Associate Professor',
  cabin: 'Cabin C-314, Block C (3rd Floor)',
  employee_id: 'FAC-2041',
  officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM',
  avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
};

export const sampleTimetable = [
  { id: 'tt-1', day: 'MONDAY', course: 'UCS405: Operating Systems', time_slot: '08:50-09:40', type: 'Lecture', location: 'LT 101 (Block B)', color_preset: 'maroon', instructor: 'Dr. Rajesh Kumar' },
  { id: 'tt-2', day: 'MONDAY', course: 'UCS414: Computer Networks', time_slot: '10:30-11:20', type: 'Lecture', location: 'LP 104 (Lecture Pavilion)', color_preset: 'charcoal', instructor: 'Dr. Sunita Bansal' },
  { id: 'tt-3', day: 'MONDAY', course: 'UCS405: OS Lab', time_slot: '11:20-13:00', type: 'Lab', location: 'CS Lab 3 (C-Block 2nd Fl)', color_preset: 'maroon', instructor: 'Er. Tarun Gupta' },
  { id: 'tt-4', day: 'MONDAY', course: 'UMA010: Mathematics II', time_slot: '14:40-15:30', type: 'Tutorial', location: 'LT 202', color_preset: 'charcoal', instructor: 'Dr. Meenakshi Sharma' },
  { id: 'tt-5', day: 'TUESDAY', course: 'UCS310: Database Management Systems', time_slot: '09:40-10:30', type: 'Lecture', location: 'LT 102', color_preset: 'maroon', instructor: 'Dr. Amanpreet Kaur' },
  { id: 'tt-6', day: 'TUESDAY', course: 'UEC401: Analog Electronics', time_slot: '11:20-12:10', type: 'Lecture', location: 'B-Block 204', color_preset: 'charcoal', instructor: 'Dr. Vikramaditya' },
  { id: 'tt-7', day: 'TUESDAY', course: 'UCS310: DBMS Lab', time_slot: '13:50-15:30', type: 'Lab', location: 'Database Lab (C-Block)', color_preset: 'maroon', instructor: 'Er. Simran Gill' },
  { id: 'tt-8', day: 'WEDNESDAY', course: 'UCS414: Computer Networks', time_slot: '08:50-09:40', type: 'Lecture', location: 'LP 104', color_preset: 'charcoal', instructor: 'Dr. Sunita Bansal' },
  { id: 'tt-9', day: 'WEDNESDAY', course: 'UCS405: Operating Systems', time_slot: '10:30-11:20', type: 'Lecture', location: 'LT 101', color_preset: 'maroon', instructor: 'Dr. Rajesh Kumar' },
  { id: 'tt-10', day: 'THURSDAY', course: 'UMA010: Mathematics II', time_slot: '09:40-10:30', type: 'Lecture', location: 'LT 101', color_preset: 'charcoal', instructor: 'Dr. Meenakshi Sharma' },
  { id: 'tt-11', day: 'FRIDAY', course: 'UEC401: Analog Electronics', time_slot: '10:30-11:20', type: 'Lecture', location: 'B-Block 204', color_preset: 'charcoal', instructor: 'Dr. Vikramaditya' },
];

export const initialTasks = [
  { id: 'tsk-1', label: 'Submit OS Assignment 3 (Process Scheduling)', sub: 'Due tomorrow at 11:59 PM • UCS405', is_done: false, category: 'Assignment' },
  { id: 'tsk-2', label: 'Prepare Socket Programming Lab Report', sub: 'CN Lab prep • UCS414', is_done: false, category: 'Lab' },
  { id: 'tsk-3', label: 'Revise BCNF Normalization Theorems', sub: 'DBMS Mid-Sem review • UCS310', is_done: true, category: 'Revision' },
  { id: 'tsk-4', label: 'Collect Mathematics II Tutorial Sheet 4', sub: 'From Dr. Meenakshi Sharma cabin', is_done: false, category: 'Tutorial' },
];

export const initialNotifications = [
  { id: 'notif-1', title: 'MST Datesheet Released', message: 'Dean Academic Affairs published the official Mid-Semester Test schedule.', created_at: new Date(Date.now() - 1000 * 60 * 20).toISOString(), is_read: false, link: '/calendar' },
  { id: 'notif-2', title: 'Consultation Approved', message: 'Dr. Rajesh Kumar approved your appointment for today at 03:30 PM.', created_at: new Date(Date.now() - 1000 * 60 * 90).toISOString(), is_read: false, link: '/requests' },
  { id: 'notif-3', title: 'New Lecture Slides Uploaded', message: 'UCS405 Unit 3 Virtual Memory Slides added to Academic Resources.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), is_read: true, link: '/resources' },
];

export const classroomsData = [
  { id: 'cls-1', code: 'LT 101', name: 'Lecture Theatre 101', block: 'Block B (Academic Central)', floor: 'Ground Floor', capacity: 180, type: 'Tiered Lecture Theatre', projector: true, ac: true, directions: 'Enter Block B via Main Foyer, take the central corridor straight. LT 101 is on your left opposite Dean Office.' },
  { id: 'cls-2', code: 'LT 102', name: 'Lecture Theatre 102', block: 'Block B (Academic Central)', floor: 'Ground Floor', capacity: 180, type: 'Tiered Lecture Theatre', projector: true, ac: true, directions: 'Adjacent to LT 101 in Block B, directly facing the academic courtyard.' },
  { id: 'cls-3', code: 'LP 104', name: 'Lecture Pavilion 104', block: 'Lecture Pavilion (LP)', floor: 'First Floor', capacity: 220, type: 'Smart Pavilion', projector: true, ac: true, directions: 'Enter LP building, ascend Staircase 2 near the fountain. LT 104 is on the east wing.' },
  { id: 'cls-4', code: 'CS Lab 3', name: 'Advanced Systems & OS Lab', block: 'Block C (Computer Science)', floor: 'Second Floor', capacity: 65, type: 'Computer Laboratory', projector: true, ac: true, directions: 'Take Elevator 1 in Block C to Floor 2. Exit right and follow the glass corridor.' },
  { id: 'cls-5', code: 'B-Block 204', name: 'Classroom 204', block: 'Block B (Academic Central)', floor: 'Second Floor', capacity: 80, type: 'Standard Classroom', projector: true, ac: false, directions: 'Ascend Staircase A in Block B to 2nd Floor. Room 204 is the second door on the right.' },
  { id: 'cls-6', code: 'TS 102', name: 'Tutorial Section 102', block: 'Tan Auditorium Complex', floor: 'Ground Floor', capacity: 45, type: 'Tutorial Room', projector: false, ac: true, directions: 'Behind Tan Auditorium near the seminar hall wing.' },
];

export const professorsData = [
  { id: 'prof-1', name: 'Dr. Rajesh Kumar', designation: 'Associate Professor', department: 'Computer Science & Engineering', cabin: 'Cabin C-314, Block C (3rd Floor)', email: 'rkumar@thapar.edu', phone: '+91 175 239 3144', officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM', research: 'Distributed Systems, Operating Systems, Cloud Virtualization', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', available: true },
  { id: 'prof-2', name: 'Dr. Sunita Bansal', designation: 'Professor & Head', department: 'Computer Science & Engineering', cabin: 'Cabin C-201, Block C (2nd Floor)', email: 'sbansal@thapar.edu', phone: '+91 175 239 3201', officeHours: 'Tue & Thu: 11:30 AM - 01:30 PM', research: 'Wireless Sensor Networks, Software Defined Networks, IoT', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', available: false },
  { id: 'prof-3', name: 'Dr. Vikramaditya', designation: 'Assistant Professor', department: 'Electronics & Communication', cabin: 'Cabin EC-112, Block E (1st Floor)', email: 'vikram.aditya@thapar.edu', phone: '+91 175 239 3112', officeHours: 'Everyday: 04:00 PM - 05:00 PM', research: 'VLSI Circuit Design, Embedded Microcontrollers', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', available: true },
  { id: 'prof-4', name: 'Dr. Meenakshi Sharma', designation: 'Associate Professor', department: 'Mathematics & Data Science', cabin: 'Cabin M-205, Main Academic Wing', email: 'msharma@thapar.edu', phone: '+91 175 239 3205', officeHours: 'Wed & Fri: 02:00 PM - 04:00 PM', research: 'Linear Algebra, Graph Theory, Discrete Mathematics', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', available: true },
];

export const academicCalendarEvents = [
  { id: 1, title: 'Commencement of Mid-Semester Tests (MST)', date: 'Nov 10 - Nov 16, 2026', type: 'Exam', venue: 'Assigned Lecture Theatres (LT 101 - 105)' },
  { id: 2, title: 'Submission Deadline for Course Practical Files', date: 'Nov 27, 2026', type: 'Academic', venue: 'Department Laboratories' },
  { id: 3, title: 'Guru Nanak Jayanti (University Holiday)', date: 'Nov 24, 2026', type: 'Holiday', venue: 'Campus Wide' },
  { id: 4, title: 'End-Semester Theory & Practical Examinations (EST)', date: 'Dec 15 - Dec 29, 2026', type: 'Exam', venue: 'Central Examination Centers' },
  { id: 5, title: 'Winter Academic Recess', date: 'Dec 30, 2026 - Jan 10, 2027', type: 'Holiday', venue: 'University Recess' },
];

export const academicResources = [
  { id: 1, title: 'UCS405: Operating Systems Complete Lecture Slides (Units 1-5)', subject: 'Operating Systems', type: 'Lecture Slides', size: '14.2 MB', author: 'Dr. Rajesh Kumar' },
  { id: 2, title: 'UCS405: Mid-Sem Previous Year Questions (PYQs 2023-2025) with Solutions', subject: 'Operating Systems', type: 'PYQ Bank', size: '3.8 MB', author: 'Department of CSE' },
  { id: 3, title: 'UCS414: Computer Networks Socket Programming & TCP Handshake Notes', subject: 'Computer Networks', type: 'Study Notes', size: '5.1 MB', author: 'Dr. Sunita Bansal' },
  { id: 4, title: 'UCS310: Database Management Systems Normalization Handout & SQL Guide', subject: 'Database Systems', type: 'Course Manual', size: '2.4 MB', author: 'Dr. Amanpreet Kaur' },
  { id: 5, title: 'UMA010: Engineering Mathematics-II Standard Formulae Handbook', subject: 'Mathematics II', type: 'Formula Sheet', size: '4.6 MB', author: 'Dept. of Mathematics' },
  { id: 6, title: 'UEC401: Analog Electronics Circuit Simulation & Lab Manual', subject: 'Analog Electronics', type: 'Lab Manual', size: '8.3 MB', author: 'Dr. Vikramaditya' },
];

export const initialRequests = [
  { id: 'req-1', studentName: 'Aarav Sharma', studentRoll: '102303492', professorName: 'Dr. Rajesh Kumar', topic: 'UCS405 OS Assignment 3 Doubt Consultation', slot: 'Today, 03:30 PM', cabin: 'Cabin C-314', status: 'Approved' },
  { id: 'req-2', studentName: 'Aarav Sharma', studentRoll: '102303492', professorName: 'Dr. Sunita Bansal', topic: 'Computer Networks Capstone Project Topic Approval', slot: 'Tomorrow, 11:30 AM', cabin: 'Cabin C-201', status: 'Pending' },
  { id: 'req-3', studentName: 'Priya Narang', studentRoll: '102303112', professorName: 'Dr. Rajesh Kumar', topic: 'Distributed Systems Virtualization Clarification', slot: 'Nov 15, 04:00 PM', cabin: 'Cabin C-314', status: 'Pending' },
];
