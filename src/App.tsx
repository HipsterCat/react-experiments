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
import { NavigationProvider, Page, useNavigation } from './StateRouter'
import { Tabbar } from './components/Tabbar/Tabbar'
import { TabbarItem } from './components/Tabbar/TabbarItem'

function App() {
  return (
    <AppRoot>
      <NiceToastProvider>
        <BalanceAnimationProvider>
          <BoxOpeningProvider>
            <NavigationProvider defaultPage="leaderboard">
              <MainContent />
              <SimpleTabbar />
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
  const { currentPage, navigate } = useNavigation();
  
  const pages = ['leaderboard', 'balance', 'toasts', 'rewards', 'events'];
  const currentIndex = pages.indexOf(currentPage);
  
  const goToPrevious = () => {
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : pages.length - 1;
    navigate(pages[prevIndex]);
  };
  
  const goToNext = () => {
    const nextIndex = currentIndex < pages.length - 1 ? currentIndex + 1 : 0;
    navigate(pages[nextIndex]);
  };

  return (
    <div className="pb-16"> {/* Add padding for tabbar */}
      {/* Navigation buttons */}
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <button 
          onClick={goToPrevious}
          className="px-3 py-1 bg-blue-500 text-white rounded shadow-lg text-sm"
        >
          ← Prev
        </button>
        <button 
          onClick={goToNext}
          className="px-3 py-1 bg-blue-500 text-white rounded shadow-lg text-sm"
        >
          Next →
        </button>
      </div>

      {/* Pages */}
      <Page name="leaderboard">
        <LeaderboardOvertakeDemo />
      </Page>
      
      <Page name="balance">
        <div className="p-4">
          <h2 className="text-xl font-bold mb-4">Balance Demo</h2>
          <BalanceAnimationLayer />
        </div>
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
  );
}

function SimpleTabbar() {
  const { currentPage, navigate } = useNavigation();

  const tabs = [
    { id: 'leaderboard', label: 'Leaderboard', icon: '🏆' },
    { id: 'balance', label: 'Balance', icon: '💰' },
    { id: 'toasts', label: 'Toasts', icon: '🍞' },
    { id: 'rewards', label: 'Rewards', icon: '🎁' },
    { id: 'events', label: 'Events', icon: '📅' },
  ];

  return (
    <Tabbar visible={true}>
      {tabs.map((tab) => (
        <TabbarItem
          key={tab.id}
          icon={<span className="text-xl">{tab.icon}</span>}
          active={currentPage === tab.id}
          onClick={() => navigate(tab.id)}
        >
          {tab.label}
        </TabbarItem>
      ))}
    </Tabbar>
  );
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
