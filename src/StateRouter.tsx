import { createContext, useContext, useState, ReactNode } from 'react';

// Navigation context
interface NavigationContextType {
  currentPage: string;
  navigate: (page: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

// Navigation provider
interface NavigationProviderProps {
  children: ReactNode;
  defaultPage?: string;
}

export function NavigationProvider({ children, defaultPage = 'home' }: NavigationProviderProps) {
  const [currentPage, setCurrentPage] = useState(defaultPage);

  const navigate = (page: string) => {
    setCurrentPage(page);
  };

  return (
    <NavigationContext.Provider value={{ currentPage, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

// Hook to use navigation
export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error('useNavigation must be used within NavigationProvider');
  }
  return context;
}

// Page component
interface PageProps {
  name: string;
  children: ReactNode;
}

export function Page({ name, children }: PageProps) {
  const { currentPage } = useNavigation();
  return currentPage === name ? <>{children}</> : null;
}

// Navigation button
interface NavButtonProps {
  to: string;
  children: ReactNode;
  className?: string;
}

export function NavButton({ to, children, className }: NavButtonProps) {
  const { navigate } = useNavigation();
  
  return (
    <button 
      className={className}
      onClick={() => navigate(to)}
    >
      {children}
    </button>
  );
}
