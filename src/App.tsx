import BoxOpeningDemo from './components/BoxOpeningDemo'
import BoxOpeningModal from './components/BoxOpeningModal'
import BalanceAnimation from './components/BalanceAnimation'
import { AppRoot } from '@telegram-apps/telegram-ui'
import { BoxOpeningProvider } from './hooks/useBoxOpening'
import { BalanceAnimationProvider, useBalanceAnimation } from './hooks/useBalanceAnimation'

function App() {
  return (
    <AppRoot>
      <BalanceAnimationProvider>
        <BoxOpeningProvider>
          <BoxOpeningDemo />
          <BoxOpeningModal />
          
          {/* Balance Animation - positioned above all modals */}
          <BalanceAnimationLayer />
        </BoxOpeningProvider>
      </BalanceAnimationProvider>
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
        initialBalance={1000}
        alwaysVisible={false}
        animationSpeed={1}
      />
    </div>
  );
}

export default App
