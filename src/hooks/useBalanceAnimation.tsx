import { type FC, type ReactNode, createContext, useContext, useRef, useEffect } from 'react';
import type { BalanceAnimationRef } from '../components/BalanceAnimation';

interface BalanceAnimationContextType {
  balanceRef: React.RefObject<BalanceAnimationRef>;
  changeBalance: (amount: number, fromCoordinates: { x: number; y: number }, balanceType?: 'coins' | 'usdt') => void;
  getBalanceIconCoordinates: () => { x: number; y: number };
  setBalanceType: (type: 'coins' | 'usdt') => void;
}

const BalanceAnimationContext = createContext<BalanceAnimationContextType | undefined>(undefined);

export const BalanceAnimationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const balanceRef = useRef<BalanceAnimationRef>(null);

  // Debug: provider lifecycle
  useEffect(() => {
    console.log('[BalanceProvider] mounted');
    return () => {
      console.log('[BalanceProvider] unmounted');
    };
  }, []);

  const changeBalance = (amount: number, fromCoordinates: { x: number; y: number }, balanceType?: 'coins' | 'usdt') => {
    const hasRef = !!balanceRef.current;
    const hasMethods = hasRef && typeof balanceRef.current?.changeBalance === 'function' && typeof balanceRef.current?.setBalanceType === 'function';
    console.log('[BalanceProvider.changeBalance] called', {
      amount,
      fromCoordinates,
      balanceType: balanceType ?? '(unchanged)',
      hasRef,
      hasMethods,
    });
    if (!hasRef) {
      console.warn('[BalanceProvider.changeBalance] balanceRef.current is null');
      return;
    }
    try {
      // Switch to the specified balance type if provided
      if (balanceType) {
        console.log('[BalanceProvider.changeBalance] setBalanceType →', balanceType);
        balanceRef.current.setBalanceType(balanceType);
      }
      // Then change the balance
      console.log('[BalanceProvider.changeBalance] delegating to BalanceAnimation.changeBalance');
      balanceRef.current.changeBalance(amount, fromCoordinates);
    } catch (error) {
      console.error('[BalanceProvider.changeBalance] error:', error);
    }
  };

  const getBalanceIconCoordinates = () => {
    const hasRef = !!balanceRef.current;
    if (hasRef) {
      const coords = balanceRef.current.getBalanceIconCoordinates();
      console.log('[BalanceProvider.getBalanceIconCoordinates] →', coords);
      return coords;
    }
    console.warn('[BalanceProvider.getBalanceIconCoordinates] balanceRef.current is null');
    return { x: 0, y: 0 };
  };

  const setBalanceType = (type: 'coins' | 'usdt') => {
    const hasRef = !!balanceRef.current;
    console.log('[BalanceProvider.setBalanceType] called →', type, { hasRef });
    if (!hasRef) return;
    try {
      balanceRef.current.setBalanceType(type);
    } catch (error) {
      console.error('[BalanceProvider.setBalanceType] error:', error);
    }
  };

  const value = {
    balanceRef,
    changeBalance,
    getBalanceIconCoordinates,
    setBalanceType,
  };

  return (
    <BalanceAnimationContext.Provider value={value}>
      {children}
    </BalanceAnimationContext.Provider>
  );
};

export const useBalanceAnimation = () => {
  const context = useContext(BalanceAnimationContext);
  console.log('[useBalanceAnimation] hook accessed. Context is', context ? 'present' : 'undefined');
  if (context === undefined) {
    throw new Error('useBalanceAnimation must be used within a BalanceAnimationProvider');
  }
  return context;
};
