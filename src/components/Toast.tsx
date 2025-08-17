import { motion, useMotionValue, animate, PanInfo } from 'framer-motion';
import { useEffect, useRef, useState, useCallback } from 'react';
import { Toast as ToastType, TOAST_CONFIG, SwipeDirection } from '../types/toast';
import { useToast } from './NiceToastProvider';

interface ToastProps {
  toast: ToastType;
  index: number;
  total: number;
  onHeightChange: (height: number) => void;
}

const Toast = ({ toast, index, total, onHeightChange }: ToastProps) => {
  const { hideToast, pauseToast, resumeToast } = useToast();
  const [interacting, setInteracting] = useState(false);
  const toastRef = useRef<HTMLDivElement>(null);
  const heightRef = useRef<number>(0);
  const swipeX = useMotionValue(0);
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
  } = toast;

  // Calculate if toast is visible (within visible limit)
  const isVisible = index < TOAST_CONFIG.VISIBLE_TOASTS;

  // Set mounted state
  useEffect(() => {
    const timer = setTimeout(() => {
      toast.mounted = true;
    }, 50);
    return () => clearTimeout(timer);
  }, []);

  // Measure height
  useEffect(() => {
    if (toastRef.current && toastRef.current.offsetHeight !== heightRef.current) {
      heightRef.current = toastRef.current.offsetHeight;
      onHeightChange(heightRef.current);
    }
  });

  // Handle hover/interaction pausing
  useEffect(() => {
    if (interacting && toast.duration && toast.duration > 0) {
      pauseToast(id);
    } else if (!interacting && toast.pausedAt) {
      resumeToast(id);
    }
  }, [interacting, id, pauseToast, resumeToast, toast.duration, toast.pausedAt]);

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
            <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
          )
        };
      case 'custom':
      default:
        return {
          backgroundColor: style?.backgroundColor || '#ffffff',
          borderColor: style?.borderColor || '#e5e7eb',
          color: style?.color || '#1f2937',
          icon: icon || ''
        };
    }
  };

  const styling = getDefaultStyling();

  // Calculate stacking transforms
  const getStackingStyle = () => {
    if (!isVisible) {
      return {
        scale: 0.8,
        opacity: 0,
        y: position === 'top' ? -20 : 20,
      };
    }

    const scale = 1 - (index * 0.05);
    const opacity = 1 - (index * 0.1);
    
    // Calculate offset based on previous toasts' heights
    let offset = 0;
    for (let i = 0; i < index; i++) {
      offset += TOAST_CONFIG.GAP;
    }

    const y = position === 'top' 
      ? offset + (index * 10) // Slight additional offset for depth
      : -(offset + (index * 10));

    return {
      scale: Math.max(scale, 0.85),
      opacity: Math.max(opacity, 0.7),
      y,
      zIndex: total - index,
    };
  };

  const stackingStyle = getStackingStyle();

  // Handle swipe
  const handleSwipe = useCallback((_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    if (!dismissible) return;

    const { offset, velocity } = info;
    const swipeThreshold = TOAST_CONFIG.SWIPE_THRESHOLD;
    
    // Determine swipe direction
    const isHorizontalSwipe = Math.abs(offset.x) > Math.abs(offset.y);
    const swipeAmount = isHorizontalSwipe ? Math.abs(offset.x) : Math.abs(offset.y);
    const swipeVelocity = isHorizontalSwipe ? Math.abs(velocity.x) : Math.abs(velocity.y);

    if (swipeAmount > swipeThreshold || swipeVelocity > 500) {
      // Determine direction
      let direction: SwipeDirection;
      if (isHorizontalSwipe) {
        direction = offset.x > 0 ? 'right' : 'left';
      } else {
        direction = offset.y > 0 ? 'down' : 'up';
      }

      toast.swipeOut = true;
      toast.swipeDirection = direction;
      
      onDismiss?.();
      hideToast(id);
    } else {
      // Snap back
      animate(swipeX, 0, { type: 'spring', stiffness: 400, damping: 30 });
      animate(swipeY, 0, { type: 'spring', stiffness: 400, damping: 30 });
    }
  }, [dismissible, hideToast, id, onDismiss, swipeX, swipeY]);

  // Render custom JSX if provided
  if (jsx) {
    return (
      <motion.div
        ref={toastRef}
        layout
        initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? -20 : 20 }}
        animate={{
          opacity: removed ? 0 : stackingStyle.opacity,
          scale: removed ? 0.8 : stackingStyle.scale,
          y: removed ? (position === 'top' ? -50 : 50) : stackingStyle.y,
        }}
        exit={{ opacity: 0, scale: 0.8 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        style={{
          zIndex: stackingStyle.zIndex,
          x: swipeX,
          y: swipeY,
          ...style,
        }}
        className={`relative w-[var(--toast-width)] pointer-events-auto ${className}`}
        drag={dismissible}
        dragConstraints={{ top: 0, bottom: 0, left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleSwipe}
        onPointerDown={() => setInteracting(true)}
        onPointerUp={() => setInteracting(false)}
        onPointerLeave={() => setInteracting(false)}
        onClick={onClick}
        whileTap={{ scale: onClick ? 0.98 : 1 }}
      >
        {jsx}
      </motion.div>
    );
  }

  // Attention animation for duplicates
  const attentionAnimation = updateCount > 0 ? {
    scale: [stackingStyle.scale, stackingStyle.scale * 1.05, stackingStyle.scale],
  } : {};

  return (
    <motion.div
      ref={toastRef}
      layout
      initial={{ opacity: 0, scale: 0.9, y: position === 'top' ? -20 : 20 }}
      animate={{
        opacity: removed ? 0 : stackingStyle.opacity,
        scale: removed ? 0.8 : stackingStyle.scale,
        y: removed ? (position === 'top' ? -50 : 50) : stackingStyle.y,
        ...attentionAnimation,
      }}
      exit={{ opacity: 0, scale: 0.8 }}
      transition={{ 
        type: 'spring', 
        stiffness: 400, 
        damping: 30,
        scale: attentionAnimation.scale ? {
          duration: 0.3,
          times: [0, 0.5, 1],
        } : undefined,
      }}
      style={{
        zIndex: stackingStyle.zIndex,
        x: swipeX,
        ...style,
      }}
      className={`
        relative w-[var(--toast-width)] rounded-lg shadow-lg backdrop-blur-sm pointer-events-auto
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
      drag={dismissible ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.2}
      onDragEnd={handleSwipe}
      onPointerDown={() => setInteracting(true)}
      onPointerUp={() => setInteracting(false)}
      onPointerLeave={() => setInteracting(false)}
      onClick={onClick}
      whileTap={{ scale: onClick ? 0.98 : 1 }}
    >
      <div 
        className="flex items-center p-4 rounded-lg border"
        style={{
          backgroundColor: styling.backgroundColor,
          borderColor: styling.borderColor,
          color: styling.color,
        }}
      >
        {/* Icon */}
        {styling.icon && (
          <div className="flex-shrink-0 mr-3">
            {typeof styling.icon === 'string' && (styling.icon.startsWith('/') || styling.icon.startsWith('http')) ? (
              <img src={styling.icon} alt="" className="w-5 h-5" />
            ) : (
              <span className="text-lg font-bold flex items-center justify-center">
                {styling.icon}
              </span>
            )}
          </div>
        )}

        {/* Message */}
        <div className="flex-1 text-sm font-medium">
          {message}
          {updateCount > 0 && (
            <span className="ml-2 text-xs opacity-70">
              ({updateCount + 1}x)
            </span>
          )}
        </div>

        {/* Close button */}
        {dismissible && type !== 'loading' && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onDismiss?.();
              hideToast(id);
            }}
            className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-black/10 transition-colors"
            aria-label="Close toast"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default Toast;