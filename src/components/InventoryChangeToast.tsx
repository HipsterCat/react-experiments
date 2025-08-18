import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
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
  onClick?: () => void;
}

export interface InventoryChangeToastRef {
  show: (data: InventoryChangeToastData) => void;
  hide: () => void;
}

// Animation phases
type AnimationPhase = 'hidden' | 'appearing' | 'itemFlying' | 'itemsCollapsing' | 'labelShowing' | 'hiding';

// Size presets
const sizePresets = {
  circle: { width: 56, height: 56, borderRadius: 28 },
  expanded: { width: 320, height: 56, borderRadius: 28 },
};

const InventoryChangeToast = forwardRef<InventoryChangeToastRef>((_, ref) => {
  const [phase, setPhase] = useState<AnimationPhase>('hidden');
  const [data, setData] = useState<InventoryChangeToastData | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const hideTimeoutRef = useRef<NodeJS.Timeout>();
  const phaseTimeoutRef = useRef<NodeJS.Timeout>();
  
  // Motion values for flying item
  const flyingItemX = useMotionValue(0);
  const flyingItemY = useMotionValue(0);
  const flyingItemScale = useMotionValue(0);
  const flyingItemOpacity = useMotionValue(0);

  const show = (toastData: InventoryChangeToastData) => {
    // Clear any existing timeouts
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    
    setData(toastData);
    setIsVisible(true);
    
    // Initialize flying item position
    const toastCenterX = window.innerWidth / 2;
    const toastCenterY = 80; // Top position
    
    flyingItemX.set(toastData.fromCoordinates.x - toastCenterX);
    flyingItemY.set(toastData.fromCoordinates.y - toastCenterY);
    flyingItemScale.set(0.5);
    flyingItemOpacity.set(1);
    
    // Start animation sequence
    setPhase('appearing');
    
    // Phase 1: Toast appears as circle (0-200ms)
    phaseTimeoutRef.current = setTimeout(() => {
      setPhase('itemFlying');
      
      // Animate flying item to toast center
      animate(flyingItemX, -20, { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
      animate(flyingItemY, 0, { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
      animate(flyingItemScale, 1, { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
      
      // Phase 2: Start collapsing items and show label early (300ms)
      phaseTimeoutRef.current = setTimeout(() => {
        setPhase('itemsCollapsing');
        
        // Phase 3: Full label display (600ms)
        phaseTimeoutRef.current = setTimeout(() => {
          setPhase('labelShowing');
          
          // Phase 4: Hide after 4000ms total
          hideTimeoutRef.current = setTimeout(() => {
            hide();
          }, 3100);
        }, 300);
      }, 300);
    }, 200);
  };
  
  const hide = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    
    setPhase('hiding');
    flyingItemOpacity.set(0);
    
    setTimeout(() => {
      setIsVisible(false);
      setPhase('hidden');
      setData(null);
    }, 300);
  };
  
  useImperativeHandle(ref, () => ({ show, hide }));
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
      if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    };
  }, []);
  
  // Determine current size based on phase
  const currentSize = phase === 'itemsCollapsing' || phase === 'labelShowing' ? 'expanded' : 'circle';
  const showOtherItems = phase === 'itemsCollapsing' || phase === 'labelShowing';
  const showLabel = phase === 'itemsCollapsing' || phase === 'labelShowing';
  const hideOtherItems = phase === 'hiding';
  
  // Filter only box items and prepare display
  const boxItems = data?.otherItems?.filter(item => 
    item.icon.includes('box_') || item.icon.includes('mystery_box')
  ) || [];
  const displayItems = phase === 'itemsCollapsing' ? boxItems : boxItems.slice(0, 3);
  const totalBoxCount = boxItems.length + 1; // +1 for main item if it's a box
  
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-20 z-[13000]">
      {/* Main Toast Container */}
      <motion.div
        className="relative flex items-center bg-white shadow-lg overflow-hidden cursor-pointer"
        style={{ 
          outline: '1px solid rgba(0, 0, 0, 0.2)',
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)'
        }}
        initial={false}
        animate={{
          width: sizePresets[currentSize].width,
          height: sizePresets[currentSize].height,
          borderRadius: sizePresets[currentSize].borderRadius,
          scale: isVisible && phase !== 'hiding' ? 1 : 0.5,
          opacity: isVisible && phase !== 'hiding' ? 1 : 0,
        }}
        transition={{
          width: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
          height: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
          borderRadius: { duration: 0.4, ease: [0.32, 0.72, 0, 1] },
          scale: { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
          opacity: { duration: 0.2 },
        }}
        onClick={data?.onClick}
        whileHover={{ scale: data?.onClick ? 1.02 : 1 }}
        whileTap={{ scale: data?.onClick ? 0.98 : 1 }}
      >
        {/* Main Item Icon (destination) */}
        <motion.div
          className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10"
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: phase !== 'hidden' && phase !== 'appearing' ? 1 : 0,
            scale: phase !== 'hidden' && phase !== 'appearing' ? 1 : 0,
          }}
          transition={{ 
            duration: 0.3,
            delay: phase === 'itemFlying' ? 0.3 : 0
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
        
        {/* Other Items Preview */}
        <AnimatePresence>
          {showOtherItems && (
            <motion.div
              className="absolute right-12 top-1/2 -translate-y-1/2 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative flex items-center">
                {displayItems.map((item, index) => {
                  const isCollapsing = phase === 'itemsCollapsing';
                  const itemIndex = boxItems.indexOf(item);
                  const spacing = isCollapsing ? -4 : -8;
                  
                  return (
                    <motion.div
                      key={item.id}
                      className="relative w-9 h-9"
                      initial={{
                        x: isCollapsing ? itemIndex * 12 : 0,
                        scale: 0,
                        opacity: 0,
                      }}
                      animate={{
                        x: hideOtherItems ? 0 : (isCollapsing && index < 3 ? index * spacing : itemIndex * spacing),
                        y: hideOtherItems ? 20 : 0,
                        scale: hideOtherItems ? 0 : (isCollapsing && index >= 3 ? 0 : 1),
                        opacity: hideOtherItems ? 0 : (isCollapsing && index >= 3 ? 0 : 1),
                      }}
                      transition={{
                        duration: 0.5,
                        delay: isCollapsing ? 0 : index * 0.05,
                        ease: [0.32, 0.72, 0, 1],
                      }}
                      style={{ 
                        zIndex: displayItems.length - index,
                        position: 'absolute',
                        left: index * 28
                      }}
                    >
                      <img 
                        src={item.icon} 
                        alt={item.name || ''} 
                        className="w-full h-full object-contain"
                      />
                    </motion.div>
                  );
                })}
                
                {/* Counter badge */}
                {totalBoxCount > 1 && (
                  <motion.div
                    className="absolute -bottom-1 -right-1 bg-gray-800 text-white rounded-full px-1.5 py-0.5 text-xs font-bold"
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{
                      scale: hideOtherItems ? 0 : 1,
                      opacity: hideOtherItems ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.3,
                      delay: 0.2,
                      ease: [0.32, 0.72, 0, 1],
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
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Right Chevron */}
        <AnimatePresence>
          {showOtherItems && data?.onClick && (
            <motion.div
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              transition={{ duration: 0.3 }}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Label */}
        <AnimatePresence>
          {showLabel && (
            <motion.div
              className="absolute left-14 top-1/2 -translate-y-1/2"
              initial={{ x: -30, opacity: 0, scale: 1.3 }}
              animate={{ x: 0, opacity: 1, scale: 1 }}
              exit={{ x: 10, opacity: 0, scale: 0.9 }}
              transition={{ 
                duration: 0.4, 
                ease: [0.32, 0.72, 0, 1],
                delay: phase === 'itemsCollapsing' ? 0.2 : 0
              }}
            >
              <p className="text-black font-semibold text-sm whitespace-nowrap">
                Saved to Inventory
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Flying Item */}
      <AnimatePresence>
        {isVisible && data && (phase === 'itemFlying' || phase === 'appearing') && (
          <motion.div
            className="absolute w-10 h-10 pointer-events-none"
            style={{
              x: flyingItemX,
              y: flyingItemY,
              scale: flyingItemScale,
              opacity: flyingItemOpacity,
              left: -20,
              top: -20,
            }}
          >
            <motion.div
              animate={{
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 0.6,
                ease: "linear",
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
      </AnimatePresence>
    </div>
  );
});

InventoryChangeToast.displayName = 'InventoryChangeToast';

export default InventoryChangeToast;
