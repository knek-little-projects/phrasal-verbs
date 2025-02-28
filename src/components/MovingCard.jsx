import { useEffect, useState } from 'react';
import Card from './Card';
import './MovingCard.scss';

export default function MovingCard({ startPosition, endPosition, onAnimationEnd }) {
  const [position, setPosition] = useState(startPosition);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    // Start animation in the next frame to ensure the initial position is applied
    requestAnimationFrame(() => {
      setPosition(endPosition);
    });

    const timer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationEnd();
    }, 500); // Match this with CSS animation duration

    return () => clearTimeout(timer);
  }, [endPosition, onAnimationEnd]);

  if (!isAnimating) return null;

  return (
    <div 
      className="moving-card"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px)`,
      }}
    >
      <Card faceDown={true} />
    </div>
  );
} 