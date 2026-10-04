import 'dotenv/config';
import mysql from 'mysql2/promise';
import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import {
  INITIAL_SKILLS,
  INITIAL_USERS,
  INITIAL_SWAPS,
  INITIAL_SESSIONS,
  INITIAL_REVIEWS,
  INITIAL_NOTIFICATIONS
} from './seedData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DB_FILE = path.join(__dirname, 'db.json');

const app = express();
const PORT = process.env.PORT || 5000;
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: Number(process.env.DB_PORT) || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

app.use(cors());
app.use(express.json());

// In-memory + persistent JSON database
let db = {
  skills: [],
  users: [],
  swaps: [],
  sessions: [],
  reviews: [],
  notifications: []
};

function loadDatabase() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const raw = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(raw);
      console.log('Loaded database from db.json');
    } else {
      resetDatabase();
    }
  } catch (err) {
    console.error('Error reading db.json, resetting to seed data:', err);
    resetDatabase();
  }
}

function saveDatabase() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
  } catch (err) {
    console.error('Failed to save to db.json:', err);
  }
}

function resetDatabase() {
  db = {
    skills: JSON.parse(JSON.stringify(INITIAL_SKILLS)),
    users: JSON.parse(JSON.stringify(INITIAL_USERS)),
    swaps: JSON.parse(JSON.stringify(INITIAL_SWAPS)),
    sessions: JSON.parse(JSON.stringify(INITIAL_SESSIONS)),
    reviews: JSON.parse(JSON.stringify(INITIAL_REVIEWS)),
    notifications: JSON.parse(JSON.stringify(INITIAL_NOTIFICATIONS))
  };
  saveDatabase();
  console.log('Database initialized with seed data.');
}

loadDatabase();

