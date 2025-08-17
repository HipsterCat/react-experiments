import React from 'react';

interface ConfettiParticlesProps {
  count?: number;
  margin?: number;
  padding?: number;
}

export const ConfettiParticles: React.FC<ConfettiParticlesProps> = ({ 
  count = 40 
}) => {
  // Simple animated sparkles effect
  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-yellow-300 rounded-full animate-pulse"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 2}s`,
            animationDuration: `${1 + Math.random()}s`,
          }}
        />
      ))}
    </div>
  );
};
