import BoxOpeningModal from './components/BoxOpeningModal'
import BalanceAnimation from './components/BalanceAnimation'
import BoxOpeningDemo from './components/BoxOpeningDemo'
import LeaderboardOvertakeDemo from './components/LeaderboardOvertakeDemo'
import InventoryChangeToastDemo from './components/InventoryChangeToastDemo'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { BoxOpeningProvider } from './hooks/useBoxOpening'
import { BalanceAnimationProvider, useBalanceAnimation } from './hooks/useBalanceAnimation'
import { NiceToastProvider } from './components/NiceToastProvider'
import EventStackDemo from './components/EventStackDemo'
import { TabbarProvider } from './components/Tabbar/TabbarProvider'
import { NavigationProvider, Page, NavButton, useNavigation } from './StateRouter'

function App() {
  return (
    <AppRoot>
      <NiceToastProvider>
        <BalanceAnimationProvider>
          <BoxOpeningProvider>
            <NavigationProvider defaultPage="leaderboard">
              <TabbarProvider>
                <MainContent />
              </TabbarProvider>
            </NavigationProvider>
            
            <BoxOpeningModal />
            
            {/* Balance Animation - positioned above all modals */}
            <BalanceAnimationLayer />
          </BoxOpeningProvider>
        </BalanceAnimationProvider>
      </NiceToastProvider>
    </AppRoot>
  )
}

function MainContent() {
  return (
    <div>
      {/* Simple Navigation */}
      <nav className="p-4 bg-gray-100 flex gap-2 flex-wrap">
        <NavButton to="leaderboard" className="px-3 py-1 bg-blue-500 text-white rounded">
          Leaderboard
        </NavButton>
        <NavButton to="balance" className="px-3 py-1 bg-green-500 text-white rounded">
          Balance
        </NavButton>
        <NavButton to="toasts" className="px-3 py-1 bg-purple-500 text-white rounded">
          Toasts
        </NavButton>
        <NavButton to="rewards" className="px-3 py-1 bg-orange-500 text-white rounded">
          Rewards
        </NavButton>
        <NavButton to="events" className="px-3 py-1 bg-red-500 text-white rounded">
          Events
        </NavButton>
      </nav>

      {/* Pages */}
      <Page name="leaderboard">
        <LeaderboardOvertakeDemo />
      </Page>
      
      <Page name="balance">
        <BalanceAnimationLayer />
      </Page>
      
      <Page name="toasts">
        <InventoryChangeToastDemo />
      </Page>
      
      <Page name="rewards">
        <BoxOpeningDemo />
      </Page>
      
      <Page name="events">
        <EventStackDemo />
      </Page>
    </div>
  )
}

// Separate component to use the balance context
function BalanceAnimationLayer() {
  const { balanceRef } = useBalanceAnimation();
  
  return (
    <div className="fixed top-4 left-4 z-[99999] pointer-events-none">
      <BalanceAnimation
        ref={balanceRef}
        initialCoinsBalance={2255}
        initialUsdtBalance={0}
        alwaysVisible={false}
        animationSpeed={1}
      />
    </div>
  );
}

export default App
