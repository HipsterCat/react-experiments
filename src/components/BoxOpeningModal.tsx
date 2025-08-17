import { fetchProfile, fetchTasks, useBoxOpening, useSnackbar } from "../hooks/useBoxOpening";
import { ClosableModal } from "./ClosableModal";
import { RewardTypeImage } from "./RewardTypeImage";
import { ConfettiParticles } from "./particles/ConfettiParticles";
import { Button, Text, Title } from "@telegram-apps/telegram-ui";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import boxOpenBg from "../assets/boxes/boxOpenBg_2.jpg";
import { PrizeCarousel, type WheelSpinState } from "./PrizeCarousel";
import { ServiceBoxOpenResponse, PrizeItem } from "../types/rewards";
import { getBoxContents, openBox } from "../services/mockBoxService";
import { BottomSentinelSafeArea } from "./BottomSentinelSafeArea";
import downIcon from "../assets/down.png";
import Confetti from "react-confetti";
import { useAppDispatch } from "../hooks/useBoxOpening";



const BoxOpeningModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { isBoxOpeningModalOpen, closeBoxModal, openBoxModal, currentBoxId } =
    useBoxOpening();
  const { showSnackbar } = useSnackbar();

  const [showTopupConfetti, setShowTopupConfetti] = useState(false);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wheelSpinState, setWheelSpinState] = useState<WheelSpinState>("IDLE");

  const [isRewardLoading, setRewardLoading] = useState(false);
  const [actualReward, setActualReward] =
    useState<ServiceBoxOpenResponse | null>(null);

  const handleTopupSuccess = () => {
    setShowTopupConfetti(true);
    setTimeout(() => {
      setShowTopupConfetti(false);
    }, 6000);
  };

  useEffect(() => {
    if (currentBoxId !== undefined) {
      console.log('useEffect', currentBoxId);
      setActualReward(null);
      console.log('useEffect setWheelSpinState IDLE');
      setWheelSpinState("IDLE");
      setRewardLoading(false);
      loadPrizes();
    }
  }, [currentBoxId]);

  useEffect(() => {
    if (actualReward?.reward_type === "box" && wheelSpinState === "STOPPED") {
      console.log('useEffect IF ACTUAL REWARD', actualReward, wheelSpinState);
      handleTopupSuccess();
    }
  }, [actualReward, wheelSpinState]);

  const loadPrizes = async () => {
    if (currentBoxId === undefined) return;

    try {
      setIsLoading(true);
      const data = await getBoxContents(String(currentBoxId));

      const filteredRewards = data.rewards.filter(
        (reward) =>
          reward.reward_type !== "double_balance" &&
          reward.reward_type !== "telegram_premium"
      );

      const mappedPrizes: PrizeItem[] = [
        ...filteredRewards,
        ...filteredRewards,
      ].map((reward) => ({
        reward_type: reward.reward_type as PrizeItem["reward_type"],
        reward_value: reward.reward_value,
      }));

      setPrizes(mappedPrizes);
    } catch (error) {
      console.error(error);
      showSnackbar(t("profilePage.dailyModal.error"), { type: "error" });
      closeBoxModal();
    } finally {
      setIsLoading(false);
    }
  };

  const startSpinning = async () => {
    try {
      if (currentBoxId === undefined || isRewardLoading) return;

      setRewardLoading(true);

      console.log('startSpinning, openBox', currentBoxId);
      const data = await openBox(String(currentBoxId));

      setActualReward(data);
      console.log('startSpinning setWheelSpinState SPINNING', data);
      setWheelSpinState("SPINNING");
      setRewardLoading(false);

    } catch (error) {
      console.error(error);
      showSnackbar(t("profilePage.dailyModal.error"), { type: "error" });
      closeBoxModal();
    }
  };

  const handleContinue = () => {
    closeBoxModal();
    dispatch(fetchTasks());
    dispatch(fetchProfile()); 
  };

  const handleOpenNow = () => {
    if (actualReward) {
      console.log('handleOpenNow', actualReward);
      const match = actualReward.extra?.match(/:(\d+)/);
      if (match) {
        console.log('handleOpenNow', match[1]);
        openBoxModal(Number(match[1]));
      }
    } else {
      closeBoxModal();
      dispatch(fetchTasks());
      dispatch(fetchProfile());
    }
  };

  const handleSaveToInventory = () => {
    closeBoxModal();
    dispatch(fetchTasks());
    dispatch(fetchProfile());
  };

  const isRevealed = wheelSpinState === "STOPPED";
  const isBoxBlackhole = actualReward
    ? actualReward.reward_type === "box"
    : false;

  const getBg = () => {
    if (
      actualReward &&
      actualReward.reward_type === "box" &&
      actualReward.reward_value === 12
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(126, 255, 243, 0.5), rgba(103, 162, 255, 0.5)), url(${boxOpenBg})`,
      };
    }
    if (
      actualReward &&
      actualReward.reward_type === "box" &&
      actualReward.reward_value === 13
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(238, 206, 243, 0.5), rgba(213, 86, 255, 0.5)), url(${boxOpenBg})`,
      };
    }
    if (
      actualReward &&
      actualReward.reward_type === "box" &&
      actualReward.reward_value === 14
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(239, 255, 151, 0.5), rgba(255, 206, 133, 0.5)), url(${boxOpenBg})`,
      };
    }
    return {
      backgroundImage: `linear-gradient(rgba(239, 239, 244, 0.5), rgba(239, 239, 244, 0.5)), url(${boxOpenBg})`,
    };
  };

  return (
    <ClosableModal
      isOpen={isBoxOpeningModalOpen}
      onOpenChange={(value) => {
        if (!value) closeBoxModal();
      }}
      style={{
        ...getBg(),
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
    >
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
          {isLoading ? (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
            </div>
          ) : (
            <>
              {/* Gradient overlays */}
              <div className="hidden absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-background to-transparent z-10" />
              <div className="hidden absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-10" />

              {wheelSpinState !== "STOPPED" && (
                <PrizeCarousel
                  prizes={prizes}
                  wheelSpinState={wheelSpinState}
                  setSpinState={setWheelSpinState}
                  actualReward={actualReward}
                />
              )}

              {wheelSpinState === "STOPPED" && actualReward && (
                <div
                  style={{
                    marginBottom: actualReward.reward_type === "box" ? 8 : 0,
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

                    {!isBoxBlackhole && (
                      <div
                        className="relative mt-2"
                        style={{ width: 220, height: 220 }}
                      >
                        <RewardTypeImage
                          reward={actualReward}
                          className="w-full h-full"
                          badgeSize="m"
                        />
                      </div>
                    )}
                    {isBoxBlackhole && (
                      <div
                        className="relative mt-[21px]"
                        style={{ width: 154, height: 154 }}
                      >
                        <RewardTypeImage
                          reward={actualReward}
                          className="w-full h-full"
                          badgeSize="m"
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer with button */}
        {!isLoading && (
          <div className="fixed z-[999] bottom-0 left-0 right-0 w-full">
            <div className="px-4 pb-4">
              {!isBoxBlackhole &&
                (wheelSpinState === "IDLE" || wheelSpinState === "STOPPED") && (
                  <Button
                    size="s"
                    stretched={true}
                    mode={"filled"}
                    onClick={isRevealed ? handleContinue : startSpinning}
                    style={{
                      borderRadius: 20,
                      height: 42,
                    }}
                    loading={isRewardLoading}
                  >
                    <Text
                      weight="2"
                      style={{
                        fontSize: 15,
                        lineHeight: "20px",
                      }}
                    >
                      {isRevealed
                        ? t("common.button_continue")
                        : t("box_open.button_reveal_reward")}
                    </Text>

                    {!isRevealed && (
                      <ConfettiParticles count={40} margin={8} padding={8} />
                    )}
                  </Button>
                )}
              {isBoxBlackhole &&
                (wheelSpinState === "IDLE" || wheelSpinState === "STOPPED") && (
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
                      onClick={handleSaveToInventory}
                      style={{
                        borderRadius: 20,
                        height: 42,
                        background: "white",
                      }}
                      loading={isRewardLoading}
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
                      onClick={handleOpenNow}
                      style={{
                        borderRadius: 20,
                        height: 42,
                        background:
                          actualReward && actualReward.reward_value === 12
                            ? "rgba(0, 201, 255, 1)"
                            : actualReward && actualReward.reward_value === 13
                            ? "rgba(112, 0, 203, 1)"
                            : actualReward && actualReward.reward_value === 14
                            ? "rgba(255, 119, 0, 1)"
                            : undefined,
                      }}
                      loading={isRewardLoading}
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

                      {!isRevealed && (
                        <ConfettiParticles count={40} margin={8} padding={8} />
                      )}
                    </Button>
                  </div>
                )}
            </div>
            <BottomSentinelSafeArea />
          </div>
        )}
      </div>
    </ClosableModal>
  );
};

export default BoxOpeningModal;
