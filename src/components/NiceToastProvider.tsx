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
  const toastDeadlines = useRef<Map<string, number>>(new Map());
  const visibleByKey = useRef<Map<string, string>>(new Map());
  const toastCounter = useRef(1);
  const hideToastRef = useRef<(id: string) => void>();
  // Keep a live reference to the latest toasts array to avoid side-effects
  // inside state updaters and stale closures in timer callbacks
  const toastsRef = useRef<ToastType[]>([]);

  // Clean up removed toasts periodically
  useEffect(() => {
    const cleanup = setInterval(() => {
      const now = Date.now();
      setToasts(prev => {
        const filtered = prev.filter(t => !t.removed || now - t.createdAt < 10000);
        if (filtered.length === prev.length) return prev;
        // Sync ref to avoid stale snapshot
        toastsRef.current = filtered;
        return filtered;
      });
    }, 5000);
    return () => clearInterval(cleanup);
  }, []);

  const makeKey = useCallback((variantId: string, position: 'top' | 'bottom') => `${variantId}::${position}`, []);

  const clearToastTimer = useCallback((id: string) => {
    const timer = toastTimers.current.get(id);
    if (timer) {
      clearTimeout(timer);
      toastTimers.current.delete(id);
    }
    toastDeadlines.current.delete(id);
  }, []);

  const startToastTimer = useCallback((toast: ToastType) => {
    if (!toast.remainingTime || toast.remainingTime <= 0) return;

    // Clear existing timer if any
    const existing = toastTimers.current.get(toast.id);
    if (existing) clearTimeout(existing);

    console.log(`[ToastProvider] Starting timer for toast ${toast.id}, duration: ${toast.remainingTime}ms`);
    const expectedStartAt = toast.timerStartAt;
    const expectedUpdateCount = toast.updateCount;
    const expectedDeadline = Date.now() + toast.remainingTime;
    toastDeadlines.current.set(toast.id, expectedDeadline);
    console.log(`[ToastProvider] Timer metadata for ${toast.id}`, { expectedStartAt, expectedUpdateCount, expectedDeadline });
    const timer = setTimeout(() => {
      console.log(`[ToastProvider] Timer expired for toast ${toast.id}`);
      // Use the latest toasts snapshot to decide, then perform side-effect directly
      const currentToast = toastsRef.current.find(t => t.id === toast.id);
      if (!currentToast) {
        toastTimers.current.delete(toast.id);
        return;
      }
      const currentDeadline = toastDeadlines.current.get(toast.id);
      // Guard against stale timers from older states
      const isStale = (expectedStartAt !== null && currentToast.timerStartAt !== expectedStartAt)
        || currentToast.updateCount !== expectedUpdateCount
        || !currentToast.visible
        || currentToast.removed
        || currentDeadline !== expectedDeadline;
      if (isStale) {
        console.log(`[ToastProvider] Ignoring stale timer for ${toast.id}`, {
          expectedStartAt,
          actualStartAt: currentToast.timerStartAt,
          expectedUpdateCount,
          actualUpdateCount: currentToast.updateCount,
          expectedDeadline,
          actualDeadline: currentDeadline,
          visible: currentToast.visible,
          removed: currentToast.removed,
        });
        toastTimers.current.delete(toast.id);
        return;
      }
      currentToast.onAutoClose?.();
      if (hideToastRef.current) {
        console.log(`[ToastProvider] Calling hideToast for ${toast.id}`);
        hideToastRef.current(toast.id);
      }
      // Ensure timer is cleared from the map on expiry
      toastTimers.current.delete(toast.id);
      toastDeadlines.current.delete(toast.id);
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
    toastDeadlines.current.clear();
    
    // Mark all as removed
    setToasts(prev => prev.map(toast => ({ ...toast, removed: true })));
    
    // Clear after animation
    setTimeout(() => {
      setToasts([]);
    }, TOAST_CONFIG.TIME_BEFORE_UNMOUNT);
  }, []);

  // Handle document visibility for pausing timers (attach once, read from ref)
  useEffect(() => {
    const handleVisibilityChange = () => {
      const snapshot = toastsRef.current;
      if (document.hidden) {
        snapshot.forEach(toast => {
          if (toast.visible && toast.duration && toast.duration > 0 && !toast.pausedAt && toast.remainingTime > 0) {
            pauseToast(toast.id);
          }
        });
      } else {
        snapshot.forEach(toast => {
          if (toast.visible && toast.pausedAt && toast.remainingTime > 0) {
            resumeToast(toast.id);
          }
        });
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [pauseToast, resumeToast]);

  // Set hideToast ref once (functions are stable due to useCallback)
  useEffect(() => {
    console.log(`[ToastProvider] Setting hideToastRef`);
    hideToastRef.current = hideToast;
  }, []);

  // Keep toastsRef in sync with state
  useEffect(() => {
    toastsRef.current = toasts;
  }, [toasts]);

  const showToast = useCallback((toastInput: ToastInput): string => {
    const variantId = generateVariantId(toastInput);
    const position = toastInput.position || 'bottom';
    const defaultDuration = toastInput.duration ?? TOAST_CONFIG.TOAST_LIFETIME;

    console.log(`[ToastProvider] showToast called:`, { variantId, position, defaultDuration, type: toastInput.type });

    // Check the latest snapshot for an existing visible toast with same variantId
    const key = makeKey(variantId, position);
    let existingId = visibleByKey.current.get(key);
    // Validate the id still points to a visible toast
    let existingVisible = existingId ? toastsRef.current.find(t => t.id === existingId && t.visible && !t.removed) : undefined;
    if (!existingVisible) {
      existingVisible = toastsRef.current.find(t => t.variantId === variantId && t.position === position && t.visible && !t.removed);
      if (existingVisible) visibleByKey.current.set(key, existingVisible.id);
    }

    if (existingVisible) {
      console.log(`[ToastProvider] Updating existing toast ${existingVisible.id}`);
      // Clear any running timer before updating
      clearToastTimer(existingVisible.id);

      let updatedToast: ToastType | null = null;
      setToasts(prev => {
        const next = prev.map(t => {
          if (t.id === existingVisible.id) {
            const now = Date.now();
            const updated = {
              ...t,
              ...toastInput,
              id: t.id,
              variantId: t.variantId,
              position: t.position,
              updateCount: t.updateCount + 1,
              remainingTime: defaultDuration,
              timerStartAt: defaultDuration > 0 ? now : null,
              pausedAt: null,
            } as ToastType;
            updatedToast = updated;
            return updated;
          }
          return t;
        });
        // Keep ref in sync so rapid calls see the latest state
        toastsRef.current = next;
        return next;
      });

      if (defaultDuration > 0 && updatedToast) {
        setTimeout(() => startToastTimer(updatedToast as ToastType), 0);
      }

      return existingVisible.id;
    }

    // Determine current visible toast at this position from latest snapshot
    const currentVisible = toastsRef.current.find(t => t.position === position && t.visible && !t.removed);

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
      const updated = prev.map(t => {
        if (currentVisible && t.id === currentVisible.id) {
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
      const next = [...updated, newToast];
      // Maintain fast lookup for visible by variant+position
      visibleByKey.current.set(key, newToast.id);
      // Keep ref in sync so rapid calls see the latest state
      toastsRef.current = next;
      return next;
    });

    if (newToast.remainingTime > 0) {
      setTimeout(() => startToastTimer(newToast), 0);
    }

    return id;
  }, [clearToastTimer, startToastTimer]);

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