import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in reverse dependency order
  await prisma.auditLog.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.meetingRequest.deleteMany();
  await prisma.timetableEntry.deleteMany();
  await prisma.officeHour.deleteMany();
  await prisma.blockedDate.deleteMany();
  await prisma.note.deleteMany();
  await prisma.task.deleteMany();
  await prisma.link.deleteMany();
  await prisma.fileUpload.deleteMany();
  await prisma.resource.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.professorProfile.deleteMany();
  await prisma.classroom.deleteMany();
  await prisma.department.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = bcrypt.hashSync('demo123', 10);

  // 2. Create Departments (10 departments)
  const departmentsData = [
    { name: 'CSED', fullName: 'Computer Science & Engineering Department', code: 'CSE' },
    { name: 'Electronics', fullName: 'Electronics & Communication Engineering', code: 'ECE' },
    { name: 'Mechanical', fullName: 'Mechanical Engineering Department', code: 'MEC' },
    { name: 'Mathematics', fullName: 'Department of Mathematics & Data Science', code: 'MTH' },
    { name: 'Physics', fullName: 'Department of Applied Physics', code: 'PHY' },
    { name: 'Civil', fullName: 'Civil Engineering Department', code: 'CIV' },
    { name: 'Electrical', fullName: 'Electrical & Instrumentation Department', code: 'EIE' },
    { name: 'Chemical', fullName: 'Chemical Engineering Department', code: 'CHE' },
    { name: 'Biotechnology', fullName: 'Department of Biotechnology', code: 'BIO' },
    { name: 'Humanities', fullName: 'School of Humanities and Social Sciences', code: 'HSS' },
  ];

  const deptMap: Record<string, string> = {};
  for (const d of departmentsData) {
    const created = await prisma.department.create({ data: d });
    deptMap[d.name] = created.id;
  }
  console.log(`✓ Seeded ${departmentsData.length} departments`);

  // 3. Create Classrooms (12 classrooms and labs)
  const classroomsData = [
    {
      name: 'Lecture Theatre 101',
      block: 'Block B',
      floor: 'Ground Floor',
      capacity: 180,
      code: 'LT101',
      type: 'LECTURE_HALL',
      location: 'Academic Central • Room LT-101',
      imageUrl: 'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Central Air Conditioned', 'Dual Smart Projectors', 'Acoustic Soundproofing', 'Tiered Seating']),
      directions: 'Enter Block B via Main Foyer, take the central corridor straight. LT 101 is on your left opposite Dean Office.'
    },
    {
      name: 'Lecture Theatre 102',
      block: 'Block B',
      floor: 'Ground Floor',
      capacity: 180,
      code: 'LT102',
      type: 'LECTURE_HALL',
      location: 'Academic Central • Room LT-102',
      imageUrl: 'https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Central Air Conditioned', 'Smart Display', 'Microphone System', 'Wheelchair Ramp']),
      directions: 'Adjacent to LT 101 in Block B, directly facing the open green courtyard.'
    },
    {
      name: 'Lecture Pavilion 104',
      block: 'Lecture Hall',
      floor: 'First Floor',
      capacity: 220,
      code: 'LP104',
      type: 'LECTURE_HALL',
      location: 'Lecture Pavilion • Room LP-104',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Wide Presentation Wall', 'Wireless Mic', 'Tiered Amphitheatre', 'High-Speed Wi-Fi']),
      directions: 'Enter LP building, ascend Staircase 2 near the central fountain. Room 104 is on the East Wing.'
    },
    {
      name: 'Advanced Systems & OS Lab',
      block: 'CSED',
      floor: 'Second Floor',
      capacity: 65,
      code: 'CSL03',
      type: 'LAB',
      location: 'CSED Block C • Room C-204',
      imageUrl: 'https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['65 High-End Workstations', 'Dual Monitor Setup', 'Server Rack Access', 'Dedicated UPS Power']),
      directions: 'Take Elevator 1 in Block C to Floor 2. Exit right and follow the glass computing corridor.'
    },
    {
      name: 'Tan Auditorium Hall',
      block: 'Block TAN',
      floor: 'Ground Floor',
      capacity: 350,
      code: 'TAN01',
      type: 'LECTURE_HALL',
      location: 'Tan Auditorium Complex • Main Auditorium',
      imageUrl: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Full Stage & Lighting', 'Cinema Grade Projection', 'Central AC', 'Green Room']),
      directions: 'Main entrance facing the Central Library Lawn. Direct ground-level auditorium foyer access.'
    },
    {
      name: 'Workshop Room W-103',
      block: 'Lab',
      floor: 'Ground Floor',
      capacity: 50,
      code: 'W103',
      type: 'LAB',
      location: 'Mechanical Workshop • Room W-103',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Industrial Test Benches', 'Precision Lathes', 'Safety Ventilation', 'First Aid Station']),
      directions: 'Walk past Block A to the Western Workshop compound. W-103 is located in the Central Machine Bay.'
    },
    {
      name: 'Network & IoT Laboratory',
      block: 'CSED',
      floor: 'Third Floor',
      capacity: 60,
      code: 'CSL05',
      type: 'LAB',
      location: 'CSED Block C • Room C-310',
      imageUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Cisco Routers', 'Raspberry Pi Kits', 'Oscilloscopes', 'High-Speed LAN']),
      directions: 'Block C 3rd floor, directly across from the elevator.'
    },
    {
      name: 'VLSI Design Studio',
      block: 'Block E',
      floor: 'First Floor',
      capacity: 45,
      code: 'ECL02',
      type: 'LAB',
      location: 'Electronics Wing • Room EC-108',
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Cadence EDA Suite', 'FPGA Kits', 'Logic Analyzers', 'Clean Room Access']),
      directions: 'Block E first floor, turn left past the department head office.'
    },
    {
      name: 'Applied Optics & Laser Lab',
      block: 'Block PHY',
      floor: 'Second Floor',
      capacity: 40,
      code: 'PHL01',
      type: 'LAB',
      location: 'Physics Block • Room PH-201',
      imageUrl: 'https://images.unsplash.com/photo-1507668077129-56e32842fceb?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Darkroom Enclosure', 'Helium-Neon Lasers', 'Spectrometers', 'Optical Benches']),
      directions: 'Science Block 2nd floor, North corridor.'
    },
    {
      name: 'Seminar Hall S-202',
      block: 'Block A',
      floor: 'Second Floor',
      capacity: 120,
      code: 'SH202',
      type: 'CLASSROOM',
      location: 'Main Administrative Block • Room A-202',
      imageUrl: 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Smart Board', 'Surround Sound', 'Podium Mic', 'Video Conference']),
      directions: 'Central staircase Block A, directly opposite conference room.'
    },
    {
      name: 'Computation & Statistics Room',
      block: 'Block MTH',
      floor: 'Ground Floor',
      capacity: 55,
      code: 'MTH101',
      type: 'CLASSROOM',
      location: 'Mathematics Block • Room M-101',
      imageUrl: 'https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['MATLAB Workstations', 'Projection System', 'Ergonomic Seating']),
      directions: 'Mathematics Wing ground floor entrance.'
    },
    {
      name: 'Fluid Mechanics Lab',
      block: 'Lab',
      floor: 'Ground Floor',
      capacity: 50,
      code: 'MEL02',
      type: 'LAB',
      location: 'Mechanical Heavy Labs • Room M-004',
      imageUrl: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop&q=80',
      amenities: JSON.stringify(['Wind Tunnel', 'Hydraulic Test Bench', 'Viscometers', 'Safety Goggles']),
      directions: 'South end of Mechanical Workshop compound.'
    }
  ];

  const classMap: Record<string, string> = {};
  for (const c of classroomsData) {
    const created = await prisma.classroom.create({ data: c });
    classMap[c.code] = created.id;
  }
  console.log(`✓ Seeded ${classroomsData.length} classrooms`);

  // 4. Create Admin User
  const adminUser = await prisma.user.create({
    data: {
      id: 'usr_admin_demo',
      email: 'admin@demo.com',
      name: 'Dean Academic Administration',
      passwordHash,
      role: 'ADMIN',
      avatarUrl: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=80',
      status: 'ACTIVE'
    }
  });
  console.log('✓ Created Admin user: admin@demo.com');

  // 5. Create Students (3 students)
  const studentsData = [
    {
      id: 'usr_student_demo',
      email: 'student@demo.com',
      name: 'Sumit Bansal',
      rollNo: '102303492',
      branch: 'Computer Science & Engineering',
      year: '3rd Year (Batch 2023-2027)',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_student_2',
      email: 'pnarang_be23@thapar.edu',
      name: 'Priya Narang',
      rollNo: '102303112',
      branch: 'Computer Science & Engineering',
      year: '3rd Year (Batch 2023-2027)',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
    },
    {
      id: 'usr_student_3',
      email: 'akash.verma@thapar.edu',
      name: 'Akash Verma',
      rollNo: '102303501',
      branch: 'Electronics & Communication',
      year: '3rd Year (Batch 2023-2027)',
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
    }
  ];

  for (const s of studentsData) {
    await prisma.user.create({
      data: {
        id: s.id,
        email: s.email,
        name: s.name,
        passwordHash,
        role: 'STUDENT',
        avatarUrl: s.avatarUrl,
        status: 'ACTIVE',
        studentProfile: {
          create: {
            rollNo: s.rollNo,
            branch: s.branch,
            year: s.year
          }
        }
      }
    });
  }
  console.log(`✓ Seeded ${studentsData.length} students (including student@demo.com)`);

  // 6. Create Professors (10 professors matching departments)
  const professorsData = [
    {
      id: 'usr_prof_demo',
      email: 'professor@demo.com',
      name: 'Dr. Rajesh Kumar',
      teacherCode: 'TCH-CSE-01',
      deptName: 'CSED',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin C-314, Block C (3rd Floor)',
      bio: 'Senior researcher in Distributed Operating Systems, Cloud Virtualization, and Systems Performance.',
      researchAreas: 'Distributed Systems, Linux Kernel, Cloud Performance',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 0, dayName: 'Monday', startTime: '15:00', endTime: '17:00' },
        { day: 2, dayName: 'Wednesday', startTime: '15:00', endTime: '17:00' }
      ]
    },
    {
      id: 'usr_prof_2',
      email: 'sbansal@thapar.edu',
      name: 'Dr. Sunita Bansal',
      teacherCode: 'TCH-CSE-02',
      deptName: 'CSED',
      designation: 'PROFESSOR',
      officeLocation: 'Cabin C-201, Block C (2nd Floor)',
      bio: 'Head of Computer Networks Laboratory. Specializing in Software-Defined Networking and Sensor Grids.',
      researchAreas: 'Software Defined Networks, IoT, Wireless Grids',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 1, dayName: 'Tuesday', startTime: '11:30', endTime: '13:30' },
        { day: 3, dayName: 'Thursday', startTime: '11:30', endTime: '13:30' }
      ]
    },
    {
      id: 'usr_prof_3',
      email: 'vikram.aditya@thapar.edu',
      name: 'Dr. Vikramaditya',
      teacherCode: 'TCH-ECE-04',
      deptName: 'Electronics',
      designation: 'ASSISTANT',
      officeLocation: 'Cabin EC-112, Block E (1st Floor)',
      bio: 'Focuses on VLSI design, semiconductor devices, and embedded edge compute platforms.',
      researchAreas: 'VLSI Architectures, Microcontrollers, Analog Circuits',
      isOnline: false,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 0, dayName: 'Monday', startTime: '16:00', endTime: '17:00' },
        { day: 4, dayName: 'Friday', startTime: '16:00', endTime: '17:00' }
      ]
    },
    {
      id: 'usr_prof_4',
      email: 'msharma@thapar.edu',
      name: 'Dr. Meenakshi Sharma',
      teacherCode: 'TCH-MTH-01',
      deptName: 'Mathematics',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin M-205, Main Academic Wing',
      bio: 'Graph theory, combinatorial algorithms, and discrete linear algebraic analysis.',
      researchAreas: 'Linear Algebra, Graph Theory, Numerical Analysis',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 2, dayName: 'Wednesday', startTime: '14:00', endTime: '16:00' },
        { day: 4, dayName: 'Friday', startTime: '14:00', endTime: '16:00' }
      ]
    },
    {
      id: 'usr_prof_5',
      email: 'hsingh@thapar.edu',
      name: 'Dr. Harpreet Singh',
      teacherCode: 'TCH-MEC-03',
      deptName: 'Mechanical',
      designation: 'PROFESSOR',
      officeLocation: 'Cabin ME-108, Workshop Block',
      bio: 'Advanced manufacturing, thermal analysis, and surface engineering laboratory.',
      researchAreas: 'Thermal Spray Coatings, CAD/CAM, Surface Tribology',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 1, dayName: 'Tuesday', startTime: '15:00', endTime: '16:30' },
        { day: 4, dayName: 'Friday', startTime: '15:00', endTime: '16:30' }
      ]
    },
    {
      id: 'usr_prof_6',
      email: 'kculdeep@thapar.edu',
      name: 'Dr. Kuldeep Sharma',
      teacherCode: 'TCH-PHY-02',
      deptName: 'Physics',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin PH-204, Science Block',
      bio: 'Laser spectroscopy, optics, and solid-state materials.',
      researchAreas: 'Optics, Laser Spectroscopy, Quantum Materials',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 0, dayName: 'Monday', startTime: '14:00', endTime: '15:30' },
        { day: 3, dayName: 'Thursday', startTime: '14:00', endTime: '15:30' }
      ]
    },
    {
      id: 'usr_prof_7',
      email: 'akaur@thapar.edu',
      name: 'Dr. Amanpreet Kaur',
      teacherCode: 'TCH-CSE-07',
      deptName: 'CSED',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin C-115, Block C (1st Floor)',
      bio: 'Database Systems, Information Retrieval, and Knowledge Graphs.',
      researchAreas: 'Relational DB, NoSQL, Vector Embeddings',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 1, dayName: 'Tuesday', startTime: '10:00', endTime: '12:00' }
      ]
    },
    {
      id: 'usr_prof_8',
      email: 'rgupta@thapar.edu',
      name: 'Dr. Rohit Gupta',
      teacherCode: 'TCH-CIV-01',
      deptName: 'Civil',
      designation: 'PROFESSOR',
      officeLocation: 'Cabin CV-102, Civil Wing',
      bio: 'Structural engineering, seismic analysis, and resilient concrete materials.',
      researchAreas: 'Structural Dynamics, Earthquake Engineering',
      isOnline: false,
      avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 3, dayName: 'Thursday', startTime: '14:00', endTime: '16:00' }
      ]
    },
    {
      id: 'usr_prof_9',
      email: 'schopra@thapar.edu',
      name: 'Dr. Shalini Chopra',
      teacherCode: 'TCH-CHE-02',
      deptName: 'Chemical',
      designation: 'ASSISTANT',
      officeLocation: 'Cabin CH-204, Chemical Block',
      bio: 'Biofuel synthesis, process intensification, and reaction kinetics.',
      researchAreas: 'Catalysis, Green Chemistry, Reactor Design',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 4, dayName: 'Friday', startTime: '11:00', endTime: '13:00' }
      ]
    },
    {
      id: 'usr_prof_10',
      email: 'vmehta@thapar.edu',
      name: 'Dr. Vivek Mehta',
      teacherCode: 'TCH-BIO-01',
      deptName: 'Biotechnology',
      designation: 'ASSOCIATE',
      officeLocation: 'Cabin BT-301, Bio Annex',
      bio: 'Computational biology, genetic sequencing algorithms, and molecular modelling.',
      researchAreas: 'Bioinformatics, CRISPR, Proteomics',
      isOnline: true,
      avatarUrl: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
      officeHours: [
        { day: 0, dayName: 'Monday', startTime: '11:00', endTime: '12:30' }
      ]
    }
  ];

  for (const p of professorsData) {
    const departmentId = deptMap[p.deptName] || deptMap['CSED'];
    await prisma.user.create({
      data: {
        id: p.id,
        email: p.email,
        name: p.name,
        passwordHash,
        role: 'PROFESSOR',
        avatarUrl: p.avatarUrl,
        status: 'ACTIVE',
        professorProfile: {
          create: {
            teacherCode: p.teacherCode,
            departmentId,
            designation: p.designation,
            officeLocation: p.officeLocation,
            bio: p.bio,
            researchAreas: p.researchAreas,
            isOnline: p.isOnline,
            officeHours: {
              create: p.officeHours.map((oh) => ({
                day: oh.day,
                dayName: oh.dayName,
                startTime: oh.startTime,
                endTime: oh.endTime,
                isAvailable: true
              }))
            }
          }
        }
      }
    });
  }
  console.log(`✓ Seeded ${professorsData.length} professors with office hours (including professor@demo.com)`);

  // 7. Seed Timetables
  const timeSlots = [
    '8:00-8:50', '8:50-9:40', '9:40-10:30', '10:30-11:20',
    '11:20-12:10', '12:10-1:00', '1:00-1:50', '1:50-2:40',
    '2:40-3:30', '3:30-4:20', '4:20-5:10', '5:10-6:00', '6:00-6:50'
  ];

  const timetableData = [
    // Student Timetable (Sumit Bansal - usr_student_demo)
    { ownerId: 'usr_student_demo', day: 0, dayName: 'Monday', periodIndex: 1, subject: 'UCS405: Operating Systems', roomId: classMap['LT101'], roomName: 'LT 101', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
    { ownerId: 'usr_student_demo', day: 0, dayName: 'Monday', periodIndex: 3, subject: 'UCS414: Computer Networks', roomId: classMap['LP104'], roomName: 'LP 104', professorName: 'Dr. Sunita Bansal', color: '#313131' },
    { ownerId: 'usr_student_demo', day: 0, dayName: 'Monday', periodIndex: 4, subject: 'UCS405: OS Lab', roomId: classMap['CSL03'], roomName: 'CS Lab 3', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
    { ownerId: 'usr_student_demo', day: 0, dayName: 'Monday', periodIndex: 5, subject: 'UCS405: OS Lab (Contd.)', roomId: classMap['CSL03'], roomName: 'CS Lab 3', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
    { ownerId: 'usr_student_demo', day: 1, dayName: 'Tuesday', periodIndex: 2, subject: 'UCS310: Database Systems', roomId: classMap['LT102'], roomName: 'LT 102', professorName: 'Dr. Amanpreet Kaur', color: '#313131' },
    { ownerId: 'usr_student_demo', day: 1, dayName: 'Tuesday', periodIndex: 4, subject: 'UEC401: Analog Electronics', roomId: classMap['LT101'], roomName: 'LT 101', professorName: 'Dr. Vikramaditya', color: '#640000' },
    { ownerId: 'usr_student_demo', day: 2, dayName: 'Wednesday', periodIndex: 1, subject: 'UCS414: Computer Networks', roomId: classMap['LP104'], roomName: 'LP 104', professorName: 'Dr. Sunita Bansal', color: '#313131' },
    { ownerId: 'usr_student_demo', day: 2, dayName: 'Wednesday', periodIndex: 3, subject: 'UCS405: Operating Systems', roomId: classMap['LT101'], roomName: 'LT 101', professorName: 'Dr. Rajesh Kumar', color: '#640000' },
    { ownerId: 'usr_student_demo', day: 3, dayName: 'Thursday', periodIndex: 2, subject: 'UMA010: Mathematics II', roomId: classMap['LT101'], roomName: 'LT 101', professorName: 'Dr. Meenakshi Sharma', color: '#313131' },
    { ownerId: 'usr_student_demo', day: 4, dayName: 'Friday', periodIndex: 3, subject: 'UEC401: Analog Electronics', roomId: classMap['LT102'], roomName: 'LT 102', professorName: 'Dr. Vikramaditya', color: '#640000' },

    // Professor Timetable (Dr. Rajesh Kumar - usr_prof_demo)
    { ownerId: 'usr_prof_demo', day: 0, dayName: 'Monday', periodIndex: 1, subject: 'UCS405: Operating Systems (Lect.)', roomId: classMap['LT101'], roomName: 'LT 101', color: '#640000' },
    { ownerId: 'usr_prof_demo', day: 0, dayName: 'Monday', periodIndex: 4, subject: 'UCS405: OS Lab (Sec A)', roomId: classMap['CSL03'], roomName: 'CS Lab 3', color: '#313131' },
    { ownerId: 'usr_prof_demo', day: 0, dayName: 'Monday', periodIndex: 5, subject: 'UCS405: OS Lab (Sec A)', roomId: classMap['CSL03'], roomName: 'CS Lab 3', color: '#313131' },
    { ownerId: 'usr_prof_demo', day: 0, dayName: 'Monday', periodIndex: 9, subject: 'Department Academic Meeting', roomId: classMap['LT102'], roomName: 'Conference Room', color: '#313131' },
    { ownerId: 'usr_prof_demo', day: 2, dayName: 'Wednesday', periodIndex: 3, subject: 'UCS405: Operating Systems (Lect.)', roomId: classMap['LT101'], roomName: 'LT 101', color: '#640000' },
    { ownerId: 'usr_prof_demo', day: 2, dayName: 'Wednesday', periodIndex: 8, subject: 'PG Thesis Guidance Slot', roomId: classMap['CSL03'], roomName: 'Lab C-204', color: '#640000' },
    { ownerId: 'usr_prof_demo', day: 4, dayName: 'Friday', periodIndex: 4, subject: 'UCS405: Operating Systems (Tutorial)', roomId: classMap['LT101'], roomName: 'LT 101', color: '#640000' },
  ];

  for (const tt of timetableData) {
    await prisma.timetableEntry.create({
      data: {
        ownerId: tt.ownerId,
        day: tt.day,
        dayName: tt.dayName,
        periodIndex: tt.periodIndex,
        timeSlot: timeSlots[tt.periodIndex] || '8:00-8:50',
        subject: tt.subject,
        roomId: tt.roomId,
        roomName: tt.roomName,
        professorName: tt.professorName,
        color: tt.color
      }
    });
  }
  console.log(`✓ Seeded ${timetableData.length} timetable entries`);

  // 8. Seed Meeting Requests with different statuses
  const requestsData = [
    {
      id: 'req-1',
      studentId: 'usr_student_demo',
      professorId: 'usr_prof_demo',
      date: '2026-11-30',
      startTime: '15:30',
      endTime: '16:20',
      timeSlot: '3:30-4:20',
      reason: 'UCS405 OS Assignment 3 Doubt Consultation regarding Peterson algorithm race conditions and kernel mutexes.',
      meetingType: 'DOUBT',
      attachmentUrl: null,
      attachmentName: null,
      attachmentSize: 0,
      status: 'ACCEPTED',
      professorRemark: 'Approved. Please bring your draft code logic to Cabin C-314.'
    },
    {
      id: 'req-2',
      studentId: 'usr_student_demo',
      professorId: 'usr_prof_2',
      date: '2026-12-01',
      startTime: '11:20',
      endTime: '12:10',
      timeSlot: '11:20-12:10',
      reason: 'Discussion regarding Capstone Project Proposal on Software-Defined Network flow balancing.',
      meetingType: 'PROJECT',
      attachmentUrl: '/uploads/sample_project_synopsis.pdf',
      attachmentName: 'sdn_project_synopsis.pdf',
      attachmentSize: 1.8,
      status: 'PENDING',
      professorRemark: null
    },
    {
      id: 'req-3',
      studentId: 'usr_student_2',
      professorId: 'usr_prof_demo',
      date: '2026-12-02',
      startTime: '16:20',
      endTime: '17:10',
      timeSlot: '4:20-5:10',
      reason: 'Guidance on Distributed Systems Virtualization paper review.',
      meetingType: 'GUIDANCE',
      attachmentUrl: null,
      attachmentName: null,
      attachmentSize: 0,
      status: 'PENDING',
      professorRemark: null
    },
    {
      id: 'req-4',
      studentId: 'usr_student_3',
      professorId: 'usr_prof_3',
      date: '2026-11-28',
      startTime: '16:00',
      endTime: '17:00',
      timeSlot: '4:20-5:10',
      reason: 'VLSI laboratory breadboard testing query and timing diagram setup.',
      meetingType: 'DOUBT',
      attachmentUrl: null,
      attachmentName: null,
      attachmentSize: 0,
      status: 'REJECTED',
      professorRemark: 'Unable to take doubts during this slot due to departmental audit. Please reschedule for next week.'
    }
  ];

  for (const r of requestsData) {
    await prisma.meetingRequest.create({ data: r });
  }
  console.log(`✓ Seeded ${requestsData.length} meeting requests with varied statuses`);

  // 9. Seed Notes, Tasks, Links, Files
  const tasksData = [
    { userId: 'usr_student_demo', title: 'Submit OS Assignment 3 (Process Scheduling)', dueDate: 'Due tomorrow at 11:59 PM • UCS405', category: 'Assignment', done: false },
    { userId: 'usr_student_demo', title: 'Prepare Socket Programming Lab Report', dueDate: 'CN Lab prep • UCS414', category: 'Lab', done: false },
    { userId: 'usr_student_demo', title: 'Revise BCNF Normalization Theorems', dueDate: 'DBMS Mid-Sem review • UCS310', category: 'Revision', done: true },
    { userId: 'usr_prof_demo', title: 'Submit Mid-Sem Question Paper to Dean Office', dueDate: 'Confidential Exam Branch envelope', category: 'Exam', done: false },
    { userId: 'usr_prof_demo', title: 'Upload Unit 3 Lecture Slides to Portal', dueDate: 'UCS405 Virtual Memory', category: 'Course', done: true },
  ];
  for (const t of tasksData) {
    await prisma.task.create({ data: t });
  }

  const notesData = [
    { userId: 'usr_student_demo', title: 'OS Mid-Sem Key Theorems', content: 'Peterson algorithm mutual exclusion proof, Dining Philosophers semaphore solution, Bankers algorithm safety state check.' },
    { userId: 'usr_student_demo', title: 'Library Book Due Date', content: 'Return Computer Networks 5th Edition by Tanenbaum before Friday 4 PM.' },
    { userId: 'usr_prof_demo', title: 'Lab 3 Hardware Upgrade', content: 'Coordinate with CITM for additional RAM sticks in CS Lab 3 machines.' },
  ];
  for (const n of notesData) {
    await prisma.note.create({ data: n });
  }

  const linksData = [
    { userId: 'usr_student_demo', title: 'Webkiosk Portal', url: 'https://webkiosk.thapar.edu' },
    { userId: 'usr_student_demo', title: 'Central Library Catalogue', url: 'https://library.thapar.edu' },
    { userId: 'usr_prof_demo', title: 'Faculty Research Gateway', url: 'https://faculty.thapar.edu' },
  ];
  for (const l of linksData) {
    await prisma.link.create({ data: l });
  }

  const filesData = [
    { ownerId: 'usr_student_demo', fileName: 'Operating_Systems_Syllabus.pdf', sizeBytes: 1468000, mimeType: 'application/pdf', url: '/uploads/sample_project_synopsis.pdf' },
    { ownerId: 'usr_student_demo', fileName: 'CN_Socket_Programming_Guide.pdf', sizeBytes: 2936000, mimeType: 'application/pdf', url: '/uploads/sample_project_synopsis.pdf' },
    { ownerId: 'usr_prof_demo', fileName: 'UCS405_Lecture_Syllabus_2026.pdf', sizeBytes: 3355000, mimeType: 'application/pdf', url: '/uploads/sample_project_synopsis.pdf' },
  ];
  for (const f of filesData) {
    await prisma.fileUpload.create({ data: f });
  }

  // 10. Seed Notifications
  const notifsData = [
    { userId: 'usr_student_demo', type: 'REQUEST', title: 'Meeting Confirmed', message: 'Dr. Rajesh Kumar accepted your consultation request for Nov 30 at 3:30 PM in Cabin C-314.', link: '/requests', isRead: false },
    { userId: 'usr_student_demo', type: 'INFO', title: 'MST Datesheet Published', message: 'Dean Academic Affairs announced Mid-Sem exam schedules.', link: '/calendar', isRead: true },
    { userId: 'usr_prof_demo', type: 'REQUEST', title: 'New Meeting Request', message: 'Priya Narang submitted a request for Dec 02, 4:20 PM regarding Distributed Systems.', link: '/requests', isRead: false },
  ];
  for (const nt of notifsData) {
    await prisma.notification.create({ data: nt });
  }

  // 11. Seed Audit Logs
  const auditData = [
    { actorId: 'usr_admin_demo', actorName: 'Dean Academic Administration', actorRole: 'ADMIN', action: 'SYSTEM_CONFIG', entity: 'Department', details: JSON.stringify({ message: 'Initialized 10 Academic Departments' }) },
    { actorId: 'usr_prof_demo', actorName: 'Dr. Rajesh Kumar', actorRole: 'PROFESSOR', action: 'REQUEST_ACCEPTED', entity: 'MeetingRequest', entityId: 'req-1', details: JSON.stringify({ message: 'Accepted meeting request with Sumit Bansal' }) },
    { actorId: 'usr_student_demo', actorName: 'Sumit Bansal', actorRole: 'STUDENT', action: 'REQUEST_CREATED', entity: 'MeetingRequest', entityId: 'req-2', details: JSON.stringify({ message: 'Requested project discussion with Dr. Sunita Bansal' }) },
  ];
  for (const a of auditData) {
    await prisma.auditLog.create({ data: a });
  }

  console.log('✅ Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
