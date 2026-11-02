export const initialUser = {
  id: 'usr_thapar_102',
  full_name: 'Aarav Sharma',
  email: 'asharma_be23@thapar.edu',
  role: 'student', // 'student' | 'faculty' | 'admin'
  department: 'Computer Science & Engineering',
  batch: '2023-2027',
  roll_no: '102303492',
  avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
};

export const sampleTimetable = [
  { id: 'tt-1', day: 'MONDAY', course: 'UCS405: Operating Systems', time_slot: '08:50-09:40', type: 'Lecture', location: 'LT 101 (Block B)', color_preset: 'indigo', instructor: 'Dr. Rajesh Kumar' },
  { id: 'tt-2', day: 'MONDAY', course: 'UCS414: Computer Networks', time_slot: '10:30-11:20', type: 'Lecture', location: 'LP 104 (Lecture Pavilion)', color_preset: 'violet', instructor: 'Dr. Sunita Bansal' },
  { id: 'tt-3', day: 'MONDAY', course: 'UCS405: OS Lab', time_slot: '11:20-13:00', type: 'Lab', location: 'CS Lab 3 (C-Block 2nd Fl)', color_preset: 'green', instructor: 'Er. Tarun Gupta' },
  { id: 'tt-4', day: 'MONDAY', course: 'UMA010: Mathematics II', time_slot: '14:40-15:30', type: 'Tutorial', location: 'LT 202', color_preset: 'orange', instructor: 'Dr. Meenakshi Sharma' },
  { id: 'tt-5', day: 'TUESDAY', course: 'UCS310: Database Management Systems', time_slot: '09:40-10:30', type: 'Lecture', location: 'LT 102', color_preset: 'indigo', instructor: 'Dr. Amanpreet Kaur' },
  { id: 'tt-6', day: 'TUESDAY', course: 'UEC401: Analog Electronics', time_slot: '11:20-12:10', type: 'Lecture', location: 'B-Block 204', color_preset: 'amber', instructor: 'Dr. Vikramaditya' },
  { id: 'tt-7', day: 'TUESDAY', course: 'UCS310: DBMS Lab', time_slot: '13:50-15:30', type: 'Lab', location: 'Database Lab (C-Block)', color_preset: 'red', instructor: 'Er. Simran Gill' },
  { id: 'tt-8', day: 'WEDNESDAY', course: 'UCS414: Computer Networks', time_slot: '08:50-09:40', type: 'Lecture', location: 'LP 104', color_preset: 'violet', instructor: 'Dr. Sunita Bansal' },
  { id: 'tt-9', day: 'WEDNESDAY', course: 'UCS405: Operating Systems', time_slot: '10:30-11:20', type: 'Lecture', location: 'LT 101', color_preset: 'indigo', instructor: 'Dr. Rajesh Kumar' },
  { id: 'tt-10', day: 'THURSDAY', course: 'UMA010: Mathematics II', time_slot: '09:40-10:30', type: 'Lecture', location: 'LT 101', color_preset: 'orange', instructor: 'Dr. Meenakshi Sharma' },
  { id: 'tt-11', day: 'FRIDAY', course: 'UEC401: Analog Electronics', time_slot: '10:30-11:20', type: 'Lecture', location: 'B-Block 204', color_preset: 'amber', instructor: 'Dr. Vikramaditya' },
];

export const initialTasks = [
  { id: 'tsk-1', label: 'Submit OS Assignment 3 (Process Scheduling)', sub: 'Due tomorrow at 11:59 PM', is_done: false, category: 'Academic' },
  { id: 'tsk-2', label: 'Collect lab manual from Central Stationery', sub: 'Before 5:00 PM at Cosmo market', is_done: false, category: 'Errand' },
  { id: 'tsk-3', label: 'Review Computer Networks Socket Programming', sub: 'CN Lab prep', is_done: true, category: 'Study' },
  { id: 'tsk-4', label: 'Confirm team registration for HackTU 6.0', sub: 'CCS Technical Society', is_done: false, category: 'Societies' },
];

export const initialNotifications = [
  { id: 'notif-1', title: 'Class Rescheduled: OS Lecture', message: 'Dr. Rajesh Kumar moved OS Lecture from 08:50 AM to 11:20 AM in LT 101.', created_at: new Date(Date.now() - 1000 * 60 * 25).toISOString(), is_read: false, link: '/dashboard' },
  { id: 'notif-2', title: 'Marketplace Inquiry: Casio fx-991EX', message: 'Rohan Verma messaged you regarding your Scientific Calculator listing.', created_at: new Date(Date.now() - 1000 * 60 * 120).toISOString(), is_read: false, link: '/marketplace' },
  { id: 'notif-3', title: 'Lost Item Claim Update', message: 'Security desk at Library Gate logged a pair of black Sony earbuds.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(), is_read: true, link: '/lost-found' },
  { id: 'notif-4', title: 'Academic Calendar Update', message: 'Mid-semester test (MST) datesheet has been published on the portal.', created_at: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), is_read: true, link: '/calendar' },
];

