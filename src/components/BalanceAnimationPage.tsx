import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import BalanceAnimation, { type BalanceAnimationRef } from './BalanceAnimation';

const BalanceAnimationPage = () => {
  const [alwaysVisible, setAlwaysVisible] = useState<boolean>(true);
  const balanceAnimationRef = useRef<BalanceAnimationRef>(null);
  const buttonRefs = [
    useRef<HTMLButtonElement | null>(null),
    useRef<HTMLButtonElement | null>(null),
    useRef<HTMLButtonElement | null>(null),
    useRef<HTMLButtonElement | null>(null)
  ];

  const getElementCenter = (el: HTMLElement | null): { x: number; y: number } => {
    if (!el) return { x: 0, y: 0 };
    const rect = el.getBoundingClientRect();
    return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
  };

  const handleBalanceChange = (amount: number, buttonIndex: number) => {
    const buttonEl = buttonRefs[buttonIndex]?.current;
    const fromCoordinates = getElementCenter(buttonEl);
    balanceAnimationRef.current?.changeBalance(amount, fromCoordinates);
  };

  return (
    <div className="flex flex-col items-start justify-start min-h-screen bg-gradient-to-br from-cyan-200 to-blue-300 p-4 relative overflow-hidden">
      
      {/* Balance Display */}
      <div className="relative mb-80">
        <BalanceAnimation
          ref={balanceAnimationRef}
          initialBalance={200000}
          alwaysVisible={alwaysVisible}
          animationSpeed={1}
        />
      </div>

      {/* Toggle Control */}
      <div className="mb-6 w-full max-w-md relative z-10">
        <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-700">
              Balance Visibility Mode
            </span>
            <div className="flex items-center space-x-3">
              <span className={`text-xs ${alwaysVisible ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Always Visible
              </span>
              <motion.button
                className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
                  alwaysVisible ? 'bg-blue-500' : 'bg-gray-300'
                }`}
                onClick={() => setAlwaysVisible(!alwaysVisible)}
                whileTap={{ scale: 0.95 }}
              >
                <motion.div
                  className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
                  animate={{
                    x: alwaysVisible ? 1 : 25
                  }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
              </motion.button>
              <span className={`text-xs ${!alwaysVisible ? 'text-gray-900 font-medium' : 'text-gray-500'}`}>
                Animation Only
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleBalanceChange(5000, 0)}
          ref={buttonRefs[0]}
          className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          + $5,000
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleBalanceChange(500, 1)}
          ref={buttonRefs[1]}
          className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          + $500
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleBalanceChange(-2500, 2)}
          ref={buttonRefs[2]}
          className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          - $2,500
        </motion.button>
        
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => handleBalanceChange(-10000, 3)}
          ref={buttonRefs[3]}
          className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all disabled:cursor-not-allowed"
        >
          - $10,000
        </motion.button>
      </div>
    </div>
  );
};

export default BalanceAnimationPage;
