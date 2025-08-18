import React, { useState, useRef, useEffect } from 'react';
import LeaderboardOvertake from './LeaderboardOvertake';
import { useLeaderboardAnimation } from '../hooks/useLeaderboardAnimation';
import { formatRank } from '../utils/formatRank';
import { motion } from 'framer-motion';
import clsx from 'clsx';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';
import { LeaderboardUser, AnimationPhase } from '../types/leaderboard';

interface RawVirtuosoTestProps {
  topLeaders: LeaderboardUser[];
  overtakenUsers: LeaderboardUser[];
  nearbyUsers?: LeaderboardUser[];
  currentUser: LeaderboardUser & { displayRank: number; displayScore: number };
  animationPhase: AnimationPhase;
  isAnimating: boolean;
}

const RawVirtuosoTest: React.FC<RawVirtuosoTestProps> = ({
  topLeaders,
  overtakenUsers,
  nearbyUsers,
  currentUser,
  animationPhase,
  isAnimating
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const itemHeight = 48;
  const gap = 4;
  
  // FULL LEADERBOARD PHYSICS - Show the REAL distance you're climbing!
  // Total list size = your current rank (so you climb from bottom to top)
  
  const myRank = currentUser.displayRank;
  const myScore = currentUser.displayScore;
  
  // Create a FULL leaderboard from rank 1 to myRank
  const totalPositions = myRank + (animationPhase !== 'idle' ? 10 : 0); // Add overtaken positions during animation
  
  console.log(`🎯 Creating FULL leaderboard: ${totalPositions} positions (rank 1 to ${myRank}${animationPhase !== 'idle' ? ' + 10 overtaken' : ''})`);
  
  // We don't actually create all users - Virtuoso will handle virtualization
  // We just define the itemContent function to generate users on-demand
  
  // My position in the virtual list is simply myRank - 1 (0-indexed)
  const myPositionInList = myRank - 1;
  
  // START AT MY ACTUAL POSITION IN THE LIST
  const initialScrollIndex = myPositionInList;
  
  console.log('🧪 FULL Leaderboard Physics:', {
    totalPositions,
    myRank,
    myPositionInList,
    initialScrollIndex,
    animationPhase,
    climbingDistance: `${myRank} positions to climb!`,
    structure: {
      top3: 'ranks 1-3 (real data)',
      middle: `ranks 4-${myRank-11} (seek placeholders)`,
      beforeMe: `ranks ${myRank-10}-${myRank-1} (real data)`,
      me: `rank ${myRank} (YOU)`,
      overtaken: animationPhase !== 'idle' ? `ranks ${myRank+1}-${myRank+10} (overtaken)` : 'none'
    }
  });

  // Generate user data on-demand for Virtuoso
  const generateUserAtIndex = (index: number) => {
    const rank = index + 1; // Convert 0-based index to 1-based rank
    
    // Top 3 - real data
    if (rank <= 3) {
      return {
        id: `top-${rank}`,
        rank,
        name: ['🥇 Champion', '🥈 Runner-up', '🥉 Third Place'][rank - 1],
        score: 100000 - (rank - 1) * 500,
        avatar: '👑',
        isCurrentUser: false,
        isSkeleton: false
      };
    }
    
    // Last 10 before me - real data
    if (rank >= myRank - 10 && rank < myRank) {
      return {
        id: `before-${rank}`,
        rank,
        name: `Player${rank}`,
        score: myScore + (myRank - rank) * 50,
        avatar: '🎮',
        isCurrentUser: false,
        isSkeleton: false
      };
    }
    
    // My position
    if (rank === myRank) {
      return {
        id: 'current-user',
        rank,
        name: currentUser.name || 'You',
        score: myScore,
        avatar: '🎯',
        isCurrentUser: true,
        isSkeleton: false
      };
    }
    
    // Overtaken users (only during animation)
    if (animationPhase !== 'idle' && rank > myRank && rank <= myRank + 10) {
      return {
        id: `overtaken-${rank}`,
        rank,
        name: `Overtaken${rank}`,
        score: myScore - (rank - myRank) * 30,
        avatar: '😔',
        isCurrentUser: false,
        isSkeleton: false
      };
    }
    
    // Everyone else - seek placeholders
    return {
      id: `placeholder-${rank}`,
      rank,
      name: `Player${rank}`,
      score: 100000 - rank * 10, // Approximate score
      avatar: '👤',
      isCurrentUser: false,
      isSkeleton: true
    };
  };

  // Animation: scroll from OLD position to NEW position (where you'll end up after boost)
  useEffect(() => {
    if (animationPhase === 'scrolling' && virtuosoRef.current) {
      // Use the updated rank from currentUser (this changes during animation)
      const newRank = currentUser.displayRank;
      const targetIndex = newRank - 1; // Convert to 0-based index
      
      console.log('🎯 Raw Virtuoso Animation - CLIMBING UP:', {
        from: `old position (index ${initialScrollIndex}, rank ${myRank})`,
        to: `new position (index ${targetIndex}, rank ${newRank})`,
        direction: '⬆️ CLIMBING UP',
        positionsClimbed: myRank - newRank,
        totalDistance: initialScrollIndex - targetIndex
      });
      
      virtuosoRef.current.scrollToIndex({
        index: targetIndex,
        align: 'end',
        behavior: 'smooth'
      });
    }
  }, [animationPhase, initialScrollIndex, myRank, currentUser.displayRank]);

  // Reset to initial position (back to bottom)
  useEffect(() => {
    if (animationPhase === 'idle' && virtuosoRef.current) {
      console.log('🔄 Raw Virtuoso Reset to BOTTOM:', {
        index: initialScrollIndex,
        meaning: 'back to your original position at bottom'
      });
      virtuosoRef.current.scrollToIndex({
        index: initialScrollIndex,
        align: 'end',
        behavior: 'smooth'
      });
    }
  }, [animationPhase, initialScrollIndex]);

  const renderUser = (index: number) => {
    const user = generateUserAtIndex(index);
    if (!user) return null;

    const isCurrentUserItem = user.isCurrentUser;
    const isTopThree = user.rank <= 3;
    const isSkeleton = user.isSkeleton;
    
    return (
      <div
        style={{ 
          height: itemHeight, 
          marginBottom: gap,
          padding: '8px 16px',
          backgroundColor: isCurrentUserItem ? '#8b5cf6' : isTopThree ? '#fef3c7' : isSkeleton ? '#f3f4f6' : '#f9fafb',
          color: isCurrentUserItem ? 'white' : 'black',
          border: isCurrentUserItem ? '2px solid #7c3aed' : '1px solid #e5e7eb',
          borderRadius: '8px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          opacity: isSkeleton ? 0.6 : 1
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontWeight: 'bold', minWidth: '60px' }}>
            #{formatRank(user.rank)}
          </span>
          <span>{isSkeleton ? '...' : user.name}</span>
          {isCurrentUserItem && <span style={{ fontSize: '12px' }}>← YOU</span>}
        </div>
        <span style={{ fontWeight: 'bold' }}>
          {isSkeleton ? '...' : user.score.toLocaleString()}
        </span>
      </div>
    );
  };

  return (
    <div style={{ height: '400px', border: '2px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
      {/* Meta info only - no fixed content blocking the scroll */}
      <div style={{ 
        padding: '8px', 
        backgroundColor: '#f3f4f6', 
        fontSize: '11px', 
        fontFamily: 'monospace',
        borderBottom: '1px solid #d1d5db'
      }}>
        📊 FULL Leaderboard: {totalPositions} positions | 🎯 StartAt: #{initialScrollIndex} (rank #{myRank}) | 📍 Phase: {animationPhase} | 🚀 ClimbDistance: {myRank} positions!
      </div>
      
      {/* Pure Virtuoso - no fixed headers/footers */}
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: 'calc(100% - 28px)' }}
        totalCount={totalPositions}
        itemContent={renderUser}
        fixedItemHeight={itemHeight + gap}
        initialTopMostItemIndex={initialScrollIndex}
        overscan={10}
        scrollSeekConfiguration={{
          enter: (velocity) => Math.abs(velocity) > 300,
          exit: (velocity) => Math.abs(velocity) < 50,
        }}
        components={{
          ScrollSeekPlaceholder: ({ index }) => (
            <div 
              style={{ 
                height: itemHeight, 
                marginBottom: gap,
                backgroundColor: '#f3f4f6',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9ca3af',
                fontSize: '12px'
              }}
            >
              #{formatRank(index + 1)} ...
            </div>
          )
        }}
      />
    </div>
  );
};

const LeaderboardOvertakeDemo: React.FC = () => {
  const {
    state,
    getVisibleUsers,
    increaseScore,
    isAnimating,
    animationPhase,
    currentRank,
    currentScore
  } = useLeaderboardAnimation({
    initialRank: 64532,
    initialScore: 1250
  });

  const [scoreBoost, setScoreBoost] = useState(200);

  const handleBoostScore = () => {
    if (!isAnimating) {
      increaseScore(scoreBoost);
    }
  };

  const { topLeaders, overtaken, nearbyTarget, userRank, userScore } = getVisibleUsers();

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Leaderboard Overtake Animation</h1>
        <p className="text-gray-600 mb-8">
          Fast-forward leaderboard animation showing rapid rank climbing.
          Your position stays fixed at bottom while you overtake hundreds of players!
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Demo Controls */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Current Rank:</span>
                  <span className="font-bold text-2xl">#{formatRank(currentRank)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600">Score:</span>
                  <span className="font-bold text-xl">{currentScore.toLocaleString()}</span>
                </div>
                {animationPhase !== 'idle' && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Animation Phase:</span>
                    <span className="font-bold text-purple-600 capitalize">{animationPhase}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Controls</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Score Boost Amount: {scoreBoost}
                  </label>
                  <input
                    type="range"
                    min="10"
                    max="2000"
                    step="50"
                    value={scoreBoost}
                    onChange={(e) => setScoreBoost(Number(e.target.value))}
                    className="w-full"
                    disabled={isAnimating}
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>10 points</span>
                    <span>2000 points</span>
                  </div>
                </div>

                <motion.button
                  onClick={handleBoostScore}
                  disabled={isAnimating}
                  className={clsx(
                    'w-full py-4 rounded-lg font-bold text-lg transition-all',
                    'transform active:scale-95',
                    {
                      'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:shadow-lg': !isAnimating,
                      'bg-gray-300 text-gray-500 cursor-not-allowed': isAnimating
                    }
                  )}
                  whileHover={!isAnimating ? { scale: 1.02 } : {}}
                  whileTap={!isAnimating ? { scale: 0.98 } : {}}
                >
                  {isAnimating ? 'Climbing Ranks...' : `Boost Score +${scoreBoost}`}
                </motion.button>
              </div>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Features</h2>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>• Your position fixed at bottom - never moves</li>
                <li>• Top 3 slide out of view during animation</li>
                <li>• Shows hundreds of players being overtaken</li>
                <li>• Score flickering on all visible cells</li>
                <li>• Formatted rank numbers (6.4K, 64K, etc)</li>
                <li>• 1.8-second fast animation sequence</li>
                <li>• Gradient masking for depth effect</li>
                <li>• Fixed width cells with clean layout</li>
                <li>• Creates dramatic distance feeling</li>
              </ul>
            </div>
          </div>

          {/* Raw Virtuoso Test */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">🔬 Raw Virtuoso Test</h2>
              <RawVirtuosoTest 
                topLeaders={topLeaders}
                overtakenUsers={overtaken}
                nearbyUsers={nearbyTarget}
                currentUser={{
                  ...state.currentUser,
                  displayRank: userRank,
                  displayScore: userScore
                }}
                animationPhase={animationPhase}
                isAnimating={isAnimating}
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Leaderboard (Wrapped)</h2>
              <LeaderboardOvertake
                topLeaders={topLeaders}
                overtakenUsers={overtaken}
                nearbyUsers={nearbyTarget}
                currentUser={{
                  ...state.currentUser,
                  displayRank: userRank,
                  displayScore: userScore
                }}
                animationPhase={animationPhase}
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Animation Phases</h2>
              <div className="space-y-2 text-sm">
                <div className={clsx('p-2 rounded', animationPhase === 'idle' && 'bg-purple-100')}>
                  <span className="font-semibold text-gray-700">Idle:</span>
                  <span className="text-gray-600"> Shows only top 3 leaders</span>
                </div>
                <div className={clsx('p-2 rounded', animationPhase === 'expanding' && 'bg-green-100')}>
                  <span className="font-semibold text-gray-700">Expanding:</span>
                  <span className="text-gray-600"> List expands, showing overtaken users</span>
                </div>
                <div className={clsx('p-2 rounded', animationPhase === 'scrolling' && 'bg-yellow-100')}>
                  <span className="font-semibold text-gray-700">Scrolling:</span>
                  <span className="text-gray-600"> Fast scrolling with rank counting</span>
                </div>
                <div className={clsx('p-2 rounded', animationPhase === 'settling' && 'bg-orange-100')}>
                  <span className="font-semibold text-gray-700">Settling:</span>
                  <span className="text-gray-600"> Slowing down near target position</span>
                </div>
                <div className={clsx('p-2 rounded', animationPhase === 'collapsing' && 'bg-red-100')}>
                  <span className="font-semibold text-gray-700">Collapsing:</span>
                  <span className="text-gray-600"> Returning to idle state</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-purple-600">100K+</div>
            <div className="text-sm text-gray-600">Total Players</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-pink-600">Top {((currentRank / 100000) * 100).toFixed(1)}%</div>
            <div className="text-sm text-gray-600">Your Position</div>
          </div>
          <div className="bg-white rounded-lg p-4 text-center shadow">
            <div className="text-2xl font-bold text-green-600">{isAnimating ? '🚀' : '⏸️'}</div>
            <div className="text-sm text-gray-600">Status</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LeaderboardOvertakeDemo;
