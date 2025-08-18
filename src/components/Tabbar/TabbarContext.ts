import { noop } from "es-toolkit";
import {
  type Dispatch,
  createContext,
  useContext,
  useLayoutEffect,
} from "react";

export type ScreenOptions = {
  tabbar?: boolean;
};

export type ScreenOptionsStackEntry = {
  id: string;
  options: ScreenOptions;
};

export type TabbarContextType = {
  isTabbarEnabled: boolean;
  setIsTabbarEnabled: Dispatch<boolean>;
  setMainButtonVisibility: Dispatch<boolean>;
  pushScreenOptions: (options: ScreenOptions) => VoidFunction;
};

const TabbarContext = createContext<TabbarContextType>({
  isTabbarEnabled: false,
  setIsTabbarEnabled: noop,
  setMainButtonVisibility: noop,
  pushScreenOptions: () => noop,
});

export const TabbarContextProvider = TabbarContext.Provider;

export const useTabbarContext = () => {
  return useContext(TabbarContext);
};

export function useScreenOptions(options: { tabbar?: boolean }) {
  const { pushScreenOptions } = useTabbarContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useLayoutEffect(() => {
    return pushScreenOptions(options);
  }, [options.tabbar]);
}
