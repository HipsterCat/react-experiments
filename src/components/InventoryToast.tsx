import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AnimationCoordinates } from '../types/toast';

interface InventoryToastProps {
  itemIcon: string;
  itemName: string;
  quantity: number;
  action: 'add' | 'remove';
  animateFrom?: AnimationCoordinates;
}

const InventoryToast: React.FC<InventoryToastProps> = ({
  itemIcon,
  itemName,
  quantity,
  action,
  animateFrom,
}) => {
  const isAdd = action === 'add';
  
  // Create flying items similar to BalanceAnimation
  const flyingItems = Array.from({ length: Math.min(quantity, 5) }, (_, i) => ({
    id: i,
    delay: i * 0.05,
  }));

  return (
    <div className="relative">
      {/* Main toast content */}
      <div className="flex items-center p-4 bg-gradient-to-r from-purple-500/90 to-pink-500/90 rounded-lg border border-white/20 backdrop-blur-sm">
        <div className="relative mr-3">
          {/* Item icon with glow effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
            className="relative"
          >
            <div className="absolute inset-0 bg-white/30 rounded-full blur-xl animate-pulse" />
            <img 
              src={itemIcon} 
              alt={itemName} 
              className="w-12 h-12 relative z-10 drop-shadow-lg"
            />
          </motion.div>

          {/* Quantity badge */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: 'spring', stiffness: 500 }}
            className="absolute -top-1 -right-1 bg-white text-purple-600 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-lg"
          >
            {isAdd ? '+' : '-'}{quantity}
          </motion.div>
        </div>

        <div className="flex-1">
          <motion.h4 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="text-white font-semibold text-sm"
          >
            {itemName}
          </motion.h4>
          <motion.p 
            initial={{ x: -10, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-white/80 text-xs"
          >
            {isAdd ? 'Added to inventory' : 'Removed from inventory'}
          </motion.p>
        </div>

        {/* Sparkle effect */}
        <motion.div
          initial={{ scale: 0, rotate: 0 }}
          animate={{ scale: [0, 1.2, 1], rotate: 360 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="ml-3"
        >
          <svg className="w-6 h-6 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </motion.div>
      </div>

      {/* Flying items animation */}
      {animateFrom && (
        <AnimatePresence>
          {flyingItems.map((item) => (
            <motion.div
              key={item.id}
              className="absolute w-8 h-8 pointer-events-none"
              initial={{
                x: animateFrom.x - window.innerWidth / 2,
                y: animateFrom.y - window.innerHeight / 2,
                scale: 0,
                opacity: 0,
              }}
              animate={{
                x: 0,
                y: 0,
                scale: [0, 1.2, 1, 0.8, 0],
                opacity: [0, 1, 1, 1, 0],
              }}
              transition={{
                duration: 0.8,
                delay: item.delay,
                ease: [0.32, 0.72, 0, 1],
              }}
              style={{
                left: '20px',
                top: '50%',
                transform: 'translateY(-50%)',
              }}
            >
              <img src={itemIcon} alt="" className="w-full h-full drop-shadow-md" />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
};

export default InventoryToast;
