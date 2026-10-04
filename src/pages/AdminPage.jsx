import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, Users, BookOpen, ArrowRightLeft, 
  CheckCircle, Star, RotateCcw, Search 
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { api } from '../services/api';
import SkillBadge from '../components/SkillBadge';

export default function AdminPage() {
  const { addToast, reloadApp } = useApp();

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('students'); // 'students', 'swaps', 'sessions'
  const [searchTerm, setSearchTerm] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const data = await api.getAdminStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      addToast('error', 'Error Loading Admin Stats', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleResetData = async () => {
    if (window.confirm('Reset all demo data back to the clean seed state? Any newly registered users or swap requests will be reset.')) {
      try {
        await api.resetDatabase();
        addToast('success', 'Database Reset', 'System restored to fresh demo seed data.');
        reloadApp();
        fetchStats();
      } catch (err) {
        addToast('error', 'Reset Failed', err.message);
      }
    }
  };

  if (loading || !stats) {
    return (
      <div className="container" style={{ padding: '4rem 1.25rem', textAlign: 'center', color: 'var(--text-muted)' }}>
        Loading platform administration metrics...
      </div>
    );
  }

  const filteredUsers = (stats.users || []).filter(u => 
    u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.major.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.college.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSwaps = (stats.swaps || []).filter(s =>
    s.offeredSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.requestedSkill.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.status.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        flexWrap: 'wrap',
        gap: '1rem'
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-neutral">
              <ShieldCheck size={13} color="#2563EB" /> Admin Overview
            </span>
          </div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.25rem' }}>
            Platform Overview & Records
          </h1>
          <p style={{ color: '#64748B', fontSize: '0.9rem' }}>
            Inspect all registered student profiles, active swap proposals, and completed sessions.
          </p>
        </div>

        <button
          onClick={handleResetData}
          className="btn btn-secondary btn-sm"
          style={{ color: '#B91C1C', borderColor: '#FECACA' }}
        >
          <RotateCcw size={13} /> Reset Demo Data
        </button>
      </div>

      {/* Metrics Row */}
      <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Total Students</span>
            <Users size={16} color="#2563EB" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B' }}>{stats.totalStudents}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Verified student accounts</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skill Catalog</span>
            <BookOpen size={16} color="#2563EB" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B' }}>{stats.totalSkills}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Distinct skills offered/wanted</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active Swaps</span>
            <ArrowRightLeft size={16} color="#F59E0B" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#B45309' }}>{stats.activeSwaps}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Pending or accepted</div>
        </div>

        <div className="card" style={{ padding: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.25rem' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Completed Sessions</span>
            <CheckCircle size={16} color="#16A34A" />
          </div>
          <div style={{ fontSize: '1.75rem', fontWeight: '700', color: '#15803D' }}>{stats.completedSessions}</div>
          <div style={{ fontSize: '0.75rem', color: '#64748B' }}>Avg Rating: {stats.avgRating} ★</div>
        </div>
      </div>

      {/* Tables Card */}
      <div className="card" style={{ padding: '1.25rem' }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1rem',
          flexWrap: 'wrap',
          gap: '0.75rem'
        }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            <button
              onClick={() => setActiveTab('students')}
              className={`btn btn-sm ${activeTab === 'students' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <Users size={13} /> Students ({stats.users?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('swaps')}
              className={`btn btn-sm ${activeTab === 'swaps' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <ArrowRightLeft size={13} /> Swaps ({stats.swaps?.length || 0})
            </button>
            <button
              onClick={() => setActiveTab('sessions')}
              className={`btn btn-sm ${activeTab === 'sessions' ? 'btn-primary' : 'btn-secondary'}`}
            >
              <CheckCircle size={13} /> Sessions ({stats.sessions?.length || 0})
            </button>
          </div>

          <div style={{ position: 'relative', minWidth: '220px' }}>
            <Search size={14} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '30px', fontSize: '0.8125rem' }}
              placeholder="Search records..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </div>

        {/* Students Table */}
        {activeTab === 'students' && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Major & Year</th>
                  <th>Teaching Skills</th>
                  <th>Learning Desires</th>
                  <th>Rating</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <img src={u.avatar} alt={u.name} className="avatar avatar-sm" />
                        <div>
                          <div style={{ fontWeight: '600', color: '#1E293B' }}>{u.name}</div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div>{u.major}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.year}</div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(u.teachSkills || []).map((s, i) => (
                          <SkillBadge key={i} skill={s} type="teach" size="sm" showLevel={false} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                        {(u.learnSkills || []).map((s, i) => (
                          <SkillBadge key={i} skill={s} type="learn" size="sm" showLevel={false} />
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-neutral" style={{ fontSize: '0.75rem' }}>
                        ★ {u.rating} ({u.reviewCount})
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Swaps Table */}
        {activeTab === 'swaps' && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Swap ID</th>
                  <th>Offered Skill</th>
                  <th>Requested Skill</th>
                  <th>Status</th>
                  <th>Created</th>
                </tr>
              </thead>
              <tbody>
                {filteredSwaps.map((s) => (
                  <tr key={s.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {s.id}
                    </td>
                    <td>
                      <SkillBadge skill={s.offeredSkill} type="teach" size="sm" showLevel={false} />
                    </td>
                    <td>
                      <SkillBadge skill={s.requestedSkill} type="learn" size="sm" showLevel={false} />
                    </td>
                    <td>
                      <span className={`badge badge-status-${s.status}`} style={{ textTransform: 'capitalize' }}>
                        {s.status}
                      </span>
                    </td>
                    <td style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>
                      {new Date(s.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Sessions Table */}
        {activeTab === 'sessions' && (
          <div className="table-wrapper">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Session ID</th>
                  <th>Skill</th>
                  <th>Scheduled Time</th>
                  <th>Duration</th>
                  <th>Location / Link</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {(stats.sessions || []).map((sess) => (
                  <tr key={sess.id}>
                    <td style={{ fontFamily: 'monospace', fontSize: '0.75rem' }}>
                      {sess.id}
                    </td>
                    <td style={{ fontWeight: '600' }}>
                      {sess.skill}
                    </td>
                    <td style={{ color: '#475569' }}>
                      {new Date(sess.scheduledTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                    </td>
                    <td>
                      {sess.durationMinutes} min
                    </td>
                    <td style={{ color: 'var(--text-muted)' }}>
                      {sess.locationOrLink}
                    </td>
                    <td>
                      <span className={`badge ${sess.status === 'completed' ? 'badge-status-completed' : 'badge-status-accepted'}`}>
                        {sess.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
