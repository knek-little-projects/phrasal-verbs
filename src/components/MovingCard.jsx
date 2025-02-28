import { useEffect, useState } from 'react';
import Card from './Card';
import './MovingCard.scss';

export default function MovingCard({ 
  startPosition, 
  endPosition, 
  onAnimationEnd,
  card,
  rotation = 0
}) {
  const [position, setPosition] = useState(startPosition);
  const [currentRotation, setCurrentRotation] = useState(0);
  const [isAnimating, setIsAnimating] = useState(true);

  useEffect(() => {
    requestAnimationFrame(() => {
      setPosition(endPosition);
      setCurrentRotation(rotation);
    });

    const timer = setTimeout(() => {
      setIsAnimating(false);
      onAnimationEnd();
    }, 500);

    return () => clearTimeout(timer);
  }, [endPosition, rotation, onAnimationEnd]);

  if (!isAnimating) return null;

  return (
    <div 
      className="moving-card"
      style={{
        left: 0,
        top: 0,
        transform: `translate(${position.x}px, ${position.y}px) rotate(${currentRotation}deg)`,
      }}
    >
      <Card card={card} faceDown={false} />
    </div>
  );
} 