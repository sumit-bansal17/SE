// Initial seed and fallback datasets for TIET-Sync Academic OS

export const timeSlots = [
  '8:00-8:50',
  '8:50-9:40',
  '9:40-10:30',
  '10:30-11:20',
  '11:20-12:10',
  '12:10-1:00',
  '1:00-1:50',
  '1:50-2:40',
  '2:40-3:30',
  '3:30-4:20',
  '4:20-5:10',
  '5:10-6:00',
  '6:00-6:50',
];

export const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const defaultStudent = {
  id: 'usr_student_demo',
  email: 'student@demo.com',
  name: 'Sumit Bansal',
  role: 'student',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
  profile: {
    rollNo: '102303492',
    branch: 'Computer Science & Engineering',
    year: '3rd Year (Batch 2023-2027)'
  }
};

export const defaultProfessor = {
  id: 'usr_prof_demo',
  email: 'professor@demo.com',
  name: 'Dr. Rajesh Kumar',
  role: 'professor',
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
  profile: {
    teacherCode: 'TCH-CSE-01',
    department: 'CSED',
    designation: 'ASSOCIATE',
    officeLocation: 'Cabin C-314, Block C (3rd Floor)',
    bio: 'Senior researcher in Distributed Operating Systems, Cloud Virtualization, and Systems Performance.',
    officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM',
    research: 'Distributed Systems, Linux Kernel, Cloud Performance',
    isOnline: true
  }
};

export const defaultAdmin = {
  id: 'usr_admin_demo',
  email: 'admin@demo.com',
  name: 'Dean Academic Administration',
  role: 'admin',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
  profile: {
    designation: 'Head of Academic Affairs',
    department: 'Administration'
  }
};

export const initialClassrooms = [
  {
    id: 'cls-1',
    name: 'Lecture Theatre 101',
    block: 'Block B',
    floor: 'Ground Floor',
    capacity: 180,
    code: 'LT101',
    type: 'LECTURE HALL',
    location: 'Academic Central • Room LT-101',
    image: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
    amenities: ['Central Air Conditioned', 'Dual Smart Projectors', 'Acoustic Soundproofing', 'Tiered Seating'],
    directions: 'Enter Block B via Main Foyer, take the central corridor straight. LT 101 is on your left opposite Dean Office.'
  },
  {
    id: 'cls-2',
    name: 'Lecture Theatre 102',
    block: 'Block B',
    floor: 'Ground Floor',
    capacity: 180,
    code: 'LT102',
    type: 'LECTURE HALL',
    location: 'Academic Central • Room LT-102',
    image: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
    amenities: ['Central Air Conditioned', 'Smart Display', 'Microphone System', 'Wheelchair Ramp'],
    directions: 'Adjacent to LT 101 in Block B, directly facing the open green courtyard.'
  },
  {
    id: 'cls-3',
    name: 'Lecture Pavilion 104',
    block: 'Lecture Hall',
    floor: 'First Floor',
    capacity: 220,
    code: 'LP104',
    type: 'LECTURE HALL',
    location: 'Lecture Pavilion • Room LP-104',
    image: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
    amenities: ['Wide Presentation Wall', 'Wireless Mic', 'Tiered Amphitheatre', 'High-Speed Wi-Fi'],
    directions: 'Enter LP building, ascend Staircase 2 near the central fountain. Room 104 is on the East Wing.'
  },
  {
    id: 'cls-4',
    name: 'Advanced Systems & OS Lab',
    block: 'CSED',
    floor: 'Second Floor',
    capacity: 65,
    code: 'CSL03',
    type: 'LAB',
    location: 'CSED Block C • Room C-204',
    image: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80',
    amenities: ['65 High-End Workstations', 'Dual Monitor Setup', 'Server Rack Access', 'Dedicated UPS Power'],
    directions: 'Take Elevator 1 in Block C to Floor 2. Exit right and follow the glass computing corridor.'
  },
  {
    id: 'cls-5',
    name: 'Tan Auditorium Hall',
    block: 'Block TAN',
    floor: 'Ground Floor',
    capacity: 350,
    code: 'TAN01',
    type: 'LECTURE HALL',
    location: 'Tan Auditorium Complex • Main Auditorium',
    image: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
    amenities: ['Full Stage & Lighting', 'Cinema Grade Projection', 'Central AC', 'Green Room'],
    directions: 'Main entrance facing the Central Library Lawn. Direct ground-level auditorium foyer access.'
  },
  {
    id: 'cls-6',
    name: 'Workshop Room W-103',
    block: 'Lab',
    floor: 'Ground Floor',
    capacity: 50,
    code: 'W103',
    type: 'LAB',
    location: 'Mechanical Workshop • Room W-103',
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
    amenities: ['Industrial Test Benches', 'Precision Lathes', 'Safety Ventilation', 'First Aid Station'],
    directions: 'Walk past Block A to the Western Workshop compound. W-103 is located in the Central Machine Bay.'
  }
];

export const initialProfessors = [
  {
    id: 'usr_prof_demo',
    email: 'professor@demo.com',
    name: 'Dr. Rajesh Kumar',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    profile: {
      teacherCode: 'TCH-CSE-01',
      department: 'CSED',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin C-314, Block C (3rd Floor)',
      bio: 'Senior researcher in Distributed Operating Systems, Cloud Virtualization, and Systems Performance.',
      officeHours: 'Mon & Wed: 03:00 PM - 05:00 PM',
      research: 'Distributed Systems, Linux Kernel, Cloud Performance',
      isOnline: true
    }
  },
  {
    id: 'usr_prof_2',
    email: 'sbansal@thapar.edu',
    name: 'Dr. Sunita Bansal',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    profile: {
      teacherCode: 'TCH-CSE-02',
      department: 'CSED',
      designation: 'PROFESSOR',
      officeLocation: 'Cabin C-201, Block C (2nd Floor)',
      bio: 'Head of Computer Networks Laboratory. Specializing in Software-Defined Networking and Sensor Grids.',
      officeHours: 'Tue & Thu: 11:30 AM - 01:30 PM',
      research: 'Software Defined Networks, IoT, Wireless Grids',
      isOnline: true
    }
  },
  {
    id: 'usr_prof_3',
    email: 'vikram.aditya@thapar.edu',
    name: 'Dr. Vikramaditya',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    profile: {
      teacherCode: 'TCH-ECE-04',
      department: 'Electronics',
      designation: 'ASSISTANT',
      officeLocation: 'Cabin EC-112, Block E (1st Floor)',
      bio: 'Focuses on VLSI design, semiconductor devices, and embedded edge compute platforms.',
      officeHours: 'Mon-Fri: 04:00 PM - 05:00 PM',
      research: 'VLSI Architectures, Microcontrollers, Analog Circuits',
      isOnline: false
    }
  },
  {
    id: 'usr_prof_4',
    email: 'msharma@thapar.edu',
    name: 'Dr. Meenakshi Sharma',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    profile: {
      teacherCode: 'TCH-MTH-01',
      department: 'Mathematics',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin M-205, Main Academic Wing',
      bio: 'Graph theory, combinatorial algorithms, and discrete linear algebraic analysis.',
      officeHours: 'Wed & Fri: 02:00 PM - 04:00 PM',
      research: 'Linear Algebra, Graph Theory, Numerical Analysis',
      isOnline: true
    }
  },
  {
    id: 'usr_prof_5',
    email: 'hsingh@thapar.edu',
    name: 'Dr. Harpreet Singh',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
    profile: {
      teacherCode: 'TCH-MEC-03',
      department: 'Mechanical',
      designation: 'PROFESSOR',
      officeLocation: 'Cabin ME-108, Workshop Block',
      bio: 'Advanced manufacturing, thermal analysis, and surface engineering laboratory.',
      officeHours: 'Tue & Fri: 03:00 PM - 04:30 PM',
      research: 'Thermal Spray Coatings, CAD/CAM, Surface Tribology',
      isOnline: true
    }
  },
  {
    id: 'usr_prof_6',
    email: 'kculdeep@thapar.edu',
    name: 'Dr. Kuldeep Sharma',
    role: 'professor',
    avatar: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
    profile: {
      teacherCode: 'TCH-PHY-02',
      department: 'Physics',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin PH-204, Science Block',
      bio: 'Laser spectroscopy, optics, and solid-state materials.',
      officeHours: 'Mon & Thu: 02:00 PM - 03:30 PM',
      research: 'Optics, Laser Spectroscopy, Quantum Materials',
      isOnline: true
    }
  }
];

