import React from 'react';
import { Calendar, Clock, MapPin, Video, CheckCircle, Star } from 'lucide-react';

export default function SessionCard({ 
  session, 
  currentUserId, 
  onComplete, 
  onReview 
}) {
  const isTeacher = session.teacherId === currentUserId;
  const partner = isTeacher ? session.learner : session.teacher;
  const roleLabel = isTeacher ? 'You are Teaching' : 'You are Learning';

  const scheduledDate = new Date(session.scheduledTime);
  const formattedDate = scheduledDate.toLocaleDateString([], {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });
  const formattedTime = scheduledDate.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const isCompleted = session.status === 'completed';
  const isOnline = session.locationOrLink?.includes('http') || session.locationOrLink?.includes('meet');

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--border)',
      padding: '1.25rem'
    }}>
      {/* Top Header: Partner & Status */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          {partner?.avatar && (
            <img
              src={partner.avatar}
              alt={partner.name}
              className="avatar avatar-md"
            />
          )}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1E293B' }}>
                {partner?.name || 'Classmate'}
              </span>
              <span className={`badge ${isTeacher ? 'badge-teach' : 'badge-learn'}`} style={{ fontSize: '0.6875rem' }}>
                {roleLabel}
              </span>
            </div>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              Skill: <strong style={{ color: 'var(--primary)' }}>{session.skill}</strong>
            </div>
          </div>
        </div>

        <span className={`badge ${isCompleted ? 'badge-status-completed' : 'badge-status-accepted'}`} style={{ textTransform: 'capitalize' }}>
          {session.status}
        </span>
      </div>

      {/* Date, Time, Location Info */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
        gap: '0.5rem',
        padding: '0.65rem 0.75rem',
        backgroundColor: '#F8FAFC',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#475569' }}>
          <Calendar size={14} color="#2563EB" />
          <span>{formattedDate}</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8125rem', color: '#475569' }}>
          <Clock size={14} color="#F59E0B" />
          <span>{formattedTime} ({session.durationMinutes}m)</span>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          fontSize: '0.8125rem',
          color: '#475569',
          gridColumn: '1 / -1',
          overflow: 'hidden'
        }}>
          {isOnline ? (
            <Video size={14} color="#16A34A" style={{ flexShrink: 0 }} />
          ) : (
            <MapPin size={14} color="#16A34A" style={{ flexShrink: 0 }} />
          )}
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {session.locationOrLink}
          </span>
        </div>
      </div>

      {/* Notes / Agenda */}
      {session.notes && (
        <div style={{ fontSize: '0.8125rem', color: '#64748B' }}>
          <strong>Agenda:</strong> {session.notes}
        </div>
      )}

      {/* Action Buttons */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.35rem', borderTop: '1px solid var(--border)' }}>
        {!isCompleted && (
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => onComplete(session.id)}
          >
            <CheckCircle size={13} /> Mark Completed
          </button>
        )}

        {isCompleted && !session.reviewed && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onReview(session)}
          >
            <Star size={13} /> Leave Review
          </button>
        )}

        {isCompleted && session.reviewed && (
          <span className="badge badge-neutral" style={{ fontSize: '0.75rem', padding: '0.25rem 0.55rem' }}>
            <CheckCircle size={12} color="#16A34A" /> Review Submitted
          </span>
        )}
      </div>
    </div>
  );
}
