import React from 'react';
import { ArrowRightLeft, Calendar, Check, X, Clock, MessageSquare } from 'lucide-react';
import SkillBadge from '../SkillBadge';

export default function SwapRequestCard({ 
  swap, 
  isIncoming, 
  onAccept, 
  onReject, 
  onSchedule 
}) {
  const partner = isIncoming ? swap.sender : swap.receiver;
  const partnerLabel = isIncoming ? 'From' : 'Sent to';

  const statusBadgeClass = {
    pending: 'badge-status-pending',
    accepted: 'badge-status-accepted',
    rejected: 'badge-status-rejected',
    completed: 'badge-status-completed'
  }[swap.status] || 'badge-neutral';

  return (
    <div className="card" style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '0.85rem',
      backgroundColor: '#FFFFFF',
      border: '1px solid var(--border)',
      padding: '1.25rem'
    }}>
      {/* Top Header: Student & Status */}
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
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              {partnerLabel}
            </div>
            <div style={{ fontWeight: '600', fontSize: '0.95rem', color: '#1E293B' }}>
              {partner?.name || 'Classmate'}
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
              {partner?.major} • {partner?.year}
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'right' }}>
          <span className={`badge ${statusBadgeClass}`} style={{ textTransform: 'capitalize', fontSize: '0.75rem' }}>
            {swap.status}
          </span>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginTop: '2px' }}>
            {new Date(swap.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
          </div>
        </div>
      </div>

      {/* Exchange details: Offered Skill & Requested Skill */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1fr auto 1fr',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.65rem 0.75rem',
        backgroundColor: '#F8FAFC',
        borderRadius: 'var(--radius-sm)',
        border: '1px solid var(--border)'
      }}>
        <div>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
            {isIncoming ? 'They Offer:' : 'You Offer:'}
          </div>
          <SkillBadge skill={swap.offeredSkill} type="teach" size="sm" showLevel={false} />
        </div>

        <div style={{ color: 'var(--text-muted)' }}>
          <ArrowRightLeft size={14} />
        </div>

        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '2px' }}>
            {isIncoming ? 'They Want:' : 'You Want:'}
          </div>
          <SkillBadge skill={swap.requestedSkill} type="learn" size="sm" showLevel={false} />
        </div>
      </div>

      {/* Message */}
      {swap.message && (
        <div style={{
          fontSize: '0.8125rem',
          color: '#475569',
          backgroundColor: '#F8FAFC',
          padding: '0.5rem 0.65rem',
          borderRadius: 'var(--radius-sm)',
          borderLeft: '2px solid #CBD5E1',
          fontStyle: 'italic'
        }}>
          "{swap.message}"
        </div>
      )}

      {/* Actions */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: 'auto', paddingTop: '0.25rem' }}>
        {isIncoming && swap.status === 'pending' && (
          <>
            <button
              className="btn btn-secondary btn-sm"
              onClick={() => onReject(swap.id)}
            >
              <X size={13} /> Decline
            </button>
            <button
              className="btn btn-mutual btn-sm"
              onClick={() => onAccept(swap.id)}
            >
              <Check size={13} /> Accept Swap
            </button>
          </>
        )}

        {!isIncoming && swap.status === 'pending' && (
          <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Clock size={13} /> Waiting for {partner?.name} to respond
          </span>
        )}

        {swap.status === 'accepted' && (
          <button
            className="btn btn-primary btn-sm"
            onClick={() => onSchedule(swap)}
          >
            <Calendar size={13} /> Schedule Session
          </button>
        )}
      </div>
    </div>
  );
}
