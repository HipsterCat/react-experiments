import { useState, useEffect, useCallback, useRef } from 'react';
import { EventStackItem } from '../types/eventStack';
import { loadEventsGradually } from '../services/mockEventService';

export const useEventStack = (shouldLoad: boolean = false) => {
  const [events, setEvents] = useState<EventStackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const hasStartedLoadingRef = useRef(false);

  const addEvent = useCallback((event: EventStackItem) => {
    setEvents(prev => [...prev, event]); // Append to end so it appears at bottom
  }, []);

  const startLoading = useCallback(async () => {
    if (isLoading) return;
    if (hasStartedLoadingRef.current) return; // Prevent duplicate starts
    
    // In dev StrictMode effects may run twice; prevent duplicate streams
    if (abortRef.current) {
      abortRef.current.abort();
    }
    abortRef.current = new AbortController();
    hasStartedLoadingRef.current = true;
    
    setIsLoading(true);
    setEvents([]); // Clear existing events
    
    try {
      await loadEventsGradually(
        addEvent,
        15, // Total events to load
        1000, // Initial delay
        3000, // Interval between events (3 seconds to match stack rotation)
        abortRef.current.signal
      );
    } catch (error) {
      if (error?.name !== 'AbortError') {
        console.error('Failed to load events:', error);
      }
    } finally {
      setIsLoading(false);
      hasStartedLoadingRef.current = false;
    }
  }, [addEvent, isLoading]);

  const clearEvents = useCallback(() => {
    setEvents([]);
    hasStartedLoadingRef.current = false;
  }, []);

  // Auto-start loading when shouldLoad becomes true
  useEffect(() => {
    if (shouldLoad && events.length === 0 && !isLoading && !hasStartedLoadingRef.current) {
      startLoading();
    } else if (!shouldLoad) {
      // Reset when shouldLoad becomes false
      hasStartedLoadingRef.current = false;
    }
    
    return () => {
      // Cleanup any in-flight timers/requests
      if (abortRef.current) {
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, [shouldLoad, events.length, isLoading, startLoading]);

  return {
    events,
    isLoading,
    startLoading,
    clearEvents,
    addEvent,
  };
};
