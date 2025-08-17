import type { InventoryReward } from "../types/rewards";
import clsx from "clsx";
import { useTranslation } from "../hooks/useTranslation";

export function RewardTypeBadge({
  reward,
  className,
  size,
}: {
  reward: InventoryReward;
  className?: string;
  size: "s" | "m";
}) {
  const { t } = useTranslation();

  const getPrizeLabel = (type: string, value: number) => {
    switch (type) {
      case "coins":
        return t("reward_type.coins", { count: value });
      case "usdt":
        return t("reward_type.usdt", { count: value });
      case "ton":
        return t("reward_type.ton", { count: value });
      case "telegram_premium":
        return t("reward_type.telegram_premium");
      case "double_balance":
        return t("reward_type.double_balance");
      case "box":
        return t("reward_type.box");
      default:
        return type;
    }
  };

  return (
    <div
      className={clsx(
        "bg-white rounded-[40px] flex items-center justify-center px-[9px] py-[5px]",
        "text-rounded",
        "font-[800] text-gray-900",
        className,
        size === "s" && "text-[16px]"
      )}
      style={{ boxShadow: "0px 0px 16px rgba(0, 0, 0, 0.2)" }}
    >
      <span>{getPrizeLabel(reward.reward_type, reward.reward_value)}</span>
    </div>
  );
}
