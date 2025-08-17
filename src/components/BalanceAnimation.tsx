import { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion, AnimatePresence, useMotionValue, animate, type AnimationPlaybackControls } from 'framer-motion';
import RollingDigit from './RollingDigit';
import NumberFlow from '@number-flow/react';

type Coin = {
  id: number;
  isCredit: boolean;
  delay: number;
  keyframesX: number[];
  keyframesY: number[];
};

export interface BalanceAnimationRef {
  changeBalance: (amount: number, fromCoordinates: { x: number; y: number }) => void;
  getBalanceIconCoordinates: () => { x: number; y: number };
  setBalanceType: (type: 'coins' | 'usdt') => void;
}

interface BalanceAnimationProps {
  initialBalance?: number;
  initialCoinsBalance?: number;
  initialUsdtBalance?: number;
  alwaysVisible?: boolean;
  animationSpeed?: number;
  className?: string;
  balanceType?: 'coins' | 'usdt';
  useRollingCounter?: boolean;
  useNumberFlow?: boolean;
}

const BalanceAnimation = forwardRef<BalanceAnimationRef, BalanceAnimationProps>(({ 
  initialCoinsBalance = 2255,
  initialUsdtBalance = 0,
  alwaysVisible = true,
  animationSpeed = 1,
  className = "",
  balanceType: initialBalanceType = 'coins',
  useRollingCounter = false,
  useNumberFlow = true,
}, ref) => {
  // Determine the correct initial balance based on balance type
  // (no longer used directly once we introduced per-type persistent balances)

  // Persistent balances for both types
  const [coinsBalance, setCoinsBalance] = useState<number>(initialCoinsBalance);
  const [usdtBalance, setUsdtBalance] = useState<number>(initialUsdtBalance);
  const [balanceType, setBalanceType] = useState<'coins' | 'usdt'>(initialBalanceType);
  
  // Current balance based on type
  const balance = balanceType === 'coins' ? coinsBalance : usdtBalance;
  // Note: do not alias setter to avoid "unused" issues; update specific setter explicitly on complete
  
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animatingCoins, setAnimatingCoins] = useState<Coin[]>([]);
  const [balanceVisible, setBalanceVisible] = useState<boolean>(true);
  const HOLD_AFTER_MS = 0; // pause on finished number
  const motionValue = useMotionValue(balance);
  const [displayBalance, setDisplayBalance] = useState<number>(balance);
  const [diffStartIndex, setDiffStartIndex] = useState<number>(-1);
  const balanceIconRef = useRef<HTMLDivElement | null>(null);

  const countingAnimationDuration = 1.0;
  const animatedCoinsDuration = countingAnimationDuration * 1.2;
  const [animId, setAnimId] = useState<number>(0);
  const animationControlsRef = useRef<AnimationPlaybackControls | null>(null);
  const animationRunIdRef = useRef<number>(0);
  const targetRef = useRef<number>(balance);
  const holdTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);
  const coinFinishTimerRef = useRef<number | null>(null);
  const coinsRunIdRef = useRef<number>(0);
  const directionRef = useRef<number>(0);
  // Tracks the sign of the most recent delta so highlight color reflects this call immediately
  const deltaSignRef = useRef<number>(0);
  
  // Coin animation constraints
  const MAX_X_OFFSET = 30; // Maximum negative X offset for coin arc
  const MAX_Y_OFFSET = 30; // Maximum Y offset from minimum Y position

  // Cleanup timers and animations on unmount
  useEffect(() => {
    return () => {
      animationControlsRef.current?.stop();
      if (holdTimerRef.current) window.clearTimeout(holdTimerRef.current);
      if (hideTimerRef.current) window.clearTimeout(hideTimerRef.current);
      if (coinFinishTimerRef.current) window.clearTimeout(coinFinishTimerRef.current);
    };
  }, []);

  // Update balance visibility when toggle changes
  useEffect(() => {
    setBalanceVisible(alwaysVisible);
  }, [alwaysVisible]);

  // Get the appropriate icon path based on balance type
  const getIconPath = (): string => {
    return balanceType === 'usdt' 
      ? "/src/assets/icon_coin_withdrawable_usd.webp"
      : "/src/assets/icon_coin.webp";
  };

  // Format number with comma separators
  const formatNumber = (num: number): string => {
    return Math.round(num).toLocaleString();
  };

  // Get individual digits for animation
  const getDigits = (num: number): string[] => {
    return formatNumber(num).split('');
  };

  // Find the first differing digit position (from left)
  const getFirstDifferingPosition = (oldNum: number, newNum: number): number => {
    const oldStr = formatNumber(oldNum);
    const newStr = formatNumber(newNum);
    
    for (let i = 0; i < Math.max(oldStr.length, newStr.length); i++) {
      if (oldStr[i] !== newStr[i]) {
        return i;
      }
    }
    return -1;
  };

  const getElementCenter = (el: HTMLElement | null): { x: number; y: number } => {
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const getBalanceIconCoordinates = (): { x: number; y: number } => {
    return getElementCenter(balanceIconRef.current);
  };

  const changeBalance = (amount: number, fromCoordinates: { x: number; y: number }) => {
    // Always ensure visibility during activity
    if (!balanceVisible) {
      setBalanceVisible(true);
    }

    // Cancel any pending hide timers; we'll decide to hide when truly idle
    if (hideTimerRef.current) {
      clearTimeout(hideTimerRef.current);
      hideTimerRef.current = null;
    }
    if (holdTimerRef.current) {
      clearTimeout(holdTimerRef.current);
      holdTimerRef.current = null;
    }
    if (coinFinishTimerRef.current) {
      clearTimeout(coinFinishTimerRef.current);
      coinFinishTimerRef.current = null;
    }

    // Accumulate new target based on current ultimate target, not last committed balance
    const currentDisplay = Math.round(motionValue.get());
    const newTarget = Math.max(0, (isAnimating ? targetRef.current : balance) + amount);
    targetRef.current = newTarget;

    // Record the sign of this change so highlight color is correct immediately
    deltaSignRef.current = amount > 0 ? 1 : amount < 0 ? -1 : 0;
    // Also prime direction to avoid a single-frame mismatch before retarget kicks in
    directionRef.current = deltaSignRef.current;

    // Bump animation id to restart highlight/scale timeline
    setAnimId((id) => id + 1);
    setIsAnimating(true);

    // Recompute differing index against current display so highlight is accurate mid-flight
    setDiffStartIndex(getFirstDifferingPosition(currentDisplay, newTarget));

    // Spawn additional coins for this delta
    spawnCoins(amount, fromCoordinates);

    // If we were in animation-only mode and hidden, make it visible first then retarget shortly after
    if (!alwaysVisible && !balanceVisible) {
      setTimeout(() => {
        retargetCounterAnimation(newTarget);
      }, 50 * animationSpeed);
    } else {
      retargetCounterAnimation(newTarget);
    }
  };

  const spawnCoins = (amount: number, fromCoordinates: { x: number; y: number }) => {
    const from = amount > 0 ? fromCoordinates : { x: MAX_X_OFFSET, y: MAX_Y_OFFSET };
    const toCenter = amount > 0 ? { x: MAX_X_OFFSET, y: MAX_Y_OFFSET } : fromCoordinates;
    const to = { x: toCenter.x - 8, y: toCenter.y - 7 };

    const coinCount = Math.min(Math.max(Math.floor(Math.abs(amount) / 1000), 4), 12);
    const coins = Array.from({ length: coinCount }, (_, i) => {
      const isLeftSide = i < coinCount / 2;
      const midX = isLeftSide
        ? Math.random() * MAX_X_OFFSET
        : Math.random() * (MAX_X_OFFSET * 4);
      const baseY = Math.min(from.y, to.y);
      const midY = baseY - Math.random() * MAX_Y_OFFSET;
      return {
        id: Date.now() + i,
        isCredit: amount > 0,
        delay: i * 0.05,
        keyframesX: [from.x, midX, to.x],
        keyframesY: [from.y, midY, to.y]
      };
    });
    setAnimatingCoins((prev) => {
      const next = [...prev, ...coins];
      // Soft cap to avoid unbounded arrays
      return next.slice(-120);
    });

    // finish after the last coin in this burst completes its flight
    const maxDelay = coins.reduce((acc, c) => Math.max(acc, c.delay), 0);
    const thisCoinsRunId = ++coinsRunIdRef.current;
    if (coinFinishTimerRef.current) clearTimeout(coinFinishTimerRef.current);
    coinFinishTimerRef.current = window.setTimeout(() => {
      if (thisCoinsRunId !== coinsRunIdRef.current) return;
      setIsAnimating(false);
      setDiffStartIndex(-1);
      setAnimatingCoins([]);
      if (!alwaysVisible) {
        hideTimerRef.current = window.setTimeout(() => {
          setBalanceVisible(false);
        }, 3000);
      }
    }, ((animatedCoinsDuration * animationSpeed) + maxDelay) * 1000 + HOLD_AFTER_MS);
  };

  const retargetCounterAnimation = (newTarget: number) => {
    // Stop any in-flight tween and start a new one from the current value
    animationControlsRef.current?.stop();
    const localRunId = ++animationRunIdRef.current;
    const currentVal = motionValue.get();
    if (newTarget > currentVal) directionRef.current = 1;
    else if (newTarget < currentVal) directionRef.current = -1;
    // bump to restart highlight block with fresh direction/color keyframes
    setAnimId((id) => id + 1);
    animationControlsRef.current = animate(motionValue, newTarget, {
      duration: countingAnimationDuration * animationSpeed,
      ease: "easeOut",
      onUpdate: (val) => {
        setDisplayBalance(val);
      },
      onComplete: () => {
        // Ignore if superseded by a newer run
        if (localRunId !== animationRunIdRef.current) return;
        // Update the correct balance based on current type
        if (balanceType === 'coins') {
          setCoinsBalance(newTarget);
        } else {
          setUsdtBalance(newTarget);
        }
        setDisplayBalance(newTarget);
        // finalization handled by coinFinishTimerRef scheduled in spawnCoins
      }
    });
  };

  // Expose methods via ref
  useImperativeHandle(ref, () => ({
    changeBalance,
    getBalanceIconCoordinates,
    setBalanceType: (type: 'coins' | 'usdt') => {
      setBalanceType(type);
      // Switch to the persistent balance for this type
      const newBalance = type === 'coins' ? coinsBalance : usdtBalance;
      setDisplayBalance(newBalance);
      motionValue.set(newBalance);
      targetRef.current = newBalance;
    }
  }));

  const digits = getDigits(displayBalance);
  const isCredit = (deltaSignRef.current !== 0 ? deltaSignRef.current : directionRef.current) > 0;
  // Map each rendered character to its numeric place value for per-digit rolling
  const digitsStr = digits.join('');
  const rawNumericStr = digitsStr.replace(/[^0-9]/g, '');
  const places: Array<number | null> = [];
  {
    let numericIndex = 0;
    for (let i = 0; i < digits.length; i++) {
      const ch = digits[i];
      if (/\d/.test(ch)) {
        const power = rawNumericStr.length - numericIndex - 1;
        places[i] = Math.pow(10, power);
        numericIndex++;
      } else {
        places[i] = null;
      }
    }
  }
  
  // During animation, find which digits should be colored
  const shouldColorDigit = (index: number): boolean => {
    if (!isAnimating) return false;
    return diffStartIndex >= 0 && index >= diffStartIndex;
  };

  return (
    <div className={`relative ${className}`} style={{ zIndex: 12_000 }}>
      {/* Animated Coins */}
      <AnimatePresence>
        {animatingCoins.map((coin) => (
          <motion.div
            key={coin.id}
            className="fixed top-0 left-0 w-4 h-4 z-20 pointer-events-none"
            initial={{
              x: coin.keyframesX[0],
              y: coin.keyframesY[0],
              scale: 0.0
            }}
            animate={{
              x: coin.keyframesX,
              y: coin.keyframesY,
              scale: [0.0, 1.0, 1.0, 1.0, 0.0]
            }}
            transition={{
              duration: animatedCoinsDuration * animationSpeed,
              delay: coin.delay,
              ease: "easeOut"
            }}
          >
            <img src={getIconPath()} alt="Coin" className="w-full h-full object-contain" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Balance Display with Icon Overlay */}
      <motion.div
        initial={!alwaysVisible ? { opacity: 0, scale: 0.5 } : { opacity: 1, scale: 1 }}
        animate={balanceVisible ? { 
          opacity: 1, 
          scale: [0.5, 1.4, 1] 
        } : { 
          opacity: 0, 
          scale: 0.5 
        }}
        transition={
          balanceVisible 
            ? { 
                opacity: { duration: 0.1 * animationSpeed },
                scale: { 
                  duration: 0.45 * animationSpeed,
                  ease: "easeInOut"
                }
              }
            : { duration: 0.2 * animationSpeed }
        }
        className="relative"
        style={{ transformOrigin: 'top left' }}
      >
        {/* Balance Container */}
        <div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl pl-1.5 pr-2 relative z-10 flex items-center"
          style={{ 
            height: '30px',
            outline: '1px solid rgba(0, 0, 0, 0.15)',
            boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.20)',
          }}
        >
          <div className="flex items-center" style={{ gap: '2px' }}>
            {/* Invisible placeholder to maintain spacing */}
            <div className="w-4 h-4 flex items-center justify-center">
            </div>
          
          <div className="flex items-center">
            <div className="flex items-center text-base font-bold leading-5 whitespace-nowrap">
              {(() => {
                // NumberFlow option - smooth rolling with selective highlighting
                if (useNumberFlow) {
                  const formattedValue = formatNumber(Math.round(displayBalance));
                  const shouldHighlight = isAnimating && diffStartIndex >= 0;
                  
                  return (
                    <motion.div
                      className="inline-flex tabular-nums"
                      animate={shouldHighlight ? {
                        fontSize: ['1rem', '1rem', '1.4rem', '1.4rem', '1.4rem', '1.4rem', '1.4rem', '1.4rem', '1rem'],
                        color: [
                          '#1f2937',
                          '#1f2937',
                          isCredit ? '#22c55e' : '#f97316',
                          isCredit ? '#22c55e' : '#f97316',
                          isCredit ? '#22c55e' : '#f97316',
                          isCredit ? '#22c55e' : '#f97316',
                          '#1f2937'
                        ],
                        marginBottom: ['0px', '1px', '1px', '1px', '1px', '1px', '0px']
                      } : { fontSize: '1rem', color: '#1f2937' }}
                      transition={{
                        duration: countingAnimationDuration * animationSpeed,
                        ease: 'easeOut'
                      }}
                    >
                      <NumberFlow
                        value={Math.round(displayBalance)}
                        format={{ 
                          notation: 'standard',
                          minimumFractionDigits: 0,
                          maximumFractionDigits: 0,
                          useGrouping: true
                        }}
                        style={{
                          fontSize: 'inherit',
                          fontWeight: 'inherit',
                          color: 'inherit',
                          fontVariantNumeric: 'tabular-nums',
                          lineHeight: 'inherit'
                        }}
                        transformTiming={{
                          duration: countingAnimationDuration * animationSpeed * 1000,
                          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        spinTiming={{
                          duration: countingAnimationDuration * animationSpeed * 1000,
                          easing: 'cubic-bezier(0.4, 0, 0.2, 1)'
                        }}
                        trend={deltaSignRef.current !== 0 ? deltaSignRef.current : directionRef.current}
                      />
                    </motion.div>
                  );
                }
                
                const result = [];
                let i = 0;
                while (i < digits.length) {
                  const shouldColor = shouldColorDigit(i);
                  if (shouldColor) {
                    let groupEnd = i;
                    while (groupEnd < digits.length - 1 && shouldColorDigit(groupEnd + 1)) {
                      groupEnd++;
                    }
                    const groupDigits = digits.slice(i, groupEnd + 1);
                    result.push(
                      <motion.span
                        key={`highlighted-group-${animId}-${i}`}
                        className="inline-flex origin-left tabular-nums"
                        style={{ color: '#1f2937', fontSize: '1rem' }}
                        animate={isAnimating ? {
                          fontSize: ['1rem', '1rem', '1.4rem', '1.4rem', '1.4rem', '1.4rem', '1.4rem', '1.4rem', '1rem'],
                          color: [
                            '#1f2937',
                            '#1f2937',
                            isCredit ? '#22c55e' : '#f97316',
                            isCredit ? '#22c55e' : '#f97316',
                            isCredit ? '#22c55e' : '#f97316',
                            isCredit ? '#22c55e' : '#f97316',
                            '#1f2937'
                          ],
                          marginBottom: ['0px', '1px', '1px', '1px', '1px', '1px', '0px']
                        } : { fontSize: '1rem' }}
                        transition={{
                          duration: countingAnimationDuration * animationSpeed,
                          ease: 'easeOut'
                        }}
                      >
                        {groupDigits.map((groupDigit, groupIndex) => {
                          const idx = i + groupIndex;
                          const place = places[idx];
                          const isNumeric = /\d/.test(groupDigit);
                          if (useRollingCounter && isNumeric && place) {
                            return (
                              <RollingDigit
                                key={`rolling-${idx}`}
                                place={place}
                                value={Math.round(displayBalance)}
                                height={20}
                                trend={(deltaSignRef.current !== 0 ? deltaSignRef.current : directionRef.current) as -1 | 0 | 1}
                              />
                            );
                          }
                          return (
                            <span key={`group-${idx}-${groupDigit}`} className={`inline-block`}>
                              {groupDigit}
                            </span>
                          );
                        })}
                      </motion.span>
                    );
                    i = groupEnd + 1;
                  } else {
                    result.push(
                      <span
                        key={`static-${animId}-${i}`}
                        className={`inline-block transition-colors duration-200 text-gray-800`}
                      >
                        {digits[i]}
                      </span>
                    );
                    i++;
                  }
                }
                return result;
              })()}
            </div>
          </div>
          </div>
        </div>
        
        {/* Dollar Icon - Positioned absolutely on top */}
        <motion.div 
          key={`icon-${animId}`}
          ref={balanceIconRef}
          className="absolute w-4 h-4 flex items-center justify-center z-30 pointer-events-none"
          style={{
            left: '6px',
            top: '7px'
          }}
          animate={isAnimating ? { 
            scale: [1, 1.5, 1.5, 1.5, 1.5, 1],
            x: [0, -4, -4, 0]
          } : { scale: 1, x: 0 }}
          transition={{ duration: countingAnimationDuration * animationSpeed, times: [0, 0.15, 0.85, 1], ease: "easeOut" }}
        >
          <img src={getIconPath()} alt="Coin" className="w-full h-full object-contain" />
        </motion.div>
      </motion.div>
    </div>
  );
});

BalanceAnimation.displayName = 'BalanceAnimation';

export default BalanceAnimation;