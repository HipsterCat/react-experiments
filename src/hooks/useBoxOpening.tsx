import { type FC, type ReactNode, createContext, useContext, useState, useCallback, useRef } from 'react';
import { getBoxContents } from '../services/mockBoxService';
import { PrizeItem } from '../types/rewards';

type InitialDisplayMode = 'wheel' | 'result';

interface BoxContentsState {
  prizes: PrizeItem[];
  isLoading: boolean;
  error: string | null;
}

interface BoxOpeningContextType {
  isBoxOpeningModalOpen: boolean;
  currentBoxId: number | undefined;
  initialDisplayMode: InitialDisplayMode;
  boxContents: BoxContentsState;
  openBoxModal: (boxId: number, mode?: InitialDisplayMode) => void;
  closeBoxModal: () => void;
  loadBoxContents: (boxId: number) => Promise<void>;
}

const BoxOpeningContext = createContext<BoxOpeningContextType | undefined>(undefined);

export const BoxOpeningProvider: FC<{ children: ReactNode }> = ({ children }) => {
  console.log('BoxOpeningProvider');
  const [currentBoxId, setCurrentBoxId] = useState<number | undefined>(undefined);
  const [initialDisplayMode, setInitialDisplayMode] = useState<InitialDisplayMode>('wheel');
  const [boxContents, setBoxContents] = useState<BoxContentsState>({
    prizes: [],
    isLoading: false,
    error: null
  });
  const isOpeningRef = useRef(false);

  const openBoxModal = useCallback((boxId: number, mode: InitialDisplayMode = 'wheel') => {
    console.log('openBoxModal', boxId, 'mode:', mode, 'currentBoxId:', currentBoxId, 'isOpening:', isOpeningRef.current);
    
    // Prevent opening if modal is already open with the same box or currently opening
    if (currentBoxId === boxId || isOpeningRef.current) {
      console.log('Modal already open/opening for this box, ignoring');
      return;
    }
    
    isOpeningRef.current = true;
    setCurrentBoxId(boxId);
    setInitialDisplayMode(mode);
    
    // Reset the opening flag after a short delay
    setTimeout(() => {
      isOpeningRef.current = false;
    }, 100);
  }, [currentBoxId]);

  const closeBoxModal = useCallback(() => {
    console.log('closeBoxModal');
    isOpeningRef.current = false;
    setCurrentBoxId(undefined);
    setInitialDisplayMode('wheel');
    // Clear box contents when closing
    setBoxContents({
      prizes: [],
      isLoading: false,
      error: null
    });
  }, []);

  const loadBoxContents = useCallback(async (boxId: number) => {
    console.log('loadBoxContents', boxId);
    
    setBoxContents(prev => ({
      ...prev,
      isLoading: true,
      error: null
    }));

    try {
      const data = await getBoxContents(String(boxId));
      
      // Filter and map rewards like in the original modal
      const filteredRewards = data.rewards.filter(
        (reward) =>
          reward.reward_type !== "double_balance" &&
          reward.reward_type !== "telegram_premium"
      );

      const mappedPrizes: PrizeItem[] = [
        ...filteredRewards,
        ...filteredRewards,
      ].map((reward) => ({
        reward_type: reward.reward_type as PrizeItem["reward_type"],
        reward_value: reward.reward_value,
      }));

      setBoxContents({
        prizes: mappedPrizes,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Failed to load box contents:', error);
      setBoxContents(prev => ({
        ...prev,
        isLoading: false,
        error: 'Failed to load box contents'
      }));
    }
  }, []);

  const value = {
    isBoxOpeningModalOpen: currentBoxId !== undefined,
    currentBoxId,
    initialDisplayMode,
    boxContents,
    openBoxModal,
    closeBoxModal,
    loadBoxContents,
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
