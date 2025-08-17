import React, { useState } from 'react';
import { Button, Text, Title } from '@telegram-apps/telegram-ui';
import { useBoxOpening } from '../hooks/useBoxOpening';
import { useBalanceAnimation } from '../hooks/useBalanceAnimation';
import { purchaseBox, type PurchaseBoxResponse } from '../services/mockBoxService';
import { LootBoxFullScreen } from './LootBoxFullScreen';
import { ClosableModal } from './ClosableModal';
import boxOpenBg from '../assets/boxes/boxOpenBg_2.jpg';

const BoxOpeningDemo: React.FC = () => {
  const { openBoxModal } = useBoxOpening();
  const { changeBalance } = useBalanceAnimation();
  const [purchasedBoxId, setPurchasedBoxId] = useState<number | null>(null);
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [showLootBox, setShowLootBox] = useState(false);

  const handlePurchaseBox = async () => {
    try {
      setIsPurchasing(true);
      const purchaseResult: PurchaseBoxResponse = await purchaseBox();
      console.log('Box purchased:', purchaseResult);
      
      // Deduct 150 from balance after successful purchase
      const buttonCoordinates = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
      changeBalance(-150, buttonCoordinates);
      
      setPurchasedBoxId(purchaseResult.box_id);
      setShowLootBox(true);
    } catch (error) {
      console.error('Purchase failed:', error);
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleCloseLootBox = () => {
    setPurchasedBoxId(null);
    setShowLootBox(false);
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
        
        <div className="mt-8 p-4 bg-gray-100 rounded-lg">
          <Text className="text-gray-600 text-sm">
            This is a demo of the complete box experience: purchase → acquisition screen → opening animation with randomized rewards!
          </Text>
        </div>
      </div>
    </div>

      {/* Loot Box Modal */}
      <ClosableModal
        disableTabbarToggle={showLootBox}
        style={{
          backgroundImage: `linear-gradient(rgba(126, 255, 243, 0.5), rgba(103, 162, 255, 0.5)), url(${boxOpenBg})`,
          backgroundPosition: "50%",
          backgroundSize: "cover",
          backgroundRepeat: "no-repeat",
          maxHeight: "100dvh",
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          zIndex: 11_000,
        }}
        closeStyle={{
          color: "#000",
        }}
        isOpen={showLootBox}
        onOpenChange={setShowLootBox}
      >
        {purchasedBoxId && (
          <LootBoxFullScreen
            boxId={purchasedBoxId}
            onClose={handleCloseLootBox}
          />
        )}
      </ClosableModal>
    </>
  );
};

export default BoxOpeningDemo;
