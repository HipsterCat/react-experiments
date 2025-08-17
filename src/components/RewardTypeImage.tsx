
import coin_1000_icon from "../assets/boxes/rewards/reward_coins_1000.webp";
import coin_100_icon from "../assets/boxes/rewards/reward_coins_100.webp";
import coin_300_icon from "../assets/boxes/rewards/reward_coins_300.webp";
import coin_50_icon from "../assets/boxes/rewards/reward_coins_50.webp";
import usdt_1_icon from "../assets/boxes/rewards/reward_usdt_1.webp";
import usdt_20_icon from "../assets/boxes/rewards/reward_usdt_20.webp";
import usdt_50_icon from "../assets/boxes/rewards/reward_usdt_50.webp";
import question_icon from "../assets/boxes/rewards/question.webp";
import telegram_icon from "../assets/boxes/rewards/telegram.webp";
import box_epic_icon from "../assets/boxes/rewards/box_epic.webp";
import box_legend_icon from "../assets/boxes/rewards/box_legend.webp";
import box_rare_icon from "../assets/boxes/rewards/box_rare.webp";
import box_regular_icon from "../assets/boxes/rewards/box_regular.webp";
import type { InventoryReward } from "../types/rewards";
import { RewardTypeBadge } from "./RewardTypeBadge";
import clsx from "clsx";
import { RewardBoxRareBadge } from "./RewardBoxRareBadge";
import { WheelSpinState } from "./PrizeCarousel";
import { useEffect, useRef } from "react";

const getRewardIcon = (
  reward: InventoryReward
): { icon: string; sPosition: string } => {
  switch (reward.reward_type) {
    case "coins":
      return {
        icon:
          reward.reward_value >= 1000
            ? coin_1000_icon
            : reward.reward_value >= 300
            ? coin_300_icon
            : reward.reward_value >= 100
            ? coin_100_icon
            : reward.reward_value >= 50
            ? coin_50_icon
            : coin_50_icon,
        sPosition: "rotate-2 left-6 bottom",
      };
    case "usdt":
      return {
        icon:
          reward.reward_value >= 50
            ? usdt_50_icon
            : reward.reward_value >= 20
            ? usdt_20_icon
            : usdt_1_icon,
        sPosition: "-rotate-3 right-2 bottom-2",
      };
    case "ton":
    case "telegram_premium":
      return { icon: telegram_icon, sPosition: "rotate-3 left-0 bottom-2" };
    case "double_balance":
      return { icon: question_icon, sPosition: "-rotate-5 right-0 bottom-0" };
    case "box":
      return {
        icon:
          reward.reward_value === 12
            ? box_rare_icon
            : reward.reward_value === 13
            ? box_epic_icon
            : reward.reward_value === 14
            ? box_legend_icon
            : box_regular_icon,
        sPosition: "rotate-5 -left-2 bottom-1",
      };
    default:
      return { icon: "", sPosition: "" };
  }
};

export function RewardTypeImage({
  reward,
  className,
  badgeSize,
  wheelSpinState,
  onLoaded,
}: {
  reward: InventoryReward;
  className: string;
  badgeSize?: "s" | "m";
  wheelSpinState?: WheelSpinState;
  onLoaded?: () => void;
}) {
  const { icon, sPosition } = getRewardIcon(reward);
  const imgRef = useRef<HTMLImageElement | null>(null);

  // If image is already cached/loaded, fire onLoaded immediately when icon changes
  useEffect(() => {
    if (!onLoaded) return;
    const img = imgRef.current;
    if (img && img.complete) {
      onLoaded();
    }
  }, [icon, onLoaded]);

  return (
    <div className={clsx(className, "relative")}>
      <img
        ref={imgRef}
        src={icon}
        alt=""
        className="w-full h-full"
        onLoad={onLoaded}
        onError={onLoaded}
      />
      {wheelSpinState !== 'SPINNING' && <RewardBoxRareBadge reward={reward} />}
      {badgeSize !== null && ((badgeSize === "s" && reward.reward_type !== "box") || badgeSize === "m") && (
        <RewardTypeBadge
          reward={reward}
          size={badgeSize}
          className={clsx(
            badgeSize === "s" && `absolute bottom-0 ${sPosition}`,
            badgeSize === "m" && "mt-5 absolute -bottom-20 left-1/2 transform -translate-x-1/2"
          )}
        />
      )}
    </div>
  );
}
