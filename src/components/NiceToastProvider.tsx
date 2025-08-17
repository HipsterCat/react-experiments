import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Toast as ToastType, ToastContextType } from '../types/toast';
import Toast from './Toast';

const ToastContext = createContext<ToastContextType | undefined>(undefined);

interface NiceToastProviderProps {
  children: ReactNode;
  maxToasts?: number;
}

export const NiceToastProvider = ({ children, maxToasts = 5 }: NiceToastProviderProps) => {
  const [toasts, setToasts] = useState<ToastType[]>([]);

  const showToast = useCallback((toastData: Omit<ToastType, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: ToastType = {
      ...toastData,
      id,
      duration: toastData.duration ?? 4000, // Default 4 seconds
    };

    setToasts(prev => {
      const updated = [...prev, newToast];
      // Limit the number of toasts and remove oldest if exceeded
      if (updated.length > maxToasts) {
        return updated.slice(-maxToasts);
      }
      return updated;
    });

    return id;
  }, [maxToasts]);

  const hideToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    setToasts([]);
  }, []);

  // Separate toasts by position
  const topToasts = toasts.filter(toast => toast.position === 'top');
  const bottomToasts = toasts.filter(toast => toast.position === 'bottom');

  const contextValue: ToastContextType = {
    toasts,
    showToast,
    hideToast,
    clearAllToasts,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      
      {/* Top Toasts Container */}
      <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100000] pointer-events-none">
        <div className="flex flex-col items-center space-y-2 pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {topToasts.map((toast) => (
              <Toast
                key={toast.id}
                toast={toast}
                onClose={hideToast}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* Bottom Toasts Container */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-[100000] pointer-events-none">
        <div className="flex flex-col-reverse items-center space-y-reverse space-y-2 pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {bottomToasts.map((toast) => (
              <Toast
                key={toast.id}
                toast={toast}
                onClose={hideToast}
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

export default NiceToastProvider;
