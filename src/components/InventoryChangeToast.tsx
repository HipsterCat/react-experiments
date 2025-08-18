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
  fromSize?: { width: number; height: number };
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
    
    // Initialize flying item position
    const toastCenterX = window.innerWidth / 2;
    const toastCenterY = 80; // Top position
    
    console.log('Toast animation starting', {
      fromX: toastData.fromCoordinates.x,
      fromY: toastData.fromCoordinates.y,
      toastCenterX,
      toastCenterY,
      offsetX: toastData.fromCoordinates.x - toastCenterX,
      offsetY: toastData.fromCoordinates.y - toastCenterY
    });
    
    flyingItemX.set(toastData.fromCoordinates.x - toastCenterX);
    flyingItemY.set(toastData.fromCoordinates.y - toastCenterY);
    
    // Calculate initial scale based on source size
    const sourceSize = toastData.fromSize?.width || 140;
    const targetSize = 40; // Flying item is 40px (w-10 h-10)
    const initialScale = sourceSize / targetSize;
    
    flyingItemScale.set(initialScale);
    flyingItemOpacity.set(1);
    
    console.log('Flying item animation:', {
      sourceSize,
      targetSize,
      initialScale,
      fromX: toastData.fromCoordinates.x,
      fromY: toastData.fromCoordinates.y
    });
    
    // Start with flying item immediately
    setPhase('itemFlying');
    
    // Animate flying item to toast center (circle state)
    animate(flyingItemX, 0, { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
    animate(flyingItemY, 0, { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
    animate(flyingItemScale, 1, { duration: 0.5, ease: [0.32, 0.72, 0, 1] });
    
    // Phase 1: Toast appears when item is halfway (250ms)
    phaseTimeoutRef.current = setTimeout(() => {
      setIsVisible(true);
      
      // Fade out flying item as toast icon appears
      phaseTimeoutRef.current = setTimeout(() => {
        animate(flyingItemOpacity, 0, { duration: 0.2 });
        setPhase('itemsCollapsing');
        
        // Phase 3: Full label display (800ms)
        phaseTimeoutRef.current = setTimeout(() => {
          setPhase('labelShowing');
          
          // Phase 4: Hide after 4000ms total
          hideTimeoutRef.current = setTimeout(() => {
            hide();
          }, 2800);
        }, 300);
      }, 300);
    }, 250);
  };
  
  const hide = () => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    if (phaseTimeoutRef.current) clearTimeout(phaseTimeoutRef.current);
    
    setPhase('hiding');
    animate(flyingItemOpacity, 0, { duration: 0.4, ease: 'easeOut' });
    
    setTimeout(() => {
      setIsVisible(false);
      setPhase('hidden');
      setData(null);
    }, 600); // Increased for smoother transition
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
          scale: phase === 'hiding' 
            ? { duration: 0.5, ease: [0.32, 0, 0.67, 0] }
            : { duration: 0.3, ease: [0.32, 0.72, 0, 1] },
          opacity: phase === 'hiding'
            ? { duration: 0.5, ease: 'easeOut' }
            : { duration: 0.2 },
        }}
        onClick={data?.onClick}
        whileHover={{ scale: data?.onClick ? 1.02 : 1 }}
        whileTap={{ scale: data?.onClick ? 0.98 : 1 }}
      >
        <div className="flex items-center justify-between w-full h-full px-3">
          {/* Left section: Main icon and label */}
          <div className="flex items-center flex-1">
            {/* Main Item Icon (destination) */}
            <motion.div
              className="w-10 h-10 flex-shrink-0"
              initial={{ opacity: 0, scale: 0 }}
              animate={{
                opacity: phase === 'itemsCollapsing' || phase === 'labelShowing' ? 1 : 0,
                scale: phase === 'itemsCollapsing' || phase === 'labelShowing' ? 1 : 0,
              }}
              transition={{ 
                duration: 0.2,
                delay: 0
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
              {showLabel && (
                <motion.div
                  className="ml-3"
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
          </div>
          
          {/* Right section: Other items and chevron */}
          <div className="flex items-center">
            {/* Other Items Preview */}
            <AnimatePresence>
              {showOtherItems && (
                <motion.div
                  className="flex items-center mr-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="relative flex items-center h-9" style={{ width: '100px' }}>
                    {displayItems.map((item, index) => {
                      const isCollapsing = phase === 'itemsCollapsing';
                      const itemIndex = boxItems.indexOf(item);
                      const spacing = isCollapsing ? -4 : -8;
                      
                      return (
                        <motion.div
                          key={item.id}
                          className="absolute w-9 h-9"
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
                        className="absolute -bottom-1 right-0 bg-gray-800 text-white rounded-full px-1.5 py-0.5 text-xs font-bold"
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
                  className="text-gray-400 ml-1"
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
          </div>
        </div>
      </motion.div>
      
      {/* Flying Item */}
      <AnimatePresence>
        {data && (phase === 'itemFlying' || phase === 'appearing') && (
          <motion.div
            className="fixed pointer-events-none z-[13001]"
            style={{
              left: '50%',
              top: '80px',
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
