import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { X, LogIn, UserPlus, AlertCircle } from 'lucide-react';
import SkillBadge from '../SkillBadge';

const POPULAR_SKILLS = [
  'Python', 'Machine Learning', 'UI/UX Design', 'Graphic Design',
  'React', 'Web Development', 'Data Science', 'Excel', 'Java', 'C Programming'
];

export default function AuthModal({ isOpen, initialMode = 'login', onClose, onSuccess }) {
  const { login, register, allUsers, switchUser } = useApp();
  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [college, setCollege] = useState('School of Engineering & Computing');
  const [major, setMajor] = useState('Computer Science');
  const [year, setYear] = useState('Sophomore');
  const [bio, setBio] = useState('Passionate about collaborating on hands-on campus projects and learning from peers.');
  
  // Skills tags
  const [teachSkillsList, setTeachSkillsList] = useState(['Python', 'Web Development']);
  const [learnSkillsList, setLearnSkillsList] = useState(['UI/UX Design']);
  const [customTeachInput, setCustomTeachInput] = useState('');
  const [customLearnInput, setCustomLearnInput] = useState('');

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setIsRegister(initialMode === 'register');
    setError('');
  }, [initialMode, isOpen]);

  if (!isOpen) return null;

  const handleAddTeachSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!teachSkillsList.includes(trimmed)) {
      setTeachSkillsList([...teachSkillsList, trimmed]);
    }
    setCustomTeachInput('');
  };

  const handleRemoveTeachSkill = (skill) => {
    setTeachSkillsList(teachSkillsList.filter(s => s !== skill));
  };

  const handleAddLearnSkill = (skill) => {
    const trimmed = skill.trim();
    if (!trimmed) return;
    if (!learnSkillsList.includes(trimmed)) {
      setLearnSkillsList([...learnSkillsList, trimmed]);
    }
    setCustomLearnInput('');
  };

  const handleRemoveLearnSkill = (skill) => {
    setLearnSkillsList(learnSkillsList.filter(s => s !== skill));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        if (!name.trim()) throw new Error('Please enter your full name.');
        if (!email.trim() || !email.includes('@')) throw new Error('Please enter a valid campus email address.');
        if (password.length < 4) throw new Error('Password must be at least 4 characters.');
        if (teachSkillsList.length === 0) throw new Error('Please add at least one skill you can teach.');
        if (learnSkillsList.length === 0) throw new Error('Please add at least one skill you want to learn.');

        const teachSkills = teachSkillsList.map(s => ({
          name: s,
          level: 'Intermediate'
        }));

        const learnSkills = learnSkillsList.map(s => ({
          name: s,
          targetLevel: 'Beginner'
        }));

        const newUser = await register({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
          college: college.trim(),
          major: major.trim(),
          year,
          bio: bio.trim(),
          teachSkills,
          learnSkills
        });

        if (onSuccess) onSuccess(newUser);
      } else {
        const user = await login(email.trim().toLowerCase(), password);
        if (onSuccess) onSuccess(user);
      }
      onClose();
    } catch (err) {
      setError(err.message || 'Authentication error occurred.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickDemoLogin = (userId) => {
    switchUser(userId);
    if (onSuccess) {
      const u = allUsers.find(x => x.id === userId);
      onSuccess(u);
    }
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div 
        className="modal-content" 
        onClick={(e) => e.stopPropagation()} 
        style={{ maxWidth: isRegister ? '540px' : '420px' }}
      >
        {/* Header Tabs */}
        <div className="modal-header">
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <button
              type="button"
              onClick={() => { setIsRegister(false); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                fontWeight: !isRegister ? '700' : '500',
                color: !isRegister ? '#2563EB' : '#64748B',
                cursor: 'pointer',
                borderBottom: !isRegister ? '2px solid #2563EB' : '2px solid transparent',
                paddingBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <LogIn size={15} /> Sign In
            </button>
            <button
              type="button"
              onClick={() => { setIsRegister(true); setError(''); }}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '1rem',
                fontWeight: isRegister ? '700' : '500',
                color: isRegister ? '#2563EB' : '#64748B',
                cursor: 'pointer',
                borderBottom: isRegister ? '2px solid #2563EB' : '2px solid transparent',
                paddingBottom: '4px',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <UserPlus size={15} /> Join Campus
            </button>
          </div>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '4px' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="modal-body" style={{ maxHeight: '72vh', overflowY: 'auto' }}>
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
              <AlertCircle size={15} style={{ flexShrink: 0 }} />
              <span>{error}</span>
            </div>
          )}

          {isRegister ? (
            /* REGISTER FORM */
            <>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Jordan Miller"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '0.65rem' }}>
                <div className="form-group">
                  <label className="form-label">Major *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Computer Science"
                    value={major}
                    onChange={(e) => setMajor(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Academic Year</label>
                  <select
                    className="form-select"
                    value={year}
                    onChange={(e) => setYear(e.target.value)}
                  >
                    <option value="Freshman">Freshman</option>
                    <option value="Sophomore">Sophomore</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Graduate">Graduate</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">College / Department</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. School of Engineering"
                  value={college}
                  onChange={(e) => setCollege(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Short Bio & Interests</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  placeholder="What are you currently studying or hoping to learn with peers?"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                />
              </div>

              {/* Skills I Can Teach */}
              <div className="form-group">
                <label className="form-label">
                  Skills You Can Teach * ({teachSkillsList.length})
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.45rem' }}>
                  {teachSkillsList.map(s => (
                    <SkillBadge
                      key={s}
                      skill={s}
                      type="teach"
                      showLevel={false}
                      size="sm"
                      onRemove={handleRemoveTeachSkill}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
                    placeholder="Add custom teaching skill..."
                    value={customTeachInput}
                    onChange={(e) => setCustomTeachInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddTeachSkill(customTeachInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAddTeachSkill(customTeachInput)}
                  >
                    Add
                  </button>
                </div>
                {/* Suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Suggestions:</span>
                  {POPULAR_SKILLS.filter(s => !teachSkillsList.includes(s)).slice(0, 5).map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleAddTeachSkill(s)}
                      style={{
                        backgroundColor: '#F1F5F9',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: '#475569',
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        cursor: 'pointer'
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              {/* Skills I Want to Learn */}
              <div className="form-group">
                <label className="form-label">
                  Skills You Want to Learn * ({learnSkillsList.length})
                </label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.45rem' }}>
                  {learnSkillsList.map(s => (
                    <SkillBadge
                      key={s}
                      skill={s}
                      type="learn"
                      showLevel={false}
                      size="sm"
                      onRemove={handleRemoveLearnSkill}
                    />
                  ))}
                </div>
                <div style={{ display: 'flex', gap: '0.4rem', marginBottom: '0.4rem' }}>
                  <input
                    type="text"
                    className="form-input"
                    style={{ padding: '0.4rem 0.65rem', fontSize: '0.8125rem' }}
                    placeholder="Add skill you want to learn..."
                    value={customLearnInput}
                    onChange={(e) => setCustomLearnInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLearnSkill(customLearnInput);
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleAddLearnSkill(customLearnInput)}
                  >
                    Add
                  </button>
                </div>
                {/* Suggestions */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Suggestions:</span>
                  {POPULAR_SKILLS.filter(s => !learnSkillsList.includes(s)).slice(0, 5).map(s => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => handleAddLearnSkill(s)}
                      style={{
                        backgroundColor: '#F1F5F9',
                        border: '1px solid var(--border)',
                        borderRadius: '4px',
                        color: '#475569',
                        fontSize: '0.7rem',
                        padding: '1px 6px',
                        cursor: 'pointer'
                      }}
                    >
                      + {s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.65rem' }}>
                <div className="form-group">
                  <label className="form-label">Campus Email *</label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="student@campus.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Password *</label>
                  <input
                    type="password"
                    className="form-input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}
                disabled={loading}
              >
                {loading ? 'Creating Profile...' : 'Complete Registration'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>Already registered? </span>
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Sign in here
                </button>
              </div>
            </>
          ) : (
            /* LOGIN FORM */
            <>
              <div className="form-group">
                <label className="form-label">Campus Email</label>
                <input
                  type="email"
                  className="form-input"
                  placeholder="alex.chen@campus.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Password</label>
                <input
                  type="password"
                  className="form-input"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{ width: '100%', marginTop: '0.5rem', padding: '0.65rem' }}
                disabled={loading}
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.85rem', fontSize: '0.8125rem' }}>
                <span style={{ color: 'var(--text-muted)' }}>New student on campus? </span>
                <button
                  type="button"
                  onClick={() => setIsRegister(true)}
                  style={{ background: 'none', border: 'none', color: 'var(--primary)', fontWeight: '600', cursor: 'pointer' }}
                >
                  Join Campus
                </button>
              </div>
            </>
          )}

          {/* Quick Demo Student Sign In */}
          <div style={{ marginTop: '1.25rem', paddingTop: '0.85rem', borderTop: '1px solid var(--border)', textAlign: 'center' }}>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Quick test sign-in with a demo student account:
            </span>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', justifyContent: 'center', marginTop: '0.45rem' }}>
              {allUsers.slice(0, 4).map((u) => (
                <button
                  type="button"
                  key={u.id}
                  onClick={() => handleQuickDemoLogin(u.id)}
                  className="btn btn-secondary btn-sm"
                  style={{ fontSize: '0.75rem', padding: '0.2rem 0.55rem' }}
                >
                  {u.name.split(' ')[0]} ({u.teachSkills?.[0]?.name || u.teachSkills?.[0] || u.major || 'Student'})
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
