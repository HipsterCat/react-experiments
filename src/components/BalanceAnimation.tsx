import { useState, useRef, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

type Coin = {
  id: number;
  isCredit: boolean;
  delay: number;
  keyframesX: number[];
  keyframesY: number[];
};

const BalanceCounter = () => {
  const [balance, setBalance] = useState<number>(200000);
  const [isAnimating, setIsAnimating] = useState<boolean>(false);
  const [animatingCoins, setAnimatingCoins] = useState<Coin[]>([]);
  const [changeAmount, setChangeAmount] = useState<number>(0);
  const animationSpeed = 1;
  const HOLD_AFTER_MS = 0; // pause on finished number
  const motionValue = useMotionValue(balance);
  const [displayBalance, setDisplayBalance] = useState<number>(balance);
  const [diffStartIndex, setDiffStartIndex] = useState<number>(-1);
  const balanceIconRef = useRef<HTMLDivElement | null>(null);
  const buttonRefs = [
    useRef<HTMLButtonElement | null>(null),
    useRef<HTMLButtonElement | null>(null),
    useRef<HTMLButtonElement | null>(null),
    useRef<HTMLButtonElement | null>(null)
  ];

  const countingAnimationDuration = 1.2;
  const [animDuration, setAnimDuration] = useState<number>(1);
  const [animId, setAnimId] = useState<number>(0);
  // Width approximation for digits and commas (tune for your design)
  const DIGIT_PX = 10;
  const COMMA_PX = 4;
  const HIGHLIGHT_SCALE = 1.4;
  
  // Coin animation constraints
  const MAX_COIN_OFFSET = 30; // Maximum negative X offset for coin arc
  const MAX_Y_OFFSET = 30; // Maximum Y offset from minimum Y position

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

  const changeBalance = (amount: number, buttonIndex: number) => {
    if (isAnimating) return;
    const newBalance = balance + amount;
    const oldBalance = balance;
    setAnimId((id) => id + 1);
    setChangeAmount(amount);
    setIsAnimating(true);
    setDiffStartIndex(getFirstDifferingPosition(oldBalance, newBalance));

    // DOM based positions
    const buttonEl = buttonRefs[buttonIndex]?.current as HTMLElement | null;
    const iconEl = balanceIconRef.current as HTMLElement | null;
    const from = amount > 0 ? getElementCenter(buttonEl) : getElementCenter(iconEl);
    const toCenter = amount > 0 ? getElementCenter(iconEl) : getElementCenter(buttonEl);
    // Adjust final position to account for coin positioning
    const to = { x: toCenter.x - 8, y: toCenter.y - 7 };

    // Create coins along an arc
    const coinCount = Math.min(Math.max(Math.floor(Math.abs(amount) / 1000), 4), 12);
    const coins = Array.from({ length: coinCount }, (_, i) => {
      // Create symmetric pattern: half coins negative midX, half positive midX
      const isLeftSide = i < coinCount / 2;
      const midX = isLeftSide 
        ? -Math.random() * MAX_COIN_OFFSET  // Negative midX for left side
        : Math.random() * MAX_COIN_OFFSET;  // Positive midX for right side
      // Y offset limited to not go higher than -MAX_Y_OFFSET
      const baseY = Math.min(from.y, to.y);
      const midY = baseY - Math.random() * MAX_Y_OFFSET;
      // console.log('coins coinCount', coinCount);
      // console.log('coins baseY', baseY);
      // console.log('coins midX', midX, 'midY', midY);
      // console.log('coins from', from.x, from.y, 'to', to.x, to.y);
      return {
        id: Date.now() + i,
        isCredit: amount > 0,
        delay: i * 0.05,
        keyframesX: [from.x, midX, to.x],
        keyframesY: [from.y, midY, to.y]
      };
    });
    setAnimatingCoins(coins);

    // Animate the counter value
    const duration = Math.min(Math.abs(amount) / 8000 + 1.2, 3) * animationSpeed;
    setAnimDuration(duration);
    animate(motionValue, newBalance, {
      duration: countingAnimationDuration * animationSpeed,
      ease: [0.25, 0.46, 0.45, 0.94], // Start fast, then DRAMATICALLY slow down at the end
      onUpdate: (motionValue) => {
        console.log('onUpdate setDisplayBalance', motionValue);
        setDisplayBalance(motionValue);
      },
      onComplete: () => {
        console.log('onComplete setDisplayBalance', newBalance);
        setBalance(newBalance);
        setDisplayBalance(newBalance);
        // Pause a bit on the final state before clearing highlight
        setTimeout(() => {
          console.log('holdTimer setIsAnimating false');
          setIsAnimating(false);
          setChangeAmount(0);
          setDiffStartIndex(-1);
          setAnimatingCoins([]);
        }, HOLD_AFTER_MS);
      }
    });
  };

  const digits = getDigits(displayBalance);
  const isCredit = changeAmount > 0;
  
  // Compute approximate width of the highlighted group only (diffStartIndex .. end)
  const highlightedGroupWidthPx = useMemo(() => {
    if (!isAnimating || diffStartIndex < 0) return 0;
    const group = digits.slice(diffStartIndex);
    const numCommas = group.reduce((acc, ch) => acc + (ch === ',' ? 1 : 0), 0);
    const numDigits = group.length - numCommas;
    console.log('highlightedGroupWidthPx', numDigits * DIGIT_PX + numCommas * COMMA_PX);
    return numDigits * DIGIT_PX + numCommas * COMMA_PX;
  }, [isAnimating, diffStartIndex, digits]);

  const extraWidthPx = useMemo(() => {
    if (!isAnimating) return 0;
    const extra = Math.ceil(highlightedGroupWidthPx * (HIGHLIGHT_SCALE - 1));
    console.log('extraWidthPx', extra);
    return extra;
  }, [isAnimating, highlightedGroupWidthPx]);
  
  // During animation, find which digits should be colored
  const shouldColorDigit = (index: number): boolean => {
    if (!isAnimating || changeAmount === 0) return false;
    // Use the precomputed index so highlight persists during the end hold
    return diffStartIndex >= 0 && index >= diffStartIndex;
  };

  return (
    <div className="flex flex-col items-start justify-start min-h-screen bg-gradient-to-br from-cyan-200 to-blue-300 p-4 relative overflow-hidden">
      
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
              scale: [0.0, 1.0, 1.0, 1.0, 0.0]            }}
            transition={{
              duration: countingAnimationDuration * animationSpeed,
              delay: coin.delay,
              ease: "easeInOut"
            }}
          >
            <img src="/src/assets/icon_coin.webp" alt="Coin" className="w-full h-full object-contain" />
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Balance Display with Icon Overlay */}
      <div className="relative mb-8">
        {/* Balance Container */}
        <motion.div 
          className="bg-white/95 backdrop-blur-sm rounded-2xl pl-1.5 pr-2 relative z-10 flex items-center"
          style={{ 
            height: '30px',
            outline: '1px solid rgba(0, 0, 0, 0.15)',
            boxShadow: '0 0 20px 0 rgba(0, 0, 0, 0.20)',
          }}
          transition={{ duration: 0.3 * animationSpeed }}
        >
          <div className="flex items-center" style={{ gap: '2px' }}>
            {/* Invisible placeholder to maintain spacing */}
            <div className="w-4 h-4 flex items-center justify-center">
            </div>
          
          <div className="flex items-center">
            <div className="flex items-center text-base font-bold leading-5 whitespace-nowrap">
                {(() => {
              const result = [];
              let i = 0;
              
              while (i < digits.length) {
                const shouldColor = shouldColorDigit(i);
                
                if (shouldColor) {
                  // Find the end of this highlighted group
                  let groupEnd = i;
                  while (groupEnd < digits.length - 1 && shouldColorDigit(groupEnd + 1)) {
                    groupEnd++;
                  }
                  
                  // Render the highlighted group with scaling
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
                            isCredit ? '#22c55e' : '#f97316',
                          '#1f2937'
                        ],
                        marginBottom: ['0px', '1px', '1px', '1px', '1px', '1px', '1px', '0px', '0px']
                      } : { fontSize: '1rem' }}
                      transition={{
                        duration: countingAnimationDuration * animationSpeed,
                        times: [0, 0.85, 0.85, 0.15, 1],
                        ease: "easeOut"
                      }}
                    >
                      {groupDigits.map((groupDigit, groupIndex) => (
                        <span
                          key={`group-${i + groupIndex}-${groupDigit}`}
                          className={`inline-block`}
                        >
                          {groupDigit}
                        </span>
                      ))}
                    </motion.span>
                  );
                  
                  // Skip to after this group
                  i = groupEnd + 1;
                } else {
                  // Render non-highlighted digit normally
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
        </motion.div>
        
        {/* Blue Dollar Icon - Positioned absolutely on top */}
        <motion.div 
          ref={balanceIconRef}
          className="absolute w-4 h-4 flex items-center justify-center z-30 pointer-events-none"
          style={{
            left: '6px',
            top: '7px'
          }}
          animate={isAnimating ? { 
            scale: [1, 1.5, 1.5, 1.5, 1.5, 1],
            x: [0, -4, -4, 0]
                    } : {}}
          transition={{ duration: countingAnimationDuration * animationSpeed, times: [0, 0.15, 0.85, 1], ease: "easeInOut" }}
        >
          <img src="/src/assets/icon_coin.webp" alt="Coin" className="w-full h-full object-contain" />
        </motion.div>
      </div>


      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => changeBalance(5000, 0)}
          disabled={isAnimating}
          ref={buttonRefs[0]}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          + $5,000
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => changeBalance(500, 1)}
          disabled={isAnimating}
          ref={buttonRefs[1]}
          className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          + $500
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => changeBalance(-2500, 2)}
          disabled={isAnimating}
          ref={buttonRefs[2]}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          - $2,500
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => changeBalance(-10000, 3)}
          disabled={isAnimating}
          ref={buttonRefs[3]}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          - $10,000
        </motion.button>
      </div>
    </div>
  );
};

export default BalanceCounter;