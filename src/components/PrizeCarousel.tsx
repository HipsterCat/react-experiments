import type { InventoryReward } from "../types/rewards";
import { RewardTypeImage } from "./RewardTypeImage";
import { findPrizeIndex } from "../utils/findPrizeIndex";
import useEmblaCarousel from "embla-carousel-react";
import type { Dispatch } from "react";
import { useCallback, useEffect, useRef, useState } from "react";

export type WheelSpinState = "IDLE" | "SPINNING" | "STOPPED";

interface PrizeCarouselProps {
  prizes: InventoryReward[];
  wheelSpinState: WheelSpinState;
  actualReward: InventoryReward | null;
  setSpinState: Dispatch<WheelSpinState>;
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
}: PrizeCarouselProps) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    axis: "y",
    loop: true,
    dragFree: false,
    align: "center",
    startIndex: 3,
    watchDrag: false,
  });

  const [selectedIndex, setSelectedIndex] = useState(0);

  const intervalRef = useRef<number>();
  const animationRef = useRef<number>();

  const spinStartTimeRef = useRef<number>();
  const targetIndexRef = useRef<number>();
  const lastScrollTimeRef = useRef<number>();

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

    if (wheelSpinState === "SPINNING" && actualReward) {
      clear();

      console.log("=== SPIN START ===");
      console.log("Actual Reward:", actualReward);
      console.log("Current Index:", emblaApi.selectedScrollSnap());

      const targetIndex = findPrizeIndex({
        prizes,
        targetReward: actualReward,
        currentIndex: emblaApi.selectedScrollSnap(),
      });

      if (targetIndex === null) {
        console.log("No valid prize index found, closing modal");
        setSpinState("STOPPED");
        return clear;
      }

      console.log("Selected target index:", targetIndex);
      console.log("Current index:", emblaApi.selectedScrollSnap());

      targetIndexRef.current = targetIndex;
      spinStartTimeRef.current = Date.now();
      lastScrollTimeRef.current = Date.now();

      const minSpinDuration = 3000;
      const maxSpinDuration = 10000;

      const animate = () => {
        const now = Date.now();
        const totalElapsed = now - (spinStartTimeRef.current || 0);
        const timeSinceLastScroll = now - (lastScrollTimeRef.current || 0);

        const progress = Math.min(totalElapsed / maxSpinDuration, 1);
        const easeProgress = progress * progress;
        const currentDelay = 50 + easeProgress * 800;

        if (
          timeSinceLastScroll < currentDelay &&
          totalElapsed < maxSpinDuration
        ) {
          animationRef.current = requestAnimationFrame(animate);
          return;
        }

        const currentIndex = emblaApi.selectedScrollSnap();
        const nextIndex = (currentIndex + 1) % prizes.length;

        if (
          totalElapsed > minSpinDuration &&
          nextIndex === (targetIndexRef.current || 0)
        ) {
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current);
          }

          emblaApi.scrollNext();
          const onSettle = () => {
            emblaApi.off("settle", onSettle);
            setSpinState("STOPPED");
          };
          emblaApi.on("settle", onSettle);
        } else {
          emblaApi.scrollNext();
          lastScrollTimeRef.current = now;
          animationRef.current = requestAnimationFrame(animate);
        }
      };

      animationRef.current = requestAnimationFrame(animate);
    }

    return clear;
  }, [emblaApi, wheelSpinState, actualReward, setSpinState, prizes]);

  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      <div className="overflow-hidden h-full w-full" ref={emblaRef}>
        <div className="flex flex-col items-center h-full">
          {prizes.map((prize, index) => {
            const distance = getDistance(index, selectedIndex, prizes.length);
            const isCenter = distance === 0 && wheelSpinState === "IDLE";
            const isAdjacent = distance === 1 && wheelSpinState === "IDLE";
            const isFar = distance > 1 && wheelSpinState === "IDLE";
            return (
              <div
                key={`${prize.reward_type}-${prize.reward_value}-${index}`}
                className={`relative ${isCenter ? "scale-120 z-20" : ""} ${isAdjacent ? "opacity-70 z-10" : ""} ${isFar ? "opacity-50 scale-90 z-0" : ""} py-10    will-change-transform will-change-opacity box-content`}
                style={{ width: 165, height: 165 }}
              >
                <RewardTypeImage
                  reward={prize}
                  className="w-full h-full"
                  badgeSize={wheelSpinState === "IDLE" ? "s" : undefined}
                  wheelSpinState={wheelSpinState}
                />
              </div>
            );
          })}
        </div>
      </div>

      {wheelSpinState !== "IDLE" && (
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
