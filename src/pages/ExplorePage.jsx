import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Search, Filter, RotateCcw, Compass, ArrowRightLeft, Star, Sparkles 
} from 'lucide-react';
import StudentMatchCard from '../components/cards/StudentMatchCard';
import SendRequestModal from '../components/modals/SendRequestModal';
import EmptyState from '../components/EmptyState';
import { api } from '../services/api';

const CATEGORIES = ['All Disciplines', 'Programming', 'Data Science', 'Design', 'Business & Tools'];

export default function ExplorePage({ onOpenProfile, onOpenAuth }) {
  const { currentUser, addToast } = useApp();

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Disciplines');
  const [selectedYear, setSelectedYear] = useState('All');
  const [minRating, setMinRating] = useState('All');
  const [mutualOnly, setMutualOnly] = useState(false);

  // Send request modal state
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [selectedMatch, setSelectedMatch] = useState(null);
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);

  const fetchMatches = async () => {
    try {
      setLoading(true);
      if (currentUser) {
        const data = await api.getMatches(currentUser.id);
        setMatches(data);
      } else {
        // Guest mode: show campus students
        const users = await api.getUsers();
        const guestMatches = users.map(student => ({
          student,
          compatibility: 70,
          matchType: 'explore',
          matchBadge: 'Campus Peer',
          matchReason: 'Sign in to see your exact skill match percentage with this student.',
          theyTeachYou: [],
          youTeachThem: []
        }));
        setMatches(guestMatches);
      }
    } catch (err) {
      console.error(err);
      addToast('error', 'Error Loading Students', err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, [currentUser]);

  const handleProposeSwap = (student, matchData) => {
    if (!currentUser) {
      addToast('info', 'Sign In Required', `Please sign in or join campus to propose a skill swap with ${student.name}.`);
      if (onOpenAuth) onOpenAuth('login');
      return;
    }
    setSelectedStudent(student);
    setSelectedMatch(matchData);
    setIsRequestModalOpen(true);
  };

  // Filtering
  const filteredMatches = matches.filter((m) => {
    const student = m.student;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const nameMatch = student.name.toLowerCase().includes(q);
      const majorMatch = student.major.toLowerCase().includes(q);
      const teachMatch = (student.teachSkills || []).some(s => (typeof s === 'string' ? s : s.name).toLowerCase().includes(q));
      const learnMatch = (student.learnSkills || []).some(s => (typeof s === 'string' ? s : s.name).toLowerCase().includes(q));
      if (!nameMatch && !majorMatch && !teachMatch && !learnMatch) return false;
    }

    if (selectedCategory !== 'All Disciplines') {
      const categoryKeywords = {
        'Programming': ['python', 'java', 'c programming', 'react', 'web development'],
        'Data Science': ['machine learning', 'data science', 'deep learning'],
        'Design': ['ui/ux design', 'graphic design', 'figma', 'photoshop'],
        'Business & Tools': ['excel', 'modeling', 'analytics']
      }[selectedCategory] || [];

      const matchesCat = (student.teachSkills || []).some(s => {
        const sName = (typeof s === 'string' ? s : s.name).toLowerCase();
        return categoryKeywords.some(k => sName.includes(k));
      });
      if (!matchesCat) return false;
    }

    if (selectedYear !== 'All' && student.year !== selectedYear) {
      return false;
    }

    if (minRating !== 'All') {
      const threshold = parseFloat(minRating);
      if ((student.rating || 0) < threshold) return false;
    }

    if (mutualOnly && m.matchType !== 'mutual') {
      return false;
    }

    return true;
  });

  const mutualCount = matches.filter(m => m.matchType === 'mutual').length;

  return (
    <div className="container" style={{ padding: '2rem 1.25rem 4rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700', color: '#1E293B', marginBottom: '0.35rem' }}>
          Discover Skill Partners
        </h1>
        <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
          Browse students across campus and find peers who can teach the skills you want to learn.
        </p>
      </div>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem' }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '2fr 1.2fr 1fr 1fr auto',
          gap: '0.65rem',
          alignItems: 'center'
        }} className="filter-controls-grid">
          {/* Search Input */}
          <div style={{ position: 'relative' }}>
            <Search size={15} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
            <input
              type="text"
              className="form-input"
              style={{ paddingLeft: '32px' }}
              placeholder="Search by skill or student name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Category Dropdown */}
          <div>
            <select
              className="form-select"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>

          {/* Year Dropdown */}
          <div>
            <select
              className="form-select"
              value={selectedYear}
              onChange={(e) => setSelectedYear(e.target.value)}
            >
              <option value="All">All Years</option>
              <option value="Freshman">Freshman</option>
              <option value="Sophomore">Sophomore</option>
              <option value="Junior">Junior</option>
              <option value="Senior">Senior</option>
            </select>
          </div>

          {/* Rating Dropdown */}
          <div>
            <select
              className="form-select"
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
            >
              <option value="All">Any Rating</option>
              <option value="4.8">4.8+ Stars</option>
              <option value="4.5">4.5+ Stars</option>
            </select>
          </div>

          {/* Mutual Only Toggle */}
          <button
            type="button"
            onClick={() => setMutualOnly(!mutualOnly)}
            className={`btn btn-sm ${mutualOnly ? 'btn-mutual' : 'btn-secondary'}`}
            style={{ height: '38px', padding: '0 0.85rem' }}
          >
            <span>Mutual Only</span>
            {mutualCount > 0 && <span style={{ opacity: 0.8 }}>({mutualCount})</span>}
          </button>
        </div>

        {/* Quick Filter Tags */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', marginTop: '0.85rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Quick Filters:</span>
          {['Python', 'UI/UX Design', 'React', 'Data Science', 'Machine Learning'].map(skill => (
            <button
              key={skill}
              type="button"
              onClick={() => setSearchQuery(searchQuery === skill ? '' : skill)}
              style={{
                backgroundColor: searchQuery === skill ? '#EFF6FF' : '#F1F5F9',
                color: searchQuery === skill ? '#2563EB' : '#475569',
                border: '1px solid',
                borderColor: searchQuery === skill ? '#BFDBFE' : 'var(--border)',
                borderRadius: '4px',
                padding: '2px 8px',
                fontSize: '0.75rem',
                cursor: 'pointer'
              }}
            >
              {skill}
            </button>
          ))}
          {(searchQuery || selectedCategory !== 'All Disciplines' || selectedYear !== 'All' || minRating !== 'All' || mutualOnly) && (
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All Disciplines');
                setSelectedYear('All');
                setMinRating('All');
                setMutualOnly(false);
              }}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: '0.75rem', padding: '0.15rem 0.45rem', marginLeft: 'auto' }}
            >
              <RotateCcw size={12} /> Reset
            </button>
          )}
        </div>
      </div>

      {/* Grid of Student Cards */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem 0', color: 'var(--text-muted)' }}>
          Loading students...
        </div>
      ) : filteredMatches.length === 0 ? (
        <EmptyState
          icon={Compass}
          title="No Students Found"
          description="Try broadening your search or resetting active filters."
          actionLabel="Clear Filters"
          onAction={() => {
            setSearchQuery('');
            setSelectedCategory('All Disciplines');
            setSelectedYear('All');
            setMinRating('All');
            setMutualOnly(false);
          }}
        />
      ) : (
        <div className="grid-3">
          {filteredMatches.map((m) => (
            <StudentMatchCard
              key={m.student.id}
              match={m}
              onProposeSwap={handleProposeSwap}
              onViewProfile={(student) => onOpenProfile && onOpenProfile(student)}
            />
          ))}
        </div>
      )}

      {/* Send Request Modal */}
      <SendRequestModal
        isOpen={isRequestModalOpen}
        targetStudent={selectedStudent}
        matchData={selectedMatch}
        onClose={() => setIsRequestModalOpen(false)}
        onSuccess={() => {
          fetchMatches();
        }}
      />
    </div>
  );
}
