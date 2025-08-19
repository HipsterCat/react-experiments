import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence, useMotionValue, animate } from 'framer-motion';

interface InventoryItem {
  id: string;
  icon: string;
  name?: string;
}

interface InventoryChangeToastData {
  mainItem: InventoryItem;
  otherItems?: InventoryItem[];
  totalCount?: number;
  fromCoordinates: { x: number; y: number };
  fromSize?: { width: number; height: number };
  onClick?: () => void;
}

export interface InventoryChangeToastRef {
  show: (data: InventoryChangeToastData) => void;
  hide: () => void;
}

// Simplified animation states
type AnimationState = 'hidden' | 'visible' | 'hiding';

// Size presets
const sizePresets = {
  circle: { width: 56, height: 56, borderRadius: 28 },
  expanded: { width: 320, height: 56, borderRadius: 28 },
};

// Dynamic Island-inspired spring physics
const springConfig = {
  type: "spring" as const,
  stiffness: 400,
  damping: 30,
};

// Smooth cubic-bezier easing for non-spring animations
const smoothEasing = [0.165, 0.84, 0.44, 1] as const;


const InventoryChangeToast = forwardRef<InventoryChangeToastRef>((_, ref) => {
  const [state, setState] = useState<AnimationState>('hidden');
  const [data, setData] = useState<InventoryChangeToastData | null>(null);
  const [showExpanded, setShowExpanded] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const expandTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Motion values for flying item
  const flyingItemX = useMotionValue(0);
  const flyingItemY = useMotionValue(0);
  const flyingItemScale = useMotionValue(0);
  const flyingItemOpacity = useMotionValue(0);

  const show = (toastData: InventoryChangeToastData) => {
    // Clear any existing timeouts
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    
    setData(toastData);
    
    // Initialize flying item position
    const toastCenterX = window.innerWidth / 2;
    const toastTop = 80;
    const toastCenterY = toastTop + sizePresets.circle.height / 2;
    const screenCenterY = window.innerHeight / 2;
    
    // Set up flying item initial position and scale
    flyingItemX.set(0);
    flyingItemY.set(0);
    
    const sourceSize = toastData.fromSize?.width || 140;
    const targetSize = 40;
    const initialScale = sourceSize / targetSize;
    
    flyingItemScale.set(initialScale);
    flyingItemOpacity.set(1);
    
    // Start animation sequence
    setState('visible');
    
    // Animate flying item to toast position
    animate(flyingItemX, 0, { duration: 0.5, ease: smoothEasing });
    animate(flyingItemY, toastCenterY - screenCenterY, { duration: 0.5, ease: smoothEasing });
    animate(flyingItemScale, 1, { duration: 0.5, ease: smoothEasing });
    
    // Fade out flying item and expand toast smoothly
    setTimeout(() => {
      animate(flyingItemOpacity, 0, { duration: 0.25, ease: smoothEasing });
      setShowExpanded(true);
      
      // Auto-hide after showing expanded content
      hideTimeoutRef.current = setTimeout(() => {
        hide();
      }, 3000);
    }, 400);
  };
  
  const hide = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    
    setState('hiding');
    animate(flyingItemOpacity, 0, { duration: 0.25, ease: smoothEasing });
    
    // Clean up after animation completes
    hideTimeoutRef.current = setTimeout(() => {
      setState('hidden');
      setShowExpanded(false);
      setData(null);
    }, 400);
  };
  
  useImperativeHandle(ref, () => ({ show, hide }));
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (expandTimeoutRef.current) clearTimeout(expandTimeoutRef.current);
    };
  }, []);
  
  // Determine current size and visibility based on simplified state
  const currentSize = showExpanded ? 'expanded' : 'circle';
  const isVisible = state === 'visible' || state === 'hiding';
  
  // Filter only box items and prepare display
  const boxItems = data?.otherItems?.filter(item => 
    item.icon.includes('box_') || item.icon.includes('mystery_box')
  ) || [];
  const displayItems = boxItems.slice(0, 3);
  const totalBoxCount = boxItems.length + 1; // +1 for main item if it's a box
  
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-20 z-[13000]">
      {/* Main Toast Container */}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            className="relative flex items-center bg-white shadow-lg overflow-hidden cursor-pointer"
            style={{ 
              outline: '0.5px solid rgba(0, 0, 0, 0.15)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.15)'
            }}
            initial={{
              width: sizePresets.circle.width,
              height: sizePresets.circle.height,
              borderRadius: sizePresets.circle.borderRadius,
              scale: 0.3,
              opacity: 0,
            }}
            animate={{
              width: sizePresets[currentSize].width,
              height: sizePresets[currentSize].height,
              borderRadius: sizePresets[currentSize].borderRadius,
              scale: 1,
              opacity: 1,
            }}
            exit={{
              width: sizePresets.circle.width,
              height: sizePresets.circle.height,
              borderRadius: sizePresets.circle.borderRadius,
              scale: 0.3,
              opacity: 0,
              transition: { 
                width: { duration: 0.2, ease: smoothEasing },
                height: { duration: 0.2, ease: smoothEasing },
                borderRadius: { duration: 0.2, ease: smoothEasing },
                scale: { duration: 0.25, ease: smoothEasing, delay: 0.15 },
                opacity: { duration: 0.15, ease: smoothEasing, delay: 0.2 }
              }
            }}
            transition={springConfig}
            onClick={data?.onClick}
            whileHover={{ 
              scale: data?.onClick ? 1.02 : 1, 
              boxShadow: '0 6px 18px rgba(0, 0, 0, 0.20)', 
              outline: '0.5px solid rgba(0, 0, 0, 0.2)',
              transition: { duration: 0.15, ease: smoothEasing }
            }}
            whileTap={{ 
              scale: data?.onClick ? 0.98 : 1,
              transition: { duration: 0.1, ease: smoothEasing }
            }}
          >
        <div className="flex items-center justify-between w-full h-full pl-3 pr-1">
          {/* Left section: Main icon and label */}
          <div className="flex items-center flex-1">
            {/* Main Item Icon (destination) */}
            <motion.div
              className="w-10 h-10 flex-shrink-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              transition={{ 
                ...springConfig,
                delay: 0.3
              }}
            >
              {data?.mainItem && (
                <img 
                  src={data.mainItem.icon} 
                  alt={data.mainItem.name || ''} 
                  className="w-full h-full object-contain"
                />
              )}
            </motion.div>
            
            {/* Success Label */}
            <AnimatePresence>
              {showExpanded && (
                <motion.div
                  className="ml-2"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 10 }}
                  transition={{ 
                    duration: 0.25,
                    ease: smoothEasing,
                    delay: 0.1
                  }}
                >
                  <p className="text-black font-semibold text-sm whitespace-nowrap">
                    Saved to Inventory
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Right section: Trailing group (stack + counter + chevron) */}
          <div className="flex items-center gap-1">
            {/* Trailing group */}
            <AnimatePresence>
              {showExpanded && (
                <motion.div
                  className="flex items-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ 
                    duration: 0.25,
                    ease: smoothEasing,
                    delay: 0.15
                  }}
                >
                  <div className="relative flex items-center h-9 mr-1" style={{ width: '70px' }}>
                    {displayItems.map((item, index) => (
                      <motion.div
                        key={item.id}
                        className="absolute w-9 h-9"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          ...springConfig,
                          delay: 0.2 + (index * 0.03),
                        }}
                        style={{ 
                          zIndex: displayItems.length - index,
                          right: index * 14
                        }}
                      >
                        <img 
                          src={item.icon} 
                          alt={item.name || ''} 
                          className="w-full h-full object-contain"
                        />
                      </motion.div>
                    ))}
                    
                    {/* Counter badge */}
                    {totalBoxCount > 1 && (
                      <motion.div
                        className="absolute -bottom-1 -right-1 bg-gray-800 text-white rounded-full px-1.5 py-0.5 text-xs font-bold"
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{
                          ...springConfig,
                          delay: 0.35,
                        }}
                        style={{ 
                          zIndex: 10,
                          minWidth: '20px',
                          textAlign: 'center'
                        }}
                      >
                        {totalBoxCount}
                      </motion.div>
                    )}
                  </div>
                  
                  {/* Chevron */}
                  {data?.onClick && (
                    <motion.div
                      className="text-gray-400 pl-1 pr-2"
                      initial={{ opacity: 0, x: 5 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 5 }}
                      transition={{ 
                        duration: 0.25,
                        ease: smoothEasing,
                        delay: 0.2
                      }}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Flying Item */}
      {createPortal(
        <AnimatePresence>
          {data && state === 'visible' && (
            <motion.div
              className="fixed pointer-events-none z-[13001]"
              style={{
                left: '50%',
                top: '50%',
                x: flyingItemX,
                y: flyingItemY,
                marginLeft: '-20px',
                marginTop: '-20px',
              }}
            >
              <motion.div
                className="w-10 h-10"
                style={{
                  scale: flyingItemScale,
                  opacity: flyingItemOpacity,
                }}
              >
                <img 
                  src={data.mainItem.icon} 
                  alt="" 
                  className="w-full h-full object-contain"
                />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </div>
  );
});

InventoryChangeToast.displayName = 'InventoryChangeToast';

export default InventoryChangeToast;
