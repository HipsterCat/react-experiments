import type { InventoryReward } from "../types/rewards";
import { RewardTypeImage } from "./RewardTypeImage";
import useEmblaCarousel from "embla-carousel-react";
import type { Dispatch } from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
    dragFree: false,
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

  const spinStartTimeRef = useRef<number>();
  const lastScrollTimeRef = useRef<number>();

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
        emblaApi.scrollNext();
      }, 2500);

      return clear;
    }

    if (wheelSpinState === "SPINNING") {
      clear();

      console.log("=== SPIN START ===");
      console.log("Current Index:", emblaApi.selectedScrollSnap());

      spinStartTimeRef.current = Date.now();
      lastScrollTimeRef.current = Date.now() - 100; // Start with a gap so first scroll happens immediately

      const spinDuration = 4000 + Math.random() * 1000; // 4-5 seconds

      let scrollCount = 0;
      let lastLogTime = Date.now();

      const animate = () => {
        const now = Date.now();
        const totalElapsed = now - (spinStartTimeRef.current || 0);
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
          emblaApi.scrollNext();
          scrollCount++;
          lastScrollTimeRef.current = now;
          
          const afterIndex = emblaApi.selectedScrollSnap();
          
          // Log every scroll for detailed tracking
          if (scrollCount % 10 === 0 || currentDelay > 200) {
            console.log(`[SCROLL] #${scrollCount}: ${beforeIndex} -> ${afterIndex}, Delay: ${currentDelay.toFixed(1)}ms, TimeSinceLastScroll: ${timeSinceLastScroll.toFixed(1)}ms`);
          }
        }

        // Continue until time is up AND we have minimum scrolls
        const minScrolls = 40;
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

            } catch (e) {
              console.warn("onFinalReward callback failed:", e);
            }
          }
            setSpinState("STOPPED");
          }, 500);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return clear;
  }, [emblaApi, wheelSpinState, setSpinState, prizes, onFinalReward, items.length]);

  return (
    <div className="embla absolute inset-0 flex items-center justify-center overflow-hidden">
      <style>
        {`
          .embla {
            --slide-height: 25vh;
            --slide-spacing: 5px;
            --slide-size: 25vh;
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
            padding-top: var(--slide-spacing);
            padding-bottom: var(--slide-spacing);
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
            
            // Show the provided actualReward for the selected item when either:
            // - we're revealing, or
            // - we're in STOPPED state (e.g., result view placeholder)
            const displayPrize = (isSelected && actualReward && (showRevealAnimation || wheelSpinState === 'STOPPED'))
              ? actualReward
              : prize;

              return (
                <div className="embla__slide" key={`${prize.reward_type}-${prize.reward_value}-${index}`}>
                  <motion.div
                    className="relative will-change-transform will-change-opacity"
                    initial={false}
                    style={{ height: "100%", transformOrigin: "center center" }}
                    animate={{
                      scale: scaleValue,
                      opacity: opacityValue,
                    }}
                    transition={{ 
                      duration: 0.4, 
                      ease: [0.34, 1.56, 0.64, 1]
                    }}
                  >
                    <RewardTypeImage
                      reward={displayPrize}
                      className="w-full h-full"
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

      {wheelSpinState === 'SPINNING' && (
        <svg
          className="absolute top-[50%] left-[50%] z-10 ml-[-140px] mt-[-14px]"
          width="280"
          height="28"
          viewBox="0 0 280 28"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          role="presentation"
        >
          <path
            d="M.75 22.403V5.597c0-2.353 2.585-3.79 4.584-2.547l13.517 8.402c1.889 1.174 1.889 3.922 0 5.096L5.334 24.951C3.335 26.193.75 24.756.75 22.403ZM279.75 22.403V5.597c0-2.353-2.585-3.79-4.584-2.547l-13.517 8.402c-1.889 1.174-1.889 3.922 0 5.096l13.517 8.403c1.999 1.242 4.584-.195 4.584-2.548Z"
            fill="#000"
          />
        </svg>
      )}
    </div>
  );
};