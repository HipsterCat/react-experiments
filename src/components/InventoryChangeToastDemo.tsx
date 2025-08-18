import React, { useRef, useState } from 'react';
import InventoryChangeToast, { InventoryChangeToastRef } from './InventoryChangeToast';
import { motion } from 'framer-motion';

// Sample inventory items
const SAMPLE_ITEMS = [
  { id: '1', icon: '/src/assets/boxes/rewards/box_regular.webp', name: 'Regular Box' },
  { id: '2', icon: '/src/assets/boxes/rewards/box_rare.webp', name: 'Rare Box' },
  { id: '3', icon: '/src/assets/boxes/rewards/box_epic.webp', name: 'Epic Box' },
  { id: '4', icon: '/src/assets/boxes/rewards/box_legend.webp', name: 'Legendary Box' },
  { id: '5', icon: '/src/assets/boxes/rewards/mystery_box.webp', name: 'Mystery Box' },
  { id: '6', icon: '/src/assets/boxes/rewards/reward_coins_100.webp', name: '100 Coins' },
  { id: '7', icon: '/src/assets/boxes/rewards/reward_coins_300.webp', name: '300 Coins' },
  { id: '8', icon: '/src/assets/boxes/rewards/reward_coins_1000.webp', name: '1000 Coins' },
  { id: '9', icon: '/src/assets/boxes/rewards/reward_usdt_1.webp', name: '1 USDT' },
  { id: '10', icon: '/src/assets/boxes/rewards/reward_usdt_20.webp', name: '20 USDT' },
];

const InventoryChangeToastDemo: React.FC = () => {
  const toastRef = useRef<InventoryChangeToastRef>(null);
  const [clickedItem, setClickedItem] = useState<string | null>(null);
  
  const handleItemClick = (e: React.MouseEvent<HTMLDivElement>, itemId: string) => {
    const container = e.currentTarget;
    const rect = container.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    // Get actual content size (container has p-3 = 12px padding)
    const paddingSize = 12 * 2; // p-3 on all sides
    const contentSize = rect.width - paddingSize;
    
    console.log('Clicked item:', itemId, {
      rect,
      centerX,
      centerY,
      containerSize: rect.width,
      contentSize
    });
    
    // Get random items for inventory preview
    const mainItem = SAMPLE_ITEMS.find(item => item.id === itemId)!;
    const otherItems = SAMPLE_ITEMS
      .filter(item => item.id !== itemId)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 8) + 3); // 3-10 items
    
    toastRef.current?.show({
      mainItem,
      otherItems,
      totalCount: otherItems.length + 1,
      fromCoordinates: { x: centerX, y: centerY },
      fromSize: { width: contentSize, height: contentSize },
      onClick: () => {
        console.log('Toast clicked! Opening inventory...');
        alert('Opening inventory view...');
      }
    });
    
    // Animate the clicked item
    setClickedItem(itemId);
    setTimeout(() => setClickedItem(null), 600);
  };
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-pink-100 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Inventory Change Toast Demo</h1>
        <p className="text-gray-600 mb-8">
          Click on any item below to see the inventory save animation. The item will fly to the toast,
          which then expands to show other inventory items before displaying a success message.
        </p>
        
        {/* Inventory Grid */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Your Inventory</h2>
          <div className="grid grid-cols-5 gap-4">
            {SAMPLE_ITEMS.map((item) => (
              <motion.div
                key={item.id}
                className="relative aspect-square bg-gradient-to-br from-purple-500/10 to-pink-500/10 rounded-xl p-3 cursor-pointer hover:shadow-lg transition-all border-2 border-transparent hover:border-purple-300"
                onClick={(e) => handleItemClick(e, item.id)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                animate={{
                  scale: clickedItem === item.id ? 0.8 : 1,
                  opacity: clickedItem === item.id ? 0.5 : 1,
                }}
                transition={{ duration: 0.3 }}
                onAnimationStart={() => {
                  const el = document.querySelector(`[data-item-id="${item.id}"]`);
                  if (el) {
                    const imgEl = el.querySelector('img');
                    console.log(`Item ${item.id} image size:`, imgEl?.getBoundingClientRect());
                  }
                }}
                data-item-id={item.id}
              >
                <img 
                  src={item.icon} 
                  alt={item.name}
                  className="w-full h-full object-contain"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent rounded-b-xl p-2">
                  <p className="text-white text-xs font-medium text-center truncate">
                    {item.name}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
        
        {/* Instructions */}
        <div className="mt-8 bg-white/60 backdrop-blur-sm rounded-xl p-4">
          <h3 className="font-semibold text-gray-700 mb-2">Animation Sequence:</h3>
          <ol className="list-decimal list-inside text-sm text-gray-600 space-y-1">
            <li>Toast appears as a white circle with subtle shadow</li>
            <li>Clicked item flies and rotates to the toast</li>
            <li>Icon smoothly fades in as the flying item arrives</li>
            <li>All box items appear and collapse from right to left, keeping only 3</li>
            <li>Success label slides in from left with scale animation (1.3 → 1.0)</li>
            <li>Counter badge appears in bottom corner of the stack</li>
            <li>Toast is clickable with chevron indicator on the right</li>
            <li>After 4 seconds, everything collapses back to circle and fades out</li>
          </ol>
          <div className="mt-2 text-xs text-gray-500">
            <p>• Only box items are shown in the inventory preview</p>
            <p>• Click the toast to simulate opening the full inventory</p>
          </div>
        </div>
      </div>
      
      {/* Toast Component */}
      <InventoryChangeToast ref={toastRef} />
    </div>
  );
};

export default InventoryChangeToastDemo;
