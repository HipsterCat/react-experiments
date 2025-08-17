export type ToastPosition = 'top' | 'bottom';

export type ToastType = 'success' | 'error' | 'warning' | 'info' | 'custom';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  position: ToastPosition;
  duration?: number; // in milliseconds, 0 means no auto-dismiss
  icon?: string; // custom icon path
  backgroundColor?: string;
  textColor?: string;
  borderColor?: string;
  onClose?: () => void;
  onClick?: () => void;
}

export interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, 'id'>) => string;
  hideToast: (id: string) => void;
  clearAllToasts: () => void;
}
