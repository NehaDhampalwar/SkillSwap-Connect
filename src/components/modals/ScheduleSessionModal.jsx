import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Calendar, Clock, MapPin, Video, CheckCircle, AlertCircle } from 'lucide-react';
import { api } from '../../services/api';

export default function ScheduleSessionModal({ isOpen, swap, onClose, onSuccess }) {
  const { currentUser, addToast } = useApp();

  const isSender = currentUser?.id === swap?.senderId;
  const partner = isSender ? swap?.receiver : swap?.sender;
  const defaultSkill = isSender ? swap?.requestedSkill : swap?.offeredSkill;

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const defaultDate = tomorrow.toISOString().split('T')[0];

  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState('16:00');
  const [duration, setDuration] = useState('60');
  const [locationType, setLocationType] = useState('in_person');
  const [location, setLocation] = useState('Main Campus Library, Study Room 302');
  const [notes, setNotes] = useState('Initial peer session covering fundamentals and hands-on practice.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !swap || !currentUser) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const scheduledTime = new Date(`${date}T${time}:00`).toISOString();

    setSubmitting(true);
    try {
      await api.createSession({
        swapRequestId: swap.id,
        teacherId: isSender ? swap.receiverId : swap.senderId,
        learnerId: isSender ? swap.senderId : swap.receiverId,
        skill: defaultSkill,
        scheduledTime,
        durationMinutes: Number(duration),
        locationOrLink: location,
        notes
      });

      addToast('success', 'Session Scheduled', `Learning session confirmed with ${partner?.name || 'classmate'}.`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to schedule session.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '500px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#EFF6FF',
              color: '#2563EB',
              border: '1px solid #BFDBFE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Calendar size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1E293B' }}>
                Schedule Learning Session
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Meeting with {partner?.name} for {defaultSkill}
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

          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '0.75rem',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Skill Topic</div>
              <div style={{ fontWeight: '600', color: '#2563EB', fontSize: '0.9rem' }}>{defaultSkill}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Partner</div>
              <div style={{ fontWeight: '600', fontSize: '0.875rem', color: '#1E293B' }}>{partner?.name}</div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.65rem' }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input
                type="date"
                className="form-input"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <input
                type="time"
                className="form-input"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Duration</label>
            <div style={{ display: 'flex', gap: '0.4rem' }}>
              {['30', '45', '60', '90'].map((mins) => (
                <button
                  type="button"
                  key={mins}
                  onClick={() => setDuration(mins)}
                  className={`btn btn-sm ${duration === mins ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ flex: 1, padding: '0.35rem' }}
                >
                  {mins} min
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Location or Meeting Link</label>
            <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.45rem' }}>
              <button
                type="button"
                className={`btn btn-sm ${locationType === 'in_person' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setLocationType('in_person');
                  setLocation('Main Campus Library, Study Room 302');
                }}
                style={{ flex: 1, fontSize: '0.78rem' }}
              >
                <MapPin size={13} /> Campus In-Person
              </button>
              <button
                type="button"
                className={`btn btn-sm ${locationType === 'virtual' ? 'btn-primary' : 'btn-secondary'}`}
                onClick={() => {
                  setLocationType('virtual');
                  setLocation('meet.google.com/skill-swap-' + Math.random().toString(36).substring(2, 6));
                }}
                style={{ flex: 1, fontSize: '0.78rem' }}
              >
                <Video size={13} /> Virtual / Meet
              </button>
            </div>
            <input
              type="text"
              className="form-input"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Science Library Room 4A or Google Meet URL"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Session Agenda / Focus Topics</label>
            <textarea
              className="form-textarea"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="What specifically will you practice or review?"
            />
          </div>

          <div className="modal-footer" style={{ padding: '0.75rem 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              <CheckCircle size={13} />
              <span>{submitting ? 'Confirming...' : 'Confirm Session'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
