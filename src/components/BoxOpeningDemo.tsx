import React, { useState } from 'react';
import { Button, Text, Title } from '@telegram-apps/telegram-ui';
import { useBalanceAnimation } from '../hooks/useBalanceAnimation';
import { useBoxOpening } from '../hooks/useBoxOpening';
import { purchaseBox, type PurchaseBoxResponse } from '../services/mockBoxService';

const BoxOpeningDemo: React.FC = () => {
  const { changeBalance } = useBalanceAnimation();
  const { openBoxModal } = useBoxOpening();
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const handlePurchaseBox = async () => {
    // Prevent multiple rapid clicks
    if (isPurchasing) {
      console.log('Purchase already in progress, ignoring click');
      return;
    }

    try {
      setIsPurchasing(true);
      const purchaseResult: PurchaseBoxResponse = await purchaseBox();
      console.log('Box purchased:', purchaseResult);
      
      // Deduct 150 from balance after successful purchase
      const buttonCoordinates = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      changeBalance(-150, buttonCoordinates);
      
      // Open the box modal in 'result' mode to show "you've got" screen
      openBoxModal(purchaseResult.box_id, 'result');
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleOpenBox = () => {
    openBoxModal(1, 'wheel');
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
          loading={isOpening}
          className="w-full bg-gradient-to-r from-pink-500 to-violet-500 hover:from-pink-600 hover:to-violet-600 transition-all duration-300 transform hover:scale-105"
          style={{
            borderRadius: 20,
            height: 60,
            fontSize: 18,
            fontWeight: 600,
            marginTop: 30,
          }}
        >
          {isOpening ? '💳 Opening...' : '💳 Open Mystery Box'}
        </Button>
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
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
