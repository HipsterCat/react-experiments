import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { EventStackItem, EventStackProps, EVENT_STACK_CONFIG } from '../types/eventStack';

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

  return (
    <motion.div
      className={`relative overflow-visible ${className}`}
      style={{
        width: width !== undefined ? `${width}px` : undefined,
        height: fixedHeight,
      }}
      initial={{ opacity: 0, x: -50 }}
      animate={{ opacity: visible ? 1 : 0, x: visible ? 0 : -50 }}
      transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
    >
      {title && events.length > 0 && (
        <div className="text-xs font-semibold text-gray-700 mb-1.5 px-2 select-none">
          {title}
        </div>
      )}
      <div className="relative">
        <AnimatePresence mode="sync">
          {(sequentialOnMount ? events.slice(-maxVisibleItems).map((e, i, arr) => arr[i]) : events.slice(-maxVisibleItems)).map((event, index) => {
            // index is within the visible slice; compute its y
            const targetY = index * rowStride;
            return (
              <motion.div
                key={`${event.id}-${index}`}
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
