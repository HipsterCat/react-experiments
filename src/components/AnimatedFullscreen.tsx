import React, { useEffect, useState, ReactNode } from 'react';
import { Icon28Close } from "@telegram-apps/telegram-ui/dist/icons/28/close";
import { useTabbarContext } from "../hooks/useTabbarContext";
import { motion } from "framer-motion";

interface AnimatedFullscreenProps {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
  backgroundImage?: string;
  backgroundColor?: string;
  animationType?: 'scale' | 'fade' | 'circle';
  disableTabbarToggle?: boolean;
  showCloseButton?: boolean;
  closeButtonColor?: string;
  overlayImage?: string;
  showOverlay?: boolean;
}

export const AnimatedFullscreen: React.FC<AnimatedFullscreenProps> = ({
  isOpen,
  onClose,
  children,
  backgroundImage,
  backgroundColor = 'rgba(0, 0, 0, 0.9)',
  animationType = 'scale',
  disableTabbarToggle = false,
  showCloseButton = true,
  closeButtonColor = '#000',
  overlayImage,
  showOverlay = false
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const tabbarContext = useTabbarContext();

  // Handle Telegram WebApp back button
  const bb = (window as any).Telegram?.WebApp?.BackButton || { onClick: () => {}, offClick: () => {} };

  useEffect(() => {
    if (!disableTabbarToggle) {
      tabbarContext.setIsTabbarEnabled(!isOpen);
    }
  }, [isOpen, disableTabbarToggle, tabbarContext]);

  useEffect(() => {
    const handleBack = () => {
      console.log('handleBack');
      handleClose();
    };

    if (isOpen) {
      bb.onClick(handleBack);
    }

    return () => {
      bb.offClick(handleBack);
    };
  }, [isOpen, bb]);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      // Small delay to ensure the element is rendered before animation
      const timer = setTimeout(() => {
        setIsAnimating(true);
      }, 10);
      return () => clearTimeout(timer);
    } else {
      console.log('useEffect isOpen false - setIsAnimating false');
      setIsAnimating(false);
      // Wait for animation to complete before hiding
      const timer = setTimeout(() => {
        console.log('useEffect isOpen false - setIsVisible false');
        setIsVisible(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleClose = () => {
    console.log('handleClose isanimating false');
    setIsAnimating(false);
    setTimeout(() => {
      console.log('handleClose onClose after 300ms');
      onClose();
    }, 300);
  };

  if (!isVisible) return null;

  const getBackgroundStyle = () => {
    const baseStyle = {
      backgroundPosition: "50%",
      backgroundSize: "cover",
      backgroundRepeat: "no-repeat",
    };

    if (animationType === 'circle') {
      const circleSize = isAnimating ? '150%' : '0%';
      return {
        ...baseStyle,
        background: backgroundImage 
          ? `radial-gradient(circle at center, ${backgroundColor} ${circleSize}, transparent ${circleSize}), url(${backgroundImage})`
          : `radial-gradient(circle at center, ${backgroundColor} ${circleSize}, transparent ${circleSize})`,
        transition: 'background 600ms cubic-bezier(0.4, 0, 0.2, 1)',
      };
    }

    return {
      ...baseStyle,
      backgroundImage,
      backgroundColor,
    };
  };

  const getContainerTransform = () => {
    if (animationType === 'scale') {
      return isAnimating 
        ? 'scale(1) translateY(0)' 
        : 'scale(0.6) translateY(20px)';
    }
    return isAnimating ? 'translateY(0)' : 'translateY(20px)';
  };

  return (
    <div className="fixed inset-0 z-[11000]">
      {/* Background Layer */}
      <div
        className="absolute inset-0"
        style={{
          ...getBackgroundStyle(),
          opacity: isAnimating ? 1 : 0,
          transition: 'opacity 400ms cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      {/* Overlay Layer (above background for blend mode) */}
      {overlayImage && (
        <motion.div
          className="absolute inset-0"
          style={{
            backgroundImage: `url(${overlayImage})`,
            backgroundSize: '100% 100%',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            mixBlendMode: 'overlay',
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: showOverlay ? 1 : 0 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        />
      )}
      


      {/* Content Container */}
      <div className="relative w-full h-full flex items-center justify-center">
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 z-[11001] p-2 rounded-full transition-colors"
            style={{ 
              color: closeButtonColor,
              transform: isAnimating ? 'scale(1) rotate(0deg)' : 'scale(0.8) rotate(-90deg)',
              opacity: isAnimating ? 1 : 0,
              transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: '300ms'
            }}
          >
            <Icon28Close />
          </button>
        )}

        {/* Main Content */}
        <div
          className="w-full h-full flex flex-col"
          style={{
            transform: getContainerTransform(),
            opacity: isAnimating ? 1 : 0,
            transition: 'all 400ms cubic-bezier(0.34, 1.56, 0.64, 1)',
            paddingLeft: "var(--tg-safe-area-inset-left, 0px)",
            paddingRight: "var(--tg-safe-area-inset-right, 0px)",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};
