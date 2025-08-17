import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { motion, useSpring, useTransform, type MotionValue } from 'framer-motion';

type Trend = -1 | 0 | 1;

export interface RollingCounterProps {
  value: number;
  minDigits?: number;
  groupThousands?: boolean;
  fontSize?: number;
  lineHeightPx?: number;
  digitGap?: number;
  horizontalPadding?: number;
  borderRadius?: number;
  textColor?: string;
  fontWeight?: CSSProperties['fontWeight'];
  className?: string;
  containerStyle?: CSSProperties;
  counterStyle?: CSSProperties;
  digitStyle?: CSSProperties;
  gradientHeight?: number;
  gradientFrom?: string;
  gradientTo?: string;
  showGradientMask?: boolean;
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
    restDelta?: number;
    restSpeed?: number;
  };
  trend?: Trend;
}

interface DigitFaceProps {
  motionValue: MotionValue<number>;
  faceNumber: number;
  columnHeight: number;
  trend: Trend;
}

function DigitFace({ motionValue, faceNumber, columnHeight, trend }: DigitFaceProps) {
  const translateY = useTransform(motionValue, latest => {
    const placeValue = latest % 10;
    let offset: number;
    if (trend === 1) {
      offset = (10 + faceNumber - placeValue) % 10;
    } else if (trend === -1) {
      offset = -((10 + placeValue - faceNumber) % 10);
    } else {
      const shortest = (10 + faceNumber - placeValue) % 10;
      offset = shortest > 5 ? shortest - 10 : shortest;
    }
    return offset * columnHeight;
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

  return (
    <motion.span style={{ ...style, y: translateY }}>{faceNumber}</motion.span>
  );
}

interface DigitColumnProps {
  place: number;
  numericValue: number;
  columnHeight: number;
  trend: Trend;
  spring?: RollingCounterProps['spring'];
  digitStyle?: CSSProperties;
}

function DigitColumn({ place, numericValue, columnHeight, digitStyle, trend, spring }: DigitColumnProps) {
  const valueRoundedToPlace = Math.floor(numericValue / place);
  const animatedValue = useSpring(valueRoundedToPlace, {
    stiffness: spring?.stiffness ?? 400,
    damping: spring?.damping ?? 40,
    mass: spring?.mass ?? 1,
    restDelta: spring?.restDelta ?? 0.001,
    restSpeed: spring?.restSpeed ?? 0.01,
  });

  useEffect(() => {
    animatedValue.set(valueRoundedToPlace);
  }, [animatedValue, valueRoundedToPlace]);

  const defaultStyle: CSSProperties = {
    height: columnHeight,
    position: 'relative',
    width: '1ch',
    fontVariantNumeric: 'tabular-nums',
    willChange: 'transform',
    contain: 'strict',
  };

  return (
    <div style={{ ...defaultStyle, ...digitStyle }}>
      {Array.from({ length: 10 }, (_, i) => (
        <DigitFace
          key={i}
          motionValue={animatedValue}
          faceNumber={i}
          columnHeight={columnHeight}
          trend={trend}
        />
      ))}
    </div>
  );
}

function padDigits(num: number, minDigits: number): string {
  const isNegative = num < 0;
  const n = Math.abs(Math.floor(num)).toString();
  const padded = n.padStart(minDigits, '0');
  return isNegative ? `-${padded}` : padded;
}

function insertGrouping(src: string): string {
  const isNegative = src.startsWith('-');
  const s = isNegative ? src.slice(1) : src;
  let out = '';
  let count = 0;
  for (let i = s.length - 1; i >= 0; i--) {
    out = s[i] + out;
    count++;
    if (i > 0 && count % 3 === 0) out = ',' + out;
  }
  return isNegative ? `-${out}` : out;
}

export default function RollingCounter({
  value,
  minDigits = 1,
  groupThousands = true,
  fontSize = 24,
  lineHeightPx,
  digitGap = 4,
  horizontalPadding = 6,
  borderRadius = 8,
  textColor = '#111827',
  fontWeight = 700,
  className,
  containerStyle,
  counterStyle,
  digitStyle,
  gradientHeight = 10,
  gradientFrom = 'rgba(255,255,255,1)',
  gradientTo = 'rgba(255,255,255,0)',
  showGradientMask = true,
  spring,
  trend,
}: RollingCounterProps) {
  const previousRef = useRef<number>(value);
  const [computedTrend, setComputedTrend] = useState<Trend>(0);
  useEffect(() => {
    const prev = previousRef.current;
    const dir: Trend = Math.sign(value - prev) as Trend;
    setComputedTrend(dir === 0 ? 0 : dir);
    previousRef.current = value;
  }, [value]);

  const effectiveTrend: Trend = trend ?? computedTrend;

  const height = lineHeightPx ?? Math.round(fontSize * 1.1);

  const rawDigits = useMemo(() => padDigits(value, minDigits), [value, minDigits]);
  const displayDigits = useMemo(
    () => (groupThousands ? insertGrouping(rawDigits) : rawDigits),
    [rawDigits, groupThousands]
  );

  const places = useMemo(() => {
    const numericsOnly = rawDigits.replace('-', '');
    const len = numericsOnly.length;
    const arr: Array<number | null> = [];
    let numericIndex = 0;
    for (let i = 0; i < displayDigits.length; i++) {
      const ch = displayDigits[i];
      if (ch >= '0' && ch <= '9') {
        const power = len - numericIndex - 1;
        arr.push(Math.pow(10, power));
        numericIndex++;
      } else {
        arr.push(null);
      }
    }
    return arr;
  }, [displayDigits, rawDigits]);

  const defaultContainerStyle: CSSProperties = {
    position: 'relative',
    display: 'inline-block',
  };

  const defaultCounterStyle: CSSProperties = {
    fontSize,
    display: 'flex',
    gap: digitGap,
    overflow: 'hidden',
    borderRadius,
    paddingLeft: horizontalPadding,
    paddingRight: horizontalPadding,
    lineHeight: 1,
    color: textColor,
    fontWeight,
    fontVariantNumeric: 'tabular-nums',
    alignItems: 'center',
  };

  const gradientContainerStyle: CSSProperties = {
    pointerEvents: 'none',
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  };

  const topGradientStyle: CSSProperties = {
    height: gradientHeight,
    background: `linear-gradient(to bottom, ${gradientFrom}, ${gradientTo})`,
  };

  const bottomGradientStyle: CSSProperties = {
    position: 'absolute',
    bottom: 0,
    width: '100%',
    height: gradientHeight,
    background: `linear-gradient(to top, ${gradientFrom}, ${gradientTo})`,
  };

  return (
    <div className={className} style={{ ...defaultContainerStyle, ...containerStyle }}>
      <div style={{ ...defaultCounterStyle, ...counterStyle }}>
        {displayDigits.split('').map((ch, idx) => {
          if (ch < '0' || ch > '9') {
            return (
              <span key={`sep-${idx}`} style={{ width: '0.5ch', textAlign: 'center' }}>
                {ch}
              </span>
            );
          }
          const place = places[idx] as number;
          return (
            <DigitColumn
              key={`digit-${idx}`}
              place={place}
              numericValue={Math.abs(Math.floor(value))}
              columnHeight={height}
              digitStyle={digitStyle}
              trend={effectiveTrend}
              spring={spring}
            />
          );
        })}
      </div>
      {showGradientMask && (
        <div style={gradientContainerStyle}>
          <div style={topGradientStyle} />
          <div style={bottomGradientStyle} />
        </div>
      )}
    </div>
  );
}


