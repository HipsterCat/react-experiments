export type ToastPosition = 'top' | 'bottom';
export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'loading' | 'custom';
export type SwipeDirection = 'left' | 'right' | 'up' | 'down';

// For inventory updates and other rich toasts
export interface AnimationCoordinates {
  x: number;
  y: number;
}

export interface ToastInput {
  message?: string;
  type: ToastType;
  position?: ToastPosition;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  icon?: string | React.ReactNode;
  onClose?: () => void;
  onClick?: () => void;
  onDismiss?: () => void;
  onAutoClose?: () => void;
  dismissible?: boolean;
  // For deduplication
  variantId?: string;
  // For rich content
  jsx?: React.ReactNode;
  // For animated toasts
  animateFrom?: AnimationCoordinates;
  animateTo?: AnimationCoordinates;
  // Custom styles
  style?: React.CSSProperties;
  className?: string;
}

export interface Toast extends ToastInput {
  id: string;
  variantId: string;
  createdAt: number;
  pausedAt: number | null;
  // Timestamp when the current running timer started; used to compute elapsed time precisely
  timerStartAt: number | null;
  remainingTime: number;
  height: number;
  mounted: boolean;
  removed: boolean;
  swiping: boolean;
  swipeOut: boolean;
  swipeDirection: SwipeDirection | null;
  // For attention/duplicate detection
  updateCount: number;
  // Whether this toast is currently presented (visible). Invisible toasts are paused and not rendered
  visible?: boolean;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: ToastInput) => string;
  hideToast: (id: string) => void;
  pauseToast: (id: string) => void;
  resumeToast: (id: string) => void;
  clearAllToasts: () => void;
}

// Specialized toast types
export interface InventoryUpdateToast extends ToastInput {
  type: 'custom';
  itemIcon: string;
  itemName: string;
  quantity: number;
  action: 'add' | 'remove';
}

// Toast configuration constants
export const TOAST_CONFIG = {
  VIEWPORT_OFFSET: 16, // Mobile-first
  TOAST_LIFETIME: 4000,
  TOAST_WIDTH: 340,
  SWIPE_THRESHOLD: 45,
  TIME_BEFORE_UNMOUNT: 300,
  ANIMATION_DURATION: 400,
  // Dynamic Island style dimensions/animation
  DI_INITIAL_SIZE: 56,
  DI_ICON_SIZE: 24,
  DI_EXPAND_MS: 380,
  DI_COLLAPSE_MS: 280,
  DI_TEXT_FADE_MS: 200,
} as const;