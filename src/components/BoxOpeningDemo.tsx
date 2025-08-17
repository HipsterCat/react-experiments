import React, { useState } from 'react';
import { Button, Text, Title } from '@telegram-apps/telegram-ui';
import { useBalanceAnimation } from '../hooks/useBalanceAnimation';
import { useBoxOpening } from '../hooks/useBoxOpening';
import { useToast } from './NiceToastProvider';
import { purchaseBox, type PurchaseBoxResponse } from '../services/mockBoxService';

const BoxOpeningDemo: React.FC = () => {
  const { changeBalance } = useBalanceAnimation();
  const { openBoxModal, loadBoxContents, boxContents } = useBoxOpening();
  const { showToast } = useToast();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const handlePurchaseBox = async () => {
    // Prevent multiple rapid clicks
    if (isPurchasing) {
      showToast({
        message: 'Purchase already in progress!',
        type: 'warning',
        position: 'top',
        duration: 2000
      });
      return;
    }

    try {
      setIsPurchasing(true);
      
      // Show purchasing toast
      showToast({
        message: 'Purchasing mystery box...',
        type: 'info',
        position: 'top',
        duration: 2000
      });
      
      const purchaseResult: PurchaseBoxResponse = await purchaseBox();
      console.log('Box purchased:', purchaseResult);
      
      // Show success toast
      showToast({
        message: 'Mystery box purchased successfully! 🎁',
        type: 'success',
        position: 'top',
        duration: 3000
      });
      
      // Deduct 150 from balance after successful purchase
      const buttonCoordinates = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      changeBalance(-150, buttonCoordinates, 'coins');
      
      // Open the box modal in 'result' mode to show "you've got" screen
      openBoxModal(purchaseResult.box_id, 'result');
    } catch (error) {
      console.error('Purchase failed:', error);
      showToast({
        message: 'Failed to purchase box. Please try again.',
        type: 'error',
        position: 'top',
        duration: 4000
      });
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleOpenBox = async () => {
    // Prevent multiple rapid clicks
    if (isOpening || boxContents.isLoading) {
      showToast({
        message: 'Box opening already in progress!',
        type: 'warning',
        position: 'bottom',
        duration: 2000
      });
      return;
    }

    try {
      setIsOpening(true);
      
      // Show loading toast
      showToast({
        message: 'Loading mystery box contents...',
        type: 'info',
        position: 'bottom',
        duration: 2000
      });
      
      const boxId = 1; // Demo box ID
      
      // Load box contents first for wheel mode
      await loadBoxContents(boxId);
      
      // Show ready toast
      showToast({
        message: 'Box loaded! Get ready to spin! 🎯',
        type: 'success',
        position: 'bottom',
        duration: 2500
      });
      
      // Then open the modal in wheel mode
      openBoxModal(boxId, 'wheel');
    } catch (error) {
      console.error('Failed to open box:', error);
      showToast({
        message: 'Failed to load box contents. Please try again.',
        type: 'error',
        position: 'bottom',
        duration: 4000
      });
    } finally {
      setIsOpening(false);
    }
  };

  return (
    <>
      {/* Main Demo UI */}
    <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
      <div className="text-center space-y-6 max-w-md">
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
          <div className="grid grid-cols-2 gap-2">
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Success from top! 🎉',
                type: 'success',
                position: 'top',
                duration: 3000
              })}
              className="text-xs"
            >
              Success Top
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Error from bottom! ❌',
                type: 'error',
                position: 'bottom',
                duration: 3000
              })}
              className="text-xs"
            >
              Error Bottom
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Warning message! ⚠️',
                type: 'warning',
                position: 'top',
                duration: 4000
              })}
              className="text-xs"
            >
              Warning
            </Button>
            <Button
              size="s"
              mode="outline"
              onClick={() => showToast({
                message: 'Custom toast with coin icon',
                type: 'custom',
                position: 'bottom',
                duration: 5000,
                icon: '/src/assets/icon_coin.webp',
                backgroundColor: '#8b5cf6',
                textColor: '#ffffff',
                borderColor: '#7c3aed'
              })}
              className="text-xs"
            >
              Custom
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

      {/* BoxOpeningModal is rendered once globally in App.tsx */}
    </>
  );
};

export default BoxOpeningDemo;
