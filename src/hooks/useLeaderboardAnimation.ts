import { useState, useCallback, useRef, useEffect } from 'react';
import {
  LeaderboardUser,
  LeaderboardState,
  LeaderboardUpdate
} from '../types/leaderboard';

interface UseLeaderboardAnimationProps {
  initialRank?: number;
  initialScore?: number;
}

export const useLeaderboardAnimation = ({
  initialRank = 89432,
  initialScore = 1250,
}: UseLeaderboardAnimationProps = {}) => {
  const [state, setState] = useState<LeaderboardState>({
    topLeaders: [],
    nearbyUsers: [],
    currentUser: {
      id: 'current-user',
      name: 'You',
      score: initialScore,
      rank: initialRank,
      isCurrentUser: true
    },
    totalUsers: 100000,
    isAnimating: false,
    animationPhase: 'idle'
  });

  const [displayRank, setDisplayRank] = useState(initialRank);
  const [displayScore, setDisplayScore] = useState(initialScore);
  const [overtakenUsers, setOvertakenUsers] = useState<LeaderboardUser[]>([]);
  const [visibleOvertakenCount, setVisibleOvertakenCount] = useState(0);
  
  const animationTimeoutRef = useRef<number>();
  const targetRankRef = useRef<number>(initialRank);
  const targetScoreRef = useRef<number>(initialScore);

  // Generate skeleton users for unknown positions
  const generateSkeletonUser = useCallback((rank: number): LeaderboardUser => {
    const names = ['Player', 'User', 'Gamer', 'Pro', 'Ace', 'Star', 'Champion'];
    const randomName = names[Math.floor(Math.random() * names.length)];
    const suffix = Math.floor(Math.random() * 9000) + 1000; // Random 4-digit number
    
    return {
      id: `skeleton-${rank}`,
      name: `${randomName}${suffix}`,
      score: Math.max(100, state.currentUser.score + (state.currentUser.rank - rank) * 15),
      rank,
      isSkeleton: true
    };
  }, [state.currentUser]);

  // Generate users that will be overtaken
  const generateOvertakenUsers = useCallback((
    oldRank: number,
    newRank: number,
    nearbyUsers: LeaderboardUser[]
  ): LeaderboardUser[] => {
    const users: LeaderboardUser[] = [];
    const knownUsers = new Map<number, LeaderboardUser>();
    
    nearbyUsers.forEach(user => {
      knownUsers.set(user.rank, user);
    });

    // Calculate step size for showing hundreds of users in limited space
    const totalPositions = oldRank - newRank;
    const maxUsersToShow = Math.min(300, totalPositions); // Show max 300 users for more impact
    const step = Math.max(1, Math.floor(totalPositions / maxUsersToShow));

    // Generate users with step intervals
    for (let i = 0; i < maxUsersToShow; i++) {
      const rank = newRank + 1 + (i * step);
      if (rank > oldRank) break;
      
      const user = knownUsers.get(rank) || generateSkeletonUser(rank);
      // Add some randomness to simulate real-time position changes
      if (Math.random() > 0.95) {
        const scoreVariation = Math.floor(Math.random() * 50 - 25);
        user.score = Math.max(100, user.score + scoreVariation);
      }
      users.push(user);
    }

    return users;
  }, [generateSkeletonUser]);

  // Animate rank counting
  const animateCounter = useCallback((
    startValue: number,
    endValue: number,
    duration: number,
    onUpdate: (value: number) => void
  ) => {
    const startTime = Date.now();
    const diff = endValue - startValue;

    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const currentValue = Math.floor(startValue + diff * easeOut);
      
      onUpdate(currentValue);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    animate();
  }, []);

  // Run the complete animation sequence
  const runAnimationSequence = useCallback(async (update: LeaderboardUpdate) => {
    const { oldRank, newRank, newScore } = update;
    
    // Generate overtaken users
    const overtaken = generateOvertakenUsers(oldRank, newRank, update.nearbyUsers);
    setOvertakenUsers(overtaken);
    
    // Phase 1: Expand and show overtaken users (0.3s)
    setState(prev => ({ ...prev, animationPhase: 'expanding' }));
    
    // Show all overtaken users at once
    setVisibleOvertakenCount(Math.min(overtaken.length, 100));
    
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Phase 2: Fast scrolling (0.8s)
    setState(prev => ({ ...prev, animationPhase: 'scrolling' }));
    
    // Start counting animations
    animateCounter(oldRank, newRank, 800, setDisplayRank);
    animateCounter(state.currentUser.score, newScore, 800, setDisplayScore);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Phase 3: Slow down near target (0.3s)
    setState(prev => ({ ...prev, animationPhase: 'settling' }));
    await new Promise(resolve => setTimeout(resolve, 300));
    
    // Phase 4: Collapse back to idle (0.4s)
    setState(prev => ({ ...prev, animationPhase: 'collapsing' }));
    
    // Quick fade out
    setVisibleOvertakenCount(0);
    
    await new Promise(resolve => setTimeout(resolve, 400));
    
    // Complete animation
    setState(prev => ({
      ...prev,
      isAnimating: false,
      animationPhase: 'idle',
      currentUser: {
        ...prev.currentUser,
        rank: newRank,
        score: newScore
      }
    }));
    
    setOvertakenUsers([]);
    setVisibleOvertakenCount(0);
  }, [state.currentUser.score, generateOvertakenUsers, animateCounter]);

  // Handle score increase
  const increaseScore = useCallback(async (amount: number = 50) => {
    if (state.isAnimating) return;

    // Calculate new values - very dramatic jumps
    const newScore = state.currentUser.score + amount;
    const baseOvertaken = Math.floor(amount * 5); // Many more positions per point
    const randomMultiplier = 2 + Math.random() * 8; // 2x to 10x multiplier
    const overtakenCount = Math.floor(baseOvertaken * randomMultiplier);
    const newRank = Math.max(1, state.currentUser.rank - overtakenCount);

    targetRankRef.current = newRank;
    targetScoreRef.current = newScore;

    const update: LeaderboardUpdate = {
      oldRank: state.currentUser.rank,
      newRank,
      overtakenCount,
      newScore,
      topLeaders: state.topLeaders,
      nearbyUsers: []
    };

    // Generate nearby users
    for (let i = -20; i <= 20; i++) {
      const rank = newRank + i;
      if (rank > 0 && rank <= state.totalUsers) {
        const user = generateSkeletonUser(rank);
        // Some users might be real (simulate server data)
        if (Math.random() > 0.7) {
          user.isSkeleton = false;
          user.name = `Player${rank}`;
          user.avatar = ['🎮', '🎯', '🎪', '🎨', '🎭'][Math.floor(Math.random() * 5)];
        }
        update.nearbyUsers.push(user);
      }
    }

    setState(prev => ({ ...prev, isAnimating: true }));
    await runAnimationSequence(update);
  }, [state, generateSkeletonUser, runAnimationSequence]);

  // Get visible users based on animation state
  const getVisibleUsers = useCallback((): {
    topLeaders: LeaderboardUser[];
    overtaken: LeaderboardUser[];
    userRank: number;
    userScore: number;
  } => {
    const { animationPhase } = state;
    
    // Always return top 3
    const topLeaders = state.topLeaders.slice(0, 3);
    
    // Get visible overtaken users based on animation phase
    let visibleOvertaken: LeaderboardUser[] = [];
    if (animationPhase !== 'idle') {
      visibleOvertaken = overtakenUsers
        .slice(0, visibleOvertakenCount)
        .sort((a, b) => a.rank - b.rank);
    }
    
    return {
      topLeaders,
      overtaken: visibleOvertaken,
      userRank: displayRank,
      userScore: displayScore
    };
  }, [state, overtakenUsers, visibleOvertakenCount, displayRank, displayScore]);

  // Initialize with mock data
  useEffect(() => {
    const mockTopLeaders: LeaderboardUser[] = [
      { id: '1', name: 'xXDragonSlayer99Xx', score: 125430, rank: 1, avatar: '🏆' },
      { id: '2', name: 'CryptoKing', score: 98750, rank: 2, avatar: '🥈' },
      { id: '3', name: 'MoonLambo', score: 87320, rank: 3, avatar: '🥉' },
    ];

    setState(prev => ({
      ...prev,
      topLeaders: mockTopLeaders
    }));
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (animationTimeoutRef.current) {
        clearTimeout(animationTimeoutRef.current);
      }
    };
  }, []);

  return {
    state,
    getVisibleUsers,
    increaseScore,
    isAnimating: state.isAnimating,
    animationPhase: state.animationPhase,
    currentRank: state.currentUser.rank,
    currentScore: state.currentUser.score,
    displayRank,
    displayScore
  };
};
