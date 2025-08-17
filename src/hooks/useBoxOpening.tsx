import { type FC, type ReactNode, createContext, useContext, useState, useCallback, useRef } from 'react';
import { getBoxContents } from '../services/mockBoxService';
import { PrizeItem } from '../types/rewards';

type DisplayMode = 'wheel' | 'result';

interface BoxContentsState {
  prizes: PrizeItem[];
  isLoading: boolean;
  error: string | null;
}

interface BoxOpeningContextType {
  isBoxOpeningModalOpen: boolean;
  currentBoxId: number | undefined;
  viewMode: DisplayMode;
  boxContents: BoxContentsState;
  openBoxModal: (boxId: number, mode?: DisplayMode) => void;
  closeBoxModal: () => void;
  loadBoxContents: (boxId: number) => Promise<void>;
  switchToWheel: (boxId: number) => Promise<void>;
  switchView: (mode: DisplayMode) => void;
}

const BoxOpeningContext = createContext<BoxOpeningContextType | undefined>(undefined);

export const BoxOpeningProvider: FC<{ children: ReactNode }> = ({ children }) => {
  console.log('BoxOpeningProvider');
  const [currentBoxId, setCurrentBoxId] = useState<number | undefined>(undefined);
  const [viewMode, setViewMode] = useState<DisplayMode>('wheel');
  const [boxContents, setBoxContents] = useState<BoxContentsState>({
    prizes: [],
    isLoading: false,
    error: null
  });
  const isOpeningRef = useRef(false);

  const openBoxModal = useCallback((boxId: number, viewMode: DisplayMode = 'wheel') => {
    
    // Prevent opening additional one if box modal already presented
    if (isOpeningRef.current) {
      console.log('Modal already open/opening for this box, ignoring');
      return;
    }
    
    isOpeningRef.current = true;
    setCurrentBoxId(boxId);
    setViewMode(viewMode);
    
    console.log('openBoxModal boxId', boxId, 'mode:', viewMode, 'currentBoxId:', currentBoxId, 'isOpening:', isOpeningRef.current);
    // Reset the opening flag after a short delay
    setTimeout(() => {
      isOpeningRef.current = false;
      console.log('openBoxModal isOpeningRef.current = false after 100ms');
    }, 100);
  }, [currentBoxId]);

  const closeBoxModal = useCallback(() => {
    console.log('closeBoxModal');
    isOpeningRef.current = false;
    setCurrentBoxId(undefined);
    console.log('closeBoxModal setCurrentBoxId(undefined)');
    setViewMode('wheel');
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
    viewMode,
    boxContents,
    openBoxModal,
    closeBoxModal,
    loadBoxContents,
    switchToWheel: useCallback(async (boxId: number) => {
      await loadBoxContents(boxId);
      setViewMode('wheel');
    }, [loadBoxContents]),
    switchView: useCallback((mode: DisplayMode) => {
      setViewMode(mode);
    }, []),
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
