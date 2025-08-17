import BoxOpeningModal from './components/BoxOpeningModal'
import BalanceAnimation from './components/BalanceAnimation'
import EventStackDemo from './components/EventStackDemo'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { BoxOpeningProvider } from './hooks/useBoxOpening'
import { BalanceAnimationProvider, useBalanceAnimation } from './hooks/useBalanceAnimation'
import { NiceToastProvider } from './components/NiceToastProvider'

function App() {
  return (
    <AppRoot>
      <NiceToastProvider>
        <BalanceAnimationProvider>
          <BoxOpeningProvider>
            <EventStackDemo />
            <BoxOpeningModal />
            
            {/* Balance Animation - positioned above all modals */}
            <BalanceAnimationLayer />
          </BoxOpeningProvider>
        </BalanceAnimationProvider>
      </NiceToastProvider>
    </AppRoot>
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
