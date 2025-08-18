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
  className?: string;
  visible?: boolean; // Controls fade-in/out left without unmounting
  title?: string;
  width?: number; // fixed width provided by parent
  itemHeight?: number; // fixed item height provided by parent
  gap?: number; // spacing between items provided by parent
  sequentialOnMount?: boolean; // if true, fill stack sequentially on first appear
}

export const EVENT_STACK_CONFIG = {
  ITEM_HEIGHT: 40,
  STACK_GAP: 6,
  DEFAULT_WIDTH: 314,
  DEFAULT_MAX_ITEMS: 5,
  ANIMATION_DURATION: 0.4,
  STAGGER_DELAY: 0.05,
} as const;
