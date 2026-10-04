import React from 'react';
import { 
  ArrowRight, Users, BookOpen, Star, CheckCircle, 
  Code, Palette, Brain, Layers, Search, ArrowRightLeft, Calendar
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export default function LandingPage({ onNavigate, onOpenAuth }) {
  const { allUsers, currentUser } = useApp();

  const popularSkills = [
    { name: 'Python', category: 'Programming', icon: Code, count: '32 students' },
    { name: 'UI/UX Design', category: 'Design', icon: Palette, count: '24 students' },
    { name: 'Machine Learning', category: 'Data Science', icon: Brain, count: '18 students' },
    { name: 'React', category: 'Web Development', icon: Layers, count: '29 students' },
    { name: 'Data Science', category: 'Analytics', icon: Search, count: '22 students' },
    { name: 'Java', category: 'Programming', icon: Code, count: '20 students' }
  ];

  return (
    <div>
      {/* Simple College Hero Section */}
      <section style={{
        padding: '4.5rem 0 3.5rem',
        textAlign: 'center',
        backgroundColor: '#FFFFFF',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container" style={{ maxWidth: '780px' }}>
          <div style={{ display: 'inline-flex', marginBottom: '1rem' }}>
            <span className="badge badge-neutral" style={{ padding: '0.25rem 0.65rem', fontSize: '0.8125rem' }}>
              College Peer-to-Peer Learning
            </span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2rem, 4vw, 2.75rem)',
            fontWeight: '800',
            color: '#1E293B',
            marginBottom: '1rem',
            lineHeight: 1.2
          }}>
            Learn from your peers. Share what you know.
          </h1>

          <p style={{
            fontSize: '1.1rem',
            color: '#64748B',
            marginBottom: '2rem',
            lineHeight: 1.6
          }}>
            SkillSwap Campus helps students find classmates who can teach the skills they want to learn.
          </p>

          {/* Call to action buttons */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            flexWrap: 'wrap'
          }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={() => onNavigate('explore')}
            >
              <span>Find a Skill Partner</span>
              <ArrowRight size={16} />
            </button>

            {!currentUser ? (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => onOpenAuth('register')}
              >
                <span>Join Campus</span>
              </button>
            ) : (
              <button
                className="btn btn-secondary btn-lg"
                onClick={() => onNavigate('dashboard')}
              >
                <span>Go to Dashboard</span>
              </button>
            )}
          </div>
        </div>
      </section>

      {/* How SkillSwap Works Section */}
      <section style={{
        padding: '3.5rem 0',
        backgroundColor: '#F8FAFC',
        borderBottom: '1px solid var(--border)'
      }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
            <h2 style={{ fontSize: '1.75rem', marginBottom: '0.5rem', color: '#1E293B' }}>
              How SkillSwap Works
            </h2>
            <p style={{ color: '#64748B', fontSize: '0.95rem' }}>
              A straightforward way to trade skills with peers on campus.
            </p>
          </div>

          <div className="grid-3">
            {[
              {
                stepNumber: '1',
                title: 'Add your skills',
                description: 'List the subjects or tools you can teach classmates, along with the skills you want to learn.',
                icon: BookOpen
              },
              {
                stepNumber: '2',
                title: 'Find a match',
                description: 'Browse campus profiles to find students whose interests align with what you teach and what you want to learn.',
                icon: ArrowRightLeft
              },
              {
                stepNumber: '3',
                title: 'Swap knowledge',
                description: 'Send a swap request, schedule a meeting in the campus library or online, and help each other learn.',
                icon: Calendar
              }
            ].map((step) => {
              const Icon = step.icon;
              return (
                <div key={step.stepNumber} className="card" style={{ padding: '1.5rem', position: 'relative' }}>
                  <div style={{
                    width: '36px',
                    height: '36px',
                    borderRadius: '6px',
                    backgroundColor: '#EFF6FF',
                    border: '1px solid #BFDBFE',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: '700',
                    fontSize: '1rem',
                    marginBottom: '1rem'
                  }}>
                    {step.stepNumber}
                  </div>
                  <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', color: '#1E293B' }}>
                    {step.title}
                  </h3>
                  <p style={{ fontSize: '0.875rem', color: '#64748B', lineHeight: 1.5 }}>
                    {step.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Popular Skills Section */}
      <section style={{ padding: '3.5rem 0', backgroundColor: '#FFFFFF', borderBottom: '1px solid var(--border)' }}>
        <div className="container">
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.75rem',
            flexWrap: 'wrap',
            gap: '1rem'
          }}>
            <div>
              <h2 style={{ fontSize: '1.5rem', color: '#1E293B', marginBottom: '0.25rem' }}>
                Popular Skills on Campus
              </h2>
              <p style={{ color: '#64748B', fontSize: '0.875rem' }}>
                Explore what other students are teaching and learning this semester.
              </p>
            </div>
            <button 
              className="btn btn-secondary btn-sm" 
              onClick={() => onNavigate('explore')}
            >
              Browse All Skills <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid-3">
            {popularSkills.map((skill, index) => {
              const Icon = skill.icon;
              return (
                <div
                  key={index}
                  className="card glass-card-interactive"
                  onClick={() => onNavigate('explore')}
                  style={{
                    padding: '1rem 1.25rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.85rem'
                  }}
                >
                  <div style={{
                    width: '38px',
                    height: '38px',
                    borderRadius: '6px',
                    backgroundColor: '#F1F5F9',
                    border: '1px solid var(--border)',
                    color: '#2563EB',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Icon size={18} />
                  </div>
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '0.925rem', color: '#1E293B' }}>
                      {skill.name}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                      {skill.category} • {skill.count}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Campus Project Stats Banner */}
      <section style={{ padding: '3rem 0', backgroundColor: '#F8FAFC' }}>
        <div className="container">
          <div className="card" style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: '#FFFFFF'
          }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', color: '#1E293B' }}>
              Ready to learn from your classmates?
            </h2>
            <p style={{
              maxWidth: '520px',
              margin: '0 auto 1.5rem',
              fontSize: '0.95rem',
              color: '#64748B'
            }}>
              Join campus peers trading Python, Figma, React, Data Science, and Graphic Design.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={() => onNavigate('explore')}>
                Find a Skill Partner
              </button>
              {!currentUser && (
                <button className="btn btn-secondary" onClick={() => onOpenAuth('register')}>
                  Join Campus
                </button>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
