import { ClosableModal } from "./ClosableModal";
import { FC, useEffect, useState } from "react";
import downIcon from "../assets/down.png";
import Confetti from "react-confetti";
import { Button, Title, Text } from "@telegram-apps/telegram-ui";
import { useTranslation } from "../hooks/useTranslation";
import { RewardTypeImage } from "./RewardTypeImage";
import { BottomSentinelSafeArea } from "./BottomSentinelSafeArea";
import { useBoxOpening } from "../hooks/useBoxOpening";

interface LootBoxFullScreenProps {
  boxId: number;
  onClose: () => void;
}

export const LootBoxFullScreen: FC<LootBoxFullScreenProps> = ({
  boxId,
  onClose,
}) => {
  const { t } = useTranslation();
  const { openBoxModal } = useBoxOpening();
  const [showTopupConfetti, setShowTopupConfetti] = useState(false);

  const handleTopupSuccess = () => {
    setShowTopupConfetti(true);
    setTimeout(() => {
      setShowTopupConfetti(false);
    }, 6000);
  };

  const handleOpenBox = () => {
    openBoxModal(boxId);
    onClose();
  };

  useEffect(() => {
    handleTopupSuccess();
  }, []);

  return (
    <div>
      {showTopupConfetti && <Confetti recycle={false} />}
      <div
        style={{
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
          paddingTop: "30px",
          height: "100dvh",
          paddingBottom: "var(--tg-safe-area-inset-bottom)",
          paddingLeft: "var(--tg-safe-area-inset-left)",
          paddingRight: "var(--tg-safe-area-inset-right)",
          position: "relative",
        }}
      >
        <div className="flex-1 absolute inset-0 overflow-hidden">
          <>
            <div className="hidden absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />
            <div className="hidden absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

            <div
              style={{
                marginBottom: 8,
              }}
              className="absolute inset-0 pointer-events-none flex items-center justify-center"
            >
              <div className="pointer-events-auto text-center flex flex-col items-center mb-[30px]">
                <Title
                  style={{
                    fontSize: 36,
                    lineHeight: "41px",
                    color: "#000",
                    fontWeight: 600,
                  }}
                >
                  {t("box_open.you_ve_got")}
                </Title>

                <div
                  className="relative mt-[21px]"
                  style={{ width: 154, height: 154 }}
                >
                  <RewardTypeImage
                    reward={{
                      reward_type: "box",
                      reward_value: 0,
                    }}
                    className="w-full h-full"
                    badgeSize="m"
                  />
                </div>
              </div>
            </div>
          </>
        </div>

        {/* Footer with button */}
        <div className="fixed z-[999] bottom-0 left-0 right-0 w-full">
          <div className="px-4 pb-4">
            <div className="flex flex-col items-center gap-3">
              <Text
                weight="2"
                className="text-gray-900"
                style={{
                  fontWeight: 590,
                  fontSize: 13,
                  lineHeight: "16px",
                }}
              >
                {t("box_open.later_open_later_inventory")}
              </Text>
              <Button
                size="s"
                mode={"filled"}
                onClick={() => {
                  onClose();
                }}
                style={{
                  borderRadius: 20,
                  height: 42,
                  background: "white",
                }}
              >
                <div className="flex gap-2 mx-2">
                  <img src={downIcon} style={{ height: 20 }} />
                  <Text
                    className="text-gray-900"
                    weight="2"
                    style={{
                      fontWeight: 590,
                      fontSize: 15,
                      lineHeight: "20px",
                    }}
                  >
                    {t("box_open.button_save_inventory")}
                  </Text>
                </div>
              </Button>
              <Button
                size="s"
                stretched={true}
                mode={"filled"}
                onClick={handleOpenBox}
                style={{
                  borderRadius: 20,
                  height: 42,
                  background: "rgba(0, 201, 255, 1)",
                }}
              >
                <Text
                  weight="2"
                  style={{
                    fontSize: 15,
                    lineHeight: "20px",
                  }}
                >
                  {t("box_open.button_open_now")}
                </Text>
              </Button>
            </div>
          </div>
          <BottomSentinelSafeArea />
        </div>
      </div>
    </div>
  );
};
