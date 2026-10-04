import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import DemoPersonaBar from './components/DemoPersonaBar';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';

// Modals
import AuthModal from './components/modals/AuthModal';
import ProfileModal from './components/modals/ProfileModal';
import SendRequestModal from './components/modals/SendRequestModal';

// Pages
import LandingPage from './pages/LandingPage';
import DashboardPage from './pages/DashboardPage';
import ExplorePage from './pages/ExplorePage';
import RequestsPage from './pages/RequestsPage';
import SessionsPage from './pages/SessionsPage';
import AdminPage from './pages/AdminPage';

import { ArrowLeftRight, Lock, LogIn, UserPlus } from 'lucide-react';

function AuthRequiredView({ onOpenAuth, pageName = 'this section' }) {
  return (
    <div className="container" style={{ padding: '5rem 1.25rem', textAlign: 'center' }}>
      <div className="card" style={{ maxWidth: '480px', margin: '0 auto', padding: '2.5rem 2rem' }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          backgroundColor: '#EFF6FF',
          color: '#2563EB',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 1.25rem'
        }}>
          <Lock size={22} />
        </div>
        <h2 style={{ fontSize: '1.4rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.5rem' }}>
          Student Account Required
        </h2>
        <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1.75rem', lineHeight: 1.5 }}>
          Sign in or create a student account to view your {pageName}, propose skill swaps, and schedule sessions with classmates.
        </p>
        <div style={{ display: 'flex', gap: '0.65rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" onClick={() => onOpenAuth('login')}>
            <LogIn size={15} /> Sign In
          </button>
          <button className="btn btn-secondary" onClick={() => onOpenAuth('register')}>
            <UserPlus size={15} /> Join Campus
          </button>
        </div>
      </div>
    </div>
  );
}

function AppContent() {
  const { currentUser } = useApp();
  const [activePage, setActivePage] = useState('landing');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // 'login' or 'register'
  
  // Profile modal state (supports viewing any student or own profile)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedProfileUser, setSelectedProfileUser] = useState(null);

  // Send request modal triggered from profile view
  const [isSendRequestModalOpen, setIsSendRequestModalOpen] = useState(false);
  const [targetStudentForSwap, setTargetStudentForSwap] = useState(null);

  const navigateTo = (pageId) => {
    setActivePage(pageId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthModalOpen(true);
  };

  const openProfile = (user = null) => {
    setSelectedProfileUser(user || currentUser);
    setIsProfileModalOpen(true);
  };

  const handleRequestSwapFromProfile = (targetStudent) => {
    setTargetStudentForSwap(targetStudent);
    setIsSendRequestModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', backgroundColor: '#F8FAFC' }}>
      {/* 1. Sticky Demo Persona Switcher Bar */}
      <DemoPersonaBar onNavigate={navigateTo} />

      {/* 2. Responsive College Navbar */}
      <Navbar
        activePage={activePage}
        setActivePage={setActivePage}
        onOpenAuth={openAuth}
        onOpenProfile={() => openProfile(currentUser)}
      />

      {/* 3. Main Dynamic Content */}
      <main style={{ flex: 1 }}>
        {activePage === 'landing' && (
          <LandingPage
            onNavigate={navigateTo}
            onOpenAuth={openAuth}
          />
        )}

        {activePage === 'dashboard' && (
          currentUser ? (
            <DashboardPage
              onNavigate={navigateTo}
              onOpenProfile={openProfile}
            />
          ) : (
            <AuthRequiredView onOpenAuth={openAuth} pageName="Dashboard" />
          )
        )}

        {activePage === 'explore' && (
          <ExplorePage
            onOpenProfile={openProfile}
            onOpenAuth={openAuth}
          />
        )}

        {activePage === 'requests' && (
          currentUser ? (
            <RequestsPage
              onNavigateToSessions={() => navigateTo('sessions')}
              onNavigateToExplore={() => navigateTo('explore')}
            />
          ) : (
            <AuthRequiredView onOpenAuth={openAuth} pageName="Requests" />
          )
        )}

        {activePage === 'sessions' && (
          currentUser ? (
            <SessionsPage
              onNavigateToRequests={() => navigateTo('requests')}
            />
          ) : (
            <AuthRequiredView onOpenAuth={openAuth} pageName="Sessions" />
          )
        )}

        {activePage === 'admin' && (
          <AdminPage />
        )}
      </main>

      {/* 4. Global Modals */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={(user) => {
          navigateTo('dashboard');
        }}
      />

      <ProfileModal
        isOpen={isProfileModalOpen}
        student={selectedProfileUser}
        onClose={() => setIsProfileModalOpen(false)}
        onRequestSwap={handleRequestSwapFromProfile}
      />

      <SendRequestModal
        isOpen={isSendRequestModalOpen}
        targetStudent={targetStudentForSwap}
        onClose={() => setIsSendRequestModalOpen(false)}
        onSuccess={() => {
          navigateTo('requests');
        }}
      />

      {/* 5. Toast Notifications Hub */}
      <ToastContainer />

      {/* 6. Clean College Project Footer */}
      <footer style={{
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border)',
        padding: '2.5rem 0 1.75rem',
        marginTop: 'auto',
        color: '#64748B',
        fontSize: '0.85rem'
      }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            flexWrap: 'wrap',
            gap: '1.25rem',
            paddingBottom: '1.5rem',
            borderBottom: '1px solid var(--border)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <div style={{
                width: '28px',
                height: '28px',
                borderRadius: '6px',
                backgroundColor: '#EFF6FF',
                border: '1px solid #BFDBFE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#2563EB'
              }}>
                <ArrowLeftRight size={15} />
              </div>
              <span style={{ fontWeight: '700', color: '#1E293B', fontSize: '1rem' }}>
                SkillSwap Campus
              </span>
            </div>

            <div style={{ display: 'flex', gap: '1.25rem', fontSize: '0.8125rem' }}>
              <button onClick={() => navigateTo('landing')} className="btn-ghost" style={{ cursor: 'pointer', padding: '0.2rem 0.4rem' }}>Home</button>
              <button onClick={() => navigateTo('dashboard')} className="btn-ghost" style={{ cursor: 'pointer', padding: '0.2rem 0.4rem' }}>Dashboard</button>
              <button onClick={() => navigateTo('explore')} className="btn-ghost" style={{ cursor: 'pointer', padding: '0.2rem 0.4rem' }}>Discover</button>
              <button onClick={() => navigateTo('requests')} className="btn-ghost" style={{ cursor: 'pointer', padding: '0.2rem 0.4rem' }}>Requests</button>
              <button onClick={() => navigateTo('sessions')} className="btn-ghost" style={{ cursor: 'pointer', padding: '0.2rem 0.4rem' }}>Sessions</button>
              <button onClick={() => navigateTo('admin')} className="btn-ghost" style={{ cursor: 'pointer', padding: '0.2rem 0.4rem' }}>Admin</button>
            </div>
          </div>

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            paddingTop: '1.25rem',
            flexWrap: 'wrap',
            gap: '0.75rem',
            fontSize: '0.75rem',
            color: 'var(--text-muted)'
          }}>
            <div>
              SkillSwap Campus • A peer-to-peer student project for campus skill exchange
            </div>
            <div>
              Built with React & Express
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
