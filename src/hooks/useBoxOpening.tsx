import { type FC, type ReactNode, createContext, useContext, useState, useCallback } from 'react';

interface BoxOpeningContextType {
  isBoxOpeningModalOpen: boolean;
  currentBoxId: number | undefined;
  openBoxModal: (boxId: number) => void;
  closeBoxModal: () => void;
}

const BoxOpeningContext = createContext<BoxOpeningContextType | undefined>(undefined);

export const BoxOpeningProvider: FC<{ children: ReactNode }> = ({ children }) => {
  console.log('BoxOpeningProvider');
  const [currentBoxId, setCurrentBoxId] = useState<number | undefined>(undefined);

  const openBoxModal = useCallback((boxId: number) => {
    console.log('openBoxModal', boxId);
    setCurrentBoxId(boxId);
  }, []);

  const closeBoxModal = useCallback(() => {
    console.log('closeBoxModal');
    setCurrentBoxId(undefined);
  }, []);

  const value = {
    isBoxOpeningModalOpen: currentBoxId !== undefined,
    currentBoxId,
    openBoxModal,
    closeBoxModal,
  };

  return (
    <BoxOpeningContext.Provider value={value}>
      {children}
    </BoxOpeningContext.Provider>
  );
};

export const useBoxOpening = () => {
  const context = useContext(BoxOpeningContext);
  if (context === undefined) {
    throw new Error('useBoxOpening must be used within a BoxOpeningProvider');
  }
  return context;
};

// Mock snackbar hook
export const useSnackbar = () => {
  const showSnackbar = useCallback((message: string, options?: { type?: 'error' | 'success' }) => {
    // In a real app, this would show a toast notification
    console.log(`Snackbar: ${message}`, options);
  }, []);

  return { showSnackbar };
};

// Mock dispatch hook
export const useAppDispatch = () => {
  return (action: any) => {
    // Mock dispatch function that does nothing
    console.log('Mock dispatch called with:', action);
  };
};

// Mock action creators
export const fetchTasks = () => ({ type: 'FETCH_TASKS' });
export const fetchProfile = () => ({ type: 'FETCH_PROFILE' });
