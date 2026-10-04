import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  ArrowRightLeft, Calendar, Inbox, Star, 
  ArrowRight, BookOpen, CheckCircle, Clock, Bell, User, Check, X
} from 'lucide-react';
import SkillBadge from '../components/SkillBadge';
import StudentMatchCard from '../components/cards/StudentMatchCard';
import SendRequestModal from '../components/modals/SendRequestModal';
import { api } from '../services/api';

export default function DashboardPage({ onNavigate, onOpenProfile }) {
  const { currentUser, notifications, addToast } = useApp();

  const [matches, setMatches] = useState([]);
  const [swaps, setSwaps] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Send request modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchDashboardData = () => {
    if (!currentUser) return;
    setLoading(true);
    Promise.all([
      api.getMatches(currentUser.id).catch(() => []),
      api.getSwaps(currentUser.id).catch(() => []),
      api.getSessions(currentUser.id).catch(() => [])
    ]).then(([matchesData, swapsData, sessionsData]) => {
      setMatches(matchesData);
      setSwaps(swapsData);
      setSessions(sessionsData);
    }).finally(() => {
      setLoading(false);
    });
  };

  useEffect(() => {
    fetchDashboardData();
  }, [currentUser]);

  if (!currentUser) return null;

  const pendingRequests = swaps.filter(s => s.receiverId === currentUser.id && s.status === 'pending');
  const upcomingSessions = sessions.filter(s => s.status === 'scheduled');
  const suggestedMatches = matches.slice(0, 3);

  const handleProposeSwap = (student, matchData) => {
    setSelectedStudent(student);
    setSelectedMatch(matchData);
    setIsRequestModalOpen(true);
  };

  const handleAcceptSwap = async (swapId) => {
    try {
      await api.updateSwapStatus(swapId, 'accepted');
      addToast('success', 'Swap Accepted', 'Request accepted! You can now schedule a session.');
      fetchDashboardData();
    } catch (err) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleRejectSwap = async (swapId) => {
    try {
      await api.updateSwapStatus(swapId, 'rejected');
      addToast('info', 'Request Declined', 'The proposal has been rejected.');
      fetchDashboardData();
    } catch (err) {
      addToast('error', 'Error', err.message);
    }
  };

  const handleCompleteSession = async (sessionId) => {
    try {
      await api.completeSession(sessionId);
      addToast('success', 'Session Completed', 'Great job! You can now leave a review.');
      fetchDashboardData();
    } catch (err) {
      addToast('error', 'Error', err.message);
    }
  };

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* 1. Welcome Message & Student Header */}
      <div className="card" style={{
        padding: '1.5rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <img
            src={currentUser.avatar}
            alt={currentUser.name}
            className="avatar avatar-lg"
          />
          <div>
            <h1 style={{ fontSize: '1.5rem', fontWeight: '700', marginBottom: '0.25rem', color: '#1E293B' }}>
              Welcome back, {currentUser.name}
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              {currentUser.major} • {currentUser.year} • {currentUser.college}
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '0.35rem', fontSize: '0.8125rem' }}>
              <span style={{ color: '#1E293B', fontWeight: '600' }}>
                Rating: <span style={{ color: '#F59E0B' }}>★ {currentUser.rating}</span> ({currentUser.reviewCount} reviews)
              </span>
              <span style={{ color: 'var(--text-muted)' }}>•</span>
              <span style={{ color: '#64748B' }}>
                Availability: {currentUser.availability || 'Flexible'}
              </span>
            </div>
          </div>
        </div>

        <button 
          className="btn btn-secondary btn-sm"
          onClick={() => onOpenProfile && onOpenProfile(currentUser)}
        >
          <User size={14} /> Edit Profile & Skills
        </button>
      </div>

      {/* 2. Quick Overview Stats Cards */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Skills I Teach
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>
            {(currentUser.teachSkills || []).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#2563EB', marginTop: '2px' }}>
            Available for barter
          </div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Skills I Want to Learn
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>
            {(currentUser.learnSkills || []).length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#64748B', marginTop: '2px' }}>
            Active wishlist
          </div>
        </div>

        <div 
          className="card glass-card-interactive" 
          style={{ padding: '1rem' }}
          onClick={() => onNavigate('requests')}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Pending Requests
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: pendingRequests.length > 0 ? '#F59E0B' : '#1E293B' }}>
            {pendingRequests.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: pendingRequests.length > 0 ? '#B45309' : '#64748B', marginTop: '2px' }}>
            Awaiting response
          </div>
        </div>

        <div 
          className="card glass-card-interactive" 
          style={{ padding: '1rem' }}
          onClick={() => onNavigate('sessions')}
        >
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>
            Upcoming Sessions
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '700', color: '#1E293B' }}>
            {upcomingSessions.length}
          </div>
          <div style={{ fontSize: '0.75rem', color: '#16A34A', marginTop: '2px' }}>
            Scheduled on calendar
          </div>
        </div>
      </div>

      {/* 3. My Skills & Skills I Want to Learn */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* My Skills (Teaches) */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1E293B' }}>
              My Skills (What I Teach)
            </h2>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => onOpenProfile && onOpenProfile(currentUser)}
            >
              Manage
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {(currentUser.teachSkills || []).length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No teaching skills listed yet.</p>
            ) : (
              (currentUser.teachSkills || []).map((skill, index) => (
                <SkillBadge key={index} skill={skill} type="teach" size="md" />
              ))
            )}
          </div>
        </div>

        {/* Skills I Want to Learn */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
            <h2 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1E293B' }}>
              Skills I Want to Learn
            </h2>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}
              onClick={() => onOpenProfile && onOpenProfile(currentUser)}
            >
              Manage
            </button>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {(currentUser.learnSkills || []).length === 0 ? (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>No learning desires listed yet.</p>
            ) : (
              (currentUser.learnSkills || []).map((skill, index) => (
                <SkillBadge key={index} skill={skill} type="learn" size="md" />
              ))
            )}
          </div>
        </div>
      </div>

      {/* 4. Pending Requests & Upcoming Sessions */}
      <div className="grid-2" style={{ marginBottom: '1.5rem' }}>
        {/* Pending Requests Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Inbox size={18} color="#2563EB" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1E293B' }}>
                Pending Requests ({pendingRequests.length})
              </h2>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: '0.75rem' }}
              onClick={() => onNavigate('requests')}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          {pendingRequests.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-sm)'
            }}>
              No pending swap requests right now.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {pendingRequests.slice(0, 2).map((swap) => (
                <div 
                  key={swap.id} 
                  style={{
                    padding: '0.85rem',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    backgroundColor: '#F8FAFC'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.4rem' }}>
                    <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                      {swap.sender?.name || 'Student'}
                    </div>
                    <span className="badge badge-status-pending">Pending</span>
                  </div>
                  <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Offers: <strong>{swap.offeredSkill}</strong> ↔ Wants: <strong>{swap.requestedSkill}</strong>
                  </div>
                  {swap.message && (
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.65rem', fontStyle: 'italic' }}>
                      "{swap.message}"
                    </div>
                  )}
                  <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleRejectSwap(swap.id)}
                    >
                      <X size={12} /> Decline
                    </button>
                    <button
                      className="btn btn-mutual btn-sm"
                      onClick={() => handleAcceptSwap(swap.id)}
                    >
                      <Check size={12} /> Accept
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Sessions Section */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Calendar size={18} color="#2563EB" />
              <h2 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1E293B' }}>
                Upcoming Sessions ({upcomingSessions.length})
              </h2>
            </div>
            <button 
              className="btn btn-ghost btn-sm" 
              style={{ fontSize: '0.75rem' }}
              onClick={() => onNavigate('sessions')}
            >
              View All <ArrowRight size={13} />
            </button>
          </div>

          {upcomingSessions.length === 0 ? (
            <div style={{
              padding: '1.5rem',
              textAlign: 'center',
              color: 'var(--text-secondary)',
              fontSize: '0.875rem',
              backgroundColor: '#F8FAFC',
              borderRadius: 'var(--radius-sm)'
            }}>
              No upcoming sessions scheduled. Once you accept a swap, you can book a session!
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {upcomingSessions.slice(0, 2).map((session) => {
                const isTeacher = session.teacherId === currentUser.id;
                const partner = isTeacher ? session.learner : session.teacher;
                const dateStr = new Date(session.scheduledTime).toLocaleDateString([], {
                  month: 'short',
                  day: 'numeric'
                });
                const timeStr = new Date(session.scheduledTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit'
                });

                return (
                  <div
                    key={session.id}
                    style={{
                      padding: '0.85rem',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      backgroundColor: '#F8FAFC'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <div style={{ fontWeight: '600', fontSize: '0.875rem' }}>
                        {session.skill} with {partner?.name}
                      </div>
                      <span className="badge badge-status-accepted">Confirmed</span>
                    </div>
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                      {dateStr} at {timeStr} • {session.locationOrLink}
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <button
                        className="btn btn-secondary btn-sm"
                        onClick={() => handleCompleteSession(session.id)}
                      >
                        <CheckCircle size={12} /> Mark Completed
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 5. Suggested Matches */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
          <div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: '#1E293B', marginBottom: '2px' }}>
              Suggested Matches
            </h2>
            <p style={{ fontSize: '0.875rem', color: '#64748B' }}>
              Classmates who teach what you want to learn, or want to learn what you teach.
            </p>
          </div>
          <button 
            className="btn btn-secondary btn-sm" 
            onClick={() => onNavigate('explore')}
          >
            Explore All Peers <ArrowRight size={14} />
          </button>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Finding matches...
          </div>
        ) : suggestedMatches.length === 0 ? (
          <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
            <p style={{ color: '#64748B', fontSize: '0.9rem', marginBottom: '1rem' }}>
              No matches found for your current skills. Try adding more skills you can teach or learn!
            </p>
            <button className="btn btn-primary btn-sm" onClick={() => onNavigate('explore')}>
              Browse All Campus Students
            </button>
          </div>
        ) : (
          <div className="grid-3">
            {suggestedMatches.map((m) => (
              <StudentMatchCard
                key={m.student.id}
                match={m}
                onProposeSwap={handleProposeSwap}
                onViewProfile={(student) => onOpenProfile && onOpenProfile(student)}
              />
            ))}
          </div>
        )}
      </div>

      {/* 6. Recent Activity */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
          <Bell size={18} color="#2563EB" />
          <h2 style={{ fontSize: '1.05rem', fontWeight: '600', color: '#1E293B' }}>
            Recent Activity
          </h2>
        </div>

        {notifications.length === 0 ? (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            No recent activity recorded yet.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
            {notifications.slice(0, 5).map((n) => (
              <div 
                key={n.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  backgroundColor: '#F8FAFC',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8125rem'
                }}
              >
                <div>
                  <span style={{ fontWeight: '600', color: '#1E293B', marginRight: '0.5rem' }}>
                    {n.title}:
                  </span>
                  <span style={{ color: '#64748B' }}>
                    {n.message}
                  </span>
                </div>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap', marginLeft: '1rem' }}>
                  {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Send Request Modal */}
      <SendRequestModal
        isOpen={isRequestModalOpen}
        targetStudent={selectedStudent}
        matchData={selectedMatch}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          fetchDashboardData();
          onNavigate('requests');
        }}
      />
    </div>
  );
}
