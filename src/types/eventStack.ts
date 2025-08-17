export interface EventStackItem {
  id: string;
  title: string;
  timestamp: Date;
  image: string;
  // Optional custom styling
  className?: string;
}

export interface EventStackProps {
  events: EventStackItem[];
  maxVisibleItems?: number;
  title?: string;
  width?: number;
  onEventClick?: (event: EventStackItem) => void;
  className?: string;
}

export const EVENT_STACK_CONFIG = {
  ITEM_HEIGHT: 40,
  STACK_GAP: 6,
  DEFAULT_WIDTH: 314,
  DEFAULT_MAX_ITEMS: 5,
  ANIMATION_DURATION: 0.4,
  STAGGER_DELAY: 0.05,
} as const;