// Helper: Calculate Match details
function computeMatch(currentUser, otherUser) {
  const userTeach = (currentUser.teachSkills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
  const userLearn = (currentUser.learnSkills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());

  const otherTeach = (otherUser.teachSkills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());
  const otherLearn = (otherUser.learnSkills || []).map(s => (typeof s === 'string' ? s : s.name).toLowerCase());

  const theyTeachYou = (otherUser.teachSkills || []).filter(s => {
    const sName = (typeof s === 'string' ? s : s.name).toLowerCase();
    return userLearn.includes(sName);
  });

  const youTeachThem = (currentUser.teachSkills || []).filter(s => {
    const sName = (typeof s === 'string' ? s : s.name).toLowerCase();
    return otherLearn.includes(sName);
  });

  const isMutual = theyTeachYou.length > 0 && youTeachThem.length > 0;
  const isOneWayTeach = theyTeachYou.length > 0;
  const isOneWayLearn = youTeachThem.length > 0;

  let compatibility = 30;
  let matchType = 'explore';
  let matchBadge = 'Campus Peer';
  let matchReason = 'Explore common passions and cross-discipline collaboration.';

  if (isMutual) {
    compatibility = 100;
    matchType = 'mutual';
    matchBadge = '100% Mutual Skill Match';
    const teachNames = youTeachThem.map(s => typeof s === 'string' ? s : s.name).join(', ');
    const learnNames = theyTeachYou.map(s => typeof s === 'string' ? s : s.name).join(', ');
    matchReason = `Direct reciprocal swap! You teach ${teachNames} which they want, and they teach ${learnNames} which you want.`;
  } else if (isOneWayTeach) {
    compatibility = 75;
    matchType = 'can_teach_you';
    matchBadge = 'Can Teach You';
    const learnNames = theyTeachYou.map(s => typeof s === 'string' ? s : s.name).join(', ');
    matchReason = `They can teach you ${learnNames}. You can offer skills like ${(currentUser.teachSkills || []).map(s => typeof s === 'string' ? s : s.name).slice(0, 2).join(', ')}.`;
  } else if (isOneWayLearn) {
    compatibility = 65;
    matchType = 'wants_your_skill';
    matchBadge = 'Wants Your Skill';
    const teachNames = youTeachThem.map(s => typeof s === 'string' ? s : s.name).join(', ');
    matchReason = `They want to learn ${teachNames} from you. You can exchange for any of their offered skills.`;
  }

  return {
    compatibility,
    matchType,
    matchBadge,
    matchReason,
    theyTeachYou,
    youTeachThem
  };
}

// ---------------- API ROUTES ----------------

// GET Skills list
app.get('/api/skills', async (req, res) => {
  try {
    const [skills] = await pool.query(
      'SELECT id, name, category, icon FROM skills ORDER BY name'
    );

    res.json(skills);
  } catch (error) {
    console.error('Error fetching skills:', error);
    res.status(500).json({ error: 'Failed to fetch skills.' });
  }
});

// Helper: Attach skills from MySQL to user objects
async function attachSkillsToUsers(users, dbConn = pool) {
  if (!users || users.length === 0) return users;

  const [teachRows] = await dbConn.query(`
    SELECT DISTINCT
      uts.user_id,
      s.name,
      uts.level,
      uts.experience
    FROM user_teach_skills uts
    JOIN skills s ON uts.skill_id = s.id
  `);

  const [learnRows] = await dbConn.query(`
    SELECT DISTINCT
      uls.user_id,
      s.name,
      uls.target_level,
      uls.reason
    FROM user_learn_skills uls
    JOIN skills s ON uls.skill_id = s.id
  `);

  return users.map(user => ({
    ...user,
    teachSkills: teachRows
      .filter(skill => skill.user_id === user.id)
      .map(skill => ({
        name: skill.name,
        level: skill.level,
        experience: skill.experience
      })),
    learnSkills: learnRows
      .filter(skill => skill.user_id === user.id)
      .map(skill => ({
        name: skill.name,
        targetLevel: skill.target_level,
        reason: skill.reason
      }))
  }));
}

// GET All Users
app.get('/api/users', async (req, res) => {
  try {
    const [users] = await pool.query(`
      SELECT
        id,
        name,
        email,
        college,
        major,
        year,
        avatar,
        bio,
        rating,
        review_count AS reviewCount,
        availability,
        created_at AS createdAt
      FROM users
      ORDER BY name
    `);

    const usersWithSkills = await attachSkillsToUsers(users);
    res.json(usersWithSkills);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users.' });
  }
});

// GET Single User
app.get('/api/users/:id', async (req, res) => {
  try {
    const [users] = await pool.query(
      `SELECT
        id,
        name,
        email,
        college,
        major,
        year,
        avatar,
        bio,
        rating,
        review_count AS reviewCount,
        availability,
        created_at AS createdAt
       FROM users
       WHERE id = ?`,
      [req.params.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const [userWithSkills] = await attachSkillsToUsers(users);
    res.json(userWithSkills);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ error: 'Failed to fetch user.' });
  }
});

// UPDATE User Profile
// UPDATE User Profile
app.put('/api/users/:id', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.params.id;

    const [users] = await connection.query(
      'SELECT id FROM users WHERE id = ?',
      [userId]
    );

    if (users.length === 0) {
      connection.release();
      return res.status(404).json({ error: 'User not found' });
    }

    const {
      name,
      bio,
      college,
      major,
      year,
      availability,
      avatar,
      teachSkills,
      learnSkills
    } = req.body;

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push('name = ?');
      values.push(name);
    }

    if (bio !== undefined) {
      updates.push('bio = ?');
      values.push(bio);
    }

    if (college !== undefined) {
      updates.push('college = ?');
      values.push(college);
    }

    if (major !== undefined) {
      updates.push('major = ?');
      values.push(major);
    }

    if (year !== undefined) {
      updates.push('year = ?');
      values.push(year);
    }

    if (availability !== undefined) {
      updates.push('availability = ?');
      values.push(availability);
    }

    if (avatar !== undefined) {
      updates.push('avatar = ?');
      values.push(avatar);
    }

    if (updates.length > 0) {
      values.push(userId);

      await connection.query(
        `UPDATE users SET ${updates.join(', ')} WHERE id = ?`,
        values
      );
    }

    if (teachSkills !== undefined) {
      await connection.query(
        'DELETE FROM user_teach_skills WHERE user_id = ?',
        [userId]
      );

      for (const skill of teachSkills) {
        const skillName = typeof skill === 'string' ? skill : skill.name;

        if (!skillName) continue;

        const [skillRows] = await connection.query(
          'SELECT id FROM skills WHERE name = ?',
          [skillName]
        );

        if (skillRows.length > 0) {
          await connection.query(
            `INSERT INTO user_teach_skills
             (user_id, skill_id, level, experience)
             VALUES (?, ?, ?, ?)`,
            [
              userId,
              skillRows[0].id,
              typeof skill === 'object' ? skill.level || null : null,
              typeof skill === 'object' ? skill.experience || null : null
            ]
          );
        }
      }
    }

    if (learnSkills !== undefined) {
      await connection.query(
        'DELETE FROM user_learn_skills WHERE user_id = ?',
        [userId]
      );

      for (const skill of learnSkills) {
        const skillName = typeof skill === 'string' ? skill : skill.name;

        if (!skillName) continue;

        const [skillRows] = await connection.query(
          'SELECT id FROM skills WHERE name = ?',
          [skillName]
        );

        if (skillRows.length > 0) {
          await connection.query(
            `INSERT INTO user_learn_skills
             (user_id, skill_id, target_level, reason)
             VALUES (?, ?, ?, ?)`,
            [
              userId,
              skillRows[0].id,
              typeof skill === 'object' ? skill.targetLevel || skill.level || null : null,
              typeof skill === 'object' ? skill.reason || null : null
            ]
          );
        }
      }
    }

    const [updatedUsers] = await connection.query(
      `SELECT
        id,
        name,
        email,
        college,
        major,
        year,
        avatar,
        bio,
        rating,
        review_count AS reviewCount,
        availability,
        created_at AS createdAt
       FROM users
       WHERE id = ?`,
      [userId]
    );

    const [userWithSkills] = await attachSkillsToUsers(updatedUsers, connection);

    connection.release();

    res.json(userWithSkills);

  } catch (error) {
    connection.release();
    console.error('Error updating user:', error);
    res.status(500).json({ error: 'Failed to update user profile.' });
  }
});

