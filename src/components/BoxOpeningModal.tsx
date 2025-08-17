import { fetchProfile, fetchTasks, useBoxOpening, useSnackbar } from "../hooks/useBoxOpening";
import { AnimatedFullscreen } from "./AnimatedFullscreen";
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
import starIcon from "../assets/boxes/star.webp";



const BoxOpeningModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { isBoxOpeningModalOpen, closeBoxModal, openBoxModal, currentBoxId, initialDisplayMode } =
    useBoxOpening();
  const { showSnackbar } = useSnackbar();

  const [showTopupConfetti, setShowTopupConfetti] = useState(false);
  const [prizes, setPrizes] = useState<PrizeItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [wheelSpinState, setWheelSpinState] = useState<WheelSpinState>("IDLE");
  const [showYouveGot, setShowYouveGot] = useState(false);

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
      console.log('useEffect', currentBoxId, 'initialDisplayMode:', initialDisplayMode, 'isOpen:', isBoxOpeningModalOpen);
      
      // Reset state for new box
      setActualReward(null);
      setRewardLoading(false);
      setShowTopupConfetti(false);
      
      if (initialDisplayMode === 'result') {
        // Show "you've got" screen immediately for demo mode
        console.log('useEffect setWheelSpinState STOPPED (result mode)');
        setWheelSpinState("STOPPED");
        setShowYouveGot(true);
        // Create a mock reward for the demo
        setActualReward({
          reward_type: "box",
          reward_value: 0,
        });
      } else {
        // Normal wheel mode
        console.log('useEffect setWheelSpinState IDLE (wheel mode)');
        setWheelSpinState("IDLE");
        setShowYouveGot(false);
        loadPrizes();
      }
    } else {
      // Reset all state when modal closes
      console.log('useEffect: modal closed, resetting state');
      setActualReward(null);
      setWheelSpinState("IDLE");
      setShowYouveGot(false);
      setRewardLoading(false);
      setShowTopupConfetti(false);
      setPrizes([]);
      setIsLoading(true);
    }
  }, [currentBoxId, initialDisplayMode]);

  useEffect(() => {
    if (actualReward && wheelSpinState === "STOPPED" && initialDisplayMode === 'wheel') {
      console.log('useEffect IF ACTUAL REWARD', actualReward, wheelSpinState);
      // Show "you've got" screen after wheel stops (only in wheel mode)
      setTimeout(() => {
        setShowYouveGot(true);
        if (actualReward.reward_type === "box") {
          handleTopupSuccess();
        }
      }, 500);
    }
  }, [actualReward, wheelSpinState, initialDisplayMode]);

  // Trigger confetti for result mode
  useEffect(() => {
    if (initialDisplayMode === 'result' && showYouveGot && actualReward?.reward_type === "box") {
      handleTopupSuccess();
    }
  }, [initialDisplayMode, showYouveGot, actualReward]);

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
      console.log('loadPrizes closeBoxModal');
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
      console.log('startSpinning closeBoxModal');
      closeBoxModal();
    }
  };

  const handleContinue = () => {
    console.log('handleContinue closeBoxModal');
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
      console.log('handleOpenNow closeBoxModal');
      closeBoxModal();
      dispatch(fetchTasks());
      dispatch(fetchProfile());
    }
  };

  const handleSaveToInventory = () => {
    console.log('handleSaveToInventory closeBoxModal');
    closeBoxModal();
    dispatch(fetchTasks());
    dispatch(fetchProfile());
  };


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
    <AnimatedFullscreen
      isOpen={isBoxOpeningModalOpen}
      onClose={closeBoxModal}
      backgroundImage={getBg().backgroundImage}
      animationType="scale"
      closeButtonColor="#000"
      disableTabbarToggle={true}
    >
      {showTopupConfetti && <Confetti recycle={false} />}
      
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
        {isLoading && !showYouveGot ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary" />
          </div>
        ) : (
          <>
            {/* Wheel State - Show when not in "you've got" mode */}
            {!showYouveGot && wheelSpinState !== "STOPPED" && (
              <div 
                className="absolute inset-0"
                style={{
                  transform: isBoxOpeningModalOpen ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(-30px)',
                  opacity: isBoxOpeningModalOpen ? 1 : 0,
                  transition: 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                  transitionDelay: isBoxOpeningModalOpen ? '200ms' : '0ms'
                }}
              >
                <PrizeCarousel
                  prizes={prizes}
                  wheelSpinState={wheelSpinState}
                  setSpinState={setWheelSpinState}
                  actualReward={actualReward}
                />
              </div>
            )}

            {/* "You've Got" State - Show after wheel stops or in result mode */}
            {showYouveGot && actualReward && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div 
                  className="text-center flex flex-col items-center"
                  style={{
                    transform: (showYouveGot && isBoxOpeningModalOpen) ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(30px)',
                    opacity: (showYouveGot && isBoxOpeningModalOpen) ? 1 : 0,
                    transition: 'all 600ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                    transitionDelay: (showYouveGot && isBoxOpeningModalOpen) ? '200ms' : '0ms'
                  }}
                >
                  <div
                    style={{
                      transform: (showYouveGot && isBoxOpeningModalOpen) ? 'scale(1) translateY(0)' : 'scale(0.9) translateY(20px)',
                      opacity: (showYouveGot && isBoxOpeningModalOpen) ? 1 : 0,
                      transition: 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                      transitionDelay: (showYouveGot && isBoxOpeningModalOpen) ? '300ms' : '0ms'
                    }}
                  >
                    <Title
                      style={{
                        fontSize: 36,
                        lineHeight: "41px",
                        color: "#000",
                        fontWeight: 600,
                        marginBottom: 21,
                      }}
                    >
                      {t("box_open.you_ve_got")}
                    </Title>
                  </div>

                  <div
                    className="relative"
                    style={{ width: isBoxBlackhole ? 154 : 220, height: isBoxBlackhole ? 154 : 220 }}
                  >
                    {/* Rotating Star Animation for boxes */}
                    {isBoxBlackhole && (
                      <div 
                        className="absolute left-1/2 top-1/2 pointer-events-none"
                        style={{ 
                          width: '600px',
                          height: '600px',
                          zIndex: -1,
                          transform: (showYouveGot && isBoxOpeningModalOpen) ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
                          opacity: (showYouveGot && isBoxOpeningModalOpen) ? 0.6 : 0,
                          transition: 'all 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transitionDelay: (showYouveGot && isBoxOpeningModalOpen) ? '400ms' : '0ms'
                        }}
                      >
                        <img 
                          src={starIcon} 
                          alt="" 
                          className="w-full h-full animate-spin"
                          style={{
                            animation: 'spin 20s linear infinite',
                          }}
                        />
                      </div>
                    )}
                    
                    <div
                      style={{
                        transform: (showYouveGot && isBoxOpeningModalOpen) ? 'scale(1) rotate(0deg)' : 'scale(0.7) rotate(-10deg)',
                        opacity: (showYouveGot && isBoxOpeningModalOpen) ? 1 : 0,
                        transition: 'all 700ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                        transitionDelay: (showYouveGot && isBoxOpeningModalOpen) ? '500ms' : '0ms'
                      }}
                    >
                      <RewardTypeImage
                        reward={actualReward}
                        className="w-full h-full"
                        badgeSize="m"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Footer with buttons */}
      {!isLoading && !showYouveGot && (
        <div className="relative z-[999] px-4 pb-4">
          <div 
            className="flex flex-col items-center gap-3"
            style={{
              transform: ((showYouveGot || wheelSpinState === "IDLE") && isBoxOpeningModalOpen) ? 'translateY(0)' : 'translateY(50px)',
              opacity: ((showYouveGot || wheelSpinState === "IDLE") && isBoxOpeningModalOpen) ? 1 : 0,
              transition: 'all 500ms cubic-bezier(0.34, 1.56, 0.64, 1)',
              transitionDelay: (showYouveGot && isBoxOpeningModalOpen) ? '600ms' : '200ms'
            }}
          >
            {/* Show different buttons based on state */}
            {!showYouveGot && wheelSpinState === "IDLE" && (
              <Button
                size="s"
                stretched={true}
                mode={"filled"}
                onClick={startSpinning}
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
                  {t("box_open.button_reveal_reward")}
                </Text>
                <ConfettiParticles count={40} margin={8} padding={8} />
              </Button>
            )}

            {/* "You've Got" screen buttons */}
            {showYouveGot && actualReward && (
              <>
                {isBoxBlackhole ? (
                  <>
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
                        transform: 'scale(1)',
                        transition: 'transform 200ms ease',
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.95)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
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
                      onClick={handleOpenNow}
                      style={{
                        borderRadius: 20,
                        height: 42,
                        background:
                          actualReward.reward_value === 12
                            ? "rgba(0, 201, 255, 1)"
                            : actualReward.reward_value === 13
                            ? "rgba(112, 0, 203, 1)"
                            : actualReward.reward_value === 14
                            ? "rgba(255, 119, 0, 1)"
                            : "rgba(0, 201, 255, 1)",
                        transform: 'scale(1)',
                        transition: 'transform 200ms ease',
                      }}
                      onMouseDown={(e) => {
                        e.currentTarget.style.transform = 'scale(0.95)';
                      }}
                      onMouseUp={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'scale(1)';
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
                  </>
                ) : (
                  <Button
                    size="s"
                    stretched={true}
                    mode={"filled"}
                    onClick={handleContinue}
                    style={{
                      borderRadius: 20,
                      height: 42,
                    }}
                  >
                    <Text
                      weight="2"
                      style={{
                        fontSize: 15,
                        lineHeight: "20px",
                      }}
                    >
                      {t("common.button_continue")}
                    </Text>
                  </Button>
                )}
              </>
            )}
          </div>
          <BottomSentinelSafeArea />
        </div>
      )}
    </AnimatedFullscreen>
  );
};

export default BoxOpeningModal;
