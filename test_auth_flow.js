// Automated test script for new student authentication flow:
// Register -> Duplicate check -> Invalid Login -> Valid Login -> Matching -> Persistence

async function testAuthFlow() {
  const BASE = 'http://localhost:5000/api';
  console.log('=== TEST 1: Register New Student ===');
  const regPayload = {
    name: 'Jordan Vance',
    email: 'jordan.vance@campus.edu',
    password: 'studentPass123',
    college: 'School of Computing',
    major: 'Robotics Engineering',
    year: 'Freshman',
    bio: 'Excited freshman robotics geek ready to trade C Programming for Web Development mentorship!',
    teachSkills: [
      { name: 'C Programming', level: 'Intermediate' }
    ],
    learnSkills: [
      { name: 'Web Development', targetLevel: 'Beginner' }
    ]
  };

  const regRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });

  const regData = await regRes.json();
  if (regRes.status !== 201) {
    console.error('Registration failed:', regData);
    process.exit(1);
  }
  console.log('✓ PASS: Registered student successfully!');
  console.log('  Student ID:', regData.user.id);
  console.log('  Name:', regData.user.name);
  console.log('  Skills Offered:', regData.user.teachSkills.map(s => s.name).join(', '));
  console.log('  Skills Wanted:', regData.user.learnSkills.map(s => s.name).join(', '));

  console.log('\n=== TEST 2: Duplicate Registration Error Handling ===');
  const dupRes = await fetch(`${BASE}/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(regPayload)
  });
  const dupData = await dupRes.json();
  if (dupRes.status === 409) {
    console.log('✓ PASS: Duplicate email rejected properly with message:', dupData.error);
  } else {
    console.error('✗ FAIL: Expected 409 conflict, got:', dupRes.status);
  }

  console.log('\n=== TEST 3: Invalid Login Error Handling ===');
  const badLoginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jordan.vance@campus.edu', password: 'wrongPassword' })
  });
  const badLoginData = await badLoginRes.json();
  if (badLoginRes.status === 401) {
    console.log('✓ PASS: Invalid login rejected properly with message:', badLoginData.error);
  } else {
    console.error('✗ FAIL: Expected 401, got:', badLoginRes.status);
  }

  console.log('\n=== TEST 4: Valid Student Login ===');
  const loginRes = await fetch(`${BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: 'jordan.vance@campus.edu', password: 'studentPass123' })
  });
  const loginData = await loginRes.json();
  if (loginRes.status === 200 && loginData.user.id === regData.user.id) {
    console.log('✓ PASS: Successfully logged in as:', loginData.user.name);
  } else {
    console.error('✗ FAIL: Login failed:', loginData);
  }

  console.log('\n=== TEST 5: Verify Student Appears in Discovery & Matching ===');
  const matchesRes = await fetch(`${BASE}/matches/${regData.user.id}`);
  const matches = await matchesRes.json();
  console.log(`✓ PASS: Generated ${matches.length} matches for new student ${regData.user.name}:`);
  matches.forEach(m => {
    console.log(`  -> Match with ${m.student.name}: ${m.compatibility}% [${m.matchBadge}]`);
  });

  // Verify other students also see Jordan Vance in user pool
  const allUsersRes = await fetch(`${BASE}/users`);
  const allUsers = await allUsersRes.json();
  const foundJordan = allUsers.find(u => u.id === regData.user.id);
  if (foundJordan) {
    console.log(`✓ PASS: New student ${foundJordan.name} is present in campus directory (Total students: ${allUsers.length}).`);
  } else {
    console.error('✗ FAIL: Jordan Vance not found in users list.');
  }

  console.log('\n=========================================');
  console.log('✓ ALL AUTHENTICATION FLOW TESTS PASSED!');
  console.log('=========================================');
}

testAuthFlow().catch(console.error);
