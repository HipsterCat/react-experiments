import { AnimatePresence, motion } from 'framer-motion'
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { ToastType } from '../types/toast'

// --- Physics ---
const stiffness = 400
const damping = 30

// --- Size Presets ---
export type DynamicIslandSize = 'collapsed' | 'compact' | 'long'

const sizePresets: Record<DynamicIslandSize, { width: number; height: number; borderRadius: number }> = {
  collapsed: { width: 60, height: 60, borderRadius: 30 },
  compact: { width: 235, height: 56, borderRadius: 28 },
  long: { width: 350, height: 56, borderRadius: 28 },
}

// --- Component Props ---
interface DemoToastData {
  id: string;
  message: string;
  type: ToastType;
  icon?: string | React.ReactNode;
  duration?: number;
  size: DynamicIslandSize;
}

interface DemoToastProps {
  position?: 'top' | 'bottom';
}

export interface DemoToastRef {
  showToast: (toast: Omit<DemoToastData, 'id'>) => void;
  hideToast: () => void;
}

// --- Main Component ---
const DemoToast = forwardRef<DemoToastRef, DemoToastProps>(({ position = 'bottom' }, ref) => {
  const [toast, setToast] = useState<DemoToastData | null>(null)
  const [isVisible, setIsVisible] = useState(false)
  const timeoutRef = useRef<NodeJS.Timeout>()

  const activeSize = toast?.size ?? 'collapsed'

  const showToast = (data: Omit<DemoToastData, 'id'>) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    const newToast: DemoToastData = { ...data, id: Math.random().toString(36).substr(2, 9) }
    setToast(newToast)
    setIsVisible(true)
    if (data.duration && data.duration > 0) {
      timeoutRef.current = setTimeout(hideToast, data.duration)
    }
  }

  const hideToast = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current)
    console.log('hiding toast', toast?.message)
    setIsVisible(false)
  }

  useImperativeHandle(ref, () => ({ showToast, hideToast }))

  const getIconStyling = (t: DemoToastData | null) => {
    if (!t) return null
    switch (t.type) {
        case 'success': return { bg: '#10b981', color: '#fff', icon: t.icon || '✓' };
        case 'error': return { bg: '#ef4444', color: '#fff', icon: t.icon || '✕' };
        case 'warning': return { bg: '#f59e0b', color: '#fff', icon: t.icon || '⚠' };
        case 'info': return { bg: '#fff', color: '#333', icon: t.icon || 'ℹ' };
        case 'loading': return { bg: '#6b7280', color: '#fff', icon: t.icon || <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: "linear" }} className="h-4 w-4 border-2 border-white border-t-transparent rounded-full" /> };
        default: return { bg: '#fff', color: '#333', icon: t.icon || '' };
    }
  }

  const iconStyling = getIconStyling(toast)

  return (
    <div className={`fixed left-1/2 -translate-x-1/2 z-50 ${position === 'top' ? 'top-16' : 'bottom-16'}`}>
      <motion.div
        className='relative flex items-center bg-[#333] shadow-lg'
        style={{ border: '0.5px solid rgba(255, 255, 255, 0.2)' }}
        initial={false}
        animate={{
          width: sizePresets[activeSize].width,
          height: sizePresets[activeSize].height,
          borderRadius: sizePresets[activeSize].borderRadius,
          scale: isVisible ? 1 : 0.5,
          opacity: isVisible ? 1 : 0,
          transition: { type: 'spring', stiffness, damping },
        }}
        onAnimationComplete={() => {
          if (!isVisible) setToast(null);
          {console.log(toast?.message)}

        }}
      >
        <div className="absolute inset-0 flex items-center px-4 overflow-hidden">
          {/* This wrapper is persistent and lets layout animations work */}
          <motion.div
            className="flex items-center w-full"
            animate={{ opacity: toast ? 1 : 0 }}
            initial={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Icon */}
            <motion.div
              className="relative flex-shrink-0 flex items-center justify-center rounded-full text-sm font-bold"
              style={{ width: 40, height: 40 }}
              layout
            >
              <AnimatePresence>
                {iconStyling && (
                  <motion.div
                    key={toast?.type}
                    className="absolute inset-0 rounded-full"
                    style={{ backgroundColor: iconStyling.bg }}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                  />
                )}
              </AnimatePresence>
              <AnimatePresence>
                {iconStyling && (
                  <motion.div
                    key={toast?.id}
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ color: iconStyling.color }}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1, transition: { delay: 0.1 } }}
                    exit={{ opacity: 0 }}
                  >
                    {iconStyling.icon}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Text Content */}
            {activeSize !== 'collapsed' && (
              <motion.div className="ml-3 text-left overflow-hidden" layout>
                <AnimatePresence mode="wait">
                  <motion.p
                    key={toast?.message}
                    className="text-white font-medium text-sm whitespace-nowrap"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0, transition: { type: 'spring', stiffness, damping } }}
                    exit={{ opacity: 0, y: -10, transition: { duration: 0.15 } }}
                  >
                    {toast?.message}
                  </motion.p>
                </AnimatePresence>
              </motion.div>
            )}
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
})

DemoToast.displayName = 'DemoToast'
export default DemoToast
