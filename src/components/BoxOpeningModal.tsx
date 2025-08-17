import { fetchProfile, fetchTasks, useBoxOpening, useSnackbar } from "../hooks/useBoxOpening";
import { AnimatedFullscreen } from "./AnimatedFullscreen";
import { RewardTypeImage } from "./RewardTypeImage";
import { ConfettiParticles } from "./particles/ConfettiParticles";
import { Button, Text, Title } from "@telegram-apps/telegram-ui";
import type React from "react";
import { useEffect, useState } from "react";
import { useTranslation } from "../hooks/useTranslation";
import { useBalanceAnimation } from "../hooks/useBalanceAnimation";
import boxOpenBg from "../assets/boxes/boxOpenBg_2.jpg";
import overlayImage from "../assets/boxes/overlay.webp";
import { PrizeCarousel, type WheelSpinState } from "./PrizeCarousel";
import { ServiceBoxOpenResponse } from "../types/rewards";
import { openBox } from "../services/mockBoxService";
import { BottomSentinelSafeArea } from "./BottomSentinelSafeArea";
import downIcon from "../assets/down.png";
import Confetti from "react-confetti";
import { useAppDispatch } from "../hooks/useBoxOpening";
import starIcon from "../assets/boxes/star.webp";
import { motion } from "framer-motion";



const BoxOpeningModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { isBoxOpeningModalOpen, closeBoxModal, currentBoxId, viewMode, boxContents, switchToWheel, switchView } =
    useBoxOpening();
  const { showSnackbar } = useSnackbar();
  const { changeBalance, balanceRef } = useBalanceAnimation();

  const [showTopupConfetti, setShowTopupConfetti] = useState(false);
  const [wheelSpinState, setWheelSpinState] = useState<WheelSpinState>("IDLE");

  const [isRewardLoading, setRewardLoading] = useState(false);
  const [actualReward, setActualReward] =
    useState<ServiceBoxOpenResponse | null>(null);
  const [isSwitchingToWheel, setIsSwitchingToWheel] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [showRevealAnimation, setShowRevealAnimation] = useState(false);

  const handleTopupSuccess = () => {
    setShowTopupConfetti(true);
    setTimeout(() => {
      setShowTopupConfetti(false);
    }, 6000);
  };

  useEffect(() => {
    if (currentBoxId !== undefined) {
      console.log('on box change', currentBoxId, 'viewMode:', viewMode);
      // Reset state for a new box only
      setActualReward(null);
      setRewardLoading(false);
      setShowTopupConfetti(false);
      setHasSpun(false);
      setWheelSpinState(viewMode === 'wheel' ? 'IDLE' : 'STOPPED');
      setShowRevealAnimation(false);

      // Check if we have an error loading box contents
      if (boxContents.error) {
        showSnackbar(boxContents.error, { type: "error" });
        closeBoxModal();
      }
    } else {
      // Reset all state when modal closes
      console.log('modal closed, resetting state');
      // Add a small delay to prevent visual glitches
      setTimeout(() => {
        setActualReward(null);
        setWheelSpinState("IDLE");
        setRewardLoading(false);
        setShowTopupConfetti(false);
        setHasSpun(false);
        setShowRevealAnimation(false);
      }, 100);
    }
  }, [currentBoxId, boxContents.error]);

  // Respond to view changes without nuking reward state
  useEffect(() => {
    if (currentBoxId === undefined) return;
    if (viewMode === 'wheel') {
      setWheelSpinState('IDLE');
    } else if (viewMode === 'result') {
      // nothing; result rendering depends on actualReward
    }
  }, [viewMode, currentBoxId]);

  useEffect(() => {
    if (hasSpun && wheelSpinState === "STOPPED" && viewMode === 'wheel') {
      console.log('wheel stopped -> switching to result');
      
      // If it's a box reward, start reveal animation immediately
      if (actualReward?.reward_type === 'box') {
        setShowRevealAnimation(true);
        handleTopupSuccess();
        // Wait for reveal animation to complete before switching view
        setTimeout(() => {
          switchView('result');
        }, 600);
      } else {
        // For non-box rewards, switch immediately
        switchView('result');
      }
    }
  }, [hasSpun, wheelSpinState, viewMode, actualReward]);

  // Trigger effects when we reach result view after spinning
  useEffect(() => {
    if (hasSpun && viewMode === 'result' && actualReward) {
      // Trigger confetti for box rewards
      if (actualReward.reward_type === "box") {
        handleTopupSuccess();
      }
      
      // Trigger balance animation for coins or usdt rewards
      if (actualReward.reward_type === 'coins' || actualReward.reward_type === 'usdt') {
        // Set the appropriate balance type
        if (balanceRef.current) {
          balanceRef.current.setBalanceType(actualReward.reward_type as 'coins' | 'usdt');
        }
        
        const rewardCoordinates = { 
          x: window.innerWidth / 2, 
          y: window.innerHeight / 2 
        };
        changeBalance(actualReward.reward_value, rewardCoordinates);
      }
    }
  }, [viewMode, actualReward, hasSpun, changeBalance]);



  const startSpinning = async () => {
    try {
      if (currentBoxId === undefined || isRewardLoading || hasSpun) return;

      setRewardLoading(true);

      console.log('startSpinning, openBox', currentBoxId);
      const data = await openBox(String(currentBoxId));

      console.log('startSpinning setWheelSpinState SPINNING', data);
      setWheelSpinState("SPINNING");
      setRewardLoading(false);
      setHasSpun(true);

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

  const handleOpenNow = async () => {
    // No nesting: switch current modal from result to wheel for the same box
    if (currentBoxId === undefined) {
      console.log('handleOpenNow: no currentBoxId, closing');
      closeBoxModal();
      dispatch(fetchTasks());
      dispatch(fetchProfile());
      return;
    }

    if (isSwitchingToWheel || boxContents.isLoading) {
      console.log('handleOpenNow: already switching/loading, ignoring');
      return;
    }

    try {
      setIsSwitchingToWheel(true);
      
      // If opening a box, trigger reveal animation
      if (isBox && actualReward) {
        setShowRevealAnimation(true);
        // Wait a bit for the animation to start before switching
        await new Promise(resolve => setTimeout(resolve, 800));
      }
      
      await switchToWheel(currentBoxId);
    } catch (error) {
      console.error('handleOpenNow failed to switch to wheel:', error);
      showSnackbar('Failed to load box contents', { type: 'error' });
    } finally {
      setIsSwitchingToWheel(false);
    }
  };

  const handleSaveToInventory = () => {
    console.log('handleSaveToInventory closeBoxModal');
    closeBoxModal();
    dispatch(fetchTasks());
    dispatch(fetchProfile());
  };


  // What to display in the result view: real reward after spin, or a placeholder box before spin
  const displayReward = (viewMode === 'result' && !hasSpun)
    ? { reward_type: 'box', reward_value: currentBoxId || 11 } as ServiceBoxOpenResponse
    : actualReward;

  const isBox = displayReward ? displayReward.reward_type === "box" : false;
  
  // Debug logging
  useEffect(() => {
    console.log('[BoxOpeningModal] State:', {
      viewMode,
      hasSpun,
      displayReward,
      actualReward,
      isBox,
      showRevealAnimation,
      wheelSpinState,
      currentBoxId
    });
  }, [viewMode, hasSpun, displayReward, actualReward, isBox, showRevealAnimation, wheelSpinState, currentBoxId]);

  const getBg = () => {
    if (
      displayReward &&
      displayReward.reward_type === "box" &&
      displayReward.reward_value === 12
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(126, 255, 243, 0.5), rgba(103, 162, 255, 0.5)), url(${boxOpenBg})`,
      };
    }
    if (
      displayReward &&
      displayReward.reward_type === "box" &&
      displayReward.reward_value === 13
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(238, 206, 243, 0.5), rgba(213, 86, 255, 0.5)), url(${boxOpenBg})`,
      };
    }
    if (
      displayReward &&
      displayReward.reward_type === "box" &&
      displayReward.reward_value === 14
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
      overlayImage={overlayImage}
      showOverlay={wheelSpinState === "SPINNING"}
    >
      
      {showTopupConfetti && <Confetti recycle={false} />}
      
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
          <>
            {/* Wheel layer (kept mounted). Only show/hide, no scaling */}
            <motion.div
              className="absolute inset-0"
              initial={false}
              animate={{
                opacity: 1
              }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              style={{ pointerEvents: 'none' }}
            >
              <PrizeCarousel
                prizes={boxContents.prizes}
                wheelSpinState={wheelSpinState}
                setSpinState={setWheelSpinState}
                actualReward={actualReward}
                showRevealAnimation={showRevealAnimation}
                onRevealComplete={() => setShowRevealAnimation(false)}
                onFinalReward={(reward) => {
                  console.log('[BoxOpeningModal] onFinalReward:', reward);
                  setActualReward(reward as any);
                }}
              />
            </motion.div>

            {/* Result layer */}
            {displayReward && (
              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={false}
                animate={{
                  opacity: viewMode === 'result' ? 1 : 0,
                  scale: viewMode === 'result' ? 1 : 0.5,
                  y: viewMode === 'result' ? 0 : 50,
                }}
                transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
                style={{ pointerEvents: viewMode === 'result' ? 'auto' : 'none', zIndex: -1 }}
              >
                <div className="text-center flex flex-col items-center">
                  <div
                    className="will-change-transform will-change-opacity"
                  >
                    <Title
                      style={{
                        fontSize: 36,
                        lineHeight: "41px",
                        color: "#000",
                        fontWeight: 600,
                        zIndex: 1,
                      marginBottom: "40vh"                   }}
                    >
                      {t("box_open.you_ve_got")}
                    </Title>
                  </div>
                              {/* Rotating Star Animation for result */}
                              {(
                      <div 
                        className="absolute left-1/2 top-1/2 pointer-events-none"
                        style={{ 
                          width: '600px',
                          height: '600px',
                          zIndex: -1,
                          transform: (isBoxOpeningModalOpen) ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.8)',
                          opacity: (isBoxOpeningModalOpen) ? 0.6 : 0,
                          transition: 'all 800ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transitionDelay: (isBoxOpeningModalOpen) ? '400ms' : '0ms'
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
                </div>
              </motion.div>
            )}


          </>
      </div>

      {/* Footer with buttons */}
      {wheelSpinState !== "SPINNING" && (
        <div className="absolute bottom-0 left-0 right-0 z-[999] px-4 pb-4">
          <motion.div 
            className="flex flex-col items-center gap-3"
            initial={false}
            animate={{
              opacity: (viewMode === 'result' || wheelSpinState === "IDLE") ? 1 : 0,
            }}
            transition={{ duration: 0.5, ease: [0.34, 1.56, 0.64, 1] }}
          >
            {/* Show different buttons based on state */}
            {viewMode === 'wheel' && wheelSpinState === "IDLE" && (
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

            {/* Result screen buttons */}
            {viewMode === 'result' && displayReward && (
              <>
                {isBox ? (
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
                      loading={isSwitchingToWheel || boxContents.isLoading}
                      style={{
                        borderRadius: 20,
                        height: 42,
                        background:
                          displayReward.reward_value === 12
                            ? "rgba(0, 201, 255, 1)"
                            : displayReward.reward_value === 13
                            ? "rgba(112, 0, 203, 1)"
                            : displayReward.reward_value === 14
                            ? "rgba(255, 119, 0, 1)"
                            : "rgba(0, 201, 255, 1)",
                        transform: 'scale(1)',
                        transition: 'transform 200ms ease',
                      }}
                      onMouseDown={(e) => {
                        if (!(isSwitchingToWheel || boxContents.isLoading)) {
                          e.currentTarget.style.transform = 'scale(0.95)';
                        }
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
                        {isSwitchingToWheel || boxContents.isLoading ? 'Loading Box...' : t("box_open.button_open_now")}
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
          </motion.div>
          <BottomSentinelSafeArea />
        </div>
      )}
    </AnimatedFullscreen>
  );
};

export default BoxOpeningModal;
