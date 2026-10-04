import React from 'react';
import { ArrowRightLeft, Star, User } from 'lucide-react';
import SkillBadge from '../SkillBadge';
import StarRating from '../StarRating';

export default function StudentMatchCard({ match, onProposeSwap, onViewProfile }) {
  const { student, compatibility, matchType, matchBadge, matchReason } = match;
  const isMutual = matchType === 'mutual';

  return (
    <div className={`card ${isMutual ? 'mutual-card-glow' : ''}`} style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      height: '100%',
      backgroundColor: '#FFFFFF',
      border: isMutual ? '1px solid #86EFAC' : '1px solid var(--border)',
      padding: '1.25rem'
    }}>
      <div>
        {/* Top Header: Match Percentage & Rating */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <span 
            className={`badge ${isMutual ? 'badge-mutual' : 'badge-neutral'}`}
            style={{ fontWeight: '600', fontSize: '0.75rem' }}
          >
            {isMutual ? '100% Mutual Match' : `${compatibility}% Match`}
          </span>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
            <StarRating rating={student.rating} size={13} />
            <span style={{ fontSize: '0.8125rem', fontWeight: '600', color: '#1E293B' }}>
              {student.rating}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              ({student.reviewCount})
            </span>
          </div>
        </div>

        {/* Student Profile Info */}
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '0.85rem' }}>
          <img
            src={student.avatar}
            alt={student.name}
            className="avatar avatar-md"
            style={{ border: '1px solid var(--border)' }}
          />
          <div style={{ minWidth: 0, flex: 1 }}>
            <h3 style={{
              fontSize: '1rem',
              fontWeight: '600',
              color: '#1E293B',
              marginBottom: '2px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {student.name}
              </span>
              <span className="badge badge-neutral" style={{ fontSize: '0.6875rem', padding: '0.1rem 0.35rem' }}>
                {student.year}
              </span>
            </h3>
            <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)' }}>
              {student.major}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {student.college}
            </div>
          </div>
        </div>

        {/* Skills They Teach */}
        <div style={{ marginBottom: '0.75rem' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.35rem'
          }}>
            Teaches:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {(student.teachSkills || []).map((s, i) => (
              <SkillBadge key={i} skill={s} type="teach" size="sm" showLevel={false} />
            ))}
          </div>
        </div>

        {/* Skills They Want to Learn */}
        <div style={{ marginBottom: '0.85rem' }}>
          <div style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-secondary)',
            marginBottom: '0.35rem'
          }}>
            Wants to Learn:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
            {(student.learnSkills || []).map((s, i) => (
              <SkillBadge key={i} skill={s} type="learn" size="sm" showLevel={false} />
            ))}
          </div>
        </div>

        {/* Match Reason snippet */}
        {matchReason && (
          <div style={{
            padding: '0.5rem 0.65rem',
            backgroundColor: isMutual ? '#F0FDF4' : '#F8FAFC',
            border: '1px solid',
            borderColor: isMutual ? '#BBF7D0' : 'var(--border)',
            borderRadius: 'var(--radius-sm)',
            fontSize: '0.75rem',
            color: isMutual ? '#15803D' : 'var(--text-secondary)',
            marginBottom: '1rem',
            lineHeight: 1.4
          }}>
            {matchReason}
          </div>
        )}
      </div>

      {/* Required Actions: View Profile & Request Swap */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '0.5rem',
        marginTop: '0.5rem',
        paddingTop: '0.75rem',
        borderTop: '1px solid var(--border)'
      }}>
        <button
          type="button"
          className="btn btn-secondary btn-sm"
          onClick={() => onViewProfile && onViewProfile(student)}
        >
          <User size={13} />
          <span>View Profile</span>
        </button>

        <button
          type="button"
          className={isMutual ? 'btn btn-mutual btn-sm' : 'btn btn-primary btn-sm'}
          onClick={() => onProposeSwap && onProposeSwap(student, match)}
        >
          <ArrowRightLeft size={13} />
          <span>Request Swap</span>
        </button>
      </div>
    </div>
  );
}
