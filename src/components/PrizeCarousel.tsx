import type { InventoryReward } from "../types/rewards";
import { RewardTypeImage } from "./RewardTypeImage";
import useEmblaCarousel from "embla-carousel-react";
import type { Dispatch } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

export type WheelSpinState = "IDLE" | "SPINNING" | "STOPPED";

interface PrizeCarouselProps {
  prizes: InventoryReward[];
  wheelSpinState: WheelSpinState;
  actualReward: InventoryReward | null;
  setSpinState: Dispatch<WheelSpinState>;
  showRevealAnimation?: boolean;
  onRevealComplete?: () => void;
  onFinalReward?: (reward: InventoryReward) => void;
}

function getDistance(a: number, b: number, length: number): number {
  const direct = Math.abs(a - b);
  return Math.min(direct, length - direct);
}

export const PrizeCarousel = ({
  prizes,
  wheelSpinState,
  actualReward,
  setSpinState,
  showRevealAnimation,
  onRevealComplete,
  onFinalReward,
}: PrizeCarouselProps) => {
  // Use a fallback list so we can display a single reward (like a box)
  // in result mode before the real prizes are loaded.
  const items = prizes.length > 0 ? prizes : (actualReward ? [actualReward] : []);

  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: true,
    dragFree: true,
    align: "center",
    startIndex: 0,
    watchDrag: false,
    skipSnaps: false,
    containScroll: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);
  // const prevItemsLengthRef = useRef<number>(items.length);

  const intervalRef = useRef<number>();
  const animationRef = useRef<number>();
  const animateFnRef = useRef<(() => void) | null>(null);

  const spinStartTimeRef = useRef<number>();
  const lastScrollTimeRef = useRef<number>();
  const hasSpunRef = useRef<boolean>(false);
  const spinDurationRef = useRef<number>(0);
  const pausedSinceRef = useRef<number | null>(null);
  const totalPausedMsRef = useRef<number>(0);

  // Debug logging
  useEffect(() => {
    console.log('[PrizeCarousel] State:', {
      selectedIndex,
      wheelSpinState,
      showRevealAnimation,
      actualReward
    });
  }, [selectedIndex, wheelSpinState, showRevealAnimation, actualReward]);

  // Track if the selected reward image finished loading to end reveal precisely
  const [selectedLoaded, setSelectedLoaded] = useState(false);
  useEffect(() => {
    if (!showRevealAnimation) setSelectedLoaded(false);
  }, [showRevealAnimation]);

  useEffect(() => {
    if (!showRevealAnimation || !onRevealComplete) return;
    if (!selectedLoaded) return;
    const timer = setTimeout(() => {
      onRevealComplete();
      console.log('[PrizeCarousel] onRevealComplete');
    }, 50);
    return () => clearTimeout(timer);
  }, [showRevealAnimation, onRevealComplete, selectedLoaded]);

  // Fallback: in case image load event misses (cache edge), finish reveal after a short delay
  useEffect(() => {
    if (!showRevealAnimation || !onRevealComplete) return;
    const fallback = setTimeout(() => {
      if (!selectedLoaded) {
        console.log('[PrizeCarousel] onRevealComplete (fallback)');
        onRevealComplete();
      }
    }, 900);
    return () => clearTimeout(fallback);
  }, [showRevealAnimation, onRevealComplete, selectedLoaded]);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    return () => {
      emblaApi.off("select", onSelect);
    };
  }, [emblaApi, onSelect]);

  // Removed forced re-centering to avoid index jumps after reveal

  useEffect(() => {
    const clear = () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };

    if (!emblaApi) return clear;

    if (wheelSpinState === "IDLE") {
      intervalRef.current = window.setInterval(() => {
        emblaApi.scrollPrev();
      }, 2000);

      return clear;
    }

    if (wheelSpinState === "SPINNING") {
      clear();
      hasSpunRef.current = true;

      console.log("=== SPIN START ===");
      console.log("Current Index:", emblaApi.selectedScrollSnap());

      spinStartTimeRef.current = Date.now();
      totalPausedMsRef.current = 0;
      pausedSinceRef.current = null;
      lastScrollTimeRef.current = Date.now() - 100; // Start with a gap so first scroll happens immediately

      const spinDuration = 4000 + Math.random() * 1000; // 4-5 seconds
      spinDurationRef.current = spinDuration;

      let scrollCount = 0;
      let lastLogTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const totalElapsed = now - (spinStartTimeRef.current || 0) - (totalPausedMsRef.current || 0);
        const timeSinceLastScroll = now - (lastScrollTimeRef.current || 0);

        // Calculate progress with smooth easing
        const progress = Math.min(totalElapsed / spinDuration, 1);
        
        // Use much gentler quadratic easing for gradual slowdown
        const easedProgress = progress * progress;
        
        // Calculate current delay based on eased progress
        // Start with minDelay (fast), end with maxDelay (slow)
        const minDelay = 10;
        const maxDelay = 400; // Reduced max delay
        const currentDelay = minDelay + (maxDelay - minDelay) * easedProgress;

        // Debug logging every 500ms
        if (now - lastLogTime > 500) {
          console.log(`[SPIN DEBUG] Elapsed: ${totalElapsed}ms/${spinDuration}ms, Progress: ${(progress * 100).toFixed(1)}%, EasedProgress: ${(easedProgress * 100).toFixed(1)}%, CurrentDelay: ${currentDelay.toFixed(1)}ms, ScrollCount: ${scrollCount}, CurrentIndex: ${emblaApi.selectedScrollSnap()}, PrizeLength: ${items.length}`);
          lastLogTime = now;
        }

        if (timeSinceLastScroll >= currentDelay) {
          const beforeIndex = emblaApi.selectedScrollSnap();
          emblaApi.scrollPrev();
          scrollCount++;
          lastScrollTimeRef.current = now;
          
          const afterIndex = emblaApi.selectedScrollSnap();
          
          // Log every scroll for detailed tracking
          if (scrollCount % 10 === 0 || currentDelay > 200) {
            console.log(`[SCROLL] #${scrollCount}: ${beforeIndex} -> ${afterIndex}, Delay: ${currentDelay.toFixed(1)}ms, TimeSinceLastScroll: ${timeSinceLastScroll.toFixed(1)}ms`);
          }
        }

        // Continue until time is up AND we have minimum scrolls
        const minScrolls = 35;
        if (totalElapsed < spinDuration || scrollCount < minScrolls) {
          animationRef.current = requestAnimationFrame(animate);
        } else {
          // Stop at current position
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }

          const finalIndex = emblaApi.selectedScrollSnap();
          console.log(`[SPIN END] Total scrolls: ${scrollCount}, Final index: ${finalIndex}, Total rotations: ${(scrollCount / prizes.length).toFixed(2)}`);
          console.log("Prize at index:", prizes[finalIndex]);
          // Report final reward to parent BEFORE stopping so it can react immediately
          window.setTimeout(() => {
          if (onFinalReward) {
            try {
              onFinalReward(prizes[finalIndex]);
              setSelectedIndex(finalIndex);
              console.log("onFinalReward", prizes[finalIndex], "finalIndex", finalIndex);

            } catch (e) {
              console.warn("onFinalReward callback failed:", e);
            }
          }
            setSpinState("STOPPED");
          }, 500);
        }
      };

      animateFnRef.current = animate;
      animationRef.current = requestAnimationFrame(animate);
    }

    return clear;
  }, [emblaApi, wheelSpinState, setSpinState, prizes, onFinalReward, items.length]);

  // Pause/resume scrolling and spinning based on page visibility
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!emblaApi) return;
      if (document.hidden) {
        // Pause any ongoing animations/intervals
        if (animationRef.current) cancelAnimationFrame(animationRef.current);
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (wheelSpinState === 'SPINNING') {
          pausedSinceRef.current = Date.now();
        }
      } else {
        // Resume depending on state
        if (wheelSpinState === 'SPINNING') {
          if (pausedSinceRef.current) {
            totalPausedMsRef.current += Date.now() - pausedSinceRef.current;
            pausedSinceRef.current = null;
          }
          if (animateFnRef.current) {
            animationRef.current = requestAnimationFrame(animateFnRef.current);
          }
        } else if (wheelSpinState === 'IDLE') {
          // Restart idle gentle scroll
          if (intervalRef.current) clearInterval(intervalRef.current);
          intervalRef.current = window.setInterval(() => {
            emblaApi.scrollPrev();
          }, 2000);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [emblaApi, wheelSpinState]);

  return (
    <div className="embla absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>
        {`
          .embla {
            --slide-height: max(160px, min(200px, 25vh));
            --slide-spacing: 5px;
            --slide-size: max(160px, min(200px, 25vh));
          }
          .embla__viewport {
            overflow: hidden;
            height: 100%;
            width: 100%;
          }
          .embla__container {
            display: flex;
            touch-action: pan-x pinch-zoom;
            height: 100%;
            flex-direction: column;
            will-change: transform;
            will-change: opacity;
          }
          .embla__slide {
            transform: translate3d(0, 0, 0);
            flex: 0 0 var(--slide-size);
            min-height: 0;
            display: flex;
            align-items: center;
            justify-content: center;
          }
        `}
      </style>
      
      <div className="embla__viewport" ref={emblaRef}>
        <div className="embla__container">
          {(() => {
            const normalizedSelectedIndex = items.length > 0 
              ? ((selectedIndex % items.length) + items.length) % items.length 
              : 0;
            return items.map((prize, index) => {
              const distance = getDistance(index, normalizedSelectedIndex, items.length);
              const isCenter = distance === 0;
              const isSelected = index === normalizedSelectedIndex;
            
            // When revealing, always show the selected item prominent regardless of spin state
            const isRevealSelected = Boolean(showRevealAnimation && isSelected);

            // Calculate animation values
            const scaleValue = isRevealSelected ? 1.0 :
                              wheelSpinState === "IDLE" && isCenter ? 1.0 : 
                              wheelSpinState === "IDLE" && distance === 1 ? 0.7 :
                              wheelSpinState === "IDLE" && distance > 1 ? 0.7 :
                              wheelSpinState === "IDLE" && distance === 0 ? 1.0 :
                              wheelSpinState === "STOPPED" && isCenter ? 1.0 :
                              wheelSpinState === "STOPPED" && !isCenter ? 0 : 
                              wheelSpinState === "SPINNING" ? 0.7 : 1.0;
            
            const opacityValue = isRevealSelected ? 1 :
                                wheelSpinState === "IDLE" && distance === 1 ? 1.0 :
                                wheelSpinState === "IDLE" && distance > 1 ? 0.8 :
                                wheelSpinState === "IDLE" && distance === 0 ? 1.0 :
                                wheelSpinState === "STOPPED" && !isCenter ? 0 : 1;

            // Rotation logic for IDLE state:
            // - Items before the centered item: -5deg
            // - Items after the centered item: +5deg
            // - Centered item: 0deg
            const relativePosition = (index - normalizedSelectedIndex + items.length) % items.length;
            const isBefore = distance !== 0 && relativePosition > items.length / 2;
            const isAfter = distance !== 0 && !isBefore;
            const rotationValue = wheelSpinState === "IDLE"
              ? ((isCenter || isSelected) ? 0 : (isAfter ? 7 : -7))
              : 0;
            
            // Debug logging for visibility issues
            if (wheelSpinState === "STOPPED" && isSelected) {
              console.log(`[PrizeCarousel] STOPPED state - Selected item ${index}:`, {
                isCenter,
                isSelected,
                distance,
                selectedIndex: normalizedSelectedIndex,
                wheelSpinState,
                showRevealAnimation,
                scaleValue,
                opacityValue
              });
            }
            
            if (scaleValue === 1.0 && opacityValue === 1.0) {
              console.log("Selected key", `${prize.reward_type}-${prize.reward_value}-${index}`, "isSelected", isSelected, "actualReward", actualReward, "showRevealAnimation", showRevealAnimation, "wheelSpinState", wheelSpinState, "scaleValue", scaleValue, "opacityValue", opacityValue);
            }
            // Show the provided actualReward for the selected item when either:
            // - we're revealing, or
            // - we're in STOPPED state (e.g., result view placeholder)
            const displayPrize = (isSelected && actualReward && (showRevealAnimation || wheelSpinState === 'STOPPED'))
              ? actualReward
              : prize;

              return (
                // console.log("wheelSpinState", wheelSpinState, "scaleValue", scaleValue, "opacityValue", opacityValue, "key", `${prize.reward_type}-${prize.reward_value}-${index}`),
                <div className="embla__slide" key={`${prize.reward_type}-${prize.reward_value}-${index}`}>
                  <motion.div
                    className="relative will-change-transform will-change-opacity"
                    initial={false}
                    style={{ height: "100%", aspectRatio: "1/1", transformOrigin: "center center" }}
                    animate={{
                      scale: scaleValue,
                      opacity: opacityValue,
                      rotate: rotationValue,
                    }}
                    transition={{ 
                      type: 'spring',
                      stiffness: 220,
                      damping: 24,
                      mass: 1.5,
                    }}
                  >
                    <RewardTypeImage
                      reward={displayPrize}
                      className="w-full h-full aspect-square"
                      badgeSize={wheelSpinState === 'SPINNING' ? undefined : (wheelSpinState === 'STOPPED' && (isCenter || isSelected)) ? 'm' : 's'}
                      wheelSpinState={wheelSpinState}
                      onLoaded={isRevealSelected ? () => setSelectedLoaded(true) : undefined}
                    />
                  </motion.div>
                </div>
              );
            });
          })()}
        </div>
      </div>

      {(() => {
        // Simple opacity animation: 0 -> 1 (spinning) -> 0 (stopped)
        const targetOpacity = wheelSpinState === 'SPINNING' ? 1 : 0;
        
        // Gap between arrows: 0 by default (middle), increase when spinning
        const gap = wheelSpinState === 'SPINNING' ? '190px' : '10px'; // px gap between arrows
        console.log("gap", gap, "wheelSpinState", wheelSpinState);
        return (
       <motion.div 
            className="pointer-events-none absolute inset-0 flex items-center justify-center z-[-2]"
            animate={{ 
              gap: gap,
              opacity: targetOpacity 
            }}
            transition={{ 
              duration: 0.4, 
              ease: "easeInOut"
            }}
          >
            {/* Left pointer */}
            <svg
              aria-hidden="true"
              width="20"
              height="24"
              viewBox="0 0 20 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="presentation"
            >
              <path d="M0 20.535V3.46502C0 1.09775 2.61346 -0.336891 4.61063 0.934038L18.0227 9.46902C19.8752 10.6479 19.8752 13.3521 18.0227 14.531L4.61063 23.066C2.61345 24.3369 0 22.9023 0 20.535Z" fill="black"/>
            </svg>

            {/* Right pointer */}
            <svg
              aria-hidden="true"
              width="20"
              height="24"
              viewBox="0 0 20 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              role="presentation"
            >
              <path d="M20 20.535V3.46502C20 1.09775 17.3865 -0.336891 15.3894 0.934038L1.97726 9.46902C0.124763 10.6479 0.124767 13.3521 1.97726 14.531L15.3894 23.066C17.3865 24.3369 20 22.9023 20 20.535Z" fill="black"/>
            </svg>
          </motion.div>
        );
      })()}
    </div>
  );
};