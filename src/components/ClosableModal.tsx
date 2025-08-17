import { Modal } from "@telegram-apps/telegram-ui";
import { ModalClose } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalClose/ModalClose";
import { ModalHeader } from "@telegram-apps/telegram-ui/dist/components/Overlays/Modal/components/ModalHeader/ModalHeader";
import { Icon28Close } from "@telegram-apps/telegram-ui/dist/icons/28/close";
import type { CSSProperties, ReactNode } from "react";
import { useEffect } from "react";
import { useTabbarContext } from "../hooks/useTabbarContext";
import "../assets/modal.css";

interface ClosableModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  children: ReactNode;
  textAreaFix?: boolean;
  style?: CSSProperties;
  dismissable?: boolean;
  closeStyle?: CSSProperties;
  disableTabbarToggle?: boolean;
}

export const ClosableModal = ({
  isOpen,
  onOpenChange,
  children,
  textAreaFix = false,
  style = { backgroundColor: "var(--tgui--secondary_bg_color)" },
  dismissable = true,
  closeStyle,
  disableTabbarToggle = false,
}: ClosableModalProps) => {
  const bb = (window as any).Telegram?.WebApp?.BackButton || { onClick: () => {}, offClick: () => {} };

  const tabbarContext = useTabbarContext();

  // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
  useEffect(() => {
    if (!disableTabbarToggle) {
      tabbarContext.setIsTabbarEnabled(!isOpen);
    }
  }, [isOpen, disableTabbarToggle]);

  useEffect(() => {
    const handleBack = () => {
      onOpenChange(false);
    };

    if (isOpen) {
      bb.onClick(handleBack);
    }

    return () => {
      bb.offClick(handleBack);
    };
  }, [isOpen, bb, onOpenChange]);

  return (
    <Modal
      dismissible={dismissable}
      header={
        <ModalHeader
          after={
            <ModalClose>
              <Icon28Close
                style={{
                  color: "var(--tgui--secondary_color)",
                  cursor: "pointer",
                  ...closeStyle,
                }}
              />
            </ModalClose>
          }
        />
      }
      open={isOpen}
      onOpenChange={onOpenChange}
      className={`tg-ui-modal-fix ${textAreaFix ? "tg-ui-modal-fix__ios" : ""}`}
      style={style}
    >
      {children}
    </Modal>
  );
};