// AUTH: Register
// AUTH: Register
app.post('/api/auth/register', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      name,
      email,
      password,
      college,
      major,
      year,
      bio,
      teachSkills,
      learnSkills
    } = req.body;

    if (!name || !email || !password) {
      connection.release();
      return res.status(400).json({
        error: 'Name, email, and password are required.'
      });
    }

    const [existingUsers] = await connection.query(
      'SELECT id FROM users WHERE LOWER(email) = LOWER(?)',
      [email]
    );

    if (existingUsers.length > 0) {
      connection.release();
      return res.status(409).json({
        error: 'An account with this email already exists.'
      });
    }

    const userId = 'user_' + Date.now();
    const now = new Date();

    const avatar =
      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80';

    await connection.query(
      `INSERT INTO users
       (id, name, email, password, college, major, year, avatar, bio,
        rating, review_count, availability, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        userId,
        name,
        email,
        password,
        college || 'Campus General',
        major || 'Undeclared',
        year || 'Freshman',
        avatar,
        bio || 'Excited to learn new skills and share what I know with fellow campus peers!',
        5.0,
        0,
        'Flexible weekends & evenings',
        now
      ]
    );

    // Save teaching skills
    if (Array.isArray(teachSkills)) {
      for (const skill of teachSkills) {
        const skillName = typeof skill === 'string' ? skill : skill.name;

        if (!skillName) continue;

        const [skillRows] = await connection.query(
          'SELECT id FROM skills WHERE name = ?',
          [skillName]
        );

        if (skillRows.length > 0) {
          await connection.query(
            `INSERT INTO user_teach_skills
             (user_id, skill_id, level, experience)
             VALUES (?, ?, ?, ?)`,
            [
              userId,
              skillRows[0].id,
              typeof skill === 'object' ? skill.level || null : null,
              typeof skill === 'object' ? skill.experience || null : null
            ]
          );
        }
      }
    }

    // Save learning skills
    if (Array.isArray(learnSkills)) {
      for (const skill of learnSkills) {
        const skillName = typeof skill === 'string' ? skill : skill.name;

        if (!skillName) continue;

        const [skillRows] = await connection.query(
          'SELECT id FROM skills WHERE name = ?',
          [skillName]
        );

        if (skillRows.length > 0) {
          await connection.query(
            `INSERT INTO user_learn_skills
             (user_id, skill_id, target_level, reason)
             VALUES (?, ?, ?, ?)`,
            [
              userId,
              skillRows[0].id,
              typeof skill === 'object'
                ? skill.targetLevel || skill.level || null
                : null,
              typeof skill === 'object' ? skill.reason || null : null
            ]
          );
        }
      }
    }

    // Welcome notification
    await connection.query(
      `INSERT INTO notifications
       (id, user_id, type, title, message, \`read\`, created_at)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'notif_' + Date.now(),
        userId,
        'welcome',
        'Welcome to SkillSwap Campus!',
        'Start by exploring campus peers or proposing your first skill swap.',
        false,
        now
      ]
    );

    const [newUsers] = await connection.query(
      `SELECT
        id,
        name,
        email,
        college,
        major,
        year,
        avatar,
        bio,
        rating,
        review_count AS reviewCount,
        availability,
        created_at AS createdAt
       FROM users
       WHERE id = ?`,
      [userId]
    );

    const [userWithSkills] = await attachSkillsToUsers(newUsers, connection);

    connection.release();

    res.status(201).json({
      user: userWithSkills,
      token: 'demo_token_' + userId
    });

  } catch (error) {
    connection.release();
    console.error('Error registering user:', error);
    res.status(500).json({
      error: 'Failed to create account.'
    });
  }
});

// AUTH: Login
// AUTH: Login
app.post('/api/auth/login', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { email, password } = req.body;

    if (!email || !password) {
      connection.release();
      return res.status(400).json({
        error: 'Please enter both email and password.'
      });
    }

    const [users] = await connection.query(
      `SELECT
        id,
        name,
        email,
        password,
        college,
        major,
        year,
        avatar,
        bio,
        rating,
        review_count AS reviewCount,
        availability,
        created_at AS createdAt
       FROM users
       WHERE LOWER(email) = LOWER(?)`,
      [email]
    );

    if (users.length === 0 || users[0].password !== password) {
      connection.release();
      return res.status(401).json({
        error: 'Invalid email or password.'
      });
    }

    const user = users[0];

    const { password: pw, ...safeUser } = user;
    const [userWithSkills] = await attachSkillsToUsers([safeUser], connection);

    connection.release();

    res.json({
      user: userWithSkills,
      token: 'demo_token_' + user.id
    });

  } catch (error) {
    connection.release();
    console.error('Error logging in:', error);

    res.status(500).json({
      error: 'Failed to login.'
    });
  }
});

// GET Smart Matches for a student
// GET Smart Matches for a student
app.get('/api/matches/:userId', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.params.userId;

    // Get all users
    const [users] = await connection.query(`
      SELECT
        id,
        name,
        email,
        college,
        major,
        year,
        avatar,
        bio,
        rating,
        review_count AS reviewCount,
        availability,
        created_at AS createdAt
      FROM users
    `);

    // Get teaching skills
    const [teachRows] = await connection.query(`
      SELECT
        uts.user_id,
        s.name,
        uts.level,
        uts.experience
      FROM user_teach_skills uts
      JOIN skills s ON uts.skill_id = s.id
    `);

    // Get learning skills
    const [learnRows] = await connection.query(`
      SELECT
        uls.user_id,
        s.name,
        uls.target_level,
        uls.reason
      FROM user_learn_skills uls
      JOIN skills s ON uls.skill_id = s.id
    `);

    // Add skills to each user
    const usersWithSkills = users.map(user => ({
      ...user,

      teachSkills: teachRows
        .filter(skill => skill.user_id === user.id)
        .map(skill => ({
          name: skill.name,
          level: skill.level,
          experience: skill.experience
        })),

      learnSkills: learnRows
        .filter(skill => skill.user_id === user.id)
        .map(skill => ({
          name: skill.name,
          targetLevel: skill.target_level,
          reason: skill.reason
        }))
    }));

    const currentUser = usersWithSkills.find(
      user => user.id === userId
    );

    if (!currentUser) {
      connection.release();
      return res.status(404).json({
        error: 'User not found'
      });
    }

    const otherUsers = usersWithSkills.filter(
      user => user.id !== currentUser.id
    );

    const matched = otherUsers.map(other => {
      const matchData = computeMatch(currentUser, other);

      const {
        password,
        ...safeOther
      } = other;

      return {
        student: safeOther,
        ...matchData
      };
    });

    // Sort:
    // 1. Highest compatibility
    // 2. Highest rating
    matched.sort((a, b) => {
      if (b.compatibility !== a.compatibility) {
        return b.compatibility - a.compatibility;
      }

      return (b.student.rating || 0) - (a.student.rating || 0);
    });

    connection.release();

    res.json(matched);

  } catch (error) {
    connection.release();

    console.error('Error fetching matches:', error);

    res.status(500).json({
      error: 'Failed to fetch matches.'
    });
  }
});


// GET Swap Requests
app.get('/api/swaps', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { userId, status } = req.query;

    let query = `
      SELECT
        sw.id,
        sw.sender_id AS senderId,
        sw.receiver_id AS receiverId,
        sw.offered_skill_id AS offeredSkillId,
        sw.requested_skill_id AS requestedSkillId,
        sw.message,
        sw.status,
        sw.created_at AS createdAt,

        sender.name AS senderName,
        sender.avatar AS senderAvatar,
        sender.major AS senderMajor,

        receiver.name AS receiverName,
        receiver.avatar AS receiverAvatar,
        receiver.major AS receiverMajor,

        offeredSkill.name AS offeredSkill,
        requestedSkill.name AS requestedSkill

      FROM swaps sw

      JOIN users sender
        ON sw.sender_id = sender.id

      JOIN users receiver
        ON sw.receiver_id = receiver.id

      JOIN skills offeredSkill
        ON sw.offered_skill_id = offeredSkill.id

      JOIN skills requestedSkill
        ON sw.requested_skill_id = requestedSkill.id

      WHERE 1 = 1
    `;

    const params = [];

    if (userId) {
      query += `
        AND (sw.sender_id = ? OR sw.receiver_id = ?)
      `;
      params.push(userId, userId);
    }

    if (status) {
      query += `
        AND sw.status = ?
      `;
      params.push(status);
    }

    query += `
      ORDER BY sw.created_at DESC
    `;

    const [swaps] = await connection.query(query, params);

    const hydrated = swaps.map(swap => ({
      id: swap.id,
      senderId: swap.senderId,
      receiverId: swap.receiverId,
      offeredSkillId: swap.offeredSkillId,
      requestedSkillId: swap.requestedSkillId,
      offeredSkill: swap.offeredSkill,
      requestedSkill: swap.requestedSkill,
      message: swap.message,
      status: swap.status,
      createdAt: swap.createdAt,

      sender: {
        id: swap.senderId,
        name: swap.senderName,
        avatar: swap.senderAvatar,
        major: swap.senderMajor
      },

      receiver: {
        id: swap.receiverId,
        name: swap.receiverName,
        avatar: swap.receiverAvatar,
        major: swap.receiverMajor
      }
    }));

    connection.release();

    res.json(hydrated);

  } catch (error) {
    connection.release();

    console.error('Error fetching swap requests:', error);

    res.status(500).json({
      error: 'Failed to fetch swap requests.'
    });
  }
});

// CREATE Swap Request
// CREATE Swap Request
app.post('/api/swaps', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      senderId,
      receiverId,
      offeredSkill,
      requestedSkill,
      message
    } = req.body;

    if (!senderId || !receiverId || !offeredSkill || !requestedSkill) {
      connection.release();
      return res.status(400).json({
        error: 'Missing required swap request fields.'
      });
    }

    if (senderId === receiverId) {
      connection.release();
      return res.status(400).json({
        error: 'You cannot request a skill swap with yourself.'
      });
    }

    // Check that sender and receiver exist
    const [users] = await connection.query(
      'SELECT id, name FROM users WHERE id IN (?, ?)',
      [senderId, receiverId]
    );

    if (users.length < 2) {
      connection.release();
      return res.status(404).json({
        error: 'Sender or receiver not found.'
      });
    }

    // Check for active existing pending swap
    const [existing] = await connection.query(
      `SELECT id
       FROM swaps
       WHERE sender_id = ?
         AND receiver_id = ?
         AND status = 'pending'
       LIMIT 1`,
      [senderId, receiverId]
    );

    if (existing.length > 0) {
      connection.release();
      return res.status(409).json({
        error: 'You already have a pending swap request with this student.'
      });
    }

    // Find offered skill
    const [offeredSkillRows] = await connection.query(
      'SELECT id, name FROM skills WHERE LOWER(name) = LOWER(?)',
      [offeredSkill]
    );

    // Find requested skill
    const [requestedSkillRows] = await connection.query(
      'SELECT id, name FROM skills WHERE LOWER(name) = LOWER(?)',
      [requestedSkill]
    );

    if (offeredSkillRows.length === 0) {
      connection.release();
      return res.status(400).json({
        error: `Offered skill "${offeredSkill}" was not found.`
      });
    }

    if (requestedSkillRows.length === 0) {
      connection.release();
      return res.status(400).json({
        error: `Requested skill "${requestedSkill}" was not found.`
      });
    }

    const offeredSkillId = offeredSkillRows[0].id;
    const requestedSkillId = requestedSkillRows[0].id;

    const newSwapId = 'swap_' + Date.now();
    const now = new Date();

    const sender = users.find(user => user.id === senderId);

    const swapMessage =
      message ||
      `Hi! I would love to swap my skill in ${offeredSkill} for your mentorship in ${requestedSkill}!`;

    // Create swap request
    await connection.query(
      `INSERT INTO swaps
       (
         id,
         sender_id,
         receiver_id,
         offered_skill_id,
         requested_skill_id,
         message,
         status,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        newSwapId,
        senderId,
        receiverId,
        offeredSkillId,
        requestedSkillId,
        swapMessage,
        'pending',
        now
      ]
    );

    // Notify receiver
    await connection.query(
      `INSERT INTO notifications
       (
         id,
         user_id,
         type,
         title,
         message,
         \`read\`,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'notif_' + Date.now(),
        receiverId,
        'request_received',
        'New Skill Swap Proposal!',
        `${sender ? sender.name : 'A student'} proposed swapping ${offeredSkill} for ${requestedSkill}.`,
        false,
        now
      ]
    );

    connection.release();

    // Return the same general format expected by the frontend
    const newSwap = {
      id: newSwapId,
      senderId,
      receiverId,
      offeredSkill,
      requestedSkill,
      message: swapMessage,
      status: 'pending',
      createdAt: now.toISOString()
    };

    res.status(201).json(newSwap);

  } catch (error) {
    connection.release();

    console.error('Error creating swap request:', error);

    res.status(500).json({
      error: 'Failed to create swap request.'
    });
  }
});

// UPDATE Swap Request Status
app.put('/api/swaps/:id/status', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const swapId = req.params.id;
    const { status } = req.body;

    const allowedStatuses = ['pending', 'accepted', 'rejected', 'completed'];

    if (!status || !allowedStatuses.includes(status)) {
      connection.release();
      return res.status(400).json({
        error: 'Invalid swap status.'
      });
    }

    // Check if swap exists
    const [swaps] = await connection.query(
      `SELECT
        sw.id,
        sw.sender_id AS senderId,
        sw.receiver_id AS receiverId,
        sw.offered_skill_id AS offeredSkillId,
        sw.requested_skill_id AS requestedSkillId,
        sw.message,
        sw.status,
        sw.created_at AS createdAt
       FROM swaps sw
       WHERE sw.id = ?`,
      [swapId]
    );

    if (swaps.length === 0) {
      connection.release();
      return res.status(404).json({
        error: 'Swap request not found.'
      });
    }

    const swap = swaps[0];

    // Update status
    await connection.query(
      `UPDATE swaps
       SET status = ?
       WHERE id = ?`,
      [status, swapId]
    );

    // Find names and skill names for notification
    const [details] = await connection.query(
      `SELECT
        sender.name AS senderName,
        receiver.name AS receiverName,
        offeredSkill.name AS offeredSkill,
        requestedSkill.name AS requestedSkill
       FROM swaps sw
       JOIN users sender
         ON sw.sender_id = sender.id
       JOIN users receiver
         ON sw.receiver_id = receiver.id
       JOIN skills offeredSkill
         ON sw.offered_skill_id = offeredSkill.id
       JOIN skills requestedSkill
         ON sw.requested_skill_id = requestedSkill.id
       WHERE sw.id = ?`,
      [swapId]
    );

    const detail = details[0];

    // Notify the other participant
    const notificationUserId =
      status === 'accepted' || status === 'rejected'
        ? swap.senderId
        : swap.receiverId;

    let title = 'Swap Request Updated';
    let notificationMessage = `Your skill swap request status is now ${status}.`;

    if (status === 'accepted') {
      title = 'Swap Request Accepted! 🎉';
      notificationMessage =
        `${detail.receiverName} accepted your swap request for ${detail.offeredSkill} and ${detail.requestedSkill}.`;
    } else if (status === 'rejected') {
      title = 'Swap Request Declined';
      notificationMessage =
        `${detail.receiverName} declined your skill swap request.`;
    } else if (status === 'completed') {
      title = 'Skill Swap Completed! 🎓';
      notificationMessage =
        `Your skill swap between ${detail.offeredSkill} and ${detail.requestedSkill} has been completed.`;
    }

    await connection.query(
      `INSERT INTO notifications
       (
         id,
         user_id,
         type,
         title,
         message,
         \`read\`,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'notif_' + Date.now(),
        notificationUserId,
        `swap_${status}`,
        title,
        notificationMessage,
        false,
        new Date()
      ]
    );

    connection.release();

    res.json({
      ...swap,
      status
    });

  } catch (error) {
    connection.release();

    console.error('Error updating swap status:', error);

    res.status(500).json({
      error: 'Failed to update swap request status.'
    });
  }
});

// GET Sessions
// GET Sessions
app.get('/api/sessions', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const { userId, status } = req.query;

    let query = `
      SELECT
        s.id,
        s.swap_id AS swapRequestId,
        s.teacher_id AS teacherId,
        s.learner_id AS learnerId,
        s.skill_id AS skillId,
        s.scheduled_time AS scheduledTime,
        s.duration_minutes AS durationMinutes,
        s.location_or_link AS locationOrLink,
        s.status,
        s.notes,

        teacher.name AS teacherName,
        teacher.avatar AS teacherAvatar,

        learner.name AS learnerName,
        learner.avatar AS learnerAvatar,

        skill.name AS skillName

      FROM sessions s

      JOIN users teacher
        ON s.teacher_id = teacher.id

      JOIN users learner
        ON s.learner_id = learner.id

      JOIN skills skill
        ON s.skill_id = skill.id

      WHERE 1 = 1
    `;

    const params = [];

    if (userId) {
      query += `
        AND (s.teacher_id = ? OR s.learner_id = ?)
      `;
      params.push(userId, userId);
    }

    if (status) {
      query += `
        AND s.status = ?
      `;
      params.push(status);
    }

    query += `
      ORDER BY s.scheduled_time DESC
    `;

    const [sessions] = await connection.query(query, params);

    // Check which sessions have already been reviewed
    const [reviews] = await connection.query(`
      SELECT session_id
      FROM reviews
    `);

    const reviewedSessionIds = new Set(
      reviews.map(review => review.session_id)
    );

    const hydrated = sessions.map(session => ({
      id: session.id,
      swapRequestId: session.swapRequestId,
      teacherId: session.teacherId,
      learnerId: session.learnerId,
      skill: session.skillName,
      scheduledTime: session.scheduledTime,
      durationMinutes: session.durationMinutes,
      locationOrLink: session.locationOrLink,
      status: session.status,
      notes: session.notes,

      teacher: {
        id: session.teacherId,
        name: session.teacherName,
        avatar: session.teacherAvatar
      },

      learner: {
        id: session.learnerId,
        name: session.learnerName,
        avatar: session.learnerAvatar
      },

      reviewed: reviewedSessionIds.has(session.id)
    }));

    connection.release();

    res.json(hydrated);

  } catch (error) {
    connection.release();

    console.error('Error fetching sessions:', error);

    res.status(500).json({
      error: 'Failed to fetch sessions.'
    });
  }
});

// CREATE Scheduled Session
// CREATE Scheduled Session
app.post('/api/sessions', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      swapRequestId,
      teacherId,
      learnerId,
      skill,
      scheduledTime,
      durationMinutes,
      locationOrLink,
      notes
    } = req.body;

    if (!teacherId || !learnerId || !skill || !scheduledTime) {
      connection.release();
      return res.status(400).json({
        error: 'Teacher, learner, skill, and scheduled time are required.'
      });
    }

    // Check teacher and learner
    const [users] = await connection.query(
      `SELECT id, name
       FROM users
       WHERE id IN (?, ?)`,
      [teacherId, learnerId]
    );

    if (users.length < 2) {
      connection.release();
      return res.status(404).json({
        error: 'Teacher or learner not found.'
      });
    }

    // Find skill
    const [skillRows] = await connection.query(
      `SELECT id, name
       FROM skills
       WHERE LOWER(name) = LOWER(?)`,
      [skill]
    );

    if (skillRows.length === 0) {
      connection.release();
      return res.status(400).json({
        error: `Skill "${skill}" was not found.`
      });
    }

    const skillId = skillRows[0].id;

    const sessionId = 'session_' + Date.now();
    const now = new Date();

    const newSession = {
      id: sessionId,
      swapRequestId: swapRequestId || null,
      teacherId,
      learnerId,
      skill,
      scheduledTime,
      durationMinutes: Number(durationMinutes) || 60,
      locationOrLink:
        locationOrLink || 'Campus Library / Discord / Meet',
      status: 'scheduled',
      notes: notes || ''
    };

    // Create session
    await connection.query(
      `INSERT INTO sessions
       (
         id,
         swap_id,
         teacher_id,
         learner_id,
         skill_id,
         scheduled_time,
         duration_minutes,
         location_or_link,
         status,
         notes
       )
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        sessionId,
        swapRequestId || null,
        teacherId,
        learnerId,
        skillId,
        scheduledTime,
        Number(durationMinutes) || 60,
        locationOrLink || 'Campus Library / Discord / Meet',
        'scheduled',
        notes || ''
      ]
    );

    // If tied to a swap request, mark it as accepted
    if (swapRequestId) {
      await connection.query(
        `UPDATE swaps
         SET status = 'accepted'
         WHERE id = ?`,
        [swapRequestId]
      );
    }

    // Find teacher name
    const teacher = users.find(user => user.id === teacherId);

    const formattedDate = new Date(scheduledTime).toLocaleString([], {
      dateStyle: 'medium',
      timeStyle: 'short'
    });

    // Notify learner
    await connection.query(
      `INSERT INTO notifications
       (
         id,
         user_id,
         type,
         title,
         message,
         \`read\`,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        'notif_' + Date.now() + '_1',
        learnerId,
        'session_scheduled',
        'New Session Scheduled 📅',
        `Learning session for ${skill} with ${teacher ? teacher.name : 'mentor'} confirmed for ${formattedDate}.`,
        false,
        now
      ]
    );

    connection.release();

    res.status(201).json(newSession);

  } catch (error) {
    connection.release();

    console.error('Error creating scheduled session:', error);

    res.status(500).json({
      error: 'Failed to create scheduled session.'
    });
  }
});

// COMPLETE Session
app.put('/api/sessions/:id/complete', (req, res) => {
  const session = db.sessions.find(s => s.id === req.params.id);
  if (!session) return res.status(404).json({ error: 'Session not found.' });

  session.status = 'completed';
  session.completedAt = new Date().toISOString();

  // If this session had a swap request, check if we should mark swap completed
  if (session.swapRequestId) {
    const sw = db.swaps.find(s => s.id === session.swapRequestId);
    if (sw) sw.status = 'completed';
  }

  // Prompt the learner to leave a review
  const teacher = db.users.find(u => u.id === session.teacherId);
  db.notifications.push({
    id: 'notif_' + Date.now(),
    userId: session.learnerId,
    type: 'leave_review',
    title: 'Session Completed! ⭐',
    message: `Your ${session.skill} session with ${teacher ? teacher.name : 'your mentor'} is complete. Leave a rating to help campus peers!`,
    sessionId: session.id,
    read: false,
    createdAt: new Date().toISOString()
  });

  saveDatabase();
  res.json(session);
});

// GET Reviews
app.get('/api/reviews', (req, res) => {
  const { revieweeId, reviewerId } = req.query;
  let results = [...db.reviews];

  if (revieweeId) results = results.filter(r => r.revieweeId === revieweeId);
  if (reviewerId) results = results.filter(r => r.reviewerId === reviewerId);

  const hydrated = results.map(rev => {
    const reviewer = db.users.find(u => u.id === rev.reviewerId);
    const reviewee = db.users.find(u => u.id === rev.revieweeId);
    const session = db.sessions.find(s => s.id === rev.sessionId);
    return {
      ...rev,
      reviewer: reviewer ? { id: reviewer.id, name: reviewer.name, avatar: reviewer.avatar, major: reviewer.major } : null,
      reviewee: reviewee ? { id: reviewee.id, name: reviewee.name, avatar: reviewee.avatar } : null,
      skill: session ? session.skill : 'Skill Mentoring'
    };
  });

  hydrated.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  res.json(hydrated);
});

// CREATE Review & Rating
// CREATE Review & Rating
app.post('/api/reviews', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const {
      sessionId,
      reviewerId,
      revieweeId,
      rating,
      feedback
    } = req.body;

    // Validate required fields
    if (!reviewerId || !revieweeId || !rating) {
      connection.release();

      return res.status(400).json({
        error: 'Reviewer, reviewee, and star rating are required.'
      });
    }

    // Session ID is required because reviews table has NOT NULL session_id
    if (!sessionId) {
      connection.release();

      return res.status(400).json({
        error: 'Session ID is required to submit a review.'
      });
    }

    const numRating = Math.max(
      1,
      Math.min(5, Number(rating))
    );

    // Check reviewer and reviewee exist
    const [users] = await connection.query(
      `SELECT id, name
       FROM users
       WHERE id IN (?, ?)`,
      [reviewerId, revieweeId]
    );

    if (users.length < 2) {
      connection.release();

      return res.status(404).json({
        error: 'Reviewer or reviewee not found.'
      });
    }

    // Check session exists
    const [sessions] = await connection.query(
      `SELECT id
       FROM sessions
       WHERE id = ?`,
      [sessionId]
    );

    if (sessions.length === 0) {
      connection.release();

      return res.status(404).json({
        error: 'Session not found.'
      });
    }

    // Prevent duplicate review for same session
    const [existingReviews] = await connection.query(
      `SELECT id
       FROM reviews
       WHERE session_id = ?
         AND reviewer_id = ?
       LIMIT 1`,
      [sessionId, reviewerId]
    );

    if (existingReviews.length > 0) {
      connection.release();

      return res.status(409).json({
        error: 'You have already reviewed this session.'
      });
    }

    const reviewId = 'rev_' + Date.now();
    const notificationId = 'notif_' + Date.now();

    const reviewFeedback =
      feedback ||
      'Great skill swap session! Very helpful and friendly peer mentor.';

    const now = new Date();

    // Insert review
    await connection.query(
      `INSERT INTO reviews
       (
         id,
         session_id,
         reviewer_id,
         reviewee_id,
         rating,
         feedback,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        reviewId,
        sessionId,
        reviewerId,
        revieweeId,
        numRating,
        reviewFeedback,
        now
      ]
    );

    // Calculate updated rating
    const [ratingResult] = await connection.query(
      `SELECT
         COUNT(*) AS reviewCount,
         AVG(rating) AS averageRating
       FROM reviews
       WHERE reviewee_id = ?`,
      [revieweeId]
    );

    const reviewCount = Number(ratingResult[0].reviewCount);

    const updatedRating = Number(
      Number(ratingResult[0].averageRating).toFixed(1)
    );

    // Update user's rating and review count
    await connection.query(
      `UPDATE users
       SET rating = ?,
           review_count = ?
       WHERE id = ?`,
      [
        updatedRating,
        reviewCount,
        revieweeId
      ]
    );

    // Find reviewer name
    const reviewer = users.find(
      user => user.id === reviewerId
    );

    // Create notification
    await connection.query(
      `INSERT INTO notifications
       (
         id,
         user_id,
         type,
         title,
         message,
         \`read\`,
         created_at
       )
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        notificationId,
        revieweeId,
        'review_received',
        `New ${numRating}-Star Review! ⭐`,
        `${reviewer ? reviewer.name : 'Your swap partner'} gave you a ${numRating}-star rating: "${reviewFeedback.slice(0, 50)}..."`,
        false,
        now
      ]
    );

    connection.release();

    // Return response
    const newReview = {
      id: reviewId,
      sessionId,
      reviewerId,
      revieweeId,
      rating: numRating,
      feedback: reviewFeedback,
      createdAt: now.toISOString()
    };

    res.status(201).json({
      review: newReview,
      updatedRating
    });

  } catch (error) {
    connection.release();

    console.error('Error creating review:', error);

    res.status(500).json({
      error: 'Failed to create review.'
    });
  }
});

// GET Notifications for user
// GET Notifications for user
app.get('/api/notifications/:userId', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.params.userId;

    const [notifications] = await connection.query(
      `SELECT
        id,
        user_id AS userId,
        type,
        title,
        message,
        \`read\`,
        created_at AS createdAt
       FROM notifications
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );

    connection.release();

    res.json(notifications);

  } catch (error) {
    connection.release();

    console.error('Error fetching notifications:', error);

    res.status(500).json({
      error: 'Failed to fetch notifications.'
    });
  }
});

// Mark Notification as read
// Mark Notification as read
app.put('/api/notifications/:id/read', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const notificationId = req.params.id;

    await connection.query(
      `UPDATE notifications
       SET \`read\` = TRUE
       WHERE id = ?`,
      [notificationId]
    );

    connection.release();

    res.json({
      success: true
    });

  } catch (error) {
    connection.release();

    console.error('Error marking notification as read:', error);

    res.status(500).json({
      error: 'Failed to mark notification as read.'
    });
  }
});

