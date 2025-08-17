import React, { useEffect, useRef, useState } from 'react';

interface ConfettiParticle {
  x: number;
  y: number;
  type: 'circle' | 'star';
  color: string;
  size: number;
  opacity: number;
  velocity: { x: number; y: number };
  fadeOut: boolean;
}

interface ConfettiParticlesProps {
  count?: number;
  style?: React.CSSProperties;
  delay?: number;
  margin?: number;
  padding?: number;
}

export const ConfettiParticles: React.FC<ConfettiParticlesProps> = ({
  count = 50,
  style,
  delay = 0,
  margin = 8,
  padding = 8,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sizeRef = useRef<HTMLDivElement>(null);
  const particlesRef = useRef<ConfettiParticle[]>([]);
  const requestRef = useRef<number>();

  const scale = 4;

  const [parentWidth, setParentWidth] = useState(360);
  const [parentHeight, setParentHeight] = useState(42);

  useEffect(() => {
    const updateParticlesSize = () => {
      if (sizeRef.current) {
        const rect = sizeRef.current.getBoundingClientRect();
        setParentWidth(rect.width - (margin + padding) * 2);
        setParentHeight(rect.height - (margin + padding) * 2);
      }
    };

    const resizeObserver = new ResizeObserver(updateParticlesSize);
    if (sizeRef.current) {
      resizeObserver.observe(sizeRef.current);
    }

    updateParticlesSize();

    return () => {
      resizeObserver.disconnect();
    };
  }, [margin, padding, scale]);

  useEffect(() => {
    if (delay > 0) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, delay);

      return () => clearTimeout(timer);
    } else {
      setIsVisible(true);
    }
  }, [delay]);

  useEffect(() => {
    const COLORS = [
      '#FAFF00',
      '#FF6FB4',
      '#00FFA3',
      '#504BD7',
      '#6FFFBA',
      '#31FF0D',
      '#00E0FF',
      '#FF7B00',
      '#0DFF6A',
      '#B0FF27',
    ];

    const generateParticle = (): ConfettiParticle => {
      const color = COLORS[Math.floor(Math.random() * COLORS.length)];

      let x, y;
      if (parentWidth === parentHeight) {
        // Generate point inside circle using polar coordinates
        const radius = (parentWidth / 2) * Math.sqrt(Math.random()); // Square root for uniform distribution
        const angle = Math.random() * 2 * Math.PI;
        const center = margin + padding + parentWidth / 2;

        x = (center + radius * Math.cos(angle)) * scale;
        y = (center + radius * Math.sin(angle)) * scale;
      } else {
        x = (margin + padding + Math.random() * parentWidth) * scale;
        y = (margin + padding + Math.random() * parentHeight) * scale;
      }

      return {
        x,
        y,
        size: 1.5 + Math.random() * 1.5,
        opacity: 0.3 + Math.random() * 0.7,
        velocity: {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1,
        },
        fadeOut: false,
        type: Math.random() < 0.5 ? 'circle' : 'star',
        color,
      };
    };

    particlesRef.current = Array(count).fill(null).map(generateParticle);
    let lastTime = performance.now();

    const animate = (currentTime: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext('2d', { alpha: true });
      if (!canvas || !ctx) return;

      const deltaTime = currentTime - lastTime;
      lastTime = currentTime;

      ctx.clearRect(
        0,
        0,
        (parentWidth + (padding + margin) * 2) * scale,
        (parentHeight + (padding + margin) * 2) * scale,
      );

      particlesRef.current.forEach((particle) => {
        if (parentWidth === parentHeight) {
          // For square containers, use circular boundary
          const center = (margin + padding + parentWidth / 2) * scale;
          const radius = (parentWidth / 2 + padding) * scale; // Half width plus padding for the boundary

          const distanceFromCenter = Math.sqrt(
            Math.pow(particle.x - center, 2) + Math.pow(particle.y - center, 2),
          );

          if (!particle.fadeOut && distanceFromCenter > radius) {
            particle.fadeOut = true;
          }
        } else {
          // For rectangular containers, use rectangular boundary
          if (
            !particle.fadeOut &&
            (particle.x < margin * scale ||
              particle.x > (margin + padding + parentWidth + padding) * scale ||
              particle.y < margin * scale ||
              particle.y > (margin + padding + parentHeight + padding) * scale)
          ) {
            particle.fadeOut = true;
          }
        }

        particle.x += particle.velocity.x * deltaTime;
        particle.y += particle.velocity.y * deltaTime;

        if (particle.fadeOut) {
          const velocityMagnitude = Math.sqrt(
            particle.velocity.x * particle.velocity.x + particle.velocity.y * particle.velocity.y,
          );
          const baseFadeSpeed = 0.001;
          const fadeSpeed = baseFadeSpeed * (1 + velocityMagnitude * 50);

          particle.opacity = Math.max(0, particle.opacity - fadeSpeed * deltaTime);

          if (particle.opacity <= 0) {
            Object.assign(particle, generateParticle());
            particle.fadeOut = false;
          }
        }

        // Save the current transform state
        ctx.save();

        // Scale up the position for high-resolution rendering
        ctx.translate(particle.x, particle.y);

        ctx.globalAlpha = particle.opacity;

        if (particle.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, particle.size * scale, 0, Math.PI * 2);
          ctx.fillStyle = particle.color;
          ctx.fill();
        } else if (particle.type === 'star') {
          const size = particle.size * scale * 1.5;
          ctx.beginPath();
          ctx.moveTo(0, -size);
          ctx.lineTo(size / 3, -size / 3);
          ctx.lineTo(size, 0);
          ctx.lineTo(size / 3, size / 3);
          ctx.lineTo(0, size);
          ctx.lineTo(-size / 3, size / 3);
          ctx.lineTo(-size, 0);
          ctx.lineTo(-size / 3, -size / 3);
          ctx.closePath();
          ctx.fillStyle = particle.color;
          ctx.fill();
        }

        ctx.restore();
      });

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current);
      }
    };
  }, [parentWidth, parentHeight, count, margin, padding, scale]);

  return (
    <>
      <div
        ref={sizeRef}
        style={{ position: 'absolute', inset: -(margin + padding), pointerEvents: 'none' }}
      />
      <canvas
        width={(parentWidth + (margin + padding) * 2) * scale}
        height={(parentHeight + (margin + padding) * 2) * scale}
        ref={canvasRef}
        style={{
          position: 'absolute',
          zIndex: 1,
          opacity: isVisible ? 1 : 0,
          transition:
            'opacity 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)',
          transform: `scale(${1 / scale})`,
          transformOrigin: 'top left',
          inset: -(margin + padding),
          imageRendering: 'auto',
          pointerEvents: 'none',
          ...style,
        }}
      />
    </>
  );
};
