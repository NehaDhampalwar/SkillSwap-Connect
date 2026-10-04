import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Star, Award, AlertCircle } from 'lucide-react';
import StarRating from '../StarRating';
import { api } from '../../services/api';

export default function ReviewModal({ isOpen, session, onClose, onSuccess }) {
  const { currentUser, addToast } = useApp();

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('Great session! Very patient, clear explanations, and hands-on practice.');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !session || !currentUser) return null;

  const isTeacher = session.teacherId === currentUser.id;
  const reviewee = isTeacher ? session.learner : session.teacher;
  const revieweeId = isTeacher ? session.learnerId : session.teacherId;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    setSubmitting(true);
    try {
      await api.createReview({
        sessionId: session.id,
        reviewerId: currentUser.id,
        revieweeId,
        rating,
        feedback
      });

      addToast('success', 'Review Submitted', `Thank you for reviewing ${reviewee?.name || 'your classmate'}!`);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.message || 'Failed to submit review.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '6px',
              backgroundColor: '#FFFBEB',
              color: '#F59E0B',
              border: '1px solid #FDE68A',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Star size={16} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: '700', color: '#1E293B' }}>
                Leave Feedback
              </h3>
              <p style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Session: {session.skill}
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
            alignItems: 'center',
            gap: '0.75rem',
            padding: '0.75rem',
            backgroundColor: '#F8FAFC',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-sm)',
            marginBottom: '1rem'
          }}>
            {reviewee?.avatar && (
              <img
                src={reviewee.avatar}
                alt={reviewee.name}
                className="avatar avatar-sm"
              />
            )}
            <div>
              <div style={{ fontWeight: '600', fontSize: '0.9rem', color: '#1E293B' }}>
                {reviewee?.name || 'Classmate'}
              </div>
              <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                Skill: {session.skill}
              </div>
            </div>
          </div>

          {/* Interactive Star Rating */}
          <div style={{ textAlign: 'center', margin: '1rem 0' }}>
            <label className="form-label" style={{ justifyContent: 'center', marginBottom: '0.4rem' }}>
              How was your session?
            </label>
            <div style={{ transform: 'scale(1.2)', display: 'inline-block', margin: '0.4rem 0' }}>
              <StarRating
                rating={rating}
                size={22}
                interactive={true}
                onRatingChange={(r) => setRating(r)}
              />
            </div>
            <div style={{ fontSize: '0.8125rem', color: '#B45309', fontWeight: '600', marginTop: '0.25rem' }}>
              {rating === 5 && 'Excellent (5.0)'}
              {rating === 4 && 'Good (4.0)'}
              {rating === 3 && 'Satisfactory (3.0)'}
              {rating === 2 && 'Needs Improvement (2.0)'}
              {rating === 1 && 'Unsatisfactory (1.0)'}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Written Feedback</label>
            <textarea
              className="form-textarea"
              rows={3}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What went well? Was your partner helpful and on time?"
              required
            />
          </div>

          <div className="modal-footer" style={{ padding: '0.75rem 0 0', borderTop: 'none' }}>
            <button type="button" className="btn btn-secondary btn-sm" onClick={onClose}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary btn-sm" disabled={submitting}>
              <Award size={13} />
              <span>{submitting ? 'Submitting...' : 'Submit Review'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