// Mark ALL Notifications as read
app.put('/api/notifications/:userId/read-all', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    const userId = req.params.userId;

    await connection.query(
      `UPDATE notifications
       SET \`read\` = TRUE
       WHERE user_id = ?`,
      [userId]
    );

    connection.release();

    res.json({
      success: true
    });

  } catch (error) {
    connection.release();

    console.error('Error marking all notifications as read:', error);

    res.status(500).json({
      error: 'Failed to mark all notifications as read.'
    });
  }
});

// ADMIN Stats
app.get('/api/admin/stats', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    // Total students
    const [studentResult] = await connection.query(
      `SELECT COUNT(*) AS totalStudents
       FROM users`
    );

    // Total unique skills
    const [skillResult] = await connection.query(
      `SELECT COUNT(*) AS totalSkills
       FROM skills`
    );

    // Active swaps
    const [swapResult] = await connection.query(
      `SELECT COUNT(*) AS activeSwaps
       FROM swaps
       WHERE status IN ('pending', 'accepted')`
    );

    // Completed sessions
    const [sessionResult] = await connection.query(
      `SELECT COUNT(*) AS completedSessions
       FROM sessions
       WHERE status = 'completed'`
    );

    // Total reviews and average rating
    const [reviewResult] = await connection.query(
      `SELECT
         COUNT(*) AS totalReviews,
         COALESCE(ROUND(AVG(rating), 1), 5.0) AS avgRating
       FROM reviews`
    );

    // Users
    const [users] = await connection.query(
      `SELECT
        id,
        name,
        email,
        college,
        major,
        year,
        avatar,
        bio,
        rating,
        review_count AS reviewCount,
        availability,
        created_at AS createdAt
       FROM users
       ORDER BY name`
    );

    // Swaps
    const [swaps] = await connection.query(
      `SELECT
        sw.id,
        sw.sender_id AS senderId,
        sw.receiver_id AS receiverId,
        sw.offered_skill_id AS offeredSkillId,
        sw.requested_skill_id AS requestedSkillId,
        sw.message,
        sw.status,
        sw.created_at AS createdAt
       FROM swaps sw
       ORDER BY sw.created_at DESC`
    );

    // Sessions
    const [sessions] = await connection.query(
      `SELECT
        s.id,
        s.swap_id AS swapRequestId,
        s.teacher_id AS teacherId,
        s.learner_id AS learnerId,
        s.skill_id AS skillId,
        s.scheduled_time AS scheduledTime,
        s.duration_minutes AS durationMinutes,
        s.location_or_link AS locationOrLink,
        s.status,
        s.notes
       FROM sessions s
       ORDER BY s.scheduled_time DESC`
    );

    // Reviews
    const [reviews] = await connection.query(
      `SELECT
        r.id,
        r.session_id AS sessionId,
        r.reviewer_id AS reviewerId,
        r.reviewee_id AS revieweeId,
        r.rating,
        r.feedback,
        r.created_at AS createdAt
       FROM reviews r
       ORDER BY r.created_at DESC`
    );

    connection.release();

    res.json({
      totalStudents: Number(studentResult[0].totalStudents),
      totalSkills: Number(skillResult[0].totalSkills),
      activeSwaps: Number(swapResult[0].activeSwaps),
      completedSessions: Number(sessionResult[0].completedSessions),
      totalReviews: Number(reviewResult[0].totalReviews),
      avgRating: Number(reviewResult[0].avgRating),

      users,
      swaps,
      sessions,
      reviews
    });

  } catch (error) {
    connection.release();

    console.error('Error fetching admin stats:', error);

    res.status(500).json({
      error: 'Failed to fetch admin statistics.'
    });
  }
});

