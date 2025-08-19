import { useState, useEffect, useCallback, useRef } from 'react';
import { EventStackItem } from '../types/eventStack';
import { loadEventsGradually } from '../services/mockEventService';

export const useEventStack = (shouldLoad: boolean = false) => {
  const [events, setEvents] = useState<EventStackItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const hasStartedLoadingRef = useRef(false);

  const addEvent = useCallback((event: EventStackItem) => {
    try {
      // eslint-disable-next-line no-console
      console.debug('[useEventStack] addEvent', { id: event.id });
    } catch {}
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
      try {
        // eslint-disable-next-line no-console
        console.debug('[useEventStack] startLoading', { total: 15 });
      } catch {}
      await loadEventsGradually(
        addEvent,
        15, // Total events to load
        1000, // Initial delay
        3000, // Interval between events (3 seconds to match stack rotation)
        abortRef.current.signal
      );
    } catch (error: unknown) {
      const err = error as { name?: string };
      if (err?.name !== 'AbortError') {
        console.error('Failed to load events:', error);
      } else {
        try {
          // eslint-disable-next-line no-console
          console.debug('[useEventStack] aborted');
        } catch {}
      }
    } finally {
      setIsLoading(false);
      hasStartedLoadingRef.current = false;
    }
  }, [addEvent, isLoading]);

  const clearEvents = useCallback(() => {
    try {
      // eslint-disable-next-line no-console
      console.debug('[useEventStack] clearEvents');
    } catch {}
    setEvents([]);
    hasStartedLoadingRef.current = false;
  }, []);

  // Auto-start loading only when shouldLoad flips to true
  useEffect(() => {
    if (shouldLoad && !isLoading && !hasStartedLoadingRef.current && events.length === 0) {
      startLoading();
    }
    // When shouldLoad becomes false, stop current stream and reset guard
    if (!shouldLoad) {
      if (abortRef.current) {
        try {
          // eslint-disable-next-line no-console
          console.debug('[useEventStack] stop (shouldLoad=false)');
        } catch {}
        abortRef.current.abort();
        abortRef.current = null;
      }
      hasStartedLoadingRef.current = false;
    }
    // Intentionally no cleanup here to avoid aborting on every dependency change
  }, [shouldLoad, isLoading, startLoading, events.length]);

  // Abort on unmount only
  useEffect(() => {
    return () => {
      if (abortRef.current) {
        try {
          // eslint-disable-next-line no-console
          console.debug('[useEventStack] cleanup abort (unmount)');
        } catch {}
        abortRef.current.abort();
        abortRef.current = null;
      }
    };
  }, []);

  return {
    events,
    isLoading,
    startLoading,
    clearEvents,
    addEvent,
  };
};