export const classroomsData = [
  { id: 'cls-1', code: 'LT 101', name: 'Lecture Theatre 101', block: 'Block B', floor: 'Ground Floor', capacity: 180, type: 'Tiered Lecture Theatre', projector: true, ac: true, directions: 'Enter Block B via Main Foyer, take the central corridor straight. LT 101 is on your left opposite Dean Office.' },
  { id: 'cls-2', code: 'LT 102', name: 'Lecture Theatre 102', block: 'Block B', floor: 'Ground Floor', capacity: 180, type: 'Tiered Lecture Theatre', projector: true, ac: true, directions: 'Next to LT 101 in Block B, directly facing the open green courtyard.' },
  { id: 'cls-3', code: 'LP 104', name: 'Lecture Pavilion 104', block: 'Lecture Pavilion (LP)', floor: 'First Floor', capacity: 220, type: 'Smart Pavilion', projector: true, ac: true, directions: 'Enter LP building, ascend Staircase 2 near the fountain. LT 104 is on the east wing.' },
  { id: 'cls-4', code: 'CS Lab 3', name: 'Advanced Systems Lab', block: 'Block C (CS)', floor: 'Second Floor', capacity: 65, type: 'Computer Laboratory', projector: true, ac: true, directions: 'Take Elevator 1 in Block C to Floor 2. Exit right and follow the glass corridor.' },
  { id: 'cls-5', code: 'B-Block 204', name: 'Classroom 204', block: 'Block B', floor: 'Second Floor', capacity: 80, type: 'Standard Classroom', projector: true, ac: false, directions: 'Ascend Staircase A in Block B to 2nd Floor. Room 204 is the second door on the right.' },
  { id: 'cls-6', code: 'TS 102', name: 'Tutorial Section 102', block: 'Tan Auditorium Complex', floor: 'Ground Floor', capacity: 45, type: 'Tutorial Room', projector: false, ac: true, directions: 'Behind Tan Auditorium near the seminar hall wing.' },
];

