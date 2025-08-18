export interface LeaderboardUser {
  id: string;
  name: string;
  avatar?: string;
  score: number;
  rank: number;
  isCurrentUser?: boolean;
  isSkeleton?: boolean; // For placeholder users during animation
}

export type AnimationPhase = 
  | 'idle'         // Shows only top 3
  | 'expanding'    // List expanding, showing overtaken users
  | 'scrolling'    // Fast scrolling through ranks
  | 'settling'     // Slowing down near target
  | 'collapsing';  // Returning to idle state

export interface LeaderboardState {
  topLeaders: LeaderboardUser[]; // Top 3-100 leaders
  nearbyUsers: LeaderboardUser[]; // Users around current user's position
  currentUser: LeaderboardUser;
  totalUsers: number;
  isAnimating: boolean;
  animationPhase: AnimationPhase;
}

export interface AnimationFrame {
  rank: number;
  user?: LeaderboardUser; // Could be real user or skeleton
  duration: number; // milliseconds
  type: 'real' | 'skeleton' | 'current';
}

export interface LeaderboardUpdate {
  newRank: number;
  oldRank: number;
  overtakenCount: number;
  newScore: number;
  topLeaders: LeaderboardUser[];
  nearbyUsers: LeaderboardUser[]; // 30 positions around new rank
}

export interface LeaderboardAnimationConfig {
  defaultVisibleItems: number; // 4 by default
  expandedVisibleItems: number; // 6-7 during animation
  itemHeight: number;
  gapBetweenItems: number;
  animationSpeed: number; // ms per position
  motionBlurIntensity: number; // 0-1
}
