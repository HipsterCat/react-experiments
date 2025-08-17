import { type FC, type ReactNode, createContext, useContext, useRef } from 'react';
import type { BalanceAnimationRef } from '../components/BalanceAnimation';

interface BalanceAnimationContextType {
  balanceRef: React.RefObject<BalanceAnimationRef>;
  changeBalance: (amount: number, fromCoordinates: { x: number; y: number }) => void;
  getBalanceIconCoordinates: () => { x: number; y: number };
}

const BalanceAnimationContext = createContext<BalanceAnimationContextType | undefined>(undefined);

export const BalanceAnimationProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const balanceRef = useRef<BalanceAnimationRef>(null);

  const changeBalance = (amount: number, fromCoordinates: { x: number; y: number }) => {
    if (balanceRef.current) {
      try {
        balanceRef.current.changeBalance(amount, fromCoordinates);
      } catch (error) {
        console.error('Balance animation error:', error);
      }
    }
  };

  const getBalanceIconCoordinates = () => {
    if (balanceRef.current) {
      return balanceRef.current.getBalanceIconCoordinates();
    }
    return { x: 0, y: 0 };
  };

  const value = {
    balanceRef,
    changeBalance,
    getBalanceIconCoordinates,
  };

  return (
    <BalanceAnimationContext.Provider value={value}>
      {children}
    </BalanceAnimationContext.Provider>
  );
};

export const useBalanceAnimation = () => {
  const context = useContext(BalanceAnimationContext);
  if (context === undefined) {
    throw new Error('useBalanceAnimation must be used within a BalanceAnimationProvider');
  }
  return context;
};
