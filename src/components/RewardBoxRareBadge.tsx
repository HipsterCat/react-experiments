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
      case 11:
        return t("reward_type.box_basic");
      default:
        return t("reward_type.box_basic");
    }
  };

  if (reward.reward_type !== "box") return null;

  return (
    <div
      className={clsx(
        "rounded-[40px] flex items-center justify-center px-[9px] py-[5px] absolute",
        "text-rounded",
        "-rotate-3 -left-2 top-3",
        "font-[800]",
        reward.reward_value === 14 ? "text-black " : "text-white"
      )}
      style={{
        border: "0.5px solid rgba(255, 255, 255, 0.70)",
        boxShadow: "0px 0px 10px rgba(0, 0, 0, 0.2)",
        background:
          reward.reward_value === 12
            ? "linear-gradient(180deg, #00D1ED 0%, #0D31FF 100%)"
            : reward.reward_value === 13
            ? "linear-gradient(180deg, #BE1DE6 0%, #510DFF 100%)"
            : reward.reward_value === 14
            ? "linear-gradient(180deg, #FFFF00 0%, #FF9900 100%)"
            : reward.reward_value === 11
            ? "linear-gradient(180deg, #CDCDCD 0%, #707070 100%)"
            : "linear-gradient(180deg, #CDCDCD 0%, #707070 100%)",
      }}
    >
      <span>{getBoxRareLabel(reward.reward_value)}</span>
    </div>
  );
}
