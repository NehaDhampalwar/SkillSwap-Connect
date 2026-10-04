import React from 'react';
import { 
  Code, Brain, Palette, PenTool, Layout, Globe, 
  BarChart2, FileSpreadsheet, Coffee, Cpu, Check, X, BookOpen 
} from 'lucide-react';

const ICON_MAP = {
  'Python': Code,
  'Machine Learning': Brain,
  'UI/UX Design': Palette,
  'Graphic Design': PenTool,
  'React': Layout,
  'Web Development': Globe,
  'Data Science': BarChart2,
  'Excel': FileSpreadsheet,
  'Java': Coffee,
  'C Programming': Cpu
};

export default function SkillBadge({ 
  skill, 
  type = 'teach', 
  onRemove = null, 
  showLevel = true,
  size = 'md' 
}) {
  const name = typeof skill === 'string' ? skill : skill.name;
  const level = typeof skill === 'object' ? (skill.level || skill.targetLevel) : null;
  const IconComponent = ICON_MAP[name] || BookOpen;

  const isTeach = type === 'teach';
  const badgeClass = isTeach ? 'badge-teach' : 'badge-learn';

  return (
    <span 
      className={`badge ${badgeClass}`}
      style={{
        padding: size === 'sm' ? '0.15rem 0.45rem' : '0.25rem 0.6rem',
        fontSize: size === 'sm' ? '0.75rem' : '0.8125rem',
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.35rem',
        borderRadius: 'var(--radius-sm)'
      }}
    >
      <IconComponent size={size === 'sm' ? 12 : 13} />
      <span>{name}</span>
      {showLevel && level && (
        <span style={{
          fontSize: '0.6875rem',
          backgroundColor: isTeach ? '#DBEAFE' : '#E2E8F0',
          color: isTeach ? '#1E40AF' : '#475569',
          padding: '0.05rem 0.35rem',
          borderRadius: '3px',
          marginLeft: '2px',
          fontWeight: '500'
        }}>
          {level}
        </span>
      )}
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove(name);
          }}
          style={{
            background: 'none',
            border: 'none',
            color: 'inherit',
            cursor: 'pointer',
            padding: 0,
            display: 'flex',
            alignItems: 'center',
            opacity: 0.7
          }}
          onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
          onMouseLeave={(e) => e.currentTarget.style.opacity = 0.7}
        >
          <X size={12} />
        </button>
      )}
    </span>
  );
}
