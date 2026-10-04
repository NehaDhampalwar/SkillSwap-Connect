import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Calendar, CheckCircle } from 'lucide-react';
import SessionCard from '../components/cards/SessionCard';
import ReviewModal from '../components/modals/ReviewModal';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

export default function SessionsPage({ onNavigateToRequests }) {
  const { currentUser, addToast } = useApp();

  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming'); // 'upcoming' or 'completed'

  // Review modal state
  const [selectedSessionForReview, setSelectedSessionForReview] = useState(null);
  const [isReviewModalOpen, setIsReviewModalOpen] = useState(false);

  const fetchSessions = async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const data = await api.getSessions(currentUser.id);
      setSessions(data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [currentUser]);

  const handleCompleteSession = async (sessionId) => {
    try {
      await api.completeSession(sessionId);
      addToast('success', 'Session Completed', 'Session marked as complete! You can now leave a review.');
      fetchSessions();
    } catch (err) {
      addToast('error', 'Error completing session', err.message);
    }
  };

  const handleOpenReview = (session) => {
    setSelectedSessionForReview(session);
    setIsReviewModalOpen(true);
  };

  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const completedSessions = sessions.filter(s => s.status === 'completed');

  const currentList = activeTab === 'upcoming' ? upcomingSessions : completedSessions;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem' }}>
          Learning Sessions
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Track your scheduled study sessions and review completed peer tutoring.
        </p>
      </div>

      {/* Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        marginBottom: '1.5rem'
      }}>
        <button
          onClick={() => setActiveTab('upcoming')}
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'upcoming' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'upcoming' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'upcoming' ? '600' : '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <Calendar size={15} />
          <span>Upcoming Sessions ({upcomingSessions.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          style={{
            padding: '0.6rem 1rem',
            backgroundColor: 'transparent',
            border: 'none',
            borderBottom: activeTab === 'completed' ? '2px solid var(--primary)' : '2px solid transparent',
            color: activeTab === 'completed' ? '#2563EB' : '#64748B',
            fontWeight: activeTab === 'completed' ? '600' : '500',
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem'
          }}
        >
          <CheckCircle size={15} />
          <span>Completed History ({completedSessions.length})</span>
        </button>
      </div>

      {/* Sessions List */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading sessions...
        </div>
      ) : currentList.length === 0 ? (
        <EmptyState
          icon={Calendar}
          title={activeTab === 'upcoming' ? 'No Upcoming Sessions' : 'No Completed Sessions'}
          description={
            activeTab === 'upcoming'
              ? 'When a swap request is accepted, schedule a session to coordinate meeting times.'
              : 'Complete upcoming sessions with your peers to build your campus reputation.'
          }
          actionLabel="View Swap Requests"
          onAction={onNavigateToRequests}
        />
      ) : (
        <div className="grid-2">
          {currentList.map((session) => (
            <SessionCard
              key={session.id}
              session={session}
              currentUserId={currentUser?.id}
              onComplete={handleCompleteSession}
              onReview={handleOpenReview}
            />
          ))}
        </div>
      )}

      {/* Review Modal */}
      <ReviewModal
        isOpen={isReviewModalOpen}
        session={selectedSessionForReview}
        onClose={() => setIsReviewModalOpen(false)}
        onSuccess={() => {
          fetchSessions();
        }}
      />
    </div>
  );
}
