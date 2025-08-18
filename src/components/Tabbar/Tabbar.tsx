import { AnimatePresence, motion } from "framer-motion";
import { type JSX, type ReactNode, useEffect, useState } from "react";

import clsx from "clsx";

export function registerCSSProperty(property: PropertyDefinition) {
  try {
    if ('registerProperty' in CSS) {
      CSS.registerProperty(property);
    }
  } catch (err) {
    // Ignore possible errors
  }
}

registerCSSProperty({
  name: "--tabbar-height",
  syntax: "<length>",
  inherits: true,
  initialValue: "0px",
});

registerCSSProperty({
  name: "--tabbar-current-height",
  syntax: "<length>",
  inherits: true,
  initialValue: "0px",
});

export interface TabbarProps {
  children: ReactNode;
  visible?: boolean;
  onVisibilityChange?: (visible: boolean) => void;
  backdrop?: boolean;
  skipHideAnimation?: boolean;
}

export const Tabbar = ({
  children,
  visible = true,
  onVisibilityChange,
  backdrop,
  skipHideAnimation,
}: TabbarProps): JSX.Element => {
  const [isVisible, setIsVisible] = useState(visible);

  useEffect(() => {
    setIsVisible(visible);
    onVisibilityChange?.(visible);

    document.documentElement.style.setProperty(
      "--tabbar-current-height",
      visible ? "var(--tabbar-height)" : "0px"
    );
  }, [visible, onVisibilityChange]);

  return (
    <>
      <AnimatePresence initial={false}>
        {isVisible && (
          <motion.div
            key="tabbar"
            initial={{ transform: "translateY(100%)" }}
            animate={{ transform: "translateY(0%)" }}
            exit={{
              transform: "translateY(100%)",
              transition: skipHideAnimation
                ? {
                    duration: 0,
                  }
                : undefined,
            }}
            transition={{
              duration: 0.2,
              ease: "easeOut",
            }}
            style={{
              position: "fixed",
              bottom: 0,
              left: 0,
              right: 0,
              zIndex: 999,
            }}
          >
            <div
              className={clsx(
                "flex justify-around items-center box-content w-full",
                "h-[56px] min-h-[56px] max-h-[56px] pb-tg-safe-area-inset-bottom",
                backdrop
                  ? "bg-black/20 backdrop-blur-md text-tgui-secondary-hint"
                  : "bg-section-bg-color shadow-top-divider text-tgui-secondary-hint"
              )}
              role="tablist"
              aria-orientation="horizontal"
            >
              {children}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};
