import coin_icon from "../assets/boxes/rewards/coin.webp";
import coin_1000_icon from "../assets/boxes/rewards/coins_1000.webp";
import coin_100_icon from "../assets/boxes/rewards/coins_100.webp";
import coin_300_icon from "../assets/boxes/rewards/coins_300.webp";
import dollar_icon from "../assets/boxes/rewards/dollar.png";
import dollars_stack_icon from "../assets/boxes/rewards/dollars_stack.png";
import mystery_box_icon from "../assets/boxes/rewards/mystery_box.png";
import question_icon from "../assets/boxes/rewards/question.png";
import telegram_icon from "../assets/boxes/rewards/telegram.png";
import box_epic_icon from "../assets/boxes/rewards/box_epic.webp";
import box_legend_icon from "../assets/boxes/rewards/box_legend.webp";
import box_rare_icon from "../assets/boxes/rewards/box_rare.webp";
import box_regular_icon from "../assets/boxes/rewards/box_regular.webp";
import type { InventoryReward } from "../api/generated";
import { RewardTypeBadge } from "./RewardTypeBadge";
import clsx from "clsx";
import { RewardBoxRareBadge } from "./RewardBoxRareBadge";
import { WheelSpinState } from "./PrizeCarousel";

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
            ? coin_icon
            : coin_icon,
        sPosition: "-rotate-2 right-4 bottom-3",
      };
    case "usdt":
    case "ton":
      return reward.reward_value > 1
        ? { icon: dollars_stack_icon, sPosition: "rotate-2 left-4 bottom-2" }
        : { icon: dollar_icon, sPosition: "-rotate-2 right-4 bottom-2" };
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
        sPosition: "-rotate-5 -right-2 bottom-1",
      };
    default:
      return { icon: mystery_box_icon, sPosition: "" };
  }
};

export function RewardTypeImage({
  reward,
  className,
  badgeSize,
  wheelSpinState,
}: {
  reward: InventoryReward;
  className: string;
  badgeSize?: "s" | "m";
  wheelSpinState?: WheelSpinState;
}) {
  const { icon, sPosition } = getRewardIcon(reward);

  return (
    <div className={clsx(className, "relative")}>
      <img src={icon} alt="" className="w-full h-full" />
      {!wheelSpinState && <RewardBoxRareBadge reward={reward} />}
      {badgeSize != null && (
        <RewardTypeBadge
          reward={reward}
          size={badgeSize}
          className={clsx(
            badgeSize === "s" && `absolute bottom-0 ${sPosition}`,
            badgeSize === "m" && "mt-5"
          )}
        />
      )}
    </div>
  );
}
