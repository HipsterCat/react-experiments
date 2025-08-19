# React Experiments - Interactive UI Animation Library

A comprehensive React component showcase featuring advanced animations, dynamic UI elements, and interactive user interfaces. This collection includes balance animations, morphing toasts, prize wheels, event stacks, and various gamification elements built with modern animation libraries.

## ✨ Features & Components

### 🎯 Flying Coin Balance Animation System // particle alike, transforming
- **Animated balance counter** with smooth number transitions and rolling digits
- **Flying coin animations** with physics-based trajectories between UI elements  
- **Multi-currency support** (coins, USDT) with seamless switching
- **Real-time balance updates** with coordinated icon and text animations

### 🎁 Prize Wheel Carousel / Try Your Luck Sysm  
- **Spinning carousel** with customizable prizes and rewards
- **Physics-based deceleration** with realistic spin-to-stop mechanics
- **3D rotation effects** and perspective animations during idle/spinning states
- **Dynamic reward visualization** with scaling and opacity transitions
- **Try your luck mechanics** with randomized outcomes and anticipation

### 🔔 Morphing Toast Notifications
- **Dynamic Island-inspired** expandable toast notifications
- **Smooth morphing animations** from circular to expanded pill shapes
- **Flying item effects** that animate from source to destination
- **Inventory change notifications** with stacking and counter badges
- **Interactive toast elements** with hover and tap feedback

### 📚 Animated Event Stack Feed
- **Sequential item loading** with staggered reveal animations
- **Auto-rotating event queue** with smooth push/pop transitions  
- **Timestamp formatting** with relative time display
- **Configurable stack height** and item spacing
- **Real-time event streaming** with overflow management

### 🎮 Gamification & Rewards UI
- **Box opening animations** with reveal mechanics and particle effects
- **Confetti particle systems** for celebration moments
- **Leaderboard animations** with ranking overtakes and position changes
- **Reward type badges** with rarity indicators (common, rare, epic, legendary)
- **Inventory management UI** with item collections and storage

### 🎨 Advanced Animation Features
- **Framer Motion integration** for complex gesture-based interactions
- **Spring physics animations** with customizable stiffness and damping
- **Parallax scrolling effects** and depth-based motion
- **Gesture recognition** for swipe, drag, and tap interactions
- **Performance-optimized animations** with will-change and transform3d

## Getting Started

### Prerequisites

- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start the development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to `http://localhost:5173`

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## 🏗️ Component Architecture

### Core Animation Components
```
src/components/
├── BalanceAnimation.tsx          # Multi-currency balance with flying coins
├── InventoryChangeToast.tsx      # Morphing notification system  
├── PrizeCarousel.tsx            # Spinning wheel with physics
├── EventStack.tsx               # Animated activity feed
├── BoxOpeningModal.tsx          # Loot box reveal system
├── ConfettiParticles.tsx        # Celebration particle effects
├── LeaderboardOvertake.tsx      # Ranking animation system
└── RollingCounter.tsx           # Individual digit rolling animation
```

### Specialized UI Elements
```
src/components/
├── RewardTypeImage.tsx          # Dynamic reward visualization
├── RewardBoxRareBadge.tsx       # Rarity indicator system
├── AnimatedFullscreen.tsx       # Immersive fullscreen transitions
├── Toast.tsx                    # Base notification component
└── Tabbar/                      # Navigation with smooth transitions
    ├── Tabbar.tsx
    ├── TabbarItem.tsx
    └── TabbarProvider.tsx
```

### Hooks & State Management
```
src/hooks/
├── useBalanceAnimation.tsx      # Balance state and coin flying logic
├── useBoxOpening.tsx           # Loot box opening orchestration
├── useEventStack.ts            # Event queue management
├── useLeaderboardAnimation.ts  # Ranking change detection
└── useTabbarContext.ts         # Navigation state management
```

### Services & Data Layer
```
src/services/
├── mockBoxService.ts           # Simulated reward generation
└── mockEventService.ts         # Event feed simulation
```

## 🛠️ Technologies Used

### Core Framework & Build Tools
- **React 18** - Modern UI library with concurrent features
- **TypeScript** - Type safety and enhanced development experience
- **Vite** - Lightning-fast build tool and dev server
- **ES Toolkit** - Modern utility library for enhanced performance

### Animation & Motion Libraries  
- **Framer Motion** - Production-ready motion library for React
- **Number Flow** - Smooth numeric transitions and morphing digits
- **React Confetti** - Particle system for celebration effects
- **Embla Carousel** - Touch-friendly carousel with physics

### Styling & UI Framework
- **Tailwind CSS 4** - Utility-first CSS framework with modern features
- **Telegram UI** - Component library for Telegram-style interfaces  
- **PostCSS** - CSS processing and optimization

### Data & Utilities
- **i18next** - Internationalization framework
- **Clsx** - Conditional className utility
- **Falso** - Mock data generation for realistic testing
- **React Router DOM** - Client-side routing with animations

### Development & Quality
- **ESLint** - Code quality and consistency enforcement
- **PostHog** - Product analytics and user behavior tracking

## 🔍 Searchable Keywords & Use Cases

This component library is perfect for developers looking for:

**Animation & Motion Graphics:**
*smooth animations, framer motion examples, react animations, interactive UI, micro-interactions, gesture-based UI, physics animations, spring animations, morphing UI elements, transition effects*

**Gaming & Gamification:**
*loot box system, prize wheel, slot machine UI, reward system, achievement animations, leaderboard UI, gamification components, lottery wheel, spinning carousel, try your luck mechanics*

**Financial & E-commerce UI:**
*balance animation, wallet UI, currency display, payment animations, transaction feedback, coin flying effects, digital wallet, crypto UI, balance counter, numeric transitions*

**Notification Systems:**
*toast notifications, alert system, dynamic island, morphing notifications, iOS-style alerts, notification stack, activity feed, real-time updates, push notifications UI*

**Mobile & Touch Interfaces:**
*gesture recognition, swipe interactions, touch-friendly UI, mobile animations, responsive design, telegram UI, mobile-first design, finger-friendly controls*

**Performance & Modern React:**
*optimized animations, 60fps UI, will-change optimization, React 18 features, TypeScript components, modern React patterns, concurrent features, performance-first*

## 🎯 Perfect For Projects Requiring:

- **Gaming Applications** - Complete reward systems with physics-based interactions
- **Financial Apps** - Smooth balance updates and transaction visualizations  
- **Social Platforms** - Activity feeds and real-time notification systems
- **E-commerce Sites** - Interactive product reveals and purchase celebrations
- **Mobile Apps** - Touch-optimized interactions and responsive animations
- **Dashboard UIs** - Data visualization with smooth transitions and updates
- **Progressive Web Apps** - Native-like interactions and micro-animations
