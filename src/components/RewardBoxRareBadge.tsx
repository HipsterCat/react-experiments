import type { InventoryReward } from "../types/rewards";
import clsx from "clsx";
import { useTranslation } from "../hooks/useTranslation";

export function RewardBoxRareBadge({ reward }: { reward: InventoryReward }) {
  const { t } = useTranslation();

  const getBoxRareLabel = (value: number) => {
    switch (value) {
      case 12:
        return t("reward_type.box_rare");
      case 13:
        return t("reward_type.box_epic");
      case 14:
        return t("reward_type.box_legend");

      default:
        return null;
    }
  };

  if (reward.reward_type !== "box") return null;

  return (
    <div
      className={clsx(
        "rounded-[40px] flex items-center justify-center px-[9px] py-[5px] absolute",
        "text-rounded",
        "-rotate-5 -right-2 bottom-1",
        "font-[800]",
        reward.reward_value === 14 ? "text-gray-900 " : "text-white"
      )}
      style={{
        boxShadow: "0px 0px 16px rgba(0, 0, 0, 0.2)",
        background:
          reward.reward_value === 12
            ? "linear-gradient(180deg, #00D1ED 0%, #0D31FF 100%)"
            : reward.reward_value === 13
            ? "linear-gradient(180deg, #BE1DE6 0%, #510DFF 100%)"
            : reward.reward_value === 14
            ? "linear-gradient(180deg, #FFFF00 0%, #FF9900 100%)"
            : "white",
      }}
    >
      <span>{getBoxRareLabel(reward.reward_value)}</span>
    </div>
  );
}
