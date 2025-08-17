import { useCallback } from 'react';

export const useTabbarContext = () => {
  const setIsTabbarEnabled = useCallback((enabled: boolean) => {
    console.log('Tabbar enabled:', enabled);
    // Mock implementation - in real app this would control bottom navigation
  }, []);

  return {
    setIsTabbarEnabled,
  };
};
