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
}

export interface InventoryChangeToastRef {
  show: (data: InventoryChangeToastData) => void;
  hide: () => void;
}

// Animation phases
type AnimationPhase = 'hidden' | 'appearing' | 'itemFlying' | 'itemsExpanding' | 'labelShowing' | 'hiding';

// Size presets
const sizePresets = {
  circle: { width: 56, height: 56, borderRadius: 28 },
  expanded: { width: 280, height: 56, borderRadius: 28 },
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
      animate(flyingItemX, 0, { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
      animate(flyingItemY, 0, { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
      animate(flyingItemScale, 1, { duration: 0.6, ease: [0.32, 0.72, 0, 1] });
      
      // Phase 2: As item approaches, start expanding (400ms)
      phaseTimeoutRef.current = setTimeout(() => {
        setPhase('itemsExpanding');
        
        // Phase 3: Show label after items expand (800ms)
        phaseTimeoutRef.current = setTimeout(() => {
          setPhase('labelShowing');
          
          // Phase 4: Hide after 4000ms total
          hideTimeoutRef.current = setTimeout(() => {
            hide();
          }, 3000);
        }, 800);
      }, 400);
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
  const currentSize = phase === 'itemsExpanding' || phase === 'labelShowing' ? 'expanded' : 'circle';
  const showOtherItems = phase === 'itemsExpanding' || phase === 'labelShowing';
  const showLabel = phase === 'labelShowing';
  const hideOtherItems = phase === 'hiding';
  
  // Prepare other items (max 6)
  const otherItems = data?.otherItems?.slice(0, 6) || [];
  const remainingCount = (data?.totalCount || 0) - otherItems.length - 1; // -1 for main item
  
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-20 z-[13000]">
      {/* Main Toast Container */}
      <motion.div
        className="relative flex items-center bg-gradient-to-r from-purple-500/90 to-pink-500/90 shadow-xl backdrop-blur-sm overflow-hidden"
        style={{ border: '1px solid rgba(255, 255, 255, 0.3)' }}
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
      >
        {/* Main Item Icon (destination) */}
        <motion.div
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10"
          animate={{
            opacity: phase === 'itemFlying' || phase === 'itemsExpanding' || phase === 'labelShowing' ? 1 : 0,
            scale: phase === 'itemsExpanding' || phase === 'labelShowing' ? 1 : 0.8,
          }}
          transition={{ duration: 0.3 }}
        >
          {data?.mainItem && (
            <img 
              src={data.mainItem.icon} 
              alt={data.mainItem.name || ''} 
              className="w-full h-full object-contain drop-shadow-lg"
            />
          )}
        </motion.div>
        
        {/* Other Items Preview */}
        <AnimatePresence>
          {showOtherItems && (
            <motion.div
              className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="flex items-center -space-x-2">
                {otherItems.map((item, index) => (
                  <motion.div
                    key={item.id}
                    className="relative w-8 h-8 rounded-lg overflow-hidden bg-white/20 backdrop-blur-sm border border-white/30"
                    initial={{
                      x: -80 - index * 10,
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: hideOtherItems ? 0 : 0,
                      y: hideOtherItems ? 20 : 0,
                      scale: hideOtherItems ? 0 : 1,
                      opacity: hideOtherItems ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: index * 0.05,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                    style={{ zIndex: otherItems.length - index }}
                  >
                    <img 
                      src={item.icon} 
                      alt={item.name || ''} 
                      className="w-full h-full object-contain p-0.5"
                    />
                  </motion.div>
                ))}
                
                {/* Remaining count */}
                {remainingCount > 0 && (
                  <motion.div
                    className="relative w-8 h-8 rounded-lg bg-white/90 flex items-center justify-center border border-white/30"
                    initial={{
                      x: -80 - otherItems.length * 10,
                      scale: 0,
                      opacity: 0,
                    }}
                    animate={{
                      x: hideOtherItems ? 0 : 0,
                      y: hideOtherItems ? 20 : 0,
                      scale: hideOtherItems ? 0 : 1,
                      opacity: hideOtherItems ? 0 : 1,
                    }}
                    transition={{
                      duration: 0.4,
                      delay: otherItems.length * 0.05,
                      ease: [0.32, 0.72, 0, 1],
                    }}
                  >
                    <span className="text-xs font-bold text-purple-600">+{remainingCount}</span>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Success Label */}
        <AnimatePresence>
          {showLabel && (
            <motion.div
              className="absolute left-16 top-1/2 -translate-y-1/2"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 10, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
            >
              <p className="text-white font-semibold text-sm whitespace-nowrap">
                Inventory saved!
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
                className="w-full h-full object-contain drop-shadow-lg"
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
