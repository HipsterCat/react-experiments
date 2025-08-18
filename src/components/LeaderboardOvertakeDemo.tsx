import React, { useState } from 'react';
import LeaderboardOvertake from './LeaderboardOvertake';
import { useLeaderboardAnimation } from '../hooks/useLeaderboardAnimation';
import { formatRank } from '../utils/formatRank';
import { motion } from 'framer-motion';
import clsx from 'clsx';

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

  const { topLeaders, overtaken, userRank, userScore } = getVisibleUsers();

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

          {/* Leaderboard Demo */}
          <div className="space-y-8">
            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">Leaderboard</h2>
              <LeaderboardOvertake
                topLeaders={topLeaders}
                overtakenUsers={overtaken}
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
