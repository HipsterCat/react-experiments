import React, { useEffect, useRef } from 'react';
import { LeaderboardUser, AnimationPhase } from '../types/leaderboard';
import { formatRank } from '../utils/formatRank';
import clsx from 'clsx';
import { Virtuoso, VirtuosoHandle } from 'react-virtuoso';

interface LeaderboardOvertakeProps {
  topLeaders: LeaderboardUser[];
  overtakenUsers: LeaderboardUser[];
  nearbyUsers?: LeaderboardUser[]; // keep around target rank during animation
  currentUser: LeaderboardUser & { displayRank: number; displayScore: number };
  animationPhase: AnimationPhase;
  className?: string;
}

const LeaderboardOvertake: React.FC<LeaderboardOvertakeProps> = ({
  topLeaders,
  overtakenUsers,
  nearbyUsers,
  currentUser,
  animationPhase,
  className
}) => {
  const itemHeight = 48;
  const gap = 4;
  const containerHeight = (itemHeight + gap) * 4;
  const virtuosoRef = useRef<VirtuosoHandle>(null);

  // Calculate visible area height (now full container since top 3 are in the list)
  const visibleHeight = containerHeight - (itemHeight + gap); // Reserve space for fixed current user

            // Combine all users into one list for Virtuoso
            const allUsers = [
              ...topLeaders,
              ...overtakenUsers,
              ...(nearbyUsers || [])
            ];
            
   // Control Virtuoso scroll during animation
   useEffect(() => {
     console.log('🎯 Animation effect triggered:', { 
       animationPhase, 
       overtakenUsersLength: overtakenUsers.length,
       visibleHeight,
       hasVirtuosoRef: !!virtuosoRef.current 
     });
     
     if (animationPhase !== 'scrolling' || !virtuosoRef.current || visibleHeight <= 0) return;
     
     // Calculate target: scroll through most of the overtaken users
     const targetIndex = topLeaders.length + Math.floor(overtakenUsers.length * 0.9);
     

  
     console.log('🚀 Starting smooth scroll animation:', { 
       fromIndex: 0, 
       toIndex: targetIndex, 
       totalUsers: allUsers.length 
     });
     
     // Use Virtuoso's built-in smooth scrolling
     virtuosoRef.current.scrollToIndex({
       index: targetIndex,
       align: 'start',
       behavior: 'smooth'
     });
     
   }, [animationPhase, overtakenUsers.length, visibleHeight, topLeaders.length, allUsers.length]);

   // Reset scroll position when animation ends
   useEffect(() => {
     console.log('🔄 Reset scroll effect:', { animationPhase, hasVirtuosoRef: !!virtuosoRef.current });
     
     if (animationPhase === 'idle' && virtuosoRef.current) {
       console.log('🏠 Resetting scroll to top (index 0)');
       virtuosoRef.current.scrollToIndex({
         index: 0,
         align: 'start',
         behavior: 'smooth'
       });
     }
   }, [animationPhase]);

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
    if (!user) return null;
    
    const isCurrentUser = user.isCurrentUser;
    const isSkeleton = user.isSkeleton;
    const isTopThree = user.rank <= 3;
    const displayRank = user.displayRank ?? user.rank;
    const displayScore = user.displayScore ?? user.score;

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





   console.log('📋 All users for Virtuoso:', {
     totalCount: allUsers.length,
     topLeadersCount: topLeaders.length,
     overtakenUsersCount: overtakenUsers.length,
     nearbyUsersCount: nearbyUsers?.length || 0,
     animationPhase
   });

   return (
     <div 
       className={clsx("relative overflow-hidden rounded-xl bg-gray-100", className)}
       style={{ height: containerHeight }}
     >
       {/* Virtualized scroll container with all users */}
       {visibleHeight > 0 && (
         <div
           style={{
             position: 'absolute',
             top: 0,
             left: 0,
             right: 0,
             height: visibleHeight,
           }}
         >
           <Virtuoso
             ref={virtuosoRef}
             style={{ 
               height: '100%',
               width: '100%'
             }}
             totalCount={allUsers.length}
             itemContent={(index) => {
               const user = allUsers[index];
               
               // Only log every 10th item to reduce console spam
               if (index % 10 === 0) {
                 console.log(`🔍 Rendering item ${index}:`, { 
                   userId: user?.id, 
                   userName: user?.name, 
                   rank: user?.rank,
                   isCurrentUser: user?.isCurrentUser 
                 });
               }
               
               return user ? (
                 <div style={{ 
                   height: itemHeight, 
                   marginBottom: gap,
                   willChange: 'transform' // Optimize for animations
                 }}>
                   <UserCell user={user} />
                 </div>
               ) : null;
             }}
             fixedItemHeight={itemHeight + gap}
             initialTopMostItemIndex={0}
             overscan={5}
             scrollSeekConfiguration={{
               enter: (velocity) => Math.abs(velocity) > 200,
               exit: (velocity) => Math.abs(velocity) < 30,
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
                     color: '#9ca3af'
                   }}
                 >
                   Loading #{index + 1}...
                 </div>
               )
             }}
           />
         </div>
       )}

       {/* Fixed current user at bottom */}
       <UserCell user={currentUser} isFixed={true} />
     </div>
   );
};

export default LeaderboardOvertake;