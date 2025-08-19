import React, { createContext, useContext, useMemo, useRef } from 'react';
import InventoryChangeToast, { type InventoryChangeToastRef } from './InventoryChangeToast';

type InventoryItem = {
  id: string;
  icon: string;
  name?: string;
};

type ShowParams = {
  mainItem: InventoryItem;
  otherItems?: InventoryItem[];
  totalCount?: number;
  fromCoordinates?: { x: number; y: number };
  fromSize?: { width: number; height: number };
  onClick?: () => void;
};

interface InventoryChangeToastController {
  show: (data: ShowParams) => void;
  hide: () => void;
}

const InventoryChangeToastContext = createContext<InventoryChangeToastController | null>(null);

export const InventoryChangeToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toastRef = useRef<InventoryChangeToastRef | null>(null);

  const controller = useMemo<InventoryChangeToastController>(() => ({
    show: (data) => toastRef.current?.show(data as any),
    hide: () => toastRef.current?.hide(),
  }), []);

  return (
    <InventoryChangeToastContext.Provider value={controller}>
      {children}
      <InventoryChangeToast ref={toastRef} />
    </InventoryChangeToastContext.Provider>
  );
};

export const useInventoryChangeToast = (): InventoryChangeToastController => {
  const ctx = useContext(InventoryChangeToastContext);
  if (!ctx) throw new Error('useInventoryChangeToast must be used within InventoryChangeToastProvider');
  return ctx;
};


