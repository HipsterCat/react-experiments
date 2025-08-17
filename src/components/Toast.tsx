import { motion, useMotionValue, animate, PanInfo } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Toast as ToastType, TOAST_CONFIG } from '../types/toast';
import { useToast } from './NiceToastProvider';

interface ToastProps {
  toast: ToastType;
  index: number;
  total: number;
  onHeightChange: (height: number) => void;
}

const Toast = ({ toast }: ToastProps) => {
  const { hideToast, pauseToast, resumeToast } = useToast();
  const [interacting, setInteracting] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const swipeY = useMotionValue(0);
  
  const { 
    id,
    message,
    type,
    position = 'bottom',
    icon,
    onClick,
    onDismiss,
    dismissible = true,
    jsx,
    style,
    className = '',
    updateCount,
    removed,
    visible,
  } = toast;

  // Debug logging
  useEffect(() => {
    console.log(`[Toast ${id}] State:`, { visible, removed, updateCount, remainingTime: toast.remainingTime });
  }, [id, visible, removed, updateCount, toast.remainingTime]);

  // Set mounted state
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.mounted = true;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Handle hover/interaction pausing
  useEffect(() => {
    if (interacting && visible && toast.duration && toast.duration > 0 && toast.remainingTime > 0) {
      console.log(`[Toast ${id}] Pausing due to interaction`);
      pauseToast(id);
    } else if (!interacting && visible && toast.pausedAt && toast.remainingTime > 0) {
      console.log(`[Toast ${id}] Resuming after interaction`);
      resumeToast(id);
    }
  }, [interacting, id, pauseToast, resumeToast, toast.duration, toast.pausedAt, visible, toast.remainingTime]);

  // Get default styling based on type
  const getDefaultStyling = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: '#10b981',
          borderColor: '#059669',
          color: '#ffffff',
          icon: icon || '✓'
        };
      case 'error':
        return {
          backgroundColor: '#ef4444',
          borderColor: '#dc2626',
          color: '#ffffff',
          icon: icon || '✕'
        };
      case 'warning':
        return {
          backgroundColor: '#f59e0b',
          borderColor: '#d97706',
          color: '#ffffff',
          icon: icon || '⚠'
        };
      case 'info':
        return {
          backgroundColor: '#3b82f6',
          borderColor: '#2563eb',
          color: '#ffffff',
          icon: icon || 'ℹ'
        };
      case 'loading':
        return {
          backgroundColor: '#6b7280',
          borderColor: '#4b5563',
          color: '#ffffff',
          icon: icon || (
            <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
          )
        };
      case 'custom':
      default:
        return {
          backgroundColor: style?.backgroundColor || '#111827',
          borderColor: style?.borderColor || 'transparent',
          color: style?.color || '#ffffff',
          icon: icon || ''
        };
    }
  };

  const styling = getDefaultStyling();

  // Handle swipe
  const handleSwipe = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!dismissible) return;

    const { offset, velocity } = info;
    const swipeThreshold = TOAST_CONFIG.SWIPE_THRESHOLD;
    
    // Vertical swipe only
    const swipeAmount = Math.abs(offset.y);
    const swipeVelocity = Math.abs(velocity.y);

    if (swipeAmount > swipeThreshold || swipeVelocity > 500) {
      const direction = offset.y > 0 ? 'down' : 'up';
      toast.swipeOut = true;
      toast.swipeDirection = direction;
      
      console.log(`[Toast ${id}] Swiped ${direction}`);
      onDismiss?.();
      hideToast(id);
    } else {
      // Snap back
      animate(swipeY, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  }, [dismissible, hideToast, id, onDismiss, swipeY]);

  // Dynamic Island states
  const presented = !!visible && !removed;
  
  // Animation variants for keyframe approach
  const containerVariants = {
    initial: { 
      width: TOAST_CONFIG.DI_INITIAL_SIZE,
      opacity: 0,
      scale: 0.8,
    },
    presented: {
      width: 'var(--toast-width)',
      opacity: 1,
      scale: updateCount > 0 ? [1, 1.05, 1] : 1,
      transition: {
        width: { duration: TOAST_CONFIG.DI_EXPAND_MS / 1000, ease: [0.32, 0.72, 0, 1] },
        opacity: { duration: 0.2 },
        scale: updateCount > 0 
          ? { duration: 0.4, times: [0, 0.5, 1] }
          : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
      }
    },
    hidden: {
      width: TOAST_CONFIG.DI_INITIAL_SIZE,
      opacity: 0,
      scale: 0.4,
      transition: {
        width: { duration: TOAST_CONFIG.DI_COLLAPSE_MS / 1000, ease: [0.32, 0.72, 0, 1] },
        opacity: { duration: 0.15 },
        scale: { duration: 0.2, ease: [0.32, 0.72, 0, 1] }
      }
    }
  };

  const textVariants = {
    initial: { opacity: 0 },
    presented: { 
      opacity: 1,
      transition: { 
        delay: TOAST_CONFIG.DI_EXPAND_MS / 2000, // Start fading in halfway through expansion
        duration: TOAST_CONFIG.DI_TEXT_FADE_MS / 1000 
      }
    },
    hidden: { 
      opacity: 0,
      transition: { duration: 0.1 }
    }
  };

  // Render custom JSX if provided
  if (jsx) {
    return (
      <motion.div
        ref={toastRef}
        initial="initial"
        animate={presented ? "presented" : "hidden"}
        exit="hidden"
        variants={containerVariants}
        style={{
          y: swipeY,
          position: 'absolute',
          left: '50%',
          x: '-50%',
          pointerEvents: presented ? 'auto' : 'none',
          zIndex: presented ? 10 : 5,
          ...style,
        }}
        className={`overflow-hidden rounded-full shadow-lg backdrop-blur-sm ${className}`}
        drag={dismissible && presented ? 'y' : false}
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipe}
        onPointerDown={() => setInteracting(true)}
        onPointerUp={() => setInteracting(false)}
        onPointerLeave={() => setInteracting(false)}
        onClick={onClick}
        whileTap={{ scale: onClick ? 0.98 : 1 }}
      >
        <div className="h-14 relative flex items-center">
          {jsx}
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      ref={toastRef}
      initial="initial"
      animate={presented ? "presented" : "hidden"}
      exit="hidden"
      variants={containerVariants}
      style={{
        y: swipeY,
        position: 'absolute',
        left: '50%',
        x: '-50%',
        height: TOAST_CONFIG.DI_INITIAL_SIZE,
        backgroundColor: styling.backgroundColor,
        color: styling.color,
        border: styling.borderColor ? `1px solid ${styling.borderColor}` : undefined,
        pointerEvents: presented ? 'auto' : 'none',
        zIndex: presented ? 10 : 5,
      }}
      className={`overflow-hidden rounded-full shadow-lg backdrop-blur-sm ${onClick ? 'cursor-pointer' : ''} ${updateCount > 0 ? 'ring-2 ring-white/50 ring-offset-2 ring-offset-transparent' : ''} ${className}`}
      drag={dismissible && presented ? 'y' : false}
      dragConstraints={{ top: 0, bottom: 0 }}
      dragElastic={0.2}
      onDragEnd={handleSwipe}
      onPointerDown={() => setInteracting(true)}
      onPointerUp={() => setInteracting(false)}
      onPointerLeave={() => setInteracting(false)}
      onClick={onClick}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      <div className="flex items-center h-full px-4">
        {/* Icon container - always visible */}
        {styling.icon && (
          <div 
            className="flex-shrink-0 flex items-center justify-center"
            style={{
              width: TOAST_CONFIG.DI_ICON_SIZE,
              height: TOAST_CONFIG.DI_ICON_SIZE,
              minWidth: TOAST_CONFIG.DI_ICON_SIZE,
            }}
          >
            {typeof styling.icon === 'string' && (styling.icon.startsWith('/') || styling.icon.startsWith('http')) ? (
              <img src={styling.icon} alt="" className="w-full h-full object-contain" />
            ) : (
              <span className="text-lg font-bold flex items-center justify-center">
                {styling.icon}
              </span>
            )}
          </div>
        )}

        {/* Message - fades in after expansion */}
        <motion.div
          key={`${id}-${updateCount}`}
          className="flex-1 text-sm font-medium whitespace-nowrap overflow-hidden ml-3"
          variants={textVariants}
          initial="initial"
          animate={presented ? "presented" : "hidden"}
        >
          {message}
          {updateCount > 0 && (
            <span className="ml-2 text-xs opacity-70">({updateCount + 1}x)</span>
          )}
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Toast;