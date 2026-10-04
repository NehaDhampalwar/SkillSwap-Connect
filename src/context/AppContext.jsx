import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [unreadNotifCount, setUnreadNotifCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [toasts, setToasts] = useState([]);

  // Toast Notification Trigger
  const addToast = useCallback((type, title, message = '') => {
    const id = Date.now() + Math.random().toString(36).substring(2, 5);
    setToasts(prev => [...prev, { id, type, title, message }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  // Fetch all users and restore session if saved in localStorage
  const initialize = useCallback(async (preferredUserId = null) => {
    try {
      setLoading(true);
      const users = await api.getUsers();
      setAllUsers(users);

      const targetId = preferredUserId !== null ? preferredUserId : localStorage.getItem('skillswap_user_id');
      
      if (targetId) {
        const user = users.find(u => u.id === targetId);
        if (user) {
          setCurrentUser(user);
          localStorage.setItem('skillswap_user_id', user.id);
          loadNotifications(user.id);
        } else {
          localStorage.removeItem('skillswap_user_id');
          setCurrentUser(null);
        }
      } else {
        setCurrentUser(null);
      }
    } catch (err) {
      console.error('Failed to initialize app data:', err);
      addToast('error', 'Connection Error', 'Could not load student network. Retrying...');
    } finally {
      setLoading(false);
    }
  }, [addToast]);

  const loadNotifications = async (userId) => {
    if (!userId) return;
    try {
      const notifs = await api.getNotifications(userId);
      setNotifications(notifs);
      setUnreadNotifCount(notifs.filter(n => !n.read).length);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Switch demo student persona (Alex <-> Sarah <-> Marcus <-> Priya <-> David <-> Elena)
  const switchUser = async (userId) => {
    const target = allUsers.find(u => u.id === userId);
    if (!target) return;
    setCurrentUser(target);
    localStorage.setItem('skillswap_user_id', target.id);
    await loadNotifications(target.id);
    addToast('info', 'Demo Persona Switched', `Now viewing campus as ${target.name} (${target.major})`);
  };

  // Login
  const login = async (email, password) => {
    try {
      const res = await api.login(email, password);
      setCurrentUser(res.user);
      localStorage.setItem('skillswap_user_id', res.user.id);
      await loadNotifications(res.user.id);
      addToast('success', 'Welcome Back!', `Logged in as ${res.user.name}`);
      return res.user;
    } catch (err) {
      addToast('error', 'Login Failed', err.message);
      throw err;
    }
  };

  // Register
  const register = async (userData) => {
    try {
      const res = await api.register(userData);
      setAllUsers(prev => [...prev, res.user]);
      setCurrentUser(res.user);
      localStorage.setItem('skillswap_user_id', res.user.id);
      await loadNotifications(res.user.id);
      addToast('success', 'Profile Created!', `Welcome to SkillSwap Campus, ${res.user.name}!`);
      return res.user;
    } catch (err) {
      addToast('error', 'Registration Failed', err.message);
      throw err;
    }
  };

  // Logout
  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('skillswap_user_id');
    addToast('info', 'Signed Out', 'You have been signed out of your session.');
  };

  // Update Profile
  const updateProfile = async (updates) => {
    if (!currentUser) return;
    try {
      const updated = await api.updateUser(currentUser.id, updates);
      setCurrentUser(updated);
      setAllUsers(prev => prev.map(u => (u.id === updated.id ? updated : u)));
      addToast('success', 'Profile Updated', 'Your skills and bio have been updated!');
      return updated;
    } catch (err) {
      addToast('error', 'Update Failed', err.message);
      throw err;
    }
  };

  // Mark single notification read
  const markNotificationRead = async (id) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, read: true } : n)));
      setUnreadNotifCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
    }
  };

  // Mark all notifications read
  const markAllNotificationsRead = async () => {
    if (!currentUser) return;
    try {
      await api.markAllNotificationsRead(currentUser.id);
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadNotifCount(0);
      addToast('info', 'Notifications', 'All caught up!');
    } catch (err) {
      console.error(err);
    }
  };

  // Refresh data helper
  const refreshAll = useCallback(async () => {
    if (currentUser) {
      const users = await api.getUsers();
      setAllUsers(users);
      const me = users.find(u => u.id === currentUser.id);
      if (me) setCurrentUser(me);
      await loadNotifications(currentUser.id);
    }
  }, [currentUser]);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        allUsers,
        notifications,
        unreadNotifCount,
        loading,
        toasts,
        addToast,
        removeToast,
        switchUser,
        login,
        register,
        logout,
        updateProfile,
        markNotificationRead,
        markAllNotificationsRead,
        refreshAll,
        reloadApp: () => initialize(currentUser?.id)
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}
