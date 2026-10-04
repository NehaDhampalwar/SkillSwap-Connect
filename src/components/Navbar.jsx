import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowLeftRight, Compass, Bell, Calendar, Inbox, ShieldCheck, 
  User, LogOut, LogIn, UserPlus, Menu, X, CheckCheck, ChevronDown 
} from 'lucide-react';

export default function Navbar({ activePage, setActivePage, onOpenAuth, onOpenProfile }) {
  const { 
    currentUser, 
    unreadNotifCount, 
    notifications, 
    markNotificationRead, 
    markAllNotificationsRead, 
    logout 
  } = useApp();

  const [showNotifDropdown, setShowNotifDropdown] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Exact requested nav items: Home | Dashboard | Discover | Requests | Sessions
  const navItems = [
    { id: 'landing', label: 'Home', requiresAuth: false },
    { id: 'dashboard', label: 'Dashboard', requiresAuth: true },
    { id: 'explore', label: 'Discover', requiresAuth: false },
    { id: 'requests', label: 'Requests', requiresAuth: true, badge: unreadNotifCount > 0 ? unreadNotifCount : null },
    { id: 'sessions', label: 'Sessions', requiresAuth: true }
  ];

  const handleNavClick = (id) => {
    const item = navItems.find(n => n.id === id);
    if (item?.requiresAuth && !currentUser) {
      onOpenAuth('login');
      return;
    }
    setActivePage(id);
    setMobileMenuOpen(false);
    setShowUserDropdown(false);
    setShowNotifDropdown(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleLogout = () => {
    logout();
    setShowUserDropdown(false);
    setActivePage('landing');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <nav style={{
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid var(--border)',
      position: 'sticky',
      top: '33px', // sits directly under DemoPersonaBar
      zIndex: 90
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '60px'
      }}>
        {/* Brand & Main Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '2rem' }}>
          {/* Logo / Title */}
          <div 
            onClick={() => handleNavClick('landing')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              cursor: 'pointer',
              userSelect: 'none'
            }}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#EFF6FF',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#2563EB'
            }}>
              <ArrowLeftRight size={17} strokeWidth={2.2} />
            </div>
            <span style={{
              fontWeight: '700',
              fontSize: '1.05rem',
              color: '#1E293B',
              letterSpacing: '-0.01em'
            }}>
              SkillSwap Campus
            </span>
          </div>

          {/* Desktop Navigation Links */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }} className="desktop-nav">
            {navItems.map((item) => {
              const isActive = activePage === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  style={{
                    background: isActive ? '#EFF6FF' : 'transparent',
                    color: isActive ? '#2563EB' : '#475569',
                    border: '1px solid',
                    borderColor: isActive ? '#BFDBFE' : 'transparent',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.875rem',
                    fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '0.35rem',
                    transition: 'all 0.15s ease',
                    position: 'relative'
                  }}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span style={{
                      backgroundColor: '#EF4444',
                      color: '#FFFFFF',
                      fontSize: '0.65rem',
                      fontWeight: '700',
                      minWidth: '16px',
                      height: '16px',
                      borderRadius: '9999px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 4px'
                    }}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Section: Auth buttons or Logged-in controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          {currentUser ? (
            <>
              {/* Notification Popover */}
              <div style={{ position: 'relative' }}>
                <button
                  onClick={() => {
                    setShowNotifDropdown(!showNotifDropdown);
                    setShowUserDropdown(false);
                  }}
                  className="btn btn-ghost btn-sm"
                  style={{
                    position: 'relative',
                    padding: '0.4rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: showNotifDropdown ? 'var(--bg-subtle)' : '#FFFFFF'
                  }}
                  title="Notifications"
                >
                  <Bell size={16} />
                  {unreadNotifCount > 0 && (
                    <span style={{
                      position: 'absolute',
                      top: '-3px',
                      right: '-3px',
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: '#EF4444'
                    }}></span>
                  )}
                </button>

                {showNotifDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '320px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 100,
                    padding: '0.75rem'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      paddingBottom: '0.5rem',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '0.5rem'
                    }}>
                      <span style={{ fontWeight: '600', fontSize: '0.85rem' }}>Notifications</span>
                      {unreadNotifCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--primary)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                          }}
                        >
                          <CheckCheck size={13} /> Mark all read
                        </button>
                      )}
                    </div>

                    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
                      {notifications.length === 0 ? (
                        <div style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 6).map((n) => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markNotificationRead(n.id);
                              if (n.swapId) handleNavClick('requests');
                              if (n.sessionId) handleNavClick('sessions');
                              setShowNotifDropdown(false);
                            }}
                            style={{
                              padding: '0.5rem 0.65rem',
                              borderRadius: 'var(--radius-sm)',
                              marginBottom: '0.35rem',
                              backgroundColor: n.read ? '#FFFFFF' : '#EFF6FF',
                              border: '1px solid',
                              borderColor: n.read ? '#F1F5F9' : '#BFDBFE',
                              cursor: 'pointer',
                              fontSize: '0.8rem'
                            }}
                          >
                            <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{n.title}</div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px' }}>{n.message}</div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* Student Profile Dropdown */}
              <div style={{ position: 'relative' }}>
                <div 
                  onClick={() => {
                    setShowUserDropdown(!showUserDropdown);
                    setShowNotifDropdown(false);
                  }}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    padding: '0.25rem 0.65rem',
                    borderRadius: '6px',
                    border: '1px solid var(--border)',
                    backgroundColor: showUserDropdown ? 'var(--bg-subtle)' : '#FFFFFF',
                    cursor: 'pointer'
                  }}
                >
                  <img
                    src={currentUser.avatar}
                    alt={currentUser.name}
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      objectFit: 'cover'
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', fontWeight: '500', color: '#1E293B' }} className="hide-mobile">
                    {currentUser.name}
                  </span>
                  <ChevronDown size={14} color="#64748B" />
                </div>

                {showUserDropdown && (
                  <div style={{
                    position: 'absolute',
                    top: '40px',
                    right: 0,
                    width: '220px',
                    backgroundColor: '#FFFFFF',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-md)',
                    zIndex: 100,
                    padding: '0.5rem'
                  }}>
                    <div style={{
                      padding: '0.5rem',
                      borderBottom: '1px solid var(--border)',
                      marginBottom: '0.25rem'
                    }}>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{currentUser.major}</div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        onOpenProfile();
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.5rem' }}
                    >
                      <User size={14} /> My Student Profile
                    </button>

                    <button
                      onClick={() => {
                        setShowUserDropdown(false);
                        setActivePage('admin');
                      }}
                      className="btn btn-ghost btn-sm"
                      style={{ width: '100%', justifyContent: 'flex-start', padding: '0.4rem 0.5rem' }}
                    >
                      <ShieldCheck size={14} /> Admin Overview
                    </button>

                    <div style={{ borderTop: '1px solid var(--border)', marginTop: '0.25rem', paddingTop: '0.25rem' }}>
                      <button
                        onClick={handleLogout}
                        className="btn btn-ghost btn-sm"
                        style={{
                          width: '100%',
                          justifyContent: 'flex-start',
                          padding: '0.4rem 0.5rem',
                          color: 'var(--danger-text)'
                        }}
                      >
                        <LogOut size={14} /> Log Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          ) : (
            /* Logged Out: Sign In & Join Campus */
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <button 
                className="btn btn-secondary btn-sm" 
                onClick={() => onOpenAuth('login')}
              >
                <LogIn size={14} /> Sign In
              </button>

              <button 
                className="btn btn-primary btn-sm" 
                onClick={() => onOpenAuth('register')}
              >
                <UserPlus size={14} /> Join Campus
              </button>
            </div>
          )}

          {/* Mobile hamburger menu */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="btn btn-ghost btn-sm mobile-menu-toggle"
            style={{ display: 'none', padding: '0.4rem' }}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div style={{
          backgroundColor: '#FFFFFF',
          borderTop: '1px solid var(--border)',
          padding: '0.75rem 1.25rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.4rem'
        }}>
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => handleNavClick(item.id)}
              className="btn btn-secondary btn-sm"
              style={{ justifyContent: 'flex-start' }}
            >
              <span>{item.label}</span>
              {item.badge && (
                <span style={{
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.65rem',
                  fontWeight: '700',
                  padding: '0 4px',
                  borderRadius: '9999px',
                  marginLeft: 'auto'
                }}>
                  {item.badge}
                </span>
              )}
            </button>
          ))}
          {!currentUser ? (
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => onOpenAuth('login')}>
                Sign In
              </button>
              <button className="btn btn-primary btn-sm" style={{ flex: 1 }} onClick={() => onOpenAuth('register')}>
                Join Campus
              </button>
            </div>
          ) : (
            <button className="btn btn-danger btn-sm" style={{ marginTop: '0.5rem' }} onClick={handleLogout}>
              <LogOut size={14} /> Log Out
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
