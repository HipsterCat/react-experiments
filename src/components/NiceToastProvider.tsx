import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { Toast as ToastType, ToastContextType, ToastInput, TOAST_CONFIG } from '../types/toast';
import Toast from './Toast';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface NiceToastProviderProps {
  children: ReactNode;
}

// Helper to generate variant ID from toast properties
const generateVariantId = (toast: ToastInput): string => {
  return toast.variantId || `${toast.message || 'toast'}-${toast.type}-${toast.position || 'bottom'}`;
};

// Helper to get viewport offset based on screen size
const getViewportOffset = () => {
  if (typeof window === 'undefined') return TOAST_CONFIG.VIEWPORT_OFFSET;
  return window.innerWidth < 640 ? TOAST_CONFIG.VIEWPORT_OFFSET : 24;
};

export const NiceToastProvider = ({ children }: NiceToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);
  const toastTimers = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const toastCounter = useRef(1);

  // Handle document visibility for pausing timers
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause all toasts
        toasts.forEach(toast => {
          if (toast.duration && toast.duration > 0 && !toast.pausedAt) {
            pauseToast(toast.id);
          }
        });
      } else {
        // Resume all toasts
        toasts.forEach(toast => {
          if (toast.pausedAt) {
            resumeToast(toast.id);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [toasts]);

  const startToastTimer = useCallback((toast: ToastType) => {
    if (!toast.duration || toast.duration <= 0) return;

    const timer = setTimeout(() => {
      toast.onAutoClose?.();
      hideToast(toast.id);
    }, toast.remainingTime);

    toastTimers.current.set(toast.id, timer);
  }, []);

  const clearToastTimer = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const showToast = useCallback((toastInput: ToastInput): string => {
    const variantId = generateVariantId(toastInput);
    const position = toastInput.position || 'bottom';
    const duration = toastInput.duration ?? TOAST_CONFIG.TOAST_LIFETIME;
    
    // Check if we should update existing toast
    const existingToast = toasts.find(t => 
      t.variantId === variantId && t.position === position && !t.removed
    );

    if (existingToast) {
      // Update existing toast
      setToasts(prev => prev.map(t => {
        if (t.id === existingToast.id) {
          // Clear old timer
          clearToastTimer(t.id);
          
          const updatedToast: ToastType = {
            ...t,
            ...toastInput,
            remainingTime: duration,
            updateCount: t.updateCount + 1,
            pausedAt: null,
          };

          // Start new timer
          if (duration > 0) {
            startToastTimer(updatedToast);
          }

          return updatedToast;
        }
        return t;
      }));

      return existingToast.id;
    }

    // Create new toast
    const id = `toast-${toastCounter.current++}`;
    const newToast: ToastType = {
      ...toastInput,
      id,
      variantId,
      position,
      createdAt: Date.now(),
      pausedAt: null,
      remainingTime: duration,
      height: 0,
      mounted: false,
      removed: false,
      swiping: false,
      swipeOut: false,
      swipeDirection: null,
      updateCount: 0,
      dismissible: toastInput.dismissible !== false,
    };

    setToasts(prev => [...prev, newToast]);

    // Start timer if needed
    if (duration > 0) {
      startToastTimer(newToast);
    }

    return id;
  }, [toasts, clearToastTimer, startToastTimer]);

  const hideToast = useCallback((id: string) => {
    clearToastTimer(id);
    
    setToasts(prev => prev.map(toast => 
      toast.id === id ? { ...toast, removed: true } : toast
    ));

    // Remove from DOM after animation
    setTimeout(() => {
      setToasts(prev => prev.filter(toast => toast.id !== id));
    }, TOAST_CONFIG.TIME_BEFORE_UNMOUNT);
  }, [clearToastTimer]);

  const pauseToast = useCallback((id: string) => {
    clearToastTimer(id);
    
    setToasts(prev => prev.map(toast => {
      if (toast.id === id && !toast.pausedAt) {
        const elapsed = Date.now() - toast.createdAt;
        return {
          ...toast,
          pausedAt: Date.now(),
          remainingTime: Math.max(0, toast.remainingTime - elapsed),
        };
      }
      return toast;
    }));
  }, [clearToastTimer]);

  const resumeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(toast => {
      if (toast.id === id && toast.pausedAt) {
        const updatedToast = {
          ...toast,
          pausedAt: null,
          createdAt: Date.now(), // Reset creation time for accurate remaining time
        };

        // Restart timer with remaining time
        if (toast.remainingTime > 0) {
          startToastTimer(updatedToast);
        }

        return updatedToast;
      }
      return toast;
    }));
  }, [startToastTimer]);

  const clearAllToasts = useCallback(() => {
    // Clear all timers
    toastTimers.current.forEach(timer => clearTimeout(timer));
    toastTimers.current.clear();
    
    // Mark all as removed
    setToasts(prev => prev.map(toast => ({ ...toast, removed: true })));
    
    // Clear after animation
    setTimeout(() => {
      setToasts([]);
    }, TOAST_CONFIG.TIME_BEFORE_UNMOUNT);
  }, []);

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    pauseToast,
    resumeToast,
    clearAllToasts,
  };

  // Get toasts by position
  const getToastsByPosition = (position: 'top' | 'bottom') => {
    return toasts
      .filter(toast => toast.position === position && !toast.removed)
      .sort((a, b) => b.createdAt - a.createdAt);
  };

  const topToasts = getToastsByPosition('top');
  const bottomToasts = getToastsByPosition('bottom');

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toaster Container */}
      <div
        className="fixed inset-0 pointer-events-none z-[999999]"
        style={{
          '--viewport-offset': `${getViewportOffset()}px`,
          '--toast-width': `${TOAST_CONFIG.TOAST_WIDTH}px`,
          '--gap': `${TOAST_CONFIG.GAP}px`,
        } as React.CSSProperties}
      >
        {/* Top Toasts */}
        {topToasts.length > 0 && (
          <div
            className="absolute top-[var(--viewport-offset)] left-1/2 transform -translate-x-1/2"
            data-toast-position="top"
          >
            <AnimatePresence mode="sync">
              {topToasts.map((toast, index) => (
                <Toast
                  key={toast.id}
                  toast={toast}
                  index={index}
                  total={topToasts.length}
                  onHeightChange={(height) => {
                    setToasts(prev => prev.map(t => 
                      t.id === toast.id ? { ...t, height } : t
                    ));
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}

        {/* Bottom Toasts */}
        {bottomToasts.length > 0 && (
          <div
            className="absolute bottom-[var(--viewport-offset)] left-1/2 transform -translate-x-1/2"
            data-toast-position="bottom"
          >
            <AnimatePresence mode="sync">
              {bottomToasts.map((toast, index) => (
                <Toast
                  key={toast.id}
                  toast={toast}
                  index={index}
                  total={bottomToasts.length}
                  onHeightChange={(height) => {
                    setToasts(prev => prev.map(t => 
                      t.id === toast.id ? { ...t, height } : t
                    ));
                  }}
                />
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </ToastContext.Provider>
  );
};

// Custom hook to use the toast context
export const useToast = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToast must be used within a NiceToastProvider');
  }
  return context;
};

// Convenience methods
export const toast = {
  success: (message: string, options?: Partial<ToastInput>) => {
    const { showToast } = useToast();
    return showToast({ ...options, message, type: 'success' });
  },
  error: (message: string, options?: Partial<ToastInput>) => {
    const { showToast } = useToast();
    return showToast({ ...options, message, type: 'error' });
  },
  warning: (message: string, options?: Partial<ToastInput>) => {
    const { showToast } = useToast();
    return showToast({ ...options, message, type: 'warning' });
  },
  info: (message: string, options?: Partial<ToastInput>) => {
    const { showToast } = useToast();
    return showToast({ ...options, message, type: 'info' });
  },
  loading: (message: string, options?: Partial<ToastInput>) => {
    const { showToast } = useToast();
    return showToast({ ...options, message, type: 'loading', duration: 0 });
  },
};

export default NiceToastProvider;