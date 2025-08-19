import { fetchProfile, fetchTasks, useBoxOpening, useSnackbar } from "../hooks/useBoxOpening";
import { AnimatedFullscreen } from "./AnimatedFullscreen";
import { ConfettiParticles } from "./ConfettiParticles";
import { Button, Text, Title } from "@telegram-apps/telegram-ui";
import type React from "react";
import { useEffect, useState, useRef } from "react";
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
import EventStack from "./EventStack";
import { useEventStack } from "../hooks/useEventStack";
import { useInventoryChangeToast } from './InventoryChangeToastProvider';
import box_regular_icon from "../assets/boxes/rewards/box_regular.webp";
import box_rare_icon from "../assets/boxes/rewards/box_rare.webp";
import box_epic_icon from "../assets/boxes/rewards/box_epic.webp";
import box_legend_icon from "../assets/boxes/rewards/box_legend.webp";



const BoxOpeningModal: React.FC = () => {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();

  const { isBoxOpeningModalOpen, closeBoxModal, currentBoxId, viewMode, boxContents, switchView, loadBoxContents } =
    useBoxOpening();
  const { showSnackbar } = useSnackbar();
  const { changeBalance } = useBalanceAnimation();
  const inventoryToast = useInventoryChangeToast();

  const [showTopupConfetti, setShowTopupConfetti] = useState(false);
  const [wheelSpinState, setWheelSpinState] = useState<WheelSpinState>("IDLE");

  const [isRewardLoading, setRewardLoading] = useState(false);
  const [actualReward, setActualReward] =
    useState<ServiceBoxOpenResponse | null>(null);
  const [isSwitchingToWheel, setIsSwitchingToWheel] = useState(false);
  const [hasSpun, setHasSpun] = useState(false);
  const [showRevealAnimation, setShowRevealAnimation] = useState(false);
  // Guard to avoid duplicate balance animation per spin
  const hasAppliedRewardRef = useRef(false);
  const handleTopupSuccess = () => {
    setShowTopupConfetti(true);
    setTimeout(() => {
      setShowTopupConfetti(false);
    }, 600);
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
      console.log('on box change setWheelSpinState setshowrevealanimation false, currentBoxId', currentBoxId, 'viewMode', viewMode, 'wheelSpinState', wheelSpinState);
      setShowRevealAnimation(false);
      hasAppliedRewardRef.current = false;

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
      hasAppliedRewardRef.current = false;
    }
  }, [currentBoxId, boxContents.error]);

  // Respond to view changes without nuking reward state
  useEffect(() => {
    if (currentBoxId === undefined) return;
    if (viewMode === 'wheel') {
      // Always reset to IDLE when entering the wheel from result
      setWheelSpinState('IDLE');
    } else if (viewMode === 'result') {
      // Keep STOPPED while in result to keep single item centered
      setWheelSpinState('STOPPED');
    }
  }, [viewMode, currentBoxId]);

      // What to display in the result view: real reward after spin, or a placeholder box before spin
  const displayReward = (viewMode === 'result' && !hasSpun)
    ? { reward_type: 'box', reward_value: 11 } as ServiceBoxOpenResponse
    : actualReward;

  const isBox = displayReward ? displayReward.reward_type === "box" : false;

  // EventStack for showing recent activity (always mounted)
  // Visible when: wheel is idle OR result screen shows a Box (hide on spinning and on non-box result)
  const shouldShowEvents = (
    (viewMode === 'wheel' && wheelSpinState === 'IDLE') ||
    (viewMode === 'result' && isBox)
  );
  // Only load events when modal is open and events should be visible
  const { events } = useEventStack(isBoxOpeningModalOpen && shouldShowEvents);

  useEffect(() => {
    // Do not react if modal is closed
    if (!isBoxOpeningModalOpen) return;
    if (hasSpun && wheelSpinState === "STOPPED" && viewMode === 'wheel') {
      console.log('wheel stopped -> switching to result');
      
      // If it's a box reward, start reveal animation immediately
      if (displayReward?.reward_type === 'box') {
        console.log('displayReward -box?, displayReward', displayReward, 'boxContents.isLoading', boxContents.isLoading);
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
  }, [hasSpun, wheelSpinState, viewMode, actualReward, isBoxOpeningModalOpen]);

  // Trigger effects when we reach result view after spinning
  useEffect(() => {
    if (!isBoxOpeningModalOpen) return;
    if (hasAppliedRewardRef.current) return;
    if (hasSpun && viewMode === 'result' && displayReward) {
      console.log('hasSpun and viewMode is result -> trigger confetti');
      // Trigger confetti for box rewards
      if (displayReward?.reward_type === "box") {
        handleTopupSuccess();
      }
      
      // Trigger balance animation for coins or usdt rewards
      if (displayReward.reward_type === 'coins' || displayReward.reward_type === 'usdt') {
        const rewardCoordinates = { 
          x: window.innerWidth / 2, 
          y: window.innerHeight / 2 
        };
        // Pass the type explicitly so the animation switches context atomically
        changeBalance(
          displayReward.reward_value,
          rewardCoordinates,
          displayReward.reward_type as 'coins' | 'usdt'
        );
        hasAppliedRewardRef.current = true;
      }
    }
  }, [viewMode, displayReward, hasSpun, changeBalance, isBoxOpeningModalOpen]);



  const startSpinning = async () => {
    try {
      if (currentBoxId === undefined || isRewardLoading || hasSpun) return;

      setRewardLoading(true);
      hasAppliedRewardRef.current = false;

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

      // Ensure box contents are loaded BEFORE reveal starts
      await loadBoxContents(currentBoxId);

      if (isBox) {
        setShowRevealAnimation(true);
        await new Promise(resolve => setTimeout(resolve, 800));
        // Proactively switch to wheel after reveal delay to avoid missing callbacks
        setHasSpun(false);
        switchView('wheel');
      }

      // Do not switch view yet; wait for onRevealComplete to switch to wheel
    } catch (error) {
      console.error('handleOpenNow failed to switch to wheel:', error);
      showSnackbar('Failed to load box contents', { type: 'error' });
    } finally {
      setIsSwitchingToWheel(false);
    }
  };

  const getBoxIconByValue = (value: number) => {
    if (value === 12) return box_rare_icon;
    if (value === 13) return box_epic_icon;
    if (value === 14) return box_legend_icon;
    return box_regular_icon;
  };

  const showInventoryToastIfNeeded = () => {
    if (!(viewMode === 'result' && isBox && displayReward)) return;

    const mainIcon = getBoxIconByValue(displayReward.reward_value);
    const allBoxes = [
      { id: 'regular', icon: box_regular_icon, name: 'Regular Box' },
      { id: 'rare', icon: box_rare_icon, name: 'Rare Box' },
      { id: 'epic', icon: box_epic_icon, name: 'Epic Box' },
      { id: 'legend', icon: box_legend_icon, name: 'Legendary Box' },
    ];
    const mainItem = { id: `main-${Date.now()}` , icon: mainIcon, name: 'Box' };
    // Randomly choose between 3-6 items for total count, but cap visible trailing items to 3
    const selectedOtherItems = allBoxes
      .filter(i => i.icon !== mainIcon)
      .sort(() => Math.random() - 0.5)
      .slice(0, Math.floor(Math.random() * 4) + 3); // 3-6 items
    const visibleOtherItems = selectedOtherItems.slice(0, 3);

    inventoryToast.show({
      mainItem,
      otherItems: visibleOtherItems,
      totalCount: selectedOtherItems.length + 1,
      fromCoordinates: { x: window.innerWidth / 2, y: window.innerHeight / 2 },
      fromSize: { width: 180, height: 180 },
      onClick: () => {
        console.log('Open inventory requested from toast');
      },
    });
  };

  const handleSaveToInventory = () => {
    console.log('handleSaveToInventory closeBoxModal');
    showInventoryToastIfNeeded();
    closeBoxModal();
    dispatch(fetchTasks());
    dispatch(fetchProfile());
  };

  const handleModalClose = () => {
    // Trigger toast when closing the modal on the result screen if it's a Box reward
    showInventoryToastIfNeeded();
    closeBoxModal();
  };



  
  // Debug logging (avoid object identity churn)
  useEffect(() => {
    const rewardType = displayReward?.reward_type ?? null;
    const rewardValue = displayReward?.reward_value ?? null;
    console.log('[BoxOpeningModal] State:', {
      viewMode,
      hasSpun,
      rewardType,
      rewardValue,
      actualRewardType: actualReward?.reward_type ?? null,
      actualRewardValue: actualReward?.reward_value ?? null,
      isBox,
      showRevealAnimation,
      wheelSpinState,
      currentBoxId
    });
  }, [
    viewMode,
    hasSpun,
    actualReward?.reward_type,
    actualReward?.reward_value,
    isBox,
    showRevealAnimation,
    wheelSpinState,
    currentBoxId,
    displayReward?.reward_type,
    displayReward?.reward_value,
  ]);

  const getBg = () => {
    if (
      displayReward &&
      displayReward.reward_type === "box" &&
      displayReward.reward_value === 12
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(93, 155, 255, 0.8), rgba(126, 255, 243, 0.6)), url(${boxOpenBg})`,
      };
    }
    if (
      displayReward &&
      displayReward.reward_type === "box" &&
      displayReward.reward_value === 13
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(238, 86, 255, 0.6), rgba(238, 206, 243, 0.5)), url(${boxOpenBg})`,
      };
    }
    if (
      displayReward &&
      displayReward.reward_type === "box" &&
      displayReward.reward_value === 14
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(255, 206, 133, 0.6), rgba(239, 255, 151, 0.5)), url(${boxOpenBg})`,
      };
    }
    if (
      (displayReward &&
      displayReward.reward_type === "box" &&
      displayReward.reward_value === 11) 
    ) {
      return {
        backgroundImage: `linear-gradient(rgba(206, 243, 240, 0.9), rgba(189, 211, 226, 0.95)), url(${boxOpenBg})`,
      };
    }
    return {
      backgroundImage: `linear-gradient(rgba(187, 255, 255, 0.9), rgba(168, 255, 157, 0.9)), url(${boxOpenBg})`,
    };
  };

  return (
        <AnimatedFullscreen
      isOpen={isBoxOpeningModalOpen}
      onClose={handleModalClose}
      backgroundImage={getBg().backgroundImage}
      animationType="scale"
      closeButtonColor="#000"
      disableTabbarToggle={true}
      overlayImage={overlayImage}
      showOverlay={wheelSpinState === "SPINNING" && viewMode === 'wheel'}
    >

     {showTopupConfetti && <Confetti recycle={false} style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} />}
      
      {/* Main Content Area */}
      <div className="flex-1 relative overflow-hidden">
          <>
            {/* Wheel layer (kept mounted). Only show/hide, no scaling */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 0, y: -50, scale: 1.3 }}
              animate={{
                opacity: 1,
                y: viewMode === 'result' ? -30 : 0,
                scale: 1,
              }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              style={{ pointerEvents: viewMode === 'result' ? 'none' : 'auto', zIndex: 1 }}
            >
              <PrizeCarousel
                key={viewMode}
                prizes={viewMode === 'wheel' ? boxContents.prizes : []}
                wheelSpinState={wheelSpinState}
                setSpinState={setWheelSpinState}
                actualReward={displayReward}
                showRevealAnimation={showRevealAnimation}
                onRevealComplete={() => {
                  setShowRevealAnimation(false);
                  console.log('onRevealComplete setShowRevealAnimation false, setHasSpun false, setWheelSpinState IDLE');
                  // Prepare wheel state before switching to avoid immediate flip back to result

                  // Switch to wheel exactly when reveal completes to avoid empty gap
                  if (viewMode === 'result' && currentBoxId !== undefined) {
                    switchView('wheel');
                  }
                }}
                onFinalReward={(reward) => {
                  console.log('[BoxOpeningModal] onFinalReward:', reward);
                  setActualReward(reward as any);
                }}
              />
            </motion.div>


              <motion.div
                className="absolute inset-0 flex items-center justify-center"
                initial={{ opacity: 0, scale: 0.5, y: 50 }}
                animate={{
                  opacity: viewMode === 'result' ? 1 : 0,
                  scale: viewMode === 'result' ? 1 : 0.5,
                  y: viewMode === 'result' ? -30 : 0,
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
                        fontWeight: 700,
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
                          transform: (isBoxOpeningModalOpen) ? 'translate(-50%, -50%) scale(1)' : 'translate(-50%, -50%) scale(0.6)',
                          opacity: (isBoxOpeningModalOpen && isBox) ? 0.7 : (isBoxOpeningModalOpen && !isBox) ? 0.6 : 0,
                          transition: 'all 300ms cubic-bezier(0.34, 1.56, 0.64, 1)',
                          transitionDelay: (isBoxOpeningModalOpen) ? '800ms' : '0ms'
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
            


          </>
      </div>
      {/* EventStack - anchored top-left (adaptive width inside) */}
      <div className="absolute top-20 left-2 z-[11001]">
        <EventStack
          events={events}
          maxVisibleItems={4}
          visible={shouldShowEvents}
          title={'Recent Activity'}
          width={130}
          itemHeight={40}
          gap={6}
          sequentialOnMount={true}
          className="pointer-events-auto"
        />
      </div>


        <div className="absolute bottom-0 left-0 right-0 z-[999] px-4 pb-4">
          <motion.div 
            className="flex flex-col items-center gap-3"
            initial={{ y: -70 }}
            animate={{
              y: (viewMode === 'result' || wheelSpinState === "IDLE") ? 0 : -70,
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
                  maxWidth: 420,
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
                        maxWidth: 420,
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
                        height: 40,
                        background: "white",
                        transform: 'scale(1)',
                        transition: 'transform 200ms ease',
                        marginBottom: '6px',
                        outline: '1px solid rgb(0, 0, 0, 0.15)',

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
                            maxWidth: 420,
                          }}
                        >
                          {t("box_open.button_save_inventory")}
                        </Text>
                      </div>
                    </Button>
                    <Button
                      size="m"
                      stretched={true}
                      mode={"filled"}
                      onClick={handleOpenNow}
                      loading={isSwitchingToWheel || boxContents.isLoading}
                      style={{
                        borderRadius: 25,
                        height: 50,
                        background:
                          displayReward.reward_value === 12
                            ? "rgba(0, 201, 255, 1)"
                            : displayReward.reward_value === 13
                            ? "rgba(112, 0, 203, 1)"
                            : displayReward.reward_value === 14
                            ? "rgba(255, 119, 0, 1)"
                            : undefined,
                        transform: 'scale(1)',
                        transition: 'transform 200ms ease',
                        maxWidth: 420,
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
                        weight="1"

                      >
                        {isSwitchingToWheel || boxContents.isLoading ? 'Loading Box...' : t("box_open.button_open_now")}
                      </Text>
                      <ConfettiParticles count={40} margin={8} padding={8} />
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
                      maxWidth: 420,
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
    </AnimatedFullscreen>
  );
};

export default BoxOpeningModal;
