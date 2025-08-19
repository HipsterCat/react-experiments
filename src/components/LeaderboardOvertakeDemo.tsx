import React, { useState, useRef, useEffect, FC } from 'react';
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
  currentUser,
  animationPhase,
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

// Avatar components for isScrolling performance test
const Avatar: FC = () => {
  return (
    <div style={{
        backgroundColor: 'blue',
        borderRadius: '50%',
        width: 50,
        height: 50,
        paddingTop: 13,
        paddingLeft: 14,
        color: 'white',
        boxSizing: 'border-box'
      }}>AB</div>
  )
}

const AvatarPlaceholder: FC = () => {
return (<div style={{
        backgroundColor: '#eef2f4',
        borderRadius: '50%',
        width: 50,
        height: 50,
    }}>{' '}</div>)
}

// IsScrolling Performance Test Component
interface IsScrollingVirtuosoTestProps {
  currentUser: LeaderboardUser & { displayRank: number; displayScore: number };
  animationPhase: AnimationPhase;
  onCardClick?: (targetRank: number) => void;
}

const IsScrollingVirtuosoTest: React.FC<IsScrollingVirtuosoTestProps> = ({
  currentUser,
  animationPhase,
  onCardClick
}) => {
  const [isScrolling, setIsScrolling] = useState(false);
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const itemHeight = 48;
  const gap = 4;
  
  const myRank = currentUser.displayRank;
  const myScore = currentUser.displayScore;
  const totalPositions = myRank + (animationPhase !== 'idle' ? 10 : 0);
  const myPositionInList = myRank - 1;
  
  // Generate user data on-demand (same logic as RawVirtuosoTest)
  const generateUserAtIndex = (index: number) => {
    const rank = index + 1;
    
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
    
    return {
      id: `placeholder-${rank}`,
      rank,
      name: `Player${rank}`,
      score: 100000 - rank * 10,
      avatar: '👤',
      isCurrentUser: false,
      isSkeleton: true
    };
  };

  const handleCardClick = (rank: number) => {
    if (onCardClick) {
      onCardClick(rank);
    }
  };
  
  return (
    <div style={{ height: '400px', border: '2px solid #e5e7eb', borderRadius: '12px', overflow: 'hidden' }}>
      <div style={{ 
        padding: '8px', 
        backgroundColor: '#f3f4f6', 
        fontSize: '11px', 
        fontFamily: 'monospace',
        borderBottom: '1px solid #d1d5db'
      }}>
        🎭 IsScrolling Performance Test | Status: {isScrolling ? '🏃‍♂️ SCROLLING' : '🛑 IDLE'} | Phase: {animationPhase} | Click cards to scroll!
      </div>
      
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: 'calc(100% - 28px)' }}
        totalCount={totalPositions}
        context={{ isScrolling }}
        isScrolling={setIsScrolling}
        fixedItemHeight={itemHeight + gap}
        initialTopMostItemIndex={myPositionInList}
        itemContent={(index, _user, { isScrolling }) => {
          const user = generateUserAtIndex(index);
          if (!user) return null;

          const isCurrentUserItem = user.isCurrentUser;
          const isTopThree = user.rank <= 3;
          const isSkeleton = user.isSkeleton;
          
          return (
            <div
              onClick={() => handleCardClick(user.rank)}
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
                opacity: isSkeleton ? 0.6 : 1,
                cursor: 'pointer',
                transition: 'transform 0.1s ease'
              }}
              onMouseEnter={(e) => {
                if (!isSkeleton) e.currentTarget.style.transform = 'scale(1.02)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'scale(1)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ margin: '0 8px 0 0' }}>
                  {isScrolling ? <AvatarPlaceholder /> : <Avatar />}
                </div>
                <div>
                  <div style={{ fontWeight: 'bold', minWidth: '60px' }}>
                    #{formatRank(user.rank)}
                  </div>
                  <div style={{ fontSize: '12px', opacity: 0.8 }}>
                    {isSkeleton ? '...' : user.name}
                  </div>
                </div>
                {isCurrentUserItem && <span style={{ fontSize: '12px' }}>← YOU</span>}
              </div>
              <span style={{ fontWeight: 'bold' }}>
                {isSkeleton ? '...' : user.score.toLocaleString()}
              </span>
            </div>
          );
        }}
      />
    </div>
  );
};

// Custom easing functions for smooth scroll
function easeOutBounce(x: number): number {
  const n1 = 7.5625;
  const d1 = 2.75;

  if (x < 1 / d1) {
    return n1 * x * x;
  } else if (x < 2 / d1) {
    return n1 * (x -= 1.5 / d1) * x + 0.75;
  } else if (x < 2.5 / d1) {
    return n1 * (x -= 2.25 / d1) * x + 0.9375;
  } else {
    return n1 * (x -= 2.625 / d1) * x + 0.984375;
  }
}

function easeInOutCubic(x: number): number {
  return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
}

function easeOutElastic(x: number): number {
  const c4 = (2 * Math.PI) / 3;
  return x === 0
    ? 0
    : x === 1
    ? 1
    : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

// Boost Virtuoso Test - Whole card acts as boost button
interface BoostVirtuosoTestProps {
  currentUser: LeaderboardUser & { displayRank: number; displayScore: number };
  animationPhase: AnimationPhase;
  isAnimating: boolean;
  onBoost?: () => void;
}

const BoostVirtuosoTest: React.FC<BoostVirtuosoTestProps> = ({
  currentUser,
  animationPhase,
  isAnimating,
  onBoost
}) => {
  const virtuosoRef = useRef<VirtuosoHandle>(null);
  const [easingType, setEasingType] = useState<'bounce' | 'cubic' | 'elastic'>('bounce');
  const [isBoostActive, setIsBoostActive] = useState(false);
  const itemHeight = 48;
  const gap = 4;
  
  const myRank = currentUser.displayRank;
  const myScore = currentUser.displayScore;
  const totalPositions = myRank + (animationPhase !== 'idle' ? 10 : 0);
  const myPositionInList = myRank - 1;

  // Smart grouping for large distances - limit real positions, group the rest
  const generateUserAtIndex = (index: number) => {
    const rank = index + 1;
    const REAL_POSITION_LIMIT = 100;
    const GROUP_INTERVAL = 1500; // Group every 1.5K positions
    
    // Always show top 3 - highest priority
    if (rank <= 3) {
      return {
        id: `top-${rank}`,
        rank,
        name: ['🥇 Champion', '🥈 Runner-up', '🥉 Third Place'][rank - 1],
        score: 100000 - (rank - 1) * 500,
        avatar: '👑',
        isCurrentUser: false,
        isSkeleton: false,
        isGrouped: false
      };
    }
    
    // Always show last 10 before you - high priority
    if (rank >= myRank - 10 && rank < myRank) {
      return {
        id: `before-${rank}`,
        rank,
        name: `Player${rank}`,
        score: myScore + (myRank - rank) * 50,
        avatar: '🎮',
        isCurrentUser: false,
        isSkeleton: false,
        isGrouped: false
      };
    }
    
    // Always show your position - highest priority
    if (rank === myRank) {
      return {
        id: 'current-user',
        rank,
        name: currentUser.name || 'You',
        score: myScore,
        avatar: '🎯',
        isCurrentUser: true,
        isSkeleton: false,
        isGrouped: false
      };
    }
    
    // Show overtaken users during animation - high priority
    if (animationPhase !== 'idle' && rank > myRank && rank <= myRank + 10) {
      return {
        id: `overtaken-${rank}`,
        rank,
        name: `Overtaken${rank}`,
        score: myScore - (rank - myRank) * 30,
        avatar: '😔',
        isCurrentUser: false,
        isSkeleton: false,
        isGrouped: false
      };
    }
    
    // For large distances, use smart grouping
    // Show some real positions scattered throughout (up to limit)
    if (rank > 3 && rank < myRank - 10) {
      // Show real positions at key intervals: every 100, 500, 1000, etc.
      const shouldShowReal = 
        (rank <= 50) || // First 50 ranks
        (rank % 100 === 0) || // Every 100th rank
        (rank % 500 === 0) || // Every 500th rank
        (rank % 1000 === 0) || // Every 1000th rank
        (rank % GROUP_INTERVAL === 0); // Group boundaries
      
      if (shouldShowReal) {
        return {
          id: `real-${rank}`,
          rank,
          name: `Player${rank}`,
          score: 100000 - rank * 10,
          avatar: '🎮',
          isCurrentUser: false,
          isSkeleton: false,
          isGrouped: false
        };
      }
    }
    
    // For positions in large gaps, show grouped placeholders
    const groupStart = Math.floor((rank - 1) / GROUP_INTERVAL) * GROUP_INTERVAL + 1;
    const groupEnd = Math.min(groupStart + GROUP_INTERVAL - 1, myRank - 11);
    const isGroupBoundary = rank === groupStart;
    
    if (isGroupBoundary && groupStart < myRank - 10) {
      return {
        id: `group-${groupStart}`,
        rank,
        name: `📊 Ranks ${formatRank(groupStart)}-${formatRank(groupEnd)} (${formatRank(groupEnd - groupStart + 1)} players)`,
        score: 100000 - rank * 10,
        avatar: '📊',
        isCurrentUser: false,
        isSkeleton: true,
        isGrouped: true,
        groupStart,
        groupEnd,
        groupSize: groupEnd - groupStart + 1
      };
    }
    
    // Default skeleton for other positions
    return {
      id: `skeleton-${rank}`,
      rank,
      name: `Player${rank}`,
      score: 100000 - rank * 10,
      avatar: '👤',
      isCurrentUser: false,
      isSkeleton: true,
      isGrouped: false
    };
  };

  // Boost behavior - substantial scroll animation like raw virtuoso
  const triggerBoost = () => {
    if (!virtuosoRef.current || isAnimating) return;
    
    setIsBoostActive(true);
    
    // Target a top rank for the boost effect
    const targetRank = Math.floor(Math.random() * 10000) + 1; // Random rank 1-100000
    const targetIndex = targetRank - 1;
    
    console.log(`🚀 BOOST TRIGGERED! Climbing from rank ${myRank} to rank ${targetRank}`);
    console.log(`📏 Distance: ${myRank - targetRank} positions = ${myPositionInList - targetIndex} indices`);
    
    // Start from bottom (your position)
    virtuosoRef.current.scrollToIndex({
      index: myPositionInList,
      align: 'end',
      behavior: 'auto'
    });
    
    // Animate to target with slow-fast-slow easing
    setTimeout(() => {
      if (virtuosoRef.current) {
        const totalDistance = myPositionInList - targetIndex;
        const steps = Math.min(Math.max(Math.floor(totalDistance / 1000), 15), 60);
        
        let currentStep = 0;
        const animate = () => {
          if (currentStep >= steps || !virtuosoRef.current) return;
          
          const progress = currentStep / (steps - 1);
          let easedProgress: number;
          
          switch (easingType) {
            case 'bounce':
              easedProgress = easeOutBounce(progress);
              break;
            case 'cubic':
              easedProgress = easeInOutCubic(progress);
              break;
            case 'elastic':
              easedProgress = easeOutElastic(progress);
              break;
            default:
              easedProgress = progress;
          }
          
          const currentIndex = Math.round(myPositionInList - (totalDistance * easedProgress));
          
          virtuosoRef.current.scrollToIndex({
            index: Math.max(0, currentIndex),
            align: 'center',
            behavior: 'smooth'
          });
          
          currentStep++;
          
          // Slow-fast-slow timing
          let timing: number;
          if (progress < 0.15 || progress > 0.85) {
            timing = 250; // Slow at start/end
          } else if (progress < 0.35 || progress > 0.65) {
            timing = 100; // Medium speed
          } else {
            timing = 40; // Fast in middle
          }
          
          setTimeout(animate, timing);
        };
        
        animate();
        
        // Reset boost state after animation
        setTimeout(() => {
          setIsBoostActive(false);
          if (onBoost) {
            onBoost();
          }
        }, steps * 100);
      }
    }, 200);
  };
  
  return (
    <div 
      onClick={triggerBoost}
      style={{ 
        height: '400px', 
        border: isBoostActive ? '3px solid #10b981' : isAnimating ? '2px solid #f59e0b' : '2px solid #e5e7eb', 
        borderRadius: '12px', 
        overflow: 'hidden',
        cursor: isAnimating ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        backgroundColor: isBoostActive ? '#f0fdf4' : 'white'
      }}
    >
      {/* Header - same style as Raw Virtuoso Test */}
      <div style={{ 
        padding: '8px', 
        backgroundColor: isBoostActive ? '#10b981' : '#f3f4f6', 
        fontSize: '11px', 
        fontFamily: 'monospace',
        borderBottom: '1px solid #d1d5db',
        color: isBoostActive ? 'white' : 'black'
      }}>
        🚀 BOOST Leaderboard: {totalPositions} positions | 🎯 StartAt: #{myPositionInList + 1} (rank #{myRank}) | 📍 Phase: {animationPhase} | 
        {isBoostActive ? ' 🔥 BOOSTING!' : isAnimating ? ' ⏳ Wait...' : ' 👆 Click to BOOST!'} | 
        📊 Smart Grouping: 100 real + 1.5K groups | Easing: {easingType}
        <select 
          value={easingType} 
          onChange={(e) => {
            e.stopPropagation();
            setEasingType(e.target.value as any);
          }}
          style={{ 
            fontSize: '10px', 
            padding: '1px', 
            marginLeft: '8px',
            backgroundColor: isBoostActive ? 'white' : '#f9fafb',
            border: '1px solid #d1d5db',
            borderRadius: '3px'
          }}
        >
          <option value="bounce">Bounce</option>
          <option value="cubic">Cubic</option>
          <option value="elastic">Elastic</option>
        </select>
      </div>
      
      {/* Pure Virtuoso - same as Raw Virtuoso Test */}
      <Virtuoso
        ref={virtuosoRef}
        style={{ height: 'calc(100% - 28px)' }}
        totalCount={totalPositions}
        itemContent={(index) => {
          const user = generateUserAtIndex(index);
          if (!user) return null;

          const isCurrentUserItem = user.isCurrentUser;
          const isTopThree = user.rank <= 3;
          const isSkeleton = user.isSkeleton;
          const isGrouped = (user as any).isGrouped;
          
          return (
            <div
              style={{ 
                height: itemHeight, 
                marginBottom: gap,
                padding: '8px 16px',
                backgroundColor: isCurrentUserItem ? '#8b5cf6' : 
                               isTopThree ? '#fef3c7' : 
                               isGrouped ? '#e0f2fe' : 
                               isSkeleton ? '#f3f4f6' : '#f9fafb',
                color: isCurrentUserItem ? 'white' : 'black',
                border: isCurrentUserItem ? '2px solid #7c3aed' : 
                       isGrouped ? '1px solid #0ea5e9' : '1px solid #e5e7eb',
                borderRadius: '8px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                opacity: isSkeleton && !isGrouped ? 0.6 : 1,
                fontStyle: isGrouped ? 'italic' : 'normal'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontWeight: 'bold', minWidth: '60px' }}>
                  {isGrouped ? '📊' : `#${formatRank(user.rank)}`}
                </span>
                <span style={{ fontSize: isGrouped ? '11px' : '14px' }}>
                  {isSkeleton && !isGrouped ? '...' : user.name}
                </span>
                {isCurrentUserItem && <span style={{ fontSize: '12px' }}>← YOU</span>}
                {isGrouped && (
                  <span style={{ fontSize: '10px', color: '#0ea5e9', fontWeight: 'bold' }}>
                    GROUP
                  </span>
                )}
              </div>
              <span style={{ fontWeight: 'bold', fontSize: isGrouped ? '11px' : '14px' }}>
                {isSkeleton && !isGrouped ? '...' : 
                 isGrouped ? `~${formatRank((user as any).groupSize)} players` :
                 user.score.toLocaleString()}
              </span>
            </div>
          );
        }}
        fixedItemHeight={itemHeight + gap}
        initialTopMostItemIndex={myPositionInList}
        overscan={10}
        scrollSeekConfiguration={{
          enter: (velocity) => Math.abs(velocity) > 300,
          exit: (velocity) => Math.abs(velocity) < 50,
        }}
        components={{
          ScrollSeekPlaceholder: ({ index }) => {
            const rank = index + 1;
            const GROUP_INTERVAL = 1500;
            const groupStart = Math.floor((rank - 1) / GROUP_INTERVAL) * GROUP_INTERVAL + 1;
            const groupEnd = Math.min(groupStart + GROUP_INTERVAL - 1, myRank - 11);
            
            return (
              <div 
                style={{ 
                  height: itemHeight, 
                  marginBottom: gap,
                  backgroundColor: '#e0f2fe',
                  border: '1px dashed #0ea5e9',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0369a1',
                  fontSize: '11px',
                  fontStyle: 'italic'
                }}
              >
                📊 Fast Scrolling: Ranks {formatRank(groupStart)}-{formatRank(groupEnd)} (~{formatRank(GROUP_INTERVAL)} players)
              </div>
            );
          }
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
  const [clickedRank, setClickedRank] = useState<number | null>(null);

  const handleBoostScore = () => {
    if (!isAnimating) {
      increaseScore(scoreBoost);
    }
  };

  const { topLeaders, overtaken, nearbyTarget, userRank, userScore } = getVisibleUsers();

  const handleCardClick = (targetRank: number) => {
    setClickedRank(targetRank);
    console.log(`🎯 Card clicked! Target rank: ${targetRank}`);
  };

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
                {clickedRank && (
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Last Clicked:</span>
                    <span className="font-bold text-purple-600">#{formatRank(clickedRank)}</span>
                  </div>
                )}
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

          {/* Virtuoso Tests */}
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
              <h2 className="text-xl font-semibold mb-4">🎭 IsScrolling Performance Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                Shows performance optimization by replacing heavy components with placeholders during scrolling.
                Uses same leaderboard data as raw test. <strong>Click any card to scroll!</strong>
              </p>
              <IsScrollingVirtuosoTest 
                currentUser={{
                  ...state.currentUser,
                  displayRank: userRank,
                  displayScore: userScore
                }}
                animationPhase={animationPhase}
                onCardClick={handleCardClick}
              />
            </div>

            <div className="bg-white rounded-lg p-6 shadow-lg">
              <h2 className="text-xl font-semibold mb-4">🚀 BOOST Virtuoso Test</h2>
              <p className="text-sm text-gray-600 mb-4">
                <strong>Click the entire card to BOOST!</strong> Triggers massive movement from your rank (~64K) to a random top rank (1-10) 
                with slow-fast-slow easing. Same layout as Raw Virtuoso Test but the whole card acts as a boost button!
              </p>
              <BoostVirtuosoTest 
                currentUser={{
                  ...state.currentUser,
                  displayRank: userRank,
                  displayScore: userScore
                }}
                animationPhase={animationPhase}
                isAnimating={isAnimating}
                onBoost={() => console.log('🎉 Boost completed!')}
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