export const professorsData = [
  { id: 'prof-1', name: 'Dr. Rajesh Kumar', designation: 'Associate Professor', department: 'Computer Science', cabin: 'C-314, Block C (3rd Fl)', email: 'rkumar@thapar.edu', phone: '+91 175 239 3144', officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM', research: 'Distributed Systems, OS, Cloud', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80', available: true },
  { id: 'prof-2', name: 'Dr. Sunita Bansal', designation: 'Professor & Head', department: 'Computer Science', cabin: 'C-201, Block C (2nd Fl)', email: 'sbansal@thapar.edu', phone: '+91 175 239 3201', officeHours: 'Tue & Thu: 11:30 AM - 01:30 PM', research: 'Wireless Sensor Networks, SDN', avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80', available: false },
  { id: 'prof-3', name: 'Dr. Vikramaditya', designation: 'Assistant Professor', department: 'Electronics', cabin: 'EC-112, Block E (1st Fl)', email: 'vikram.aditya@thapar.edu', phone: '+91 175 239 3112', officeHours: 'Everyday: 04:00 PM - 05:00 PM', research: 'VLSI Circuit Design, Embedded', avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80', available: true },
  { id: 'prof-4', name: 'Dr. Meenakshi Sharma', designation: 'Associate Professor', department: 'Mathematics', cabin: 'M-205, Main Academic', email: 'msharma@thapar.edu', phone: '+91 175 239 3205', officeHours: 'Wed & Fri: 02:00 PM - 04:00 PM', research: 'Linear Algebra, Graph Theory', avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80', available: true },
];

export const marketplaceItems = [
  { id: 'mkt-1', title: 'Casio fx-991EX ClassWiz Calculator', price: 850, category: 'Electronics', condition: 'Like New', seller: 'Kavya Singhal', contact: 'ksinghal_be22@thapar.edu', date: '2 hours ago', image: 'https://images.unsplash.com/photo-1611125832047-1d7ad1e8e485?w=500&auto=format&fit=crop&q=80', description: 'Used for 1 sem only. Original slip case included.' },
  { id: 'mkt-2', title: 'Omega Mini Drafter + Drawing Board Set', price: 450, category: 'Stationery', condition: 'Good', seller: 'Harsh Vardhan', contact: 'hvardhan_be24@thapar.edu', date: 'Yesterday', image: 'https://images.unsplash.com/photo-1513542789411-b6a5d4f31634?w=500&auto=format&fit=crop&q=80', description: 'Original Omega mini drafter with clamp and canvas bag.' },
  { id: 'mkt-3', title: 'Hero Sprint 26T Mountain Bicycle', price: 2400, category: 'Vehicles', condition: 'Fair', seller: 'Aditya Mehta', contact: 'amehta_be21@thapar.edu', date: '3 days ago', image: 'https://images.unsplash.com/photo-1485965120184-e220f721d03e?w=500&auto=format&fit=crop&q=80', description: 'Smooth riding cycle with steel wire lock. Kept at Hostel J.' },
  { id: 'mkt-4', title: 'CLRS Introduction to Algorithms (4th Ed)', price: 600, category: 'Books', condition: 'Excellent', seller: 'Pranav Grover', contact: 'pgrover_be23@thapar.edu', date: '4 days ago', image: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80', description: 'Mint condition with clean margins and no markings.' },
];

export const lostFoundItems = [
  { id: 'lf-1', type: 'found', title: 'Fastrack Digital Wristwatch (Black)', location: 'LP 102 front row bench', date: 'Nov 2, 2026, 10:15 AM', contact: 'Submitted to LP Caretaker Room', status: 'Unclaimed', image: 'https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop&q=80' },
  { id: 'lf-2', type: 'lost', title: 'TIET Student ID Card (Roll: 102303881)', location: 'Near Central Library turnstiles', date: 'Nov 1, 2026, 04:30 PM', contact: 'Reward ₹200. Please contact 9876543210', status: 'Searching', image: 'https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&auto=format&fit=crop&q=80' },
  { id: 'lf-3', type: 'found', title: 'Milton Thermosteel Water Bottle', location: 'B-Block 2nd floor landing', date: 'Oct 31, 2026', contact: 'Available with Gate 1 Security', status: 'Claimed', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&auto=format&fit=crop&q=80' },
];

export const societiesData = [
  { id: 'soc-1', name: 'Creative Computing Society (CCS)', category: 'Technical', lead: 'Devansh Verma', established: '2001', members: '400+', description: 'Thapar premier technical society hosting HackTU, code sprints, and open-source bootcamps.', events: ['HackTU 6.0', 'Linux Install Fest'], color: '#4F46E5', logo: '💻' },
  { id: 'soc-2', name: 'Rotaract Club of TIET', category: 'Cultural', lead: 'Ananya Soni', established: '1975', members: '600+', description: 'Fostering leadership, blood donation drives, and youth conclaves.', events: ['Youth Parliament', 'Megadrive'], color: '#EA580C', logo: '🤝' },
  { id: 'soc-3', name: 'OWASP Student Chapter', category: 'Cybersecurity', lead: 'Sahil Sethi', established: '2016', members: '250+', description: 'Empowering students with ethical hacking, CTF challenges, and bug bounties.', events: ['Infiltrate CTF', 'Bug Bounty 101'], color: '#059669', logo: '🛡️' },
];

export const shopsData = [
  { id: 'shp-1', name: 'Cosmo Hub Food Court', category: 'Food & Cafes', location: 'Near Hostel H Lawn', timing: '09:00 AM - 11:30 PM', rating: 4.6, items: ['Cold Coffee', 'Paneer Roll', 'Peri-Peri Fries'], delivery: true, contact: '+91 98888 12345' },
  { id: 'shp-2', name: 'Nescafe Kiosk (Central Library)', category: 'Beverages', location: 'Library Quadrangle', timing: '08:00 AM - 01:00 AM', rating: 4.8, items: ['Frappe', 'Cappuccino', 'Cheese Toast'], delivery: false, contact: 'Walk-in only' },
  { id: 'shp-3', name: 'Central Reprographics & Xerox', category: 'Printing', location: 'Block A Basement', timing: '08:30 AM - 08:00 PM', rating: 4.5, items: ['Spiral Binding', 'Color Poster', 'Thesis Binding'], delivery: false, contact: '+91 98721 54321' },
];

export const wifiHotspots = [
  { name: 'Library Central Hall', ssid: 'TIET-Student-5G', status: 'Optimal', speed: '124 Mbps', signal: '98%' },
  { name: 'Lecture Pavilion (LP)', ssid: 'TIET-Student', status: 'Optimal', speed: '86 Mbps', signal: '92%' },
  { name: 'Hostel J / K Dining Quad', ssid: 'TIET-Hostel-Mesh', status: 'Good', speed: '54 Mbps', signal: '84%' },
  { name: 'Block B Computer Center', ssid: 'TIET-HighSpeed-Lab', status: 'Optimal', speed: '210 Mbps', signal: '99%' },
];

export const campusSupportContacts = [
  { title: 'Campus Health Centre & Ambulance', phone: '+91 175 239 3333', desc: '24/7 Emergency doctor on call, ambulance dispatched in 3 mins.' },
  { title: 'Central Security Control Room', phone: '+91 175 239 3119', desc: 'Main Gate 1 desk, security patrol and CCTV monitoring.' },
  { title: 'Women Safety & Helpline Desk', phone: '+91 175 239 3999', desc: 'Direct access to Women Grievance Redressal and Wardens.' },
  { title: 'Mental Wellness & Counseling Cell', phone: '+91 175 239 3280', desc: 'Confidential psychological support & stress management.' },
];