// ADMIN Reset Database to seed state
app.post('/api/admin/reset', async (req, res) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    await connection.query('DELETE FROM reviews');
    await connection.query('DELETE FROM sessions');
    await connection.query('DELETE FROM swaps');
    await connection.query('DELETE FROM notifications');
    await connection.query('DELETE FROM user_teach_skills');
    await connection.query('DELETE FROM user_learn_skills');
    await connection.query('DELETE FROM users');
    await connection.query('DELETE FROM skills');

    await connection.query('ALTER TABLE skills AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE user_teach_skills AUTO_INCREMENT = 1');
    await connection.query('ALTER TABLE user_learn_skills AUTO_INCREMENT = 1');

    await connection.commit();

    connection.release();

    res.json({
      message: 'Database reset successfully. Please run the MySQL seed data again.'
    });

  } catch (error) {
    await connection.rollback();
    connection.release();

    console.error('Error resetting MySQL database:', error);

    res.status(500).json({
      error: 'Failed to reset database.'
    });
  }
});


async function startServer() {
  try {
    const connection = await pool.getConnection();

    console.log('MySQL database connected successfully!');

    connection.release();

    app.listen(PORT, () => {
      console.log(
        `SkillSwap Campus API server running at http://localhost:${PORT}`
      );
    });

  } catch (error) {
    console.error(
      'MySQL connection failed:',
      error.message
    );
  }
}

startServer();