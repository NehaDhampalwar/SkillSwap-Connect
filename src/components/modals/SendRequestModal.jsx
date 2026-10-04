import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Send, ArrowRightLeft, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function SendRequestModal({ isOpen, targetStudent, matchData, onClose, onSuccess }) {
  const { currentUser, addToast } = useApp();

  const [offeredSkill, setOfferedSkill] = useState('');
  const [requestedSkill, setRequestedSkill] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (currentUser && targetStudent) {
      const currentTeachNames = (currentUser.teachSkills || []).map(s => typeof s === 'string' ? s : s.name);
      const targetTeachNames = (targetStudent.teachSkills || []).map(s => typeof s === 'string' ? s : s.name);

      let defaultOffer = currentTeachNames[0] || '';
      let defaultRequest = targetTeachNames[0] || '';

      if (matchData?.youTeachThem?.length > 0) {
        defaultOffer = typeof matchData.youTeachThem[0] === 'string' ? matchData.youTeachThem[0] : matchData.youTeachThem[0].name;
      }
      if (matchData?.theyTeachYou?.length > 0) {
        defaultRequest = typeof matchData.theyTeachYou[0] === 'string' ? matchData.theyTeachYou[0] : matchData.theyTeachYou[0].name;
      }

      setOfferedSkill(defaultOffer);
      setRequestedSkill(defaultRequest);
      setMessage(`Hi ${targetStudent.name.split(' ')[0]}! I noticed your profile on SkillSwap Campus and would love to exchange skills. I can teach you ${defaultOffer || 'my skills'} if you can guide me in ${defaultRequest || 'yours'}!`);
      setError('');
    }
  }, [currentUser, targetStudent, matchData, isOpen]);

  if (!isOpen || !targetStudent || !currentUser) return null;

  const currentTeachOptions = (currentUser.teachSkills || []).map(s => typeof s === 'string' ? s : s.name);
  const targetTeachOptions = (targetStudent.teachSkills || []).map(s => typeof s === 'string' ? s : s.name);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!offeredSkill) {
      setError('Please select a skill you can offer to teach.');
      return;
    }
    if (!requestedSkill) {
      setError(`Please select a skill you want ${targetStudent.name} to teach you.`);
      return;
    }

    setSubmitting(true);
    try {
      await api.createSwap({
        senderId: currentUser.id,
        receiverId: targetStudent.id,
        offeredSkill,
        requestedSkill,
        message
      });

      addToast('success', 'Swap Proposal Sent', `Request sent to ${targetStudent.name}. Check your Requests page.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to send swap proposal.');
    } finally {
      setSubmitting(false);
    }
  };

  const isMutual = matchData?.matchType === 'mutual';

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: isMutual ? '#F0FDF4' : '#EFF6FF',
              color: isMutual ? '#16A34A' : '#2563EB',
              border: '1px solid',
              borderColor: isMutual ? '#BBF7D0' : '#BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <ArrowRightLeft size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1E293B' }}>
                Propose Skill Swap
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Exchanging skills with {targetStudent.name}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          {error && (
            <div style={{
              backgroundColor: '#FEF2F2',
              border: '1px solid #FECACA',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              color: '#B91C1C',
              fontSize: '0.8125rem',
              marginBottom: '1rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <AlertCircle size={15} />
              <span>{error}</span>
            </div>
          )}

          {isMutual && (
            <div style={{
              backgroundColor: '#F0FDF4',
              border: '1px solid #BBF7D0',
              borderRadius: 'var(--radius-sm)',
              padding: '0.65rem 0.85rem',
              marginBottom: '1rem',
              fontSize: '0.8125rem',
              color: '#15803D'
            }}>
              <strong>Mutual Match:</strong> You both teach skills the other wants to learn!
            </div>
          )}

          {/* Student Info Card */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.65rem 0.85rem',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem'
          }}>
            <img
              src={targetStudent.avatar}
              alt={targetStudent.name}
              className="avatar avatar-sm"
            />
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1E293B' }}>
                {targetStudent.name}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                {targetStudent.major} • {targetStudent.year}
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
              ★ {targetStudent.rating} ({targetStudent.reviewCount})
            </div>
          </div>

          {/* Skill Select Inputs */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem', marginBottom: '1rem' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                I will teach:
              </label>
              <select
                className="form-select"
                value={offeredSkill}
                onChange={(e) => setOfferedSkill(e.target.value)}
                required
              >
                {currentTeachOptions.length === 0 ? (
                  <option value="">No skills listed in profile</option>
                ) : (
                  currentTeachOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label" style={{ fontSize: '0.8125rem' }}>
                I want to learn:
              </label>
              <select
                className="form-select"
                value={requestedSkill}
                onChange={(e) => setRequestedSkill(e.target.value)}
                required
              >
                {targetTeachOptions.length === 0 ? (
                  <option value="">Classmate offers no skills</option>
                ) : (
                  targetTeachOptions.map((s) => (
                    <option key={s} value={s}>{s}</option>
                  ))
                )}
              </select>
            </div>
          </div>

          {/* Message */}
          <div className="form-group">
            <label className="form-label">
              <span>Message to {targetStudent.name.split(' ')[0]}</span>
            </label>
            <textarea
              className="form-textarea"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Introduce yourself and propose a time or topic..."
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '0.75rem 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className={isMutual ? 'btn btn-mutual btn-sm' : 'btn btn-primary btn-sm'}
              disabled={submitting}
            >
              <Send size={13} />
              <span>{submitting ? 'Sending...' : 'Send Request'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
