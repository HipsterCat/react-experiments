import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, animate } from 'framer-motion';

const BalanceCounter = () => {
  const [balance, setBalance] = useState(200000);
  const [isAnimating, setIsAnimating] = useState(false);
  const [animatingCoins, setAnimatingCoins] = useState([]);
  const [changeAmount, setChangeAmount] = useState(0);
  const animationSpeed = 1;
  const HOLD_AFTER_MS = 10450; // pause on finished number
  const motionValue = useMotionValue(balance);
  const [displayBalance, setDisplayBalance] = useState(balance);
  const [diffStartIndex, setDiffStartIndex] = useState(-1);
  const [targetBalance, setTargetBalance] = useState(balance);
  const balanceIconRef = useRef(null);
  const buttonRefs = [useRef(null), useRef(null), useRef(null), useRef(null)];
  const [animDuration, setAnimDuration] = useState(1);
  const [animId, setAnimId] = useState(0);

  // Format number with comma separators
  const formatNumber = (num) => {
    return Math.round(num).toLocaleString();
  };

  // Get individual digits for animation
  const getDigits = (num) => {
    return formatNumber(num).split('');
  };

  // Find the first differing digit position (from left)
  const getFirstDifferingPosition = (oldNum, newNum) => {
    const oldStr = formatNumber(oldNum);
    const newStr = formatNumber(newNum);
    
    for (let i = 0; i < Math.max(oldStr.length, newStr.length); i++) {
      if (oldStr[i] !== newStr[i]) {
        return i;
      }
    }
    return -1;
  };

  const getElementCenter = (el) => {
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const changeBalance = (amount, buttonIndex) => {
    if (isAnimating) return;
    const newBalance = balance + amount;
    const oldBalance = balance;
    setAnimId((id) => id + 1);
    setTargetBalance(newBalance);
    setChangeAmount(amount);
    setIsAnimating(true);
    setDiffStartIndex(getFirstDifferingPosition(oldBalance, newBalance));

    // DOM based positions
    const buttonEl = buttonRefs[buttonIndex]?.current;
    const iconEl = balanceIconRef.current;
    const from = amount > 0 ? getElementCenter(buttonEl) : getElementCenter(iconEl);
    const to = amount > 0 ? getElementCenter(iconEl) : getElementCenter(buttonEl);

    // Create coins along an arc
    const coinCount = Math.min(Math.max(Math.floor(Math.abs(amount) / 1000), 4), 12);
    const coins = Array.from({ length: coinCount }, (_, i) => {
      const arcOffset = (Math.random() - 0.5) * 80;
      const midX = (from.x + to.x) / 2 + arcOffset;
      const midY = Math.min(from.y, to.y) - 120 - Math.random() * 40;
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
      duration,
      ease: "easeOut",
      onUpdate: (value) => {
        console.log('onUpdate setDisplayBalance', value);
        setDisplayBalance(value);
      },
      onComplete: () => {
        console.log('onComplete setDisplayBalance', newBalance);
        setBalance(newBalance);
        setDisplayBalance(newBalance);
        // Pause a bit on the final state before clearing highlight
        const holdTimer = setTimeout(() => {
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
  const isDebit = changeAmount < 0;
  
  // During animation, find which digits should be colored
  const shouldColorDigit = (index) => {
    if (!isAnimating || changeAmount === 0) return false;
    // Use the precomputed index so highlight persists during the end hold
    return diffStartIndex >= 0 && index >= diffStartIndex;
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-cyan-200 to-blue-300 p-4 relative overflow-hidden">
      
      {/* Animated Coins */}
      <AnimatePresence>
        {animatingCoins.map((coin) => (
          <motion.div
            key={coin.id}
            className="fixed top-0 left-0 w-8 h-8 bg-gradient-to-br from-yellow-300 to-yellow-500 rounded-full border-2 border-yellow-400 flex items-center justify-center text-xs font-bold text-green-700 shadow-xl z-20 pointer-events-none"
            initial={{
              x: coin.keyframesX[0],
              y: coin.keyframesY[0],
              scale: 0.6,
              opacity: 0
            }}
            animate={{
              x: coin.keyframesX,
              y: coin.keyframesY,
              scale: [0.6, 1.1, 0.8],
              opacity: [0, 1, 0.2]
            }}
            transition={{
              duration: 1.2 * animationSpeed,
              delay: coin.delay,
              ease: "easeOut"
            }}
          >
            $
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Balance Display */}
      <motion.div 
        className="bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border border-white/20 relative z-10"
        animate={isAnimating ? { 
          boxShadow: isCredit 
            ? "0 0 30px rgba(34, 197, 94, 0.3)" 
            : "0 0 30px rgba(249, 115, 22, 0.3)" 
        } : {}}
        transition={{ duration: 0.3 * animationSpeed }}
      >
        <div className="flex items-center justify-center gap-3 mb-3">
          <motion.div 
            ref={balanceIconRef}
            className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg"
            animate={isAnimating ? { 
              scale: [1, 1.3, 1.3, 1],
              rotate: isCredit ? [0, 5, 0] : [0, -5, 0]
            } : {}}
            transition={{ duration: animDuration, times: [0, 0.15, 0.85, 1], ease: "easeInOut" }}
          >
            $
          </motion.div>
          
          <div className="flex items-center">
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
                      className="inline-flex origin-left"
                      style={{ color: '#1f2937' }}
                      animate={isAnimating ? {
                        scale: [1, 1.3, 1.3, 1],
                        color: [
                          '#1f2937',
                          isCredit ? '#22c55e' : '#f97316',
                          isCredit ? '#22c55e' : '#f97316',
                          '#1f2937'
                        ]
                      } : { scale: 1 }}
                      transition={{
                        duration: animDuration,
                        times: [0, 0.15, 0.85, 1],
                        ease: "easeInOut"
                      }}
                    >
                      {groupDigits.map((groupDigit, groupIndex) => (
                        <span
                          key={`group-${i + groupIndex}-${groupDigit}`}
                          className={`text-5xl font-bold inline-block leading-none ${groupDigit === ',' ? 'mx-1' : ''}`}
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
                      className={`text-5xl font-bold inline-block leading-none transition-colors duration-200 text-gray-800 ${digits[i] === ',' ? 'mx-1' : ''}`}
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
      </motion.div>

      {/* DEBUG: Individual Digit Scaling (Wrong Approach) */}
      <motion.div 
        className="bg-red-50/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-4 border-2 border-red-200 relative z-10"
      >
        <div className="text-center mb-2">
          <span className="text-sm font-semibold text-red-600 bg-red-100 px-3 py-1 rounded-full">
            DEBUG: Individual Digit Scaling (WRONG)
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            $
          </div>
          
          <div className="flex items-center">
            {digits.map((digit, index) => {
              // Force half the digits to be in "animated" state for debugging
              const forceAnimated = index >= Math.floor(digits.length / 2);
              const debugShouldColor = forceAnimated;
              const debugShouldScale = forceAnimated;
              
              return (
                <motion.span
                  key={`debug-individual-${index}-${digit}`}
                  className={`text-5xl font-bold inline-block leading-none transition-colors duration-200 ${
                    debugShouldColor
                      ? 'text-red-500' 
                      : 'text-gray-800'
                  } ${digit === ',' ? 'mx-1' : ''}`}
                  animate={debugShouldScale ? {
                    scale: [1, 1.3, 1.3, 1],
                  } : { scale: 1 }}
                  transition={{
                    duration: animDuration,
                    times: [0, 0.15, 0.85, 1],
                    ease: "easeInOut",
                    repeat: Infinity
                  }}
                >
                  {digit}
                </motion.span>
              );
            })}
          </div>
        </div>
        <div className="text-center text-xs text-gray-600 mt-2">
          <div>❌ Individual digits scale separately (wrong approach)</div>
        </div>
      </motion.div>

      {/* DEBUG: Partial Group Scaling (Correct Approach) */}
      <motion.div 
        className="bg-green-50/95 backdrop-blur-sm rounded-3xl shadow-2xl p-8 mb-8 border-2 border-green-200 relative z-10"
      >
        <div className="text-center mb-2">
          <span className="text-sm font-semibold text-green-600 bg-green-100 px-3 py-1 rounded-full">
            DEBUG: Partial Group Scaling (CORRECT)
          </span>
        </div>
        <div className="flex items-center justify-center gap-3 mb-3">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xl shadow-lg">
            $
          </div>
          
          <div className="flex items-center">
            {(() => {
              const result = [];
              let i = 0;
              
              while (i < digits.length) {
                // Force half the digits to be colored for debugging
                const forceAnimated = i >= Math.floor(digits.length / 2);
                
                if (forceAnimated) {
                  // Find the end of this highlighted group
                  let groupEnd = i;
                  while (groupEnd < digits.length - 1 && groupEnd + 1 >= Math.floor(digits.length / 2)) {
                    groupEnd++;
                  }
                  
                  // Render the highlighted group with scaling
                  const groupDigits = digits.slice(i, groupEnd + 1);
                  result.push(
                    <motion.span
                      key={`debug-partial-group-${i}`}
                      className="inline-flex origin-left"
                      animate={{
                        scale: [1, 1.3, 1.3, 1],
                      }}
                      transition={{
                        duration: animDuration,
                        times: [0, 0.15, 0.85, 1],
                        ease: "easeInOut",
                        repeat: Infinity
                      }}
                    >
                      {groupDigits.map((groupDigit, groupIndex) => (
                        <span
                          key={`debug-partial-${i + groupIndex}-${groupDigit}`}
                          className={`text-5xl font-bold inline-block leading-none transition-colors duration-200 text-green-500 ${groupDigit === ',' ? 'mx-1' : ''}`}
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
                      key={`debug-partial-static-${i}-${digits[i]}`}
                      className={`text-5xl font-bold inline-block leading-none transition-colors duration-200 text-gray-800 ${digits[i] === ',' ? 'mx-1' : ''}`}
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
        <div className="text-center text-xs text-gray-600 mt-2">
          <div>✅ Only highlighted changing digits scale together</div>
          <div>Static digits remain unscaled</div>
          <div>Current balance: {formatNumber(displayBalance)}</div>
          <div>Digits array: [{digits.join(', ')}]</div>
          <div>Total digits: {digits.length}</div>
        </div>
      </motion.div>

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