import { getBoxContents } from './mockBoxService';
import { EventStackItem } from '../types/eventStack';

// Mock user names for events
const FIRST_NAMES = [
  'Alex', 'Sarah', 'Michael', 'Emma', 'David', 'Lisa', 'John', 'Kate',
  'Ryan', 'Amy', 'Chris', 'Zoe', 'Matthew', 'Nina', 'Jacob', 'Mia',
  'Samuel', 'Eva', 'Lucas', 'Ivy', 'Benjamin', 'Leah', 'Max', 'Ava'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas',
  'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson', 'White', 'Romanov'
];

// Event templates could be used for user-facing strings; not needed in this mock generator

// Generate a random timestamp within the last 24 hours
const getRandomTimestamp = (): Date => {
  const now = Date.now();
  const randomOffset = Math.random() * 24 * 60 * 60 * 1000; // 24 hours in ms
  return new Date(now - randomOffset);
};

// Get reward image path
const getRewardImage = (rewardType: string, rewardValue: number): string => {
  switch (rewardType) {
    case 'coins':
      if (rewardValue >= 1000) return '/src/assets/boxes/rewards/reward_coins_1000.webp';
      if (rewardValue >= 300) return '/src/assets/boxes/rewards/reward_coins_300.webp';
      if (rewardValue >= 100) return '/src/assets/boxes/rewards/reward_coins_100.webp';
      return '/src/assets/boxes/rewards/reward_coins_50.webp';
    case 'usdt':
      if (rewardValue >= 50) return '/src/assets/boxes/rewards/reward_usdt_50.webp';
      if (rewardValue >= 20) return '/src/assets/boxes/rewards/reward_usdt_20.webp';
      return '/src/assets/boxes/rewards/reward_usdt_1.webp';
    case 'box':
      switch (rewardValue) {
        case 11: return '/src/assets/boxes/rewards/box_regular.webp';
        case 12: return '/src/assets/boxes/rewards/box_rare.webp';
        case 13: return '/src/assets/boxes/rewards/box_epic.webp';
        case 14: return '/src/assets/boxes/rewards/box_legend.webp';
        default: return '/src/assets/boxes/rewards/mystery_box.webp';
      }
    default:
      return '/src/assets/boxes/rewards/question.webp';
  }
};

// Generate mock events from box contents
// Abort-aware timeout helper
const wait = (ms: number, signal?: AbortSignal): Promise<void> => {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms);
    if (signal) {
      if (signal.aborted) {
        clearTimeout(timer);
        resolve();
        return;
      }
      const onAbort = () => {
        clearTimeout(timer);
        resolve();
      };
      signal.addEventListener('abort', onAbort, { once: true });
    }
  });
};

export const generateMockEvents = async (count: number = 20, signal?: AbortSignal): Promise<EventStackItem[]> => {
  try {
    try {
      // eslint-disable-next-line no-console
      console.debug('[mockEventService] generateMockEvents:start', { count });
    } catch {}
    // Get box contents to use as reward templates
    const boxContents = await getBoxContents('mock', signal);
    if (signal?.aborted) {
      try {
        // eslint-disable-next-line no-console
        console.debug('[mockEventService] generateMockEvents:aborted-before-build');
      } catch {}
      return [];
    }
    // console.log('boxContents mockEventService', boxContents);
    const rewards = boxContents.rewards;
    
    const events: EventStackItem[] = [];
    
    for (let i = 0; i < count; i++) {
      // Pick random reward and random person name
      const reward = rewards[Math.floor(Math.random() * rewards.length)];
      const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const fullName = `${first} ${last}`;
      
      events.push({
        id: `event-${i}-${Date.now()}`,
        title: fullName,
        timestamp: getRandomTimestamp(),
        image: getRewardImage(reward.reward_type, reward.reward_value),
      });
    }
    
    // Sort by timestamp (newest first)
    events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    
    try {
      // eslint-disable-next-line no-console
      console.debug('[mockEventService] generateMockEvents:done', {
        generated: events.length,
        sampleIds: events.slice(0, 3).map((e) => e.id),
      });
    } catch {}

    return events;
  } catch (error) {
    console.error('Failed to generate mock events:', error);
    return [];
  }
};

// Simulate gradual loading of events with backoff
export const loadEventsGradually = async (
  onEventLoaded: (event: EventStackItem) => void,
  totalEvents: number = 15,
  initialDelay: number = 1000,
  intervalMs: number = 2000,
  signal?: AbortSignal
): Promise<void> => {
  try {
    try {
      // eslint-disable-next-line no-console
      console.debug('[mockEventService] loadEventsGradually:start', { totalEvents, initialDelay, intervalMs });
    } catch {}
    const allEvents = await generateMockEvents(totalEvents, signal);
    if (signal?.aborted) return;
    // console.log('allEvents', allEvents);
    
    // Add initial delay before starting
    await wait(initialDelay, signal);
    if (signal?.aborted) return;
    // console.log('initialDelay', initialDelay);
    
    // Load events one by one with intervals
    for (let i = 0; i < allEvents.length; i++) {
      if (signal?.aborted) return;
      try {
        // eslint-disable-next-line no-console
        console.debug('[mockEventService] loadEventsGradually:emit', { index: i, id: allEvents[i].id });
      } catch {}
      onEventLoaded(allEvents[i]);
      // console.log('intervalMs', intervalMs);
      // Wait before loading next event (except for the last one)
      if (i < allEvents.length - 1) {
        // console.log('intervalMs', intervalMs);
        await wait(intervalMs, signal);
      }
    }
    try {
      // eslint-disable-next-line no-console
      console.debug('[mockEventService] loadEventsGradually:complete');
    } catch {}
  } catch (error) {
    console.error('Failed to load events gradually:', error);
  }
};
