import React from 'react';
import { Layers } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon = Layers, 
  title = 'No items found', 
  description = 'There are no items matching this criteria right now.', 
  actionLabel = null, 
  onAction = null 
}) {
  return (
    <div style={{
      padding: '3rem 1.5rem',
      textAlign: 'center',
      backgroundColor: '#FFFFFF',
      borderRadius: 'var(--radius-md)',
      border: '1px dashed var(--border)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      margin: '1.5rem 0'
    }}>
      <div style={{
        width: '44px',
        height: '44px',
        borderRadius: '50%',
        backgroundColor: '#EFF6FF',
        color: '#2563EB',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '0.85rem'
      }}>
        <Icon size={22} />
      </div>
      <h3 style={{ fontSize: '1.05rem', fontWeight: '600', marginBottom: '0.35rem', color: '#1E293B' }}>
        {title}
      </h3>
      <p style={{ maxWidth: '400px', fontSize: '0.875rem', color: '#64748B', marginBottom: actionLabel ? '1.25rem' : 0 }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-primary btn-sm" onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
}
