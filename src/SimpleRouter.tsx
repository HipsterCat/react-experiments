import { useState, useEffect, ReactNode } from 'react';

// Simple hash-based router
export function useHashRouter(defaultRoute = '/') {
  const [currentRoute, setCurrentRoute] = useState(() => {
    return window.location.hash.slice(1) || defaultRoute;
  });

  useEffect(() => {
    const handleHashChange = () => {
      setCurrentRoute(window.location.hash.slice(1) || defaultRoute);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [defaultRoute]);

  const navigate = (path: string) => {
    window.location.hash = path;
  };

  return { currentRoute, navigate };
}

// Simple Route component
interface RouteProps {
  path: string;
  children: ReactNode;
}

export function Route({ path, children }: RouteProps) {
  const { currentRoute } = useHashRouter();
  return currentRoute === path ? <>{children}</> : null;
}

// Simple Router component
interface RouterProps {
  children: ReactNode;
}

export function SimpleRouter({ children }: RouterProps) {
  return <>{children}</>;
}

// Navigation helper
export function Link({ to, children, className }: { to: string; children: ReactNode; className?: string }) {
  const { navigate } = useHashRouter();
  
  return (
    <button 
      className={className}
      onClick={() => navigate(to)}
    >
      {children}
    </button>
  );
}
