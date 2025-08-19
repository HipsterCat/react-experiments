import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventStackProps, EVENT_STACK_CONFIG } from '../types/eventStack';

const EventStack: React.FC<EventStackProps> = ({
  events,
  maxVisibleItems = EVENT_STACK_CONFIG.DEFAULT_MAX_ITEMS,
  className = '',
  visible = true,
  title,
  width,
  itemHeight = EVENT_STACK_CONFIG.ITEM_HEIGHT,
  gap = EVENT_STACK_CONFIG.STACK_GAP,
  sequentialOnMount = false,
}) => {
  // Dimensions controlled externally via props

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    const weeks = Math.floor(diff / 604800000);

    if (minutes < 1) return 'just now';
    if (minutes < 60) return `${minutes} min ago`;
    if (hours < 2) return `1 hour ago`;
    if (hours < 24) return `${hours} hours ago`;
    if (days < 2) return `yesterday`;
    if (weeks < 4 && weeks > 1) return `${weeks} weeks ago`;

    return `${days} days ago`;
  };

  // Fixed height equal to maxVisibleItems; children won't change it
  const fixedHeight = (maxVisibleItems * (itemHeight + gap)) - gap;
  const rowStride = (itemHeight + gap);
  const bottomSpawnY = maxVisibleItems * rowStride + itemHeight; // always below full stack

  // Local displayed queue for smooth sequencing and rotation
  const [displayedIds, setDisplayedIds] = useState<string[]>([]);
  const hasCompletedInitialRef = useRef(false);
  const hasStartedInitialRef = useRef(false);
  const timersRef = useRef<number[]>([]);
  const eventsRef = useRef(events);

  useEffect(() => {
    eventsRef.current = events;
  }, [events]);

  // Reset sequencing on visibility change
  useEffect(() => {
    timersRef.current.forEach((t) => clearTimeout(t));
    timersRef.current = [];
    if (!visible) return;
    hasStartedInitialRef.current = false;
    if (!sequentialOnMount) {
      // Immediate fill to last N when not sequencing
      const target = events.slice(-Math.min(maxVisibleItems, events.length)).map(e => e.id);
      setDisplayedIds(target);
      hasCompletedInitialRef.current = true;
      return;
    }
    // try { console.debug('[EventStack] initial fill start (visible)'); } catch {}
    hasCompletedInitialRef.current = false;
    hasStartedInitialRef.current = false;
    setDisplayedIds([]);
    // Start after 600ms, then add items one-by-one with random delay (1200-2100ms)
    const startTimer = window.setTimeout(() => {
      const step = (index: number) => {
        if (!visible) return; // stop if hidden
        // Get current target ids from the last N events
        const curEvents = eventsRef.current;
        const targetIds = curEvents.slice(-Math.min(maxVisibleItems, curEvents.length)).map(e => e.id);
        if (targetIds.length === 0) {
          // No events yet; retry soon
          const retry = window.setTimeout(() => step(index), 150);
          timersRef.current.push(retry);
          return;
        }
        hasStartedInitialRef.current = true;
        // If desired index not yet available, wait until more events arrive
        if (index >= targetIds.length) {
          const waitMore = window.setTimeout(() => step(index), 200);
          timersRef.current.push(waitMore);
          return;
        }
        const nextId = targetIds[index];
        setDisplayedIds((prev) => prev.includes(nextId) ? prev : [...prev, nextId]);
        const reached = index + 1 >= Math.min(maxVisibleItems, targetIds.length);
        if (reached) {
          hasCompletedInitialRef.current = true;
          // try { console.debug('[EventStack] initial fill done'); } catch {}
          return;
        }
        const jitter = 1200 + Math.random() * 900; //
        const t = window.setTimeout(() => step(index + 1), jitter);
        timersRef.current.push(t);
      };
      step(0);
    }, 600);
    timersRef.current.push(startTimer);
    return () => {
      timersRef.current.forEach((t) => clearTimeout(t));
      timersRef.current = [];
    };
  }, [visible, sequentialOnMount, maxVisibleItems]);

  // When hidden, clear displayed content so we don't flash stale items next time
  useEffect(() => {
    if (!visible) {
      setDisplayedIds([]);
      hasCompletedInitialRef.current = false;
      lastIdRef.current = null;
    }
  }, [visible]);

  // On new events after initial fill, rotate: drop oldest, append newest
  const lastIdRef = useRef<string | null>(null);
  useEffect(() => {
    if (!visible) return;
    if (!hasCompletedInitialRef.current) return;
    if (events.length === 0) return;
    const newestId = events[events.length - 1].id;
    if (lastIdRef.current === newestId) return;
    lastIdRef.current = newestId;
    setDisplayedIds((prev) => {
      // If not full, just append
      if (prev.length < Math.min(maxVisibleItems, events.length)) {
        return prev.includes(newestId) ? prev : [...prev, newestId];
      }
      // If already full, rotate only if this is a new id
      if (prev.includes(newestId)) return prev;
      const rotated = [...prev.slice(1), newestId];
      return rotated;
    });
  }, [events, visible, maxVisibleItems]);

  // Build visibleEvents by mapping ids to actual items
  const idToEvent = new Map(events.map((e) => [e.id, e] as const));
  const visibleEvents = displayedIds
    .slice(-Math.min(maxVisibleItems, displayedIds.length))
    .map((id) => idToEvent.get(id))
    .filter(Boolean) as typeof events;

  const containerVisible = visible && (!sequentialOnMount || displayedIds.length > 0);

  try {
    // Lightweight render log
    // eslint-disable-next-line no-console
    // console.debug('[EventStack] render', {
    //   total: events.length,
    //   maxVisibleItems,
    //   visibleCount: visibleEvents.length,
    //   visibleIds: visibleEvents.map((e) => e.id),
    // });
  } catch {}

  return (
    <motion.div
      className={`relative overflow-visible ${className}`}
      style={{
        width: width !== undefined ? `${width}px` : undefined,
        height: fixedHeight,
      }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: containerVisible ? 1 : 0, x: containerVisible ? 0 : -50 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {title && visibleEvents.length > 0 && (
        <div className="text-xs font-semibold text-gray-700 mb-1.5 px-2 select-none">
          {title}
        </div>
      )}
      <div className="relative">
        <AnimatePresence mode="sync">
          {visibleEvents.map((event, index) => {
            // index is within the visible slice; compute its y
            const targetY = index * rowStride;
            try {
              // eslint-disable-next-line no-console
              // console.debug('[EventStack] item', { id: event.id, index, targetY });
            } catch {}
            return (
              <motion.div
                key={event.id}
                className="absolute w-full"
                initial={{ opacity: 0, scale: 0.95, y: bottomSpawnY }}
                animate={{ opacity: visible ? 1 : 0, scale: 1, y: targetY }}
                exit={{ opacity: 0, scale: 0.9, y: -rowStride }}
                transition={{ duration: 0.45, ease: [0.32, 0.72, 0, 1] }}
              >
                <div
                  className={`
                    flex items-center bg-white rounded-[20px]
                    shadow-[0_0_10px_0_rgba(0,0,0,0.20)] transition-all duration-200
                    ${event.className || ''}
                  `}
                  style={{
                    height: `${itemHeight}px`,
                    padding: '6px 6px 6px 10px',
                    gap: `${Math.max(0, gap - 2)}px`,
                  }}
                >
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-semibold text-gray-900 truncate leading-tight">
                      {event.title}
                    </div>
                    <div className="text-xs text-gray-400 truncate leading-tight">
                      {formatTimestamp(event.timestamp)}
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <img
                      src={event.image}
                      alt={event.title}
                      className="object-cover"
                      style={{ width: itemHeight - 6, height: itemHeight - 6 }}
                    />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default EventStack;