export const initialStudents = [
  defaultStudent,
  {
    id: 'usr_student_2',
    email: 'pnarang_be23@thapar.edu',
    name: 'Priya Narang',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    profile: {
      rollNo: '102303112',
      branch: 'Computer Science & Engineering',
      year: '3rd Year (Batch 2023-2027)'
    }
  },
  {
    id: 'usr_student_3',
    email: 'akash.verma@thapar.edu',
    name: 'Akash Verma',
    role: 'student',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    profile: {
      rollNo: '102303501',
      branch: 'Electronics & Communication',
      year: '3rd Year (Batch 2023-2027)'
    }
  }
];

export const initialTimetable = [
  // Student Timetable
  { id: 'tt-s1', ownerId: 'usr_student_demo', day: 'Monday', periodIndex: 1, timeSlot: '8:50-9:40', subject: 'UCS405: Operating Systems', roomId: 'cls-1', roomName: 'LT 101', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
  { id: 'tt-s2', ownerId: 'usr_student_demo', day: 'Monday', periodIndex: 3, timeSlot: '10:30-11:20', subject: 'UCS414: Computer Networks', roomId: 'cls-3', roomName: 'LP 104', professorName: 'Dr. Sunita Bansal', color: '#313131' },
  { id: 'tt-s3', ownerId: 'usr_student_demo', day: 'Monday', periodIndex: 4, timeSlot: '11:20-12:10', subject: 'UCS405: OS Lab', roomId: 'cls-4', roomName: 'CS Lab 3', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
  { id: 'tt-s4', ownerId: 'usr_student_demo', day: 'Monday', periodIndex: 5, timeSlot: '12:10-1:00', subject: 'UCS405: OS Lab (Contd.)', roomId: 'cls-4', roomName: 'CS Lab 3', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
  { id: 'tt-s5', ownerId: 'usr_student_demo', day: 'Tuesday', periodIndex: 2, timeSlot: '9:40-10:30', subject: 'UCS310: Database Systems', roomId: 'cls-2', roomName: 'LT 102', professorName: 'Dr. Amanpreet Kaur', color: '#313131' },
  { id: 'tt-s6', ownerId: 'usr_student_demo', day: 'Tuesday', periodIndex: 4, timeSlot: '11:20-12:10', subject: 'UEC401: Analog Electronics', roomId: 'cls-1', roomName: 'LT 101', professorName: 'Dr. Vikramaditya', color: '#640000' },
  { id: 'tt-s7', ownerId: 'usr_student_demo', day: 'Wednesday', periodIndex: 1, timeSlot: '8:50-9:40', subject: 'UCS414: Computer Networks', roomId: 'cls-3', roomName: 'LP 104', professorName: 'Dr. Sunita Bansal', color: '#313131' },
  { id: 'tt-s8', ownerId: 'usr_student_demo', day: 'Wednesday', periodIndex: 3, timeSlot: '10:30-11:20', subject: 'UCS405: Operating Systems', roomId: 'cls-1', roomName: 'LT 101', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
  { id: 'tt-s9', ownerId: 'usr_student_demo', day: 'Thursday', periodIndex: 2, timeSlot: '9:40-10:30', subject: 'UMA010: Mathematics II', roomId: 'cls-1', roomName: 'LT 101', professorName: 'Dr. Meenakshi Sharma', color: '#313131' },
  { id: 'tt-s10', ownerId: 'usr_student_demo', day: 'Friday', periodIndex: 3, timeSlot: '10:30-11:20', subject: 'UEC401: Analog Electronics', roomId: 'cls-2', roomName: 'LT 102', professorName: 'Dr. Vikramaditya', color: '#640000' },

  // Professor Timetable (Dr. Rajesh Kumar)
  { id: 'tt-p1', ownerId: 'usr_prof_demo', day: 'Monday', periodIndex: 1, timeSlot: '8:50-9:40', subject: 'UCS405: Operating Systems (Lect.)', roomId: 'cls-1', roomName: 'LT 101', color: '#640000' },
  { id: 'tt-p2', ownerId: 'usr_prof_demo', day: 'Monday', periodIndex: 4, timeSlot: '11:20-12:10', subject: 'UCS405: OS Lab (Sec A)', roomId: 'cls-4', roomName: 'CS Lab 3', color: '#313131' },
  { id: 'tt-p3', ownerId: 'usr_prof_demo', day: 'Monday', periodIndex: 5, timeSlot: '12:10-1:00', subject: 'UCS405: OS Lab (Sec A)', roomId: 'cls-4', roomName: 'CS Lab 3', color: '#313131' },
  { id: 'tt-p4', ownerId: 'usr_prof_demo', day: 'Monday', periodIndex: 9, timeSlot: '3:30-4:20', subject: 'Department Academic Meeting', roomId: 'cls-2', roomName: 'Conference Room', color: '#313131' },
  { id: 'tt-p5', ownerId: 'usr_prof_demo', day: 'Wednesday', periodIndex: 3, timeSlot: '10:30-11:20', subject: 'UCS405: Operating Systems (Lect.)', roomId: 'cls-1', roomName: 'LT 101', color: '#640000' },
  { id: 'tt-p6', ownerId: 'usr_prof_demo', day: 'Wednesday', periodIndex: 8, timeSlot: '2:40-3:30', subject: 'PG Thesis Guidance Slot', roomId: 'cls-4', roomName: 'Lab C-204', color: '#640000' },
  { id: 'tt-p7', ownerId: 'usr_prof_demo', day: 'Friday', periodIndex: 4, timeSlot: '11:20-12:10', subject: 'UCS405: Operating Systems (Tutorial)', roomId: 'cls-1', roomName: 'LT 101', color: '#640000' },
];

export const initialRequests = [
  {
    id: 'req-1',
    studentId: 'usr_student_demo',
    studentName: 'Sumit Bansal',
    studentRoll: '102303492',
    studentBranch: 'Computer Science (3rd Year)',
    professorId: 'usr_prof_demo',
    professorName: 'Dr. Rajesh Kumar',
    date: '2026-11-16',
    timeSlot: '3:30-4:20',
    reason: 'UCS405 OS Assignment 3 Doubt Consultation regarding Peterson algorithm race conditions and kernel mutexes.',
    type: 'Doubt',
    attachmentUrl: null,
    attachmentName: null,
    attachmentSize: 0,
    status: 'accepted',
    professorRemark: 'Approved. Please bring your draft code logic to Cabin C-314.',
    createdAt: '2026-11-12T10:30:00Z',
  },
  {
    id: 'req-2',
    studentId: 'usr_student_demo',
    studentName: 'Sumit Bansal',
    studentRoll: '102303492',
    studentBranch: 'Computer Science (3rd Year)',
    professorId: 'usr_prof_2',
    professorName: 'Dr. Sunita Bansal',
    date: '2026-11-17',
    timeSlot: '11:20-12:10',
    reason: 'Discussion regarding Capstone Project Proposal on Software-Defined Network flow balancing.',
    type: 'Project discussion',
    attachmentUrl: '/uploads/sample_project_synopsis.pdf',
    attachmentName: 'sdn_project_synopsis.pdf',
    attachmentSize: 1.8,
    status: 'pending',
    professorRemark: null,
    createdAt: '2026-11-13T09:15:00Z',
  },
  {
    id: 'req-3',
    studentId: 'usr_student_2',
    studentName: 'Priya Narang',
    studentRoll: '102303112',
    studentBranch: 'Computer Science (3rd Year)',
    professorId: 'usr_prof_demo',
    professorName: 'Dr. Rajesh Kumar',
    date: '2026-11-18',
    timeSlot: '4:20-5:10',
    reason: 'Guidance on Distributed Systems Virtualization paper review.',
    type: 'Guidance',
    attachmentUrl: null,
    attachmentName: null,
    attachmentSize: 0,
    status: 'pending',
    professorRemark: null,
    createdAt: '2026-11-13T14:20:00Z',
  },
];

export const initialTasks = [
  { id: 'tsk-1', ownerId: 'usr_student_demo', label: 'Submit OS Assignment 3 (Process Scheduling)', sub: 'Due tomorrow at 11:59 PM • UCS405', category: 'Assignment', is_done: false },
  { id: 'tsk-2', ownerId: 'usr_student_demo', label: 'Prepare Socket Programming Lab Report', sub: 'CN Lab prep • UCS414', category: 'Lab', is_done: false },
  { id: 'tsk-3', ownerId: 'usr_student_demo', label: 'Revise BCNF Normalization Theorems', sub: 'DBMS Mid-Sem review • UCS310', category: 'Revision', is_done: true },
  { id: 'tsk-4', ownerId: 'usr_prof_demo', label: 'Submit Mid-Sem Question Paper to Dean Office', sub: 'Confidential Exam Branch envelope', category: 'Exam', is_done: false },
  { id: 'tsk-5', ownerId: 'usr_prof_demo', label: 'Upload Unit 3 Lecture Slides to Portal', sub: 'UCS405 Virtual Memory', category: 'Course', is_done: true },
];

export const initialNotes = [
  { id: 'note-1', ownerId: 'usr_student_demo', title: 'OS Mid-Sem Key Theorems', content: 'Peterson algorithm mutual exclusion proof, Dining Philosophers semaphore solution, Bankers algorithm safety state check.' },
  { id: 'note-2', ownerId: 'usr_student_demo', title: 'Library Book Due Date', content: 'Return Computer Networks 5th Edition by Tanenbaum before Friday 4 PM.' },
  { id: 'note-3', ownerId: 'usr_prof_demo', title: 'Lab 3 Hardware Upgrade', content: 'Coordinate with CITM for additional RAM sticks in CS Lab 3 machines.' },
];

export const initialLinks = [
  { id: 'link-1', ownerId: 'usr_student_demo', title: 'Webkiosk Portal', url: 'https://webkiosk.thapar.edu' },
  { id: 'link-2', ownerId: 'usr_student_demo', title: 'Central Library Catalogue', url: 'https://library.thapar.edu' },
  { id: 'link-3', ownerId: 'usr_prof_demo', title: 'Faculty Research Gateway', url: 'https://faculty.thapar.edu' },
];

export const initialFiles = [
  { id: 'file-1', ownerId: 'usr_student_demo', name: 'Operating_Systems_Syllabus.pdf', size: 1.4, url: '#' },
  { id: 'file-2', ownerId: 'usr_student_demo', name: 'CN_Socket_Programming_Guide.pdf', size: 2.8, url: '#' },
  { id: 'file-3', ownerId: 'usr_prof_demo', name: 'UCS405_Lecture_Syllabus_2026.pdf', size: 3.2, url: '#' },
];

export const initialNotifications = [
  { id: 'notif-1', userId: 'usr_student_demo', title: 'Meeting Confirmed', message: 'Dr. Rajesh Kumar accepted your consultation request for Nov 16 at 3:30 PM in Cabin C-314.', is_read: false, link: '/requests', createdAt: '2026-11-13T12:00:00Z' },
  { id: 'notif-2', userId: 'usr_student_demo', title: 'MST Datesheet Published', message: 'Dean Academic Affairs announced Mid-Sem exam schedules.', is_read: true, link: '/calendar', createdAt: '2026-11-12T15:30:00Z' },
  { id: 'notif-3', userId: 'usr_prof_demo', title: 'New Meeting Request', message: 'Priya Narang submitted a request for Nov 18, 4:20 PM regarding Distributed Systems.', is_read: false, link: '/requests', createdAt: '2026-11-13T14:20:00Z' },
];

export const initialDepartments = [
  { id: 'dept-1', name: 'CSED', fullName: 'Computer Science & Engineering Department', code: 'CSE' },
  { id: 'dept-2', name: 'Mathematics', fullName: 'Department of Mathematics & Data Science', code: 'MTH' },
  { id: 'dept-3', name: 'Physics', fullName: 'Department of Applied Physics', code: 'PHY' },
  { id: 'dept-4', name: 'Electronics', fullName: 'Electronics & Communication Engineering', code: 'ECE' },
  { id: 'dept-5', name: 'Mechanical', fullName: 'Mechanical Engineering Department', code: 'MEC' },
];

export const initialAuditLogs = [
  { id: 'log-1', actorId: 'usr_admin_demo', actorName: 'Dean Academic Administration', actorRole: 'admin', action: 'SYSTEM_CONFIG', entity: 'Department', details: 'Initialized Academic Departments: CSED, ECE, Mathematics, Physics, Mechanical', createdAt: '2026-11-10T09:00:00Z' },
  { id: 'log-2', actorId: 'usr_prof_demo', actorName: 'Dr. Rajesh Kumar', actorRole: 'professor', action: 'REQUEST_ACCEPTED', entity: 'MeetingRequest', details: 'Accepted meeting request #req-1 with student Sumit Bansal for Nov 16, 3:30 PM', createdAt: '2026-11-12T10:35:00Z' },
  { id: 'log-3', actorId: 'usr_student_demo', actorName: 'Sumit Bansal', actorRole: 'student', action: 'REQUEST_CREATED', entity: 'MeetingRequest', details: 'Requested meeting #req-2 with Dr. Sunita Bansal for Nov 17, 11:20 AM', createdAt: '2026-11-13T09:15:00Z' },
];
