import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { EventStackItem, EventStackProps, EVENT_STACK_CONFIG } from '../types/eventStack';

const EventStack: React.FC<EventStackProps> = ({
  events,
  maxVisibleItems = EVENT_STACK_CONFIG.DEFAULT_MAX_ITEMS,
  title,
  width = EVENT_STACK_CONFIG.DEFAULT_WIDTH,
  onEventClick,
  className = '',
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate events with step approach
  useEffect(() => {
    if (events.length <= maxVisibleItems) return;

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => {
        const nextIndex = prevIndex + 1;
        // If we've shown all events, start over
        if (nextIndex >= events.length) {
          return 0;
        }
        return nextIndex;
      });
    }, 4000); // 4 seconds total cycle

    return () => clearInterval(interval);
  }, [events.length, maxVisibleItems]);

  const formatTimestamp = (timestamp: Date): string => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  const handleEventClick = useCallback((event: EventStackItem) => {
    onEventClick?.(event);
  }, [onEventClick]);

  // Get visible events based on current index
  const getVisibleEvents = () => {
    if (events.length === 0) return [];
    if (events.length <= maxVisibleItems) return events;
    
    const startIndex = currentIndex;
    const visibleEvents = [];
    
    for (let i = 0; i < maxVisibleItems; i++) {
      const eventIndex = (startIndex + i) % events.length;
      visibleEvents.push(events[eventIndex]);
    }
    
    return visibleEvents;
  };

  const visibleEvents = getVisibleEvents();

  const containerHeight = title 
    ? 30 + EVENT_STACK_CONFIG.STACK_GAP + (maxVisibleItems * (EVENT_STACK_CONFIG.ITEM_HEIGHT + EVENT_STACK_CONFIG.STACK_GAP)) - EVENT_STACK_CONFIG.STACK_GAP
    : (maxVisibleItems * (EVENT_STACK_CONFIG.ITEM_HEIGHT + EVENT_STACK_CONFIG.STACK_GAP)) - EVENT_STACK_CONFIG.STACK_GAP;

  return (
    <div 
      className={`relative ${className}`}
      style={{ 
        width: `${width}px`,
        height: `${containerHeight}px`,
      }}
    >
      {/* Optional title */}
      {title && (
        <div className="text-sm font-semibold text-gray-700 mb-1.5 px-2">
          {title}
        </div>
      )}

      {/* Event stack */}
      <div className="relative">
        {visibleEvents.map((event, index) => (
          <div
            key={`${event.id}-${index}`}
            className="absolute w-full"
            style={{
              top: `${index * (EVENT_STACK_CONFIG.ITEM_HEIGHT + EVENT_STACK_CONFIG.STACK_GAP)}px`,
            }}
          >
            <motion.div
              className={`
                flex items-center cursor-pointer
                bg-white rounded-[20px] shadow-[0_0_10px_0_rgba(0,0,0,0.20)]
                transition-all duration-200 hover:shadow-[0_0_15px_0_rgba(0,0,0,0.25)]
                ${event.className || ''}
              `}
              style={{
                height: `${EVENT_STACK_CONFIG.ITEM_HEIGHT}px`,
                padding: '6px 6px 6px 10px',
                gap: '8px',
              }}
              onClick={() => handleEventClick(event)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.9, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ 
                duration: 0.3,
                delay: index * 0.05,
                ease: [0.32, 0.72, 0, 1]
              }}
            >
              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-900 truncate leading-tight">
                  {event.title}
                </div>
                <div className="text-xs text-gray-600 truncate leading-tight">
                  {formatTimestamp(event.timestamp)}
                </div>
              </div>

              {/* Image */}
              <div className="flex-shrink-0">
                <img
                  src={event.image}
                  alt={event.title}
                  className="w-7 h-7 rounded-full object-cover"
                />
              </div>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Progress indicator (optional) */}
      {events.length > maxVisibleItems && (
        <div className="absolute -bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-1">
          {Array.from({ length: Math.ceil(events.length / maxVisibleItems) }, (_, i) => (
            <div
              key={i}
              className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                Math.floor(currentIndex / maxVisibleItems) === i
                  ? 'bg-gray-400'
                  : 'bg-gray-200'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default EventStack;
