import React, { useState, useEffect } from 'react';
import EventStack from './EventStack';
import { EventStackItem } from '../types/eventStack';

const EventStackDemo: React.FC = () => {
  const [events, setEvents] = useState<EventStackItem[]>([]);

  // Sample event data
  const sampleEvents: EventStackItem[] = [
    {
      id: '1',
      title: 'New Achievement Unlocked',
      timestamp: new Date(Date.now() - 2 * 60 * 1000), // 2 minutes ago
      image: '/src/assets/boxes/rewards/box_epic.webp',
    },
    {
      id: '2',
      title: 'Daily Reward Claimed',
      timestamp: new Date(Date.now() - 15 * 60 * 1000), // 15 minutes ago
      image: '/src/assets/boxes/rewards/reward_coins_100.webp',
    },
    {
      id: '3',
      title: 'Friend Request',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      image: '/src/assets/boxes/rewards/telegram.webp',
    },
    {
      id: '4',
      title: 'Box Opened',
      timestamp: new Date(Date.now() - 45 * 60 * 1000), // 45 minutes ago
      image: '/src/assets/boxes/rewards/box_rare.webp',
    },
    {
      id: '5',
      title: 'Level Up!',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      image: '/src/assets/boxes/star.webp',
    },
    {
      id: '6',
      title: 'Mystery Box Found',
      timestamp: new Date(Date.now() - 90 * 60 * 1000), // 1.5 hours ago
      image: '/src/assets/boxes/rewards/mystery_box.webp',
    },
    {
      id: '7',
      title: 'Tournament Win',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      image: '/src/assets/boxes/rewards/box_legend.webp',
    },
    {
      id: '8',
      title: 'USDT Reward',
      timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
      image: '/src/assets/boxes/rewards/reward_usdt_20.webp',
    },
  ];

  // Initialize with sample events
  useEffect(() => {
    setEvents(sampleEvents);
  }, []);

  const addNewEvent = () => {
    const newEvent: EventStackItem = {
      id: `new-${Date.now()}`,
      title: 'New Event Added',
      timestamp: new Date(),
      image: '/src/assets/boxes/rewards/question.webp',
    };
    setEvents(prev => [newEvent, ...prev]);
  };

  const clearEvents = () => {
    setEvents([]);
  };

  const resetEvents = () => {
    setEvents(sampleEvents);
  };

  const handleEventClick = (event: EventStackItem) => {
    console.log('Event clicked:', event);
    alert(`Clicked: ${event.title}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Event Stack Demo</h1>
        <p className="text-gray-600 mb-8">
          An animated vertical stack of events with smooth transitions and auto-rotation.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Controls</h2>
              <div className="space-y-3">
                <button
                  onClick={addNewEvent}
                  className="w-full bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Add New Event
                </button>
                <button
                  onClick={resetEvents}
                  className="w-full bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Reset to Sample Events
                </button>
                <button
                  onClick={clearEvents}
                  className="w-full bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
                >
                  Clear All Events
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Fixed width (314px) and item height (40px)</li>
                <li>• 6px gap between stack items</li>
                <li>• Step animation: new item appears, then old disappears</li>
                <li>• 2 seconds per animation step (4 seconds total cycle)</li>
                <li>• Formatted timestamps as subtitle (now, 2m, 1h, 3d)</li>
                <li>• Click handling for events</li>
                <li>• Optional stack title</li>
                <li>• Progress indicator for multiple pages</li>
                <li>• Hover and tap animations</li>
              </ul>
            </div>
          </div>

          {/* Event Stack Demos */}
          <div className="space-y-8">
            {/* Main Demo */}
            {/* <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Event Stack with Title</h2>
              <div className="flex justify-center">
                <EventStack
                  events={events}
                  maxVisibleItems={5}
                  title="Recent Activity"
                  onEventClick={handleEventClick}
                />
              </div>
            </div> */}

            {/* Compact Demo */}
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Compact Stack (3 items)</h2>
              <div className="flex justify-center">
                <EventStack
                  title="Recent Rewards"
                  width={130}
                  events={events}
                  maxVisibleItems={3}
                />
              </div>
            </div>

            {/* Custom Width Demo */}
            {/* <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Custom Width (280px)</h2>
              <div className="flex justify-center">
                <EventStack
                  events={events}
                  maxVisibleItems={4}
                  width={280}
                  title="Notifications"
                  onEventClick={handleEventClick}
                />
              </div>
            </div> */}
          </div>
        </div>

        {/* Event Count Info */}
        <div className="mt-8 text-center text-gray-600">
          <p>Total Events: {events.length}</p>
          {events.length > 5 && (
            <p className="text-sm">Events will auto-rotate to show all items</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventStackDemo;
