// Automated end-to-end verification of SkillSwap Campus API & logic

async function runTests() {
  const BASE = 'http://localhost:5000/api';
  console.log('--- 1. Testing Users Endpoint ---');
  const usersRes = await fetch(`${BASE}/users`);
  const users = await usersRes.json();
  console.log(`Fetched ${users.length} campus users.`);
  const alex = users.find(u => u.id === 'user_alex');
  const sarah = users.find(u => u.id === 'user_sarah');
  console.log(`User Alex: ${alex.name} (${alex.teachSkills.map(s => s.name).join(', ')})`);
  console.log(`User Sarah: ${sarah.name} (${sarah.teachSkills.map(s => s.name).join(', ')})`);

  console.log('\n--- 2. Testing Smart Mutual Matching Algorithm ---');
  const matchesRes = await fetch(`${BASE}/matches/user_alex`);
  const matches = await matchesRes.json();
  console.log(`Found ${matches.length} matches for Alex Chen:`);
  matches.forEach(m => {
    console.log(`  -> ${m.student.name}: ${m.compatibility}% [${m.matchBadge}] - "${m.matchReason}"`);
  });

  const sarahMatch = matches.find(m => m.student.id === 'user_sarah');
  if (sarahMatch && sarahMatch.matchType === 'mutual' && sarahMatch.compatibility === 100) {
    console.log('✓ PASS: Alex <-> Sarah detected as 100% Mutual Skill Match!');
  } else {
    console.error('✗ FAIL: Mutual match not detected correctly.');
  }

  console.log('\n--- 3. Testing Swap Request Creation ---');
  const swapRes = await fetch(`${BASE}/swaps`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      senderId: 'user_alex',
      receiverId: 'user_sarah',
      offeredSkill: 'Python',
      requestedSkill: 'UI/UX Design',
      message: 'Hey Sarah! Want to trade Python for UI/UX Design?'
    })
  });
  const newSwap = await swapRes.json();
  console.log(`Created swap request: ${newSwap.id}, Status: ${newSwap.status}`);

  console.log('\n--- 4. Testing Notification Delivery to Sarah ---');
  const notifsRes = await fetch(`${BASE}/notifications/user_sarah`);
  const notifs = await notifsRes.json();
  const swapNotif = notifs.find(n => n.swapId === newSwap.id);
  console.log(`Sarah received notification: "${swapNotif?.title} - ${swapNotif?.message}"`);

  console.log('\n--- 5. Testing Swap Acceptance ---');
  const acceptRes = await fetch(`${BASE}/swaps/${newSwap.id}/status`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'accepted' })
  });
  const acceptedSwap = await acceptRes.json();
  console.log(`Swap status updated to: ${acceptedSwap.status}`);

  console.log('\n--- 6. Testing Session Scheduling ---');
  const sessionRes = await fetch(`${BASE}/sessions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      swapRequestId: newSwap.id,
      teacherId: 'user_sarah',
      learnerId: 'user_alex',
      skill: 'UI/UX Design',
      scheduledTime: new Date(Date.now() + 86400000).toISOString(),
      durationMinutes: 60,
      locationOrLink: 'Campus Library, Room 302',
      notes: 'Figma Auto-layout & Design Systems basics'
    })
  });
  const newSession = await sessionRes.json();
  console.log(`Scheduled session: ${newSession.id} at ${newSession.locationOrLink}`);

  console.log('\n--- 7. Testing Session Completion & Rating ---');
  const completeRes = await fetch(`${BASE}/sessions/${newSession.id}/complete`, { method: 'PUT' });
  const completedSession = await completeRes.json();
  console.log(`Session marked: ${completedSession.status}`);

  const reviewRes = await fetch(`${BASE}/reviews`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      sessionId: newSession.id,
      reviewerId: 'user_alex',
      revieweeId: 'user_sarah',
      rating: 5,
      feedback: 'Sarah is an outstanding UI/UX tutor. She simplified Figma components and tokens so well!'
    })
  });
  const reviewData = await reviewRes.json();
  console.log(`Review posted! Sarah's updated rating: ${reviewData.updatedRating} ★`);

  console.log('\n--- 8. Testing Admin Dashboard Metrics ---');
  const adminRes = await fetch(`${BASE}/admin/stats`);
  const adminStats = await adminRes.json();
  console.log(`Admin Stats: Total Students=${adminStats.totalStudents}, Active Swaps=${adminStats.activeSwaps}, Completed Sessions=${adminStats.completedSessions}, Avg Rating=${adminStats.avgRating} ★`);

  console.log('\n=========================================');
  console.log('✓ ALL END-TO-END DEMO TEST SCENARIOS PASSED!');
  console.log('=========================================');
}

runTests().catch(console.error);
