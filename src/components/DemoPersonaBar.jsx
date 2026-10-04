import React from 'react';
import { useApp } from '../context/AppContext';
import { RotateCcw } from 'lucide-react';
import { api } from '../services/api';

export default function DemoPersonaBar({ onNavigate }) {
  const { currentUser, allUsers, switchUser, logout, addToast, reloadApp } = useApp();

  const handleReset = async () => {
    if (window.confirm('Reset all demo data to initial state?')) {
      try {
        await api.resetDatabase();
        addToast('success', 'Reset Complete', 'Data restored to initial demo state.');
        reloadApp();
      } catch (err) {
        addToast('error', 'Reset Failed', err.message);
      }
    }
  };

  const handlePersonaClick = (userId) => {
    switchUser(userId);
    if (onNavigate) {
      onNavigate('dashboard');
    }
  };

  return (
    <div style={{
      backgroundColor: '#F1F5F9',
      borderBottom: '1px solid #E2E8F0',
      padding: '0.25rem 1rem',
      fontSize: '0.78rem',
      color: '#475569',
      position: 'sticky',
      top: 0,
      zIndex: 100
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: '600', color: '#1E293B' }}>Demo Mode:</span>
          <span style={{ color: '#94A3B8' }} className="hide-mobile">Quick switch:</span>
          {allUsers.slice(0, 6).map(user => {
            const isSelected = currentUser?.id === user.id;
            return (
              <button
                key={user.id}
                onClick={() => handlePersonaClick(user.id)}
                style={{
                  background: isSelected ? '#2563EB' : '#FFFFFF',
                  color: isSelected ? '#FFFFFF' : '#334155',
                  border: isSelected ? '1px solid #2563EB' : '1px solid #CBD5E1',
                  borderRadius: '4px',
                  padding: '0.15rem 0.5rem',
                  fontSize: '0.75rem',
                  fontWeight: isSelected ? '600' : '400',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.3rem'
                }}
              >
                <span>{user.name.split(' ')[0]}</span>
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {currentUser && (
            <button
              onClick={() => {
                logout();
                if (onNavigate) onNavigate('landing');
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748B',
                fontSize: '0.75rem',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              Log out (Guest view)
            </button>
          )}

          <button
            onClick={handleReset}
            title="Reset demo data"
            style={{
              background: 'none',
              border: 'none',
              color: '#94A3B8',
              fontSize: '0.75rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.25rem'
            }}
          >
            <RotateCcw size={11} /> Reset
          </button>
        </div>
      </div>
    </div>
  );
}
