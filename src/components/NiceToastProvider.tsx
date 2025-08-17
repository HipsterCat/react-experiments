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
  const hideToastRef = useRef<(id: string) => void>();

  // Clean up removed toasts periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      setToasts(prev => prev.filter(t => !t.removed || Date.now() - t.createdAt < 10000));
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  const clearToastTimer = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
  }, []);

  const startToastTimer = useCallback((toast: ToastType) => {
    if (!toast.remainingTime || toast.remainingTime <= 0) return;

    // Clear existing timer if any
    const existing = toastTimers.current.get(toast.id);
    if (existing) clearTimeout(existing);

    console.log(`[ToastProvider] Starting timer for toast ${toast.id}, duration: ${toast.remainingTime}ms`);

    const timer = setTimeout(() => {
      console.log(`[ToastProvider] Timer expired for toast ${toast.id}`);
      // Get fresh toast state
      setToasts(prev => {
        const currentToast = prev.find(t => t.id === toast.id);
        if (currentToast && currentToast.visible && !currentToast.removed) {
          currentToast.onAutoClose?.();
          // Call hideToast
          if (hideToastRef.current) {
            console.log(`[ToastProvider] Calling hideToast for ${toast.id}`);
            hideToastRef.current(toast.id);
          }
        }
        return prev;
      });
    }, toast.remainingTime);

    toastTimers.current.set(toast.id, timer);
  }, []);

  const hideToast = useCallback((id: string) => {
    clearToastTimer(id);
    
    console.log(`[ToastProvider] hideToast called for ${id}`);
    
    let closedToast: ToastType | undefined;
    setToasts(prev => prev.map(toast => {
      if (toast.id === id) {
        closedToast = toast;
        return { ...toast, removed: true, visible: false };
      }
      return toast;
    }));

    // After animation, remove, then resume the most recent paused toast at the same position
    setTimeout(() => {
      setToasts(prev => {
        const afterRemoval = prev.filter(t => t.id !== id);
        if (!closedToast) return afterRemoval;
        const position = closedToast.position;
        const candidate = afterRemoval
          .filter(t => t.position === position && !t.removed && !t.visible)
          .sort((a, b) => b.createdAt - a.createdAt)[0];
        if (!candidate) return afterRemoval;

        console.log(`[ToastProvider] Resuming paused toast ${candidate.id}`);

        // Resume candidate only if it has remaining time
        if (candidate.remainingTime <= 0) {
          console.log(`[ToastProvider] Not resuming toast ${candidate.id} - no remaining time`);
          return afterRemoval;
        }
        
        const now = Date.now();
        const resumed = afterRemoval.map(t => {
          if (t.id === candidate.id) {
            // Start timer for remaining time
            const updated: ToastType = {
              ...t,
              visible: true,
              pausedAt: null,
              timerStartAt: now,
            };
            startToastTimer(updated);
            return updated;
          }
          return t;
        });
        return resumed;
      });
    }, TOAST_CONFIG.TIME_BEFORE_UNMOUNT);
  }, [clearToastTimer, startToastTimer]);

  const pauseToast = useCallback((id: string) => {
    clearToastTimer(id);
    
    setToasts(prev => prev.map(toast => {
      if (toast.id === id && !toast.pausedAt) {
        const now = Date.now();
        const elapsed = toast.timerStartAt ? now - toast.timerStartAt : 0;
        return {
          ...toast,
          pausedAt: now,
          timerStartAt: null,
          remainingTime: Math.max(0, toast.remainingTime - elapsed),
        };
      }
      return toast;
    }));
  }, [clearToastTimer]);

  const resumeToast = useCallback((id: string) => {
    setToasts(prev => prev.map(toast => {
      if (toast.id === id && toast.pausedAt) {
        const now = Date.now();
        const updatedToast = {
          ...toast,
          pausedAt: null,
          timerStartAt: now,
          visible: true,
        } as ToastType;

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

  // Handle document visibility for pausing timers
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Pause all visible toasts with remaining time
        toasts.forEach(toast => {
          if (toast.visible && toast.duration && toast.duration > 0 && !toast.pausedAt && toast.remainingTime > 0) {
            pauseToast(toast.id);
          }
        });
      } else {
        // Resume all visible toasts with remaining time
        toasts.forEach(toast => {
          if (toast.visible && toast.pausedAt && toast.remainingTime > 0) {
            resumeToast(toast.id);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [toasts, pauseToast, resumeToast]);

  // Set hideToast ref to avoid circular dependencies
  useEffect(() => {
    console.log(`[ToastProvider] Setting hideToastRef`);
    hideToastRef.current = hideToast;
  });

  const showToast = useCallback((toastInput: ToastInput): string => {
    const variantId = generateVariantId(toastInput);
    const position = toastInput.position || 'bottom';
    const defaultDuration = toastInput.duration ?? TOAST_CONFIG.TOAST_LIFETIME;

    console.log(`[ToastProvider] showToast called:`, { variantId, position, defaultDuration, type: toastInput.type });

    // Check if there's already a visible toast with same variantId
    const existingVisible = toasts.find(t => 
      t.variantId === variantId && t.position === position && t.visible && !t.removed
    );

    if (existingVisible) {
      console.log(`[ToastProvider] Updating existing toast ${existingVisible.id}`);
      
      // Update existing toast
      setToasts(prev => prev.map(t => {
        if (t.id === existingVisible.id) {
          clearToastTimer(t.id);
          const now = Date.now();
          const updated = {
            ...t,
            ...toastInput,
            id: t.id, // Keep the same ID
            variantId: t.variantId, // Keep the same variantId
            position: t.position, // Keep the same position
            updateCount: t.updateCount + 1,
            remainingTime: defaultDuration,
            timerStartAt: defaultDuration > 0 ? now : null,
            pausedAt: null,
          };
          
          // Restart timer after state update
          if (defaultDuration > 0) {
            setTimeout(() => startToastTimer(updated), 0);
          }
          
          return updated;
        }
        return t;
      }));
      
      return existingVisible.id;
    }

    // Determine if there is a currently visible toast at this position
    const currentVisible = toasts.find(t => t.position === position && t.visible && !t.removed);

    const id = `toast-${toastCounter.current++}`;
    const now = Date.now();
    const newToast: ToastType = {
      ...toastInput,
      id,
      variantId,
      position,
      createdAt: now,
      pausedAt: null,
      timerStartAt: defaultDuration > 0 ? now : null,
      remainingTime: defaultDuration,
      height: 0,
      mounted: false,
      removed: false,
      swiping: false,
      swipeOut: false,
      swipeDirection: null,
      updateCount: 0,
      dismissible: toastInput.dismissible !== false,
      visible: true,
    };

    console.log(`[ToastProvider] Creating new toast:`, { id, remainingTime: newToast.remainingTime, currentVisible: currentVisible?.id });

    setToasts(prev => {
      // Hide current visible toast at this position (pause and make invisible)
      const updated = prev.map(t => {
        if (currentVisible && t.id === currentVisible.id) {
          // Pause it and mark invisible
          const now = Date.now();
          let remainingTime = t.remainingTime;
          if (t.timerStartAt) {
            const elapsed = now - t.timerStartAt;
            remainingTime = Math.max(0, t.remainingTime - elapsed);
          }
          clearToastTimer(t.id);
          console.log(`[ToastProvider] Pausing toast ${t.id}, remaining: ${remainingTime}ms`);
          return {
            ...t,
            pausedAt: now,
            timerStartAt: null,
            remainingTime,
            visible: false,
          };
        }
        return t;
      });

      return [...updated, newToast];
    });

    // Start timer for new toast if needed
    if (newToast.remainingTime > 0) {
      const timerToast = { ...newToast, id };
      setTimeout(() => startToastTimer(timerToast), 0);
    }

    return id;
  }, [clearToastTimer, startToastTimer, toasts]);

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    pauseToast,
    resumeToast,
    clearAllToasts,
  };

  // Get toasts by position (we render all at a position but only the one with visible=true is fully opaque/interactive)
  const getToastsByPosition = (position: 'top' | 'bottom') => {
    return toasts
      .filter(toast => toast.position === position && !toast.removed)
      .sort((a, b) => a.createdAt - b.createdAt); // older under newer for layered animations
  };

  const topToasts = getToastsByPosition('top');
  const bottomToasts = getToastsByPosition('bottom');

  // Create toast helpers after showToast is defined
  const toast = React.useMemo(() => createToastHelpers(showToast), [showToast]);
  
  // Initialize global toast instance
  React.useEffect(() => {
    import('../utils/toast').then(({ setToastInstance }) => {
      setToastInstance(toast);
    });
  }, [toast]);

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Toaster Container */}
      <div
        className="fixed inset-0 pointer-events-none z-[999999]"
        style={{
          '--viewport-offset': `${getViewportOffset()}px`,
          '--toast-width': `${TOAST_CONFIG.TOAST_WIDTH}px`,
        } as React.CSSProperties}
      >
        {/* Top Toasts (single-slot, z-layered) */}
        <div
          className="absolute top-[var(--viewport-offset)] left-0 right-0 h-14"
          data-toast-position="top"
        >
          <AnimatePresence mode="sync">
            {topToasts.map((toast) => (
              <Toast
                key={toast.id}
                toast={toast}
                index={0}
                total={1}
                onHeightChange={() => {}}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Bottom Toasts (single-slot, z-layered) */}
        <div
          className="absolute bottom-[var(--viewport-offset)] left-0 right-0 h-14"
          data-toast-position="bottom"
        >
          <AnimatePresence mode="sync">
            {bottomToasts.map((toast) => (
              <Toast
                key={toast.id}
                toast={toast}
                index={0}
                total={1}
                onHeightChange={() => {}}
              />
            ))}
          </AnimatePresence>
        </div>
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

// Convenience toast object to be used within components
export const createToastHelpers = (showToast: (toast: ToastInput) => string) => ({
  success: (message: string, options?: Partial<ToastInput>) => 
    showToast({ ...options, message, type: 'success' }),
  error: (message: string, options?: Partial<ToastInput>) => 
    showToast({ ...options, message, type: 'error' }),
  warning: (message: string, options?: Partial<ToastInput>) => 
    showToast({ ...options, message, type: 'warning' }),
  info: (message: string, options?: Partial<ToastInput>) => 
    showToast({ ...options, message, type: 'info' }),
  loading: (message: string, options?: Partial<ToastInput>) => 
    showToast({ ...options, message, type: 'loading', duration: 0 }),
});

export default NiceToastProvider;