import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';
import { Toast as ToastType } from '../types/toast';

interface ToastProps {
  toast: ToastType;
  onClose: (id: string) => void;
}

const Toast = ({ toast, onClose }: ToastProps) => {
  const { id, message, type, position, duration = 4000, icon, backgroundColor, textColor, borderColor, onClick } = toast;

  // Auto-dismiss timer
  useEffect(() => {
    if (duration > 0) {
      const timer = setTimeout(() => {
        onClose(id);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [id, duration, onClose]);

  // Default styling based on type
  const getDefaultStyling = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: backgroundColor || '#10b981',
          textColor: textColor || '#ffffff',
          borderColor: borderColor || '#059669',
          icon: icon || '✓'
        };
      case 'error':
        return {
          backgroundColor: backgroundColor || '#ef4444',
          textColor: textColor || '#ffffff',
          borderColor: borderColor || '#dc2626',
          icon: icon || '✕'
        };
      case 'warning':
        return {
          backgroundColor: backgroundColor || '#f59e0b',
          textColor: textColor || '#ffffff',
          borderColor: borderColor || '#d97706',
          icon: icon || '⚠'
        };
      case 'info':
        return {
          backgroundColor: backgroundColor || '#3b82f6',
          textColor: textColor || '#ffffff',
          borderColor: borderColor || '#2563eb',
          icon: icon || 'ℹ'
        };
      case 'custom':
      default:
        return {
          backgroundColor: backgroundColor || '#6b7280',
          textColor: textColor || '#ffffff',
          borderColor: borderColor || '#4b5563',
          icon: icon || ''
        };
    }
  };

  const styling = getDefaultStyling();

  // Animation variants based on position
  const variants = {
    initial: position === 'top' 
      ? { opacity: 0, y: -100, scale: 0.9 }
      : { opacity: 0, y: 100, scale: 0.9 },
    animate: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 25
      }
    },
    exit: position === 'top'
      ? { 
          opacity: 0, 
          y: -50, 
          scale: 0.95,
          transition: { duration: 0.2 }
        }
      : { 
          opacity: 0, 
          y: 50, 
          scale: 0.95,
          transition: { duration: 0.2 }
        }
  };

  const handleClick = () => {
    if (onClick) {
      onClick();
    }
  };

  const handleClose = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClose(id);
  };

  return (
    <motion.div
      layout
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className={`
        relative max-w-sm w-full rounded-lg shadow-lg backdrop-blur-sm
        ${onClick ? 'cursor-pointer' : ''}
      `}
      style={{
        backgroundColor: styling.backgroundColor,
        color: styling.textColor,
        border: `1px solid ${styling.borderColor}`,
        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.15)'
      }}
      onClick={handleClick}
      whileHover={onClick ? { scale: 1.02 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
    >
      <div className="flex items-center p-4">
        {/* Icon */}
        {styling.icon && (
          <div className="flex-shrink-0 mr-3">
            {styling.icon.startsWith('/') || styling.icon.startsWith('http') ? (
              <img src={styling.icon} alt="Toast icon" className="w-5 h-5" />
            ) : (
              <span className="text-lg font-bold">{styling.icon}</span>
            )}
          </div>
        )}

        {/* Message */}
        <div className="flex-1 text-sm font-medium">
          {message}
        </div>

        {/* Close button */}
        <button
          onClick={handleClose}
          className="flex-shrink-0 ml-3 p-1 rounded-full hover:bg-black/10 transition-colors"
          aria-label="Close toast"
        >
          <span className="text-lg leading-none">×</span>
        </button>
      </div>

      {/* Progress bar for timed toasts */}
      {duration > 0 && (
        <motion.div
          className="absolute bottom-0 left-0 h-1 bg-white/30 rounded-b-lg"
          initial={{ width: '100%' }}
          animate={{ width: '0%' }}
          transition={{ duration: duration / 1000, ease: 'linear' }}
        />
      )}
    </motion.div>
  );
};

export default Toast;
