import { useEffect, type CSSProperties } from 'react';
import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion';

type Trend = -1 | 0 | 1;

interface DigitFaceProps {
  mv: MotionValue<number>;
  number: number;
  height: number;
  trend: Trend;
}

function DigitFace({ mv, number, height, trend }: DigitFaceProps) {
  const y = useTransform(mv, latest => {
    const placeValue = latest % 10;
    let offset: number;
    if (trend === 1) {
      offset = (10 + number - placeValue) % 10;
    } else if (trend === -1) {
      offset = -((10 + placeValue - number) % 10);
    } else {
      const shortest = (10 + number - placeValue) % 10;
      offset = shortest > 5 ? shortest - 10 : shortest;
    }
    return offset * height;
  });

  const style: CSSProperties = {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  };

  return <motion.span style={{ ...style, y }}>{number}</motion.span>;
}

export interface RollingDigitProps {
  place: number;
  value: number;
  height: number;
  trend: Trend;
  style?: CSSProperties;
}

export default function RollingDigit({ place, value, height, trend, style }: RollingDigitProps) {
  const valueRoundedToPlace = Math.floor(value / place);
  const spring = useSpring(valueRoundedToPlace, {
    stiffness: 520,
    damping: 44,
    mass: 1,
    restDelta: 0.001,
    restSpeed: 0.01,
  });

  useEffect(() => {
    spring.set(valueRoundedToPlace);
  }, [spring, valueRoundedToPlace]);

  const defaultStyle: CSSProperties = {
    height,
    position: 'relative',
    width: '1ch',
    fontVariantNumeric: 'tabular-nums',
    willChange: 'transform',
    contain: 'strict',
  };

  return (
    <span style={{ ...defaultStyle, ...style }}>
      {Array.from({ length: 10 }, (_, i) => (
        <DigitFace key={i} mv={spring} number={i} height={height} trend={trend} />
      ))}
    </span>
  );
}


