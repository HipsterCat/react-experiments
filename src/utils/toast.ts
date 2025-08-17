import React from 'react';
import { ToastInput, AnimationCoordinates } from '../types/toast';
import InventoryToast from '../components/InventoryToast';

// Re-export the basic toast methods from context
export { toast } from '../components/NiceToastProvider';

// Specialized toast creators
export const toastHelpers = {
  // Inventory update toast
  inventory: (
    itemIcon: string,
    itemName: string,
    quantity: number,
    action: 'add' | 'remove',
    animateFrom?: AnimationCoordinates
  ) => {
    const jsx = React.createElement(InventoryToast, {
      itemIcon,
      itemName,
      quantity,
      action,
      animateFrom,
    });

    return {
      type: 'custom' as const,
      jsx,
      position: 'top' as const,
      duration: 3000,
      dismissible: true,
      variantId: `inventory-${itemName}-${action}`,
    } as ToastInput;
  },

  // Reward toast (similar to inventory but different style)
  reward: (
    rewardIcon: string,
    rewardName: string,
    value: number | string,
    animateFrom?: AnimationCoordinates
  ) => {
    const jsx = React.createElement(
      'div',
      { className: 'flex items-center p-4 bg-gradient-to-r from-yellow-400/90 to-orange-500/90 rounded-lg border border-white/20 backdrop-blur-sm' },
      React.createElement(
        'div',
        { className: 'relative mr-3' },
        React.createElement('img', {
          src: rewardIcon,
          alt: rewardName,
          className: 'w-12 h-12 drop-shadow-lg',
        }),
        React.createElement(
          'div',
          { className: 'absolute -inset-1 bg-yellow-400/50 rounded-full blur-md animate-pulse' }
        )
      ),
      React.createElement(
        'div',
        { className: 'flex-1' },
        React.createElement(
          'h4',
          { className: 'text-white font-bold text-sm' },
          'Reward Earned!'
        ),
        React.createElement(
          'p',
          { className: 'text-white/90 text-xs' },
          `${rewardName} +${value}`
        )
      ),
      React.createElement(
        'svg',
        { className: 'w-6 h-6 text-white ml-3', fill: 'currentColor', viewBox: '0 0 20 20' },
        React.createElement('path', {
          d: 'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z',
        })
      )
    );

    return {
      type: 'custom' as const,
      jsx,
      position: 'top' as const,
      duration: 4000,
      dismissible: true,
      variantId: `reward-${rewardName}`,
      animateFrom,
    } as ToastInput;
  },

  // Achievement toast
  achievement: (
    title: string,
    description: string,
    icon?: string
  ) => {
    const jsx = React.createElement(
      'div',
      { className: 'p-4 bg-gradient-to-r from-purple-600/90 to-blue-600/90 rounded-lg border border-white/20 backdrop-blur-sm' },
      React.createElement(
        'div',
        { className: 'flex items-start' },
        icon && React.createElement(
          'div',
          { className: 'mr-3 mt-0.5' },
          React.createElement('img', {
            src: icon,
            alt: '',
            className: 'w-10 h-10',
          })
        ),
        React.createElement(
          'div',
          { className: 'flex-1' },
          React.createElement(
            'h4',
            { className: 'text-white font-bold text-sm mb-1' },
            title
          ),
          React.createElement(
            'p',
            { className: 'text-white/80 text-xs' },
            description
          )
        ),
        React.createElement(
          'div',
          { className: 'ml-3' },
          React.createElement(
            'svg',
            { className: 'w-6 h-6 text-yellow-300', fill: 'currentColor', viewBox: '0 0 20 20' },
            React.createElement('path', {
              fillRule: 'evenodd',
              d: 'M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z',
              clipRule: 'evenodd',
            })
          )
        )
      )
    );

    return {
      type: 'custom' as const,
      jsx,
      position: 'top' as const,
      duration: 5000,
      dismissible: true,
      variantId: `achievement-${title}`,
    } as ToastInput;
  },
};
