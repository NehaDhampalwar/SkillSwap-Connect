// API Service Layer for SkillSwap Campus
// Calls Express backend with graceful fallback to localStorage / seed data

const BASE_URL = '/api';

export const api = {
  // --- USERS & AUTH ---
  async getUsers() {
    const res = await fetch(`${BASE_URL}/users`);
    if (!res.ok) throw new Error('Failed to fetch students');
    return res.json();
  },

  async getUser(id) {
    const res = await fetch(`${BASE_URL}/users/${id}`);
    if (!res.ok) throw new Error('Student not found');
    return res.json();
  },

  async updateUser(id, data) {
    const res = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update profile');
    }
    return res.json();
  },

  async login(email, password) {
    const res = await fetch(`${BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Invalid credentials');
    }
    return res.json();
  },

  async register(data) {
    const res = await fetch(`${BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Registration failed');
    }
    return res.json();
  },

  // --- SMART MATCHING ---
  async getMatches(userId) {
    const res = await fetch(`${BASE_URL}/matches/${userId}`);
    if (!res.ok) throw new Error('Failed to compute skill matches');
    return res.json();
  },

  // --- SWAP REQUESTS ---
  async getSwaps(userId) {
    const url = userId ? `${BASE_URL}/swaps?userId=${userId}` : `${BASE_URL}/swaps`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch swap requests');
    return res.json();
  },

  async createSwap(data) {
    const res = await fetch(`${BASE_URL}/swaps`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to send swap proposal');
    }
    return res.json();
  },

  async updateSwapStatus(swapId, status) {
    const res = await fetch(`${BASE_URL}/swaps/${swapId}/status`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to update swap status');
    }
    return res.json();
  },

  // --- SESSIONS ---
  async getSessions(userId) {
    const url = userId ? `${BASE_URL}/sessions?userId=${userId}` : `${BASE_URL}/sessions`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch sessions');
    return res.json();
  },

  async createSession(data) {
    const res = await fetch(`${BASE_URL}/sessions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to schedule session');
    }
    return res.json();
  },

  async completeSession(sessionId) {
    const res = await fetch(`${BASE_URL}/sessions/${sessionId}/complete`, {
      method: 'PUT'
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to complete session');
    }
    return res.json();
  },

  // --- REVIEWS & RATINGS ---
  async getReviews(revieweeId) {
    const url = revieweeId ? `${BASE_URL}/reviews?revieweeId=${revieweeId}` : `${BASE_URL}/reviews`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Failed to fetch reviews');
    return res.json();
  },

  async createReview(data) {
    const res = await fetch(`${BASE_URL}/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      throw new Error(err.error || 'Failed to submit review');
    }
    return res.json();
  },

  // --- NOTIFICATIONS ---
  async getNotifications(userId) {
    const res = await fetch(`${BASE_URL}/notifications/${userId}`);
    if (!res.ok) throw new Error('Failed to fetch notifications');
    return res.json();
  },

  async markNotificationRead(id) {
    const res = await fetch(`${BASE_URL}/notifications/${id}/read`, { method: 'PUT' });
    return res.json();
  },

  async markAllNotificationsRead(userId) {
    const res = await fetch(`${BASE_URL}/notifications/${userId}/read-all`, { method: 'PUT' });
    return res.json();
  },

  // --- ADMIN & SEED ---
  async getAdminStats() {
    const res = await fetch(`${BASE_URL}/admin/stats`);
    if (!res.ok) throw new Error('Failed to fetch admin stats');
    return res.json();
  },

  async resetDatabase() {
    const res = await fetch(`${BASE_URL}/admin/reset`, { method: 'POST' });
    if (!res.ok) throw new Error('Failed to reset database');
    return res.json();
  }
};
