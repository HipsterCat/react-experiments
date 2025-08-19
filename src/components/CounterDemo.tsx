// import { useState, useRef } from 'react';
// import { motion } from 'framer-motion';
// import BalanceAnimation, { type BalanceAnimationRef } from './BalanceAnimation';

// const CounterDemo = () => {
//   const [mode, setMode] = useState<'original' | 'rolling' | 'numberflow'>('numberflow');
  
//   const balanceAnimationRef = useRef<BalanceAnimationRef>(null);
//   const buttonRefs = [
//     useRef<HTMLButtonElement | null>(null),
//     useRef<HTMLButtonElement | null>(null),
//     useRef<HTMLButtonElement | null>(null),
//     useRef<HTMLButtonElement | null>(null)
//   ];

//   const getElementCenter = (el: HTMLElement | null): { x: number; y: number } => {
//     if (!el) return { x: 0, y: 0 };
//     const rect = el.getBoundingClientRect();
//     return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
//   };

//   const handleBalanceChange = (amount: number, buttonIndex: number) => {
//     const buttonEl = buttonRefs[buttonIndex]?.current;
//     const fromCoordinates = getElementCenter(buttonEl);
//     balanceAnimationRef.current?.changeBalance(amount, fromCoordinates);
//   };

//   return (
//     <div className="flex flex-col items-start justify-start min-h-screen bg-gradient-to-br from-cyan-200 to-blue-300 p-4 relative overflow-hidden">
      
//       {/* Mode Selector */}
//       <div className="mb-6 w-full max-w-md relative z-10">
//         <div className="bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-lg">
//           <div className="flex flex-col gap-3">
//             <span className="text-sm font-medium text-gray-700 mb-2">
//               Counter Animation Mode
//             </span>
//             <div className="flex gap-2">
//               <button
//                 onClick={() => setMode('original')}
//                 className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
//                   mode === 'original' 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 Original
//               </button>
//               <button
//                 onClick={() => setMode('rolling')}
//                 className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
//                   mode === 'rolling' 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 Rolling Digits
//               </button>
//               <button
//                 onClick={() => setMode('numberflow')}
//                 className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
//                   mode === 'numberflow' 
//                     ? 'bg-blue-500 text-white' 
//                     : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
//                 }`}
//               >
//                 NumberFlow
//               </button>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Balance Display */}
//       <div className="relative mb-80">
//         <BalanceAnimation
//           key={mode} // Force remount when mode changes
//           ref={balanceAnimationRef}
//           initialCoinsBalance={25500}
//           alwaysVisible={true}
//           animationSpeed={1}
//           useRollingCounter={mode === 'rolling'}
//           useNumberFlow={mode === 'numberflow'}
//         />
//       </div>

//       {/* Control Buttons */}
//       <div className="grid grid-cols-2 gap-4 w-full max-w-md relative z-10">
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={() => handleBalanceChange(5000, 0)}
//           ref={buttonRefs[0]}
//           className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all"
//         >
//           + 5,000
//         </motion.button>
        
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={() => handleBalanceChange(500, 1)}
//           ref={buttonRefs[1]}
//           className="bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all"
//         >
//           + 500
//         </motion.button>
        
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={() => handleBalanceChange(-2500, 2)}
//           ref={buttonRefs[2]}
//           className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all"
//         >
//           - 2,500
//         </motion.button>
        
//         <motion.button
//           whileHover={{ scale: 1.02 }}
//           whileTap={{ scale: 0.98 }}
//           onClick={() => handleBalanceChange(-10000, 3)}
//           ref={buttonRefs[3]}
//           className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-4 rounded-2xl font-bold shadow-lg transition-all"
//         >
//           - 10,000
//         </motion.button>
//       </div>
//     </div>
//   );
// };

// export default CounterDemo;
