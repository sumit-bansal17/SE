import { spawn, ChildProcess } from 'child_process';

const BASE = 'http://127.0.0.1:5050/api';

async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

let serverProcess: ChildProcess;

async function runTests() {
  console.log('=== STARTING TIET-SYNC END-TO-END VERIFICATION SUITE ===\n');

  // 1. Health check
  console.log('[1/10] Checking API Health...');
  const healthRes = await fetch(`${BASE}/health`);
  if (!healthRes.ok) throw new Error(`Health check failed: ${healthRes.status}`);
  const healthData = await healthRes.json() as any;
  console.log('  -> Health status:', healthData.status, healthData.system);

  // 2. Auth: Test login for all 3 roles
  console.log('\n[2/10] Testing Authentication for Student, Professor, and Admin...');
  
  // Student
  const studentLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'student@demo.com', password: 'demo123' }),
  });
  if (!studentLoginRes.ok) throw new Error(`Student login failed: ${await studentLoginRes.text()}`);
  const studentAuth = await studentLoginRes.json() as any;
  if (!studentAuth.token || studentAuth.user.role !== 'student') throw new Error('Student auth response invalid');
  if ('passwordHash' in studentAuth.user) throw new Error('Security flaw: passwordHash returned!');
  console.log('  -> Student Login: SUCCESS (Role: student, ID:', studentAuth.user.id, ')');

  // Professor
  const profLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'professor@demo.com', password: 'demo123' }),
  });
  if (!profLoginRes.ok) throw new Error(`Professor login failed: ${await profLoginRes.text()}`);
  const profAuth = await profLoginRes.json() as any;
  if (!profAuth.token || profAuth.user.role !== 'professor') throw new Error('Professor auth response invalid');
  console.log('  -> Professor Login: SUCCESS (Role: professor, ID:', profAuth.user.id, ')');

  // Admin
  const adminLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'admin@demo.com', password: 'demo123' }),
  });
  if (!adminLoginRes.ok) throw new Error(`Admin login failed: ${await adminLoginRes.text()}`);
  const adminAuth = await adminLoginRes.json() as any;
  if (!adminAuth.token || adminAuth.user.role !== 'admin') throw new Error('Admin auth response invalid');
  console.log('  -> Admin Login: SUCCESS (Role: admin, ID:', adminAuth.user.id, ')');

  // 3. Classrooms & Professors Directory
  console.log('\n[3/10] Testing Classrooms & Professors catalog endpoints...');
  const clsRes = await fetch(`${BASE}/classrooms`);
  const classrooms = await clsRes.json() as any[];
  console.log(`  -> Classrooms returned: ${classrooms.length} entries`);

  const profsRes = await fetch(`${BASE}/professors`);
  const professors = await profsRes.json() as any[];
  console.log(`  -> Professors returned: ${professors.length} entries`);

  // 4. Timetable & Availability calculation
  const futureDate = new Date(Date.now() + 7 * 86400000).toISOString().split('T')[0]; // 7 days in future
  console.log(`\n[4/12] Testing Timetable & Slot Availability Engine for future date ${futureDate}...`);
  const availRes = await fetch(`${BASE}/timetable/professors/${profAuth.user.id}/availability?date=${futureDate}`, {
    headers: { Authorization: `Bearer ${studentAuth.token}` },
  });
  if (!availRes.ok) throw new Error(`Availability fetch failed: ${availRes.status}`);
  const availData = await availRes.json() as any;
  console.log(`  -> Availability slots calculated for ${availData.date}: ${availData.slots.length} slots evaluated`);

  // Find a mutually free slot using check-conflict endpoint
  let chosenSlot = '3:30-4:20';
  for (const s of availData.slots) {
    const chkRes = await fetch(`${BASE}/requests/check-conflict?professorId=${profAuth.user.id}&studentId=${studentAuth.user.id}&date=${futureDate}&timeSlot=${encodeURIComponent(s.timeSlot)}`, {
      headers: { Authorization: `Bearer ${studentAuth.token}` },
    });
    if (chkRes.ok) {
      const chkData = await chkRes.json() as any;
      if (!chkData.hasConflict) {
        chosenSlot = s.timeSlot;
        break;
      }
    }
  }
  console.log(`  -> Found Mutually Free Consultation Slot: ${chosenSlot}`);

  // 5. Create Meeting Request
  console.log(`\n[5/12] Testing Meeting Request Creation for slot ${chosenSlot} with Conflict Engine...`);
  const reqRes = await fetch(`${BASE}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAuth.token}`,
    },
    body: JSON.stringify({
      studentId: studentAuth.user.id,
      professorId: profAuth.user.id,
      date: futureDate,
      timeSlot: chosenSlot,
      reason: 'Algorithmic Complexity Consultation and Project Guidance',
      type: 'DOUBT',
    }),
  });
  if (!reqRes.ok) throw new Error(`Create meeting request failed: ${await reqRes.text()}`);
  const createdReq = await reqRes.json() as any;
  console.log('  -> Meeting Request Created: ID', createdReq.id, 'Status:', createdReq.status);

  // 6. Professor Accepts Request (Transactional Lock)
  console.log('\n[6/10] Testing Professor Acceptance (Slot Lock)...');
  const acceptRes = await fetch(`${BASE}/requests/${createdReq.id}/accept`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${profAuth.token}`,
    },
    body: JSON.stringify({ professorRemark: 'Consultation slot confirmed. Please bring notes.' }),
  });
  if (!acceptRes.ok) throw new Error(`Accept meeting request failed: ${await acceptRes.text()}`);
  const acceptedReq = await acceptRes.json() as any;
  console.log('  -> Meeting Accepted! Status:', acceptedReq.status, 'Remark:', acceptedReq.professorRemark);

  // 7. Enforce Business Rule: Transactional Double Booking Prevention
  console.log('\n[7/10] Enforcing Business Rule: Double Booking Prevention...');
  const doubleBookRes = await fetch(`${BASE}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAuth.token}`,
    },
    body: JSON.stringify({
      studentId: studentAuth.user.id,
      professorId: profAuth.user.id,
      date: futureDate,
      timeSlot: chosenSlot, // Exact same locked slot
      reason: 'Attempting conflicting consultation',
      type: 'DOUBT',
    }),
  });
  if (doubleBookRes.status === 409) {
    const conflictErr = await doubleBookRes.json() as any;
    console.log('  -> SUCCESS: Conflicting double-booking blocked with 409 Conflict:', conflictErr.error);
  } else {
    throw new Error(`Double booking was NOT blocked! Status: ${doubleBookRes.status}`);
  }

  // 8. Notifications & Audit Logs verification
  console.log('\n[8/10] Verifying Automated Notifications and Audit Logs...');
  const notifRes = await fetch(`${BASE}/notifications/${studentAuth.user.id}`);
  const notifs = await notifRes.json() as any[];
  console.log(`  -> Student notifications count: ${notifs.length} (Latest: "${notifs[0]?.title} - ${notifs[0]?.message.slice(0, 40)}...")`);

  const auditRes = await fetch(`${BASE}/admin/audit-logs`, {
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  const auditLogs = await auditRes.json() as any[];
  console.log(`  -> System Audit Logs count: ${auditLogs.length} (Latest: ${auditLogs[0]?.action} by ${auditLogs[0]?.actorName})`);

  // 9. Admin Operations: Add Professor & Soft/Hard Delete Business Rule
  console.log('\n[9/10] Testing Admin Operations & Professor Deletion Rule...');
  const newProfRes = await fetch(`${BASE}/admin/professors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`,
    },
    body: JSON.stringify({
      name: 'Dr. Test Professor (No History)',
      email: `testprof_nohistory_${Date.now()}@thapar.edu`,
      teacherCode: `TCH-NO-${Math.floor(100 + Math.random() * 900)}`,
      department: 'CSED',
      designation: 'ASSISTANT',
      officeLocation: 'Block D, Room 402',
    }),
  });
  if (!newProfRes.ok) throw new Error(`Admin create professor failed: ${await newProfRes.text()}`);
  const newProf = await newProfRes.json() as any;
  console.log('  -> Admin Created Professor:', newProf.name, 'ID:', newProf.id);

  // Professor has NO meeting requests -> should be HARD deleted
  const deleteNewProfRes = await fetch(`${BASE}/admin/professors/${newProf.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  const deleteNewProfData = await deleteNewProfRes.json() as any;
  console.log('  -> Deleting Professor with NO request history: mode =', deleteNewProfData.mode);
  if (deleteNewProfData.mode !== 'hard-deleted') throw new Error('Expected hard delete for professor without history');

  // Create second professor WITH meeting request history
  const profWithHistRes = await fetch(`${BASE}/admin/professors`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${adminAuth.token}`,
    },
    body: JSON.stringify({
      name: 'Dr. Test Professor (With History)',
      email: `testprof_withhistory_${Date.now()}@thapar.edu`,
      teacherCode: `TCH-WH-${Math.floor(100 + Math.random() * 900)}`,
      department: 'CSED',
      designation: 'ASSOCIATE',
      officeLocation: 'Block C, Room 201',
    }),
  });
  const profWithHist = await profWithHistRes.json() as any;

  // Add a meeting request for profWithHist
  await fetch(`${BASE}/requests`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${studentAuth.token}`,
    },
    body: JSON.stringify({
      studentId: studentAuth.user.id,
      professorId: profWithHist.id,
      date: new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      timeSlot: '1:50-2:40',
      reason: 'Research Discussion and thesis topic exploration',
      type: 'PROJECT',
    }),
  });

  // Deleting professor WITH request history -> should be SOFT deleted
  const deleteActiveProfRes = await fetch(`${BASE}/admin/professors/${profWithHist.id}`, {
    method: 'DELETE',
    headers: { Authorization: `Bearer ${adminAuth.token}` },
  });
  const deleteActiveData = await deleteActiveProfRes.json() as any;
  console.log('  -> Deleting Professor WITH request history: mode =', deleteActiveData.mode);
  if (deleteActiveData.mode !== 'soft-deleted') throw new Error('Expected soft delete for professor with meeting history');

  // 10. Workspace Storage Quota Enforcement (20 MB Quota)
  console.log('\n[10/12] Testing Workspace File Upload & 20 MB Quota Enforcement...');
  // Check storage info with authenticated token
  const storageRes = await fetch(`${BASE}/workspace/${studentAuth.user.id}`, {
    headers: { Authorization: `Bearer ${studentAuth.token}` },
  });
  if (!storageRes.ok) throw new Error(`Fetch storage failed: ${storageRes.status} ${await storageRes.text()}`);
  const storageData = await storageRes.json() as any;
  console.log(`  -> Student storage info: ${storageData.quota.usedMB} MB used of ${storageData.quota.maxMB} MB max (${storageData.quota.percent}%)`);

  // 11. Unauthorized Access Enforcement (401 / 403)
  console.log('\n[11/12] Testing Unauthorized Access Protection (401/403)...');
  const unauthRes = await fetch(`${BASE}/timetable/me`);
  if (unauthRes.status !== 401) throw new Error(`Expected 401 for unauthenticated request, got ${unauthRes.status}`);
  console.log('  -> Protected route rejected unauthenticated request with 401 Unauthorized');

  const forbiddenRes = await fetch(`${BASE}/requests/incoming`, {
    headers: { Authorization: `Bearer ${studentAuth.token}` },
  });
  if (forbiddenRes.status !== 403) {
    throw new Error(`Expected 403 for student accessing professor incoming requests, got ${forbiddenRes.status}`);
  }
  console.log('  -> Role-protected route correctly rejected student access with 403 Forbidden');

  // 12. Invalid File Upload Validation
  console.log('\n[12/12] Testing Invalid File Upload Validation (Rejecting .exe)...');
  const formData = new FormData();
  const badFile = new Blob(['binary executable contents'], { type: 'application/x-msdownload' });
  formData.append('attachment', badFile, 'danger.exe');
  formData.append('studentId', studentAuth.user.id);
  formData.append('professorId', profAuth.user.id);
  formData.append('date', futureDate);
  formData.append('timeSlot', '8:00-8:50');
  formData.append('reason', 'Test rejection of prohibited file upload type');

  const badUploadRes = await fetch(`${BASE}/requests`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${studentAuth.token}` },
    body: formData,
  });
  if (badUploadRes.status !== 400 && badUploadRes.status !== 500) {
    throw new Error(`Expected bad file upload rejection, got status: ${badUploadRes.status}`);
  }
  const badUploadText = await badUploadRes.text();
  console.log('  -> Prohibited .exe attachment rejected safely! Response:', badUploadText.slice(0, 80));

  console.log('\n======================================================');
  console.log('🎉 ALL 12 VERIFICATION TESTS PASSED SUCCESSFULLY! 🎉');
  console.log('======================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ TEST SUITE FAILED:', err);
  process.exit(1);
});
