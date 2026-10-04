import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, Plus, Star, BookOpen, Clock, ArrowRightLeft, User, Edit3, Check } from 'lucide-react';
import SkillBadge from '../SkillBadge';
import StarRating from '../StarRating';
import { api } from '../../services/api';

const AVAILABLE_SKILL_NAMES = [
  'Python', 'Machine Learning', 'UI/UX Design', 'Graphic Design',
  'React', 'Web Development', 'Data Science', 'Excel', 'Java', 'C Programming'
];

export default function ProfileModal({ isOpen, student = null, onClose, onRequestSwap }) {
  const { currentUser, updateProfile, addToast } = useApp();

  // If student is passed, display that student's profile; otherwise display currentUser
  const displayStudent = student || currentUser;
  const isOwnProfile = !student || (currentUser && student.id === currentUser.id);

  const [activeTab, setActiveTab] = useState('profile'); // 'profile', 'edit', 'reviews'
  const [formData, setFormData] = useState({
    name: '',
    college: '',
    major: '',
    year: 'Sophomore',
    bio: '',
    availability: '',
    teachSkills: [],
    learnSkills: []
  });

  const [newTeachSkill, setNewTeachSkill] = useState(AVAILABLE_SKILL_NAMES[0]);
  const [newTeachLevel, setNewTeachLevel] = useState('Intermediate');
  const [newLearnSkill, setNewLearnSkill] = useState('UI/UX Design');
  const [newLearnLevel, setNewLearnLevel] = useState('Beginner');
  const [reviews, setReviews] = useState([]);
  const [loadingReviews, setLoadingReviews] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (displayStudent) {
      setFormData({
        name: displayStudent.name || '',
        college: displayStudent.college || '',
        major: displayStudent.major || '',
        year: displayStudent.year || 'Sophomore',
        bio: displayStudent.bio || '',
        availability: displayStudent.availability || '',
        teachSkills: displayStudent.teachSkills ? JSON.parse(JSON.stringify(displayStudent.teachSkills)) : [],
        learnSkills: displayStudent.learnSkills ? JSON.parse(JSON.stringify(displayStudent.learnSkills)) : []
      });

      // Load reviews for this student
      setLoadingReviews(true);
      api.getReviews(displayStudent.id)
        .then(data => setReviews(data))
        .catch(console.error)
        .finally(() => setLoadingReviews(false));
      
      // Default tab
      setActiveTab('profile');
    }
  }, [displayStudent, isOpen]);

  if (!isOpen || !displayStudent) return null;

  const handleAddTeachSkill = () => {
    const exists = formData.teachSkills.some(s => (typeof s === 'string' ? s : s.name).toLowerCase() === newTeachSkill.toLowerCase());
    if (exists) {
      addToast('error', 'Duplicate Skill', 'You already teach this skill.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      teachSkills: [...prev.teachSkills, { name: newTeachSkill, level: newTeachLevel }]
    }));
  };

  const handleRemoveTeachSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      teachSkills: prev.teachSkills.filter(s => (typeof s === 'string' ? s : s.name) !== skillName)
    }));
  };

  const handleAddLearnSkill = () => {
    const exists = formData.learnSkills.some(s => (typeof s === 'string' ? s : s.name).toLowerCase() === newLearnSkill.toLowerCase());
    if (exists) {
      addToast('error', 'Duplicate Skill', 'You already added this skill to your wishlist.');
      return;
    }
    setFormData(prev => ({
      ...prev,
      learnSkills: [...prev.learnSkills, { name: newLearnSkill, targetLevel: newLearnLevel }]
    }));
  };

  const handleRemoveLearnSkill = (skillName) => {
    setFormData(prev => ({
      ...prev,
      learnSkills: prev.learnSkills.filter(s => (typeof s === 'string' ? s : s.name) !== skillName)
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile(formData);
      addToast('success', 'Profile Updated', 'Your student profile and skills were saved.');
      setActiveTab('profile');
    } catch (err) {
      console.error(err);
      addToast('error', 'Update Failed', err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '620px' }}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img
              src={displayStudent.avatar}
              alt={displayStudent.name}
              className="avatar avatar-md"
            />
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: '700', color: '#1E293B', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                {displayStudent.name}
                <span className="badge badge-neutral" style={{ fontSize: '0.6875rem' }}>
                  {displayStudent.year}
                </span>
              </h3>
              <p style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                {displayStudent.major} • {displayStudent.college}
              </p>
            </div>
          </div>

          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Tab switcher */}
        <div style={{
          display: 'flex',
          borderBottom: '1px solid var(--border)',
          backgroundColor: '#F8FAFC',
          padding: '0 1.25rem'
        }}>
          <button
            onClick={() => setActiveTab('profile')}
            style={{
              padding: '0.65rem 0.9rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'profile' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'profile' ? '#2563EB' : '#64748B',
              fontWeight: activeTab === 'profile' ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Profile Information
          </button>

          {isOwnProfile && (
            <button
              onClick={() => setActiveTab('edit')}
              style={{
                padding: '0.65rem 0.9rem',
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: activeTab === 'edit' ? '2px solid var(--primary)' : '2px solid transparent',
                color: activeTab === 'edit' ? '#2563EB' : '#64748B',
                fontWeight: activeTab === 'edit' ? '600' : '500',
                fontSize: '0.875rem',
                cursor: 'pointer'
              }}
            >
              Edit Details & Skills
            </button>
          )}

          <button
            onClick={() => setActiveTab('reviews')}
            style={{
              padding: '0.65rem 0.9rem',
              backgroundColor: 'transparent',
              border: 'none',
              borderBottom: activeTab === 'reviews' ? '2px solid var(--primary)' : '2px solid transparent',
              color: activeTab === 'reviews' ? '#2563EB' : '#64748B',
              fontWeight: activeTab === 'reviews' ? '600' : '500',
              fontSize: '0.875rem',
              cursor: 'pointer'
            }}
          >
            Reviews ({reviews.length})
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ maxHeight: '65vh', overflowY: 'auto' }}>
          {/* PROFILE VIEW MODE */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              {/* About Section */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.35rem' }}>
                  About
                </h4>
                <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: 1.5 }}>
                  {displayStudent.bio || 'No bio provided yet.'}
                </p>
              </div>

              {/* Skills I Teach */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.4rem' }}>
                  Skills I Teach ({displayStudent.teachSkills?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(displayStudent.teachSkills || []).length === 0 ? (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None listed</span>
                  ) : (
                    displayStudent.teachSkills.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} type="teach" size="md" />
                    ))
                  )}
                </div>
              </div>

              {/* Skills I Want to Learn */}
              <div>
                <h4 style={{ fontSize: '0.875rem', fontWeight: '600', color: '#1E293B', marginBottom: '0.4rem' }}>
                  Skills I Want to Learn ({displayStudent.learnSkills?.length || 0})
                </h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                  {(displayStudent.learnSkills || []).length === 0 ? (
                    <span style={{ fontSize: '0.8125rem', color: 'var(--text-muted)' }}>None listed</span>
                  ) : (
                    displayStudent.learnSkills.map((s, idx) => (
                      <SkillBadge key={idx} skill={s} type="learn" size="md" />
                    ))
                  )}
                </div>
              </div>

              {/* Availability */}
              <div style={{
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', marginBottom: '2px' }}>
                  Availability for Sessions
                </div>
                <div style={{ fontSize: '0.875rem', color: '#1E293B' }}>
                  {displayStudent.availability || 'Flexible study hours'}
                </div>
              </div>

              {/* Rating & Reviews summary */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.75rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)'
              }}>
                <div>
                  <div style={{ fontSize: '0.75rem', fontWeight: '600', color: '#64748B', marginBottom: '2px' }}>
                    Peer Rating
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <StarRating rating={displayStudent.rating} size={15} />
                    <span style={{ fontWeight: '700', fontSize: '0.95rem', color: '#1E293B' }}>
                      {displayStudent.rating}
                    </span>
                    <span style={{ fontSize: '0.8125rem', color: '#64748B' }}>
                      ({displayStudent.reviewCount} reviews)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={() => setActiveTab('reviews')}
                >
                  View Reviews
                </button>
              </div>
            </div>
          )}

          {/* EDIT MODE (Only for current user) */}
          {activeTab === 'edit' && isOwnProfile && (
            <div>
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div className="form-group">
                  <label className="form-label">Major</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.major}
                    onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">College / Department</label>
                  <input
                    type="text"
                    className="form-input"
                    value={formData.college}
                    onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio & Interests</label>
                <textarea
                  className="form-textarea"
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  placeholder="Share a bit about what you study and what you want to learn..."
                />
              </div>

              <div className="form-group">
                <label className="form-label">Availability</label>
                <input
                  type="text"
                  className="form-input"
                  value={formData.availability}
                  onChange={(e) => setFormData({ ...formData, availability: e.target.value })}
                  placeholder="e.g. Mon/Wed after 4 PM, Sat mornings"
                />
              </div>

              {/* Skills I Can Teach Editor */}
              <div style={{ marginTop: '1rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <label className="form-label">
                  Skills I Can Teach ({formData.teachSkills.length})
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  {formData.teachSkills.map((s, idx) => (
                    <SkillBadge
                      key={idx}
                      skill={s}
                      type="teach"
                      onRemove={handleRemoveTeachSkill}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select
                    className="form-select"
                    style={{ flex: 2 }}
                    value={newTeachSkill}
                    onChange={(e) => setNewTeachSkill(e.target.value)}
                  >
                    {AVAILABLE_SKILL_NAMES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    className="form-select"
                    style={{ flex: 1 }}
                    value={newTeachLevel}
                    onChange={(e) => setNewTeachLevel(e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddTeachSkill}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>

              {/* Skills I Want to Learn Editor */}
              <div style={{ marginTop: '1.25rem', borderTop: '1px solid var(--border)', paddingTop: '1rem' }}>
                <label className="form-label">
                  Skills I Want to Learn ({formData.learnSkills.length})
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.65rem' }}>
                  {formData.learnSkills.map((s, idx) => (
                    <SkillBadge
                      key={idx}
                      skill={s}
                      type="learn"
                      onRemove={handleRemoveLearnSkill}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <select
                    className="form-select"
                    style={{ flex: 2 }}
                    value={newLearnSkill}
                    onChange={(e) => setNewLearnSkill(e.target.value)}
                  >
                    {AVAILABLE_SKILL_NAMES.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                  <select
                    className="form-select"
                    style={{ flex: 1 }}
                    value={newLearnLevel}
                    onChange={(e) => setNewLearnLevel(e.target.value)}
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={handleAddLearnSkill}
                  >
                    <Plus size={14} /> Add
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* REVIEWS VIEW MODE */}
          {activeTab === 'reviews' && (
            <div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                padding: '0.85rem 1rem',
                backgroundColor: '#F8FAFC',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                marginBottom: '1rem'
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '1.75rem', fontWeight: '800', color: '#1E293B', lineHeight: 1 }}>
                    {displayStudent.rating}
                  </div>
                  <StarRating rating={displayStudent.rating} size={14} />
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {displayStudent.reviewCount} reviews
                  </div>
                </div>
                <div style={{ borderLeft: '1px solid var(--border)', paddingLeft: '1rem', fontSize: '0.8125rem', color: '#64748B' }}>
                  Feedback left by campus classmates after completed skill exchange sessions.
                </div>
              </div>

              {loadingReviews ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)' }}>
                  Loading reviews...
                </div>
              ) : reviews.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                  No reviews left yet for this student.
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                  {reviews.map((rev) => (
                    <div
                      key={rev.id}
                      style={{
                        padding: '0.75rem 0.85rem',
                        backgroundColor: '#F8FAFC',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                          {rev.reviewer?.avatar && (
                            <img
                              src={rev.reviewer.avatar}
                              alt={rev.reviewer.name}
                              className="avatar avatar-sm"
                            />
                          )}
                          <span style={{ fontWeight: '600', fontSize: '0.8125rem', color: '#1E293B' }}>
                            {rev.reviewer?.name || 'Classmate'}
                          </span>
                        </div>
                        <StarRating rating={rev.rating} size={12} />
                      </div>
                      <p style={{ fontSize: '0.8125rem', color: '#475569', fontStyle: 'italic', marginBottom: '2px' }}>
                        "{rev.feedback}"
                      </p>
                      <span style={{ fontSize: '0.6875rem', color: 'var(--text-muted)' }}>
                        Skill: {rev.skill} • {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="modal-footer">
          <button className="btn btn-secondary btn-sm" onClick={onClose}>
            Close
          </button>

          {!isOwnProfile && onRequestSwap && (
            <button
              className="btn btn-primary btn-sm"
              onClick={() => {
                onClose();
                onRequestSwap(displayStudent);
              }}
            >
              <ArrowRightLeft size={13} /> Request Skill Swap
            </button>
          )}

          {isOwnProfile && activeTab === 'edit' && (
            <button
              className="btn btn-primary btn-sm"
              onClick={handleSave}
              disabled={saving}
            >
              <Check size={13} /> {saving ? 'Saving...' : 'Save Profile Changes'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
