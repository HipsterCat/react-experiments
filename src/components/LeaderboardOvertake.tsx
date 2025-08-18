import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { LeaderboardUser, AnimationPhase } from '../types/leaderboard';
import { formatRank } from '../utils/formatRank';
import clsx from 'clsx';

interface LeaderboardOvertakeProps {
  topLeaders: LeaderboardUser[];
  overtakenUsers: LeaderboardUser[];
  currentUser: LeaderboardUser & { displayRank: number; displayScore: number };
  animationPhase: AnimationPhase;
  className?: string;
}

const LeaderboardOvertake: React.FC<LeaderboardOvertakeProps> = ({
  topLeaders,
  overtakenUsers,
  currentUser,
  animationPhase,
  className
}) => {
  const isAnimating = animationPhase !== 'idle';
  const itemHeight = 48;
  const gap = 4;
  const visibleItemsInIdle = 4; // top 3 + user
  const containerHeight = (itemHeight + gap) * visibleItemsInIdle;
  
  // Random score updates for flickering effect
  const [flickerScores, setFlickerScores] = useState<Record<string, number>>({});
  
  useEffect(() => {
    if (animationPhase === 'scrolling') {
      const interval = setInterval(() => {
        const newScores: Record<string, number> = {};
        overtakenUsers.forEach(user => {
          if (!user.isCurrentUser) {
            newScores[user.id] = user.score + Math.floor(Math.random() * 500 - 250);
          }
        });
        setFlickerScores(newScores);
      }, 50); // Faster flicker
      
      return () => clearInterval(interval);
    } else {
      setFlickerScores({});
    }
  }, [animationPhase, overtakenUsers]);

  // User cell component
  const UserCell = ({ 
    user, 
    y = 0,
    isFixed = false
  }: { 
    user: LeaderboardUser & { displayRank?: number; displayScore?: number };
    y?: number;
    isFixed?: boolean;
  }) => {
    const isCurrentUser = user.isCurrentUser;
    const isSkeleton = user.isSkeleton;
    const isTopThree = user.rank <= 3;
    const displayRank = user.displayRank ?? user.rank;
    const displayScore = flickerScores[user.id] ?? user.displayScore ?? user.score;

    // Skeleton placeholder - no text, just rectangles
    if (isSkeleton && !isTopThree) {
      return (
        <div
          className="absolute left-0 right-0 bg-gray-50 rounded-lg px-4 flex items-center justify-between"
          style={{
            height: itemHeight,
            transform: `translateY(${y}px)`,
          }}
        >
          <div className="flex items-center gap-4 flex-1">
            <div className="w-12 h-4 bg-gray-200 rounded animate-pulse" />
            <div className="w-24 h-4 bg-gray-200 rounded animate-pulse" />
          </div>
          <div className="w-16 h-4 bg-gray-200 rounded animate-pulse" />
        </div>
      );
    }

    return (
      <div
        className={clsx(
          'absolute left-0 right-0 rounded-lg px-4 flex items-center justify-between',
          {
            'bg-gradient-to-r from-purple-600 to-pink-600 text-white': isCurrentUser,
            'bg-white': !isCurrentUser && !isSkeleton,
          }
        )}
        style={{
          height: itemHeight,
          transform: isFixed ? 'none' : `translateY(${y}px)`,
          bottom: isFixed ? 0 : 'auto',
          position: isFixed ? 'absolute' : 'absolute',
          zIndex: isFixed ? 50 : 1,
        }}
      >
        <div className="flex items-center gap-4 flex-1">
          {/* Rank with fixed width */}
          <div className={clsx(
            'font-bold text-base w-12 text-right tabular-nums',
            { 'text-white': isCurrentUser, 'text-gray-900': !isCurrentUser }
          )}>
            {isTopThree && user.rank <= 3 ? 
              ['🥇', '🥈', '🥉'][user.rank - 1] : 
              `#${formatRank(displayRank)}`
            }
          </div>

          {/* Name */}
          <div className="flex-1">
            <div className={clsx(
              'font-medium text-sm',
              { 'text-white': isCurrentUser, 'text-gray-700': !isCurrentUser }
            )}>
              {user.name}
            </div>
          </div>
        </div>

        {/* Score */}
        <div className={clsx(
          'text-right',
          { 'text-white': isCurrentUser, 'text-gray-700': !isCurrentUser }
        )}>
          <div className="font-bold text-base tabular-nums">
            {displayScore.toLocaleString()}
          </div>
        </div>
      </div>
    );
  };

  // Generate skeleton placeholders between top 3 and user positions
  const generateSkeletonGap = () => {
    const items = [];
    const gapSize = 20; // Number of skeleton items to show
    for (let i = 0; i < gapSize; i++) {
      items.push(
        <UserCell
          key={`gap-skeleton-${i}`}
          user={{
            id: `gap-${i}`,
            name: '',
            score: 0,
            rank: 4 + i,
            isSkeleton: true
          }}
          y={(topLeaders.length + i) * (itemHeight + gap)}
        />
      );
    }
    return items;
  };

  return (
    <div 
      className={clsx(
        'relative overflow-hidden rounded-xl bg-gray-100',
        className
      )}
      style={{ height: containerHeight }}
    >
      {/* Gradient masks */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-gray-100 to-transparent z-20 pointer-events-none" />
      <div className="absolute bottom-12 left-0 right-0 h-20 bg-gradient-to-t from-gray-100 to-transparent z-10 pointer-events-none" />

      {/* Scrollable content */}
      <AnimatePresence mode="sync">
        {/* Idle state: top 3 + gap + user */}
        {animationPhase === 'idle' && (
          <>
            {topLeaders.map((leader, index) => (
              <UserCell key={leader.id} user={leader} y={index * (itemHeight + gap)} />
            ))}
            {generateSkeletonGap()}
          </>
        )}

        {/* Animation state: scrolling content */}
        {isAnimating && (
          <motion.div
            initial={{ y: 0 }}
            animate={{
              y: animationPhase === 'scrolling' ? 
                overtakenUsers.length * (itemHeight + gap) * 0.8 : // Scroll up fast
                animationPhase === 'settling' ? 
                  overtakenUsers.length * (itemHeight + gap) : // Final position
                  0
            }}
            transition={{
              duration: animationPhase === 'scrolling' ? 0.8 : // Much faster
                       animationPhase === 'settling' ? 0.3 : 
                       0.5,
              ease: animationPhase === 'scrolling' ? 'linear' : 'easeOut'
            }}
          >
            {/* Top leaders move up and out */}
            {animationPhase !== 'collapsing' && topLeaders.map((leader, index) => (
              <UserCell 
                key={leader.id} 
                user={leader} 
                y={index * (itemHeight + gap) - (itemHeight + gap) * 4}
              />
            ))}
            
            {/* Overtaken users */}
            {overtakenUsers.map((user, index) => (
              <UserCell 
                key={user.id} 
                user={user} 
                y={index * (itemHeight + gap)}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fixed current user cell - always visible at bottom */}
      <UserCell 
        user={{
          ...currentUser,
          displayRank: currentUser.displayRank,
          displayScore: currentUser.displayScore
        }} 
        isFixed={true}
      />
    </div>
  );
};

export default LeaderboardOvertake;