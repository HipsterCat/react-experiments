import React, { useState, useRef } from 'react';
import { Button, Text, Title } from '@telegram-apps/telegram-ui';
import { useBalanceAnimation } from '../hooks/useBalanceAnimation';
import { useBoxOpening } from '../hooks/useBoxOpening';
import { useToast } from './NiceToastProvider';
import { toastHelpers } from '../utils/toast';
import { purchaseBox, type PurchaseBoxResponse } from '../services/mockBoxService';
import DemoToast, { DemoToastRef, DynamicIslandSize } from '../components/DemoToast';
import { ToastType } from '../types/toast';

const BoxOpeningDemo: React.FC = () => {
  const { changeBalance } = useBalanceAnimation();
  const { openBoxModal, loadBoxContents, boxContents } = useBoxOpening();
  const { showToast, clearAllToasts } = useToast();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  
  // Demo toast refs
  const demoToastTopRef = useRef<DemoToastRef>(null);
  const demoToastBottomRef = useRef<DemoToastRef>(null);
  const handlePurchaseBox = async () => {
    // Prevent multiple rapid clicks
    if (isPurchasing) {
      // showToast({
      //   message: 'Purchase already in progress!',
      //   type: 'warning',
      //   position: 'top',
      //   duration: 2000
      // });
      return;
    }

    try {
      setIsPurchasing(true);
      
      // // Show purchasing toast
      // showToast({
      //   message: 'Purchasing mystery box...',
      //   type: 'info',
      //   position: 'top',
      //   duration: 2000
      // });
      
      const purchaseResult: PurchaseBoxResponse = await purchaseBox();
      console.log('Box purchased:', purchaseResult);
      
      // // Show success toast
      // showToast({
      //   message: 'Mystery box purchased successfully! 🎁',
      //   type: 'success',
      //   position: 'top',
      //   duration: 3000
      // });
      
      // Deduct 150 from balance after successful purchase
      const buttonCoordinates = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      console.log('changeBalance -150, buttonCoordinates', buttonCoordinates);
      changeBalance(-150, buttonCoordinates, 'coins');
      
      // Open the box modal in 'result' mode to show "you've got" screen
      openBoxModal(purchaseResult.box_id, 'result');
    } catch (error) {
      console.error('Purchase failed:', error);
      // showToast({
      //   message: 'Failed to purchase box. Please try again.',
      //   type: 'error',
      //   position: 'top',
      //   duration: 4000
      // });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleOpenBox = async () => {
    // Prevent multiple rapid clicks
    if (isOpening || boxContents.isLoading) {
      // showToast({
      //   message: 'Box opening already in progress!',
      //   type: 'warning',
      //   position: 'bottom',
      //   duration: 2000
      // });
      return;
    }

    try {
      setIsOpening(true);
      
      // Show loading toast
      // showToast({
      //   message: 'Loading mystery box contents...',
      //   type: 'info',
      //   position: 'bottom',
      //   duration: 2000
      // });
      
      const boxId = 1; // Demo box ID
      
      // Load box contents first for wheel mode
      await loadBoxContents(boxId);
      
      // Show ready toast
      // showToast({
      //   message: 'Box loaded! Get ready to spin! 🎯',
      //   type: 'success',
      //   position: 'bottom',
      //   duration: 2500
      // });
      
      // Then open the modal in wheel mode
      openBoxModal(boxId, 'wheel');
    } catch (error) {
      console.error('Failed to open box:', error);
      // showToast({
      //   message: 'Failed to load box contents. Please try again.',
      //   type: 'error',
      //   position: 'bottom',
      //   duration: 4000
      // });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <>
      {/* Main Demo UI */}
    <div className="min-h-screen bg-white p-4 overflow-y-auto">
      <div className="max-w-md mx-auto text-center space-y-6 py-8">
        <Title className="text-black text-4xl font-bold mb-10" style={{ marginBottom: 10 }}>
          🎁 Box Opening Demo
        </Title>
        
        <Text className="text-gray-700 text-lg mb-8" style={{ marginBottom: 30 }}>
          Click the button below to purchase a mystery box and see what reward you get!
        </Text>
        
        <Button
          size="l"
          mode="filled"
          onClick={handlePurchaseBox}
          loading={isPurchasing}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
          style={{
            borderRadius: 20,
            height: 60,
            fontSize: 18,
            fontWeight: 600,
            marginTop: 30,
          }}
        >
          {isPurchasing ? '💳 Purchasing...' : '💳 Purchase Mystery Box'}
        </Button>

        <Button
          size="l"
          mode="filled"
          onClick={handleOpenBox}
          loading={isOpening || boxContents.isLoading}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
          style={{
            borderRadius: 20,
            height: 60,
            fontSize: 18,
            fontWeight: 600,
            marginTop: 30,
          }}
        >
          {(isOpening || boxContents.isLoading) ? '🎯 Loading Box...' : '🎯 Open Mystery Box (Wheel)'}
        </Button>

        {/* Toast Demo Section */}
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-800 text-sm font-semibold mb-3">
            🍞 Toast Notifications Demo:
          </Text>
          
          {/* Basic Toasts */}
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Success! Task completed',
                type: 'success',
                position: 'top',
              })}
              className="text-xs"
            >
              Success
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Error occurred!',
                type: 'error',
                position: 'bottom',
              })}
              className="text-xs"
            >
              Error
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Loading data...',
                type: 'loading',
                position: 'top',
                duration: 0, // Manual dismiss
              })}
              className="text-xs"
            >
              Loading
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Info: Swipe to dismiss!',
                type: 'info',
                position: 'bottom',
              })}
              className="text-xs"
            >
              Info
            </Button>
          </div>
          
          {/* Rich Toasts */}
          <Text className="text-gray-800 text-sm font-semibold mt-4 mb-2">
            Rich Animated Toasts:
          </Text>
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="s"
              mode="outline"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showToast(toastHelpers.inventory(
                  '/src/assets/boxes/rewards/mystery_box.webp',
                  'Mystery Box',
                  3,
                  'add',
                  { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
                ));
              }}
              className="text-xs"
            >
              + Inventory
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                showToast(toastHelpers.reward(
                  '/src/assets/icon_coin.webp',
                  'Coins',
                  '500',
                  { x: rect.x + rect.width / 2, y: rect.y + rect.height / 2 }
                ));
              }}
              className="text-xs"
            >
              + Reward
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => {
                showToast(toastHelpers.achievement(
                  'First Purchase!',
                  'You bought your first mystery box',
                  '/src/assets/boxes/star.webp'
                ));
              }}
              className="text-xs"
            >
              Achievement
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => {
                // Stack multiple toasts
                showToast({ message: 'First in stack', type: 'info', position: 'bottom' });
                setTimeout(() => {
                  showToast({ message: 'Second (on top)', type: 'success', position: 'bottom' });
                  setTimeout(() => {
                    showToast({ message: 'Third (newest)', type: 'warning', position: 'bottom' });
                  }, 300);
                }, 300);
              }}
              className="text-xs"
            >
              Stack Test
            </Button>
          </div>

          {/* Test Features */}
          <Text className="text-gray-800 text-sm font-semibold mt-4 mb-2">
            Test Features:
          </Text>
          <div className="flex gap-2">
            <Button
              size="s"
              mode="outline"
              onClick={() => {
                // Test duplicate detection
                showToast({
                  message: 'Duplicate test toast',
                  type: 'warning',
                  position: 'top',
                  variantId: 'test-duplicate'
                });
              }}
              className="text-xs flex-1"
            >
              Duplicate
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => {
                showToast({
                  message: 'Click me!',
                  type: 'info',
                  position: 'top',
                  onClick: () => alert('Toast clicked!'),
                  dismissible: false, // Can't swipe
                });
              }}
              className="text-xs flex-1"
            >
              Clickable
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => {
                // Clear all toasts
                clearAllToasts();
              }}
              className="text-xs flex-1"
            >
              Clear All
            </Button>
          </div>
        </div>
        
        {/* Demo Toast Section */}
        <div className="mt-8 p-4 bg-gray-900 rounded-lg">
          <Text className="text-white text-sm font-semibold mb-3">
            🚀 Dynamic Island Toast (Single Container):
          </Text>
          
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              size="s"
              mode="outline"
              onClick={() => demoToastTopRef.current?.showToast({
                message: 'Compact Toast',
                type: 'success',
                duration: 4000,
                size: 'compact',
              })}
              className="text-xs"
            >
              Show Compact
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => demoToastBottomRef.current?.showToast({
                message: 'This is a much longer toast message',
                type: 'info',
                duration: 5000,
                size: 'long',
              })}
              className="text-xs"
            >
              Show Long
            </Button>
          </div>

          <Text className="text-white text-sm font-semibold mb-2">
            Test Dynamic Sizing & Morphing:
          </Text>
          <div className="grid grid-cols-1 gap-2 mb-4">
            <Button
              size="s"
              mode="outline"
              onClick={() => {
                const sequence: { message: string, type: ToastType, size: DynamicIslandSize }[] = [
                  { message: 'Connecting...', type: 'loading', size: 'compact' },
                  { message: 'Authentication successful!', type: 'success', size: 'long' },
                  { message: 'Welcome back, Sasha!', type: 'info', size: 'long' },
                  { message: '', type: 'info', size: 'collapsed' },
                ];
                
                let delay = 0;
                sequence.forEach((item, index) => {
                  setTimeout(() => {
                    demoToastTopRef.current?.showToast({ ...item, duration: 3000 });
                  }, delay);
                  delay += index === sequence.length - 2 ? 3000 : 2000;
                });
              }}
              className="text-xs"
            >
              Run Full Sequence
            </Button>
          </div>

          <div className="flex gap-2">
            <Button
              size="s"
              mode="outline"
              onClick={() => {
                demoToastTopRef.current?.hideToast();
                demoToastBottomRef.current?.hideToast();
              }}
              className="text-xs flex-1"
            >
              Hide All
            </Button>
          </div>
        </div>
        
        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-600 text-sm">
            This is a demo of the complete box experience: purchase → acquisition screen → opening animation with randomized rewards!
          </Text>
        </div>
      </div>
    </div>

      {/* Demo Toast Components */}
      <DemoToast ref={demoToastTopRef} position="top" />
      <DemoToast ref={demoToastBottomRef} position="bottom" />

      {/* BoxOpeningModal is rendered once globally in App.tsx */}
    </>
  );
};

export default BoxOpeningDemo;
