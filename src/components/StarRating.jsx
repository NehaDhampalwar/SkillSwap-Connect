import React, { useState } from 'react';
import { Star } from 'lucide-react';

export default function StarRating({ rating = 5, size = 16, interactive = false, onRatingChange = null }) {
  const [hoverRating, setHoverRating] = useState(0);

  const displayRating = interactive ? (hoverRating || rating) : rating;

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = star <= Math.round(displayRating);
        return (
          <span
            key={star}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            style={{
              cursor: interactive ? 'pointer' : 'default',
              transition: 'transform 0.15s ease',
              display: 'inline-flex',
              transform: interactive && hoverRating === star ? 'scale(1.2)' : 'scale(1)'
            }}
          >
            <Star
              size={size}
              fill={isFilled ? '#f59e0b' : 'none'}
              color={isFilled ? '#f59e0b' : 'rgba(255,255,255,0.25)'}
              strokeWidth={isFilled ? 0 : 1.5}
            />
          </span>
        );
      })}
    </div>
  );
}
