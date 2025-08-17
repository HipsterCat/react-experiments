// Mock types to replace the generated API types
export interface InventoryReward {
  reward_type: string;
  reward_value: number;
}

export interface ServiceBoxOpenResponse {
  extra?: string;
  reward_type: string;
  reward_value: number;
}

export interface ServiceBoxContentResponse {
  rewards: InventoryReward[];
}

export type WheelSpinState = "IDLE" | "SPINNING" | "STOPPED";

export interface PrizeItem {
  reward_type:
    | "coins"
    | "usdt"
    | "ton"
    | "telegram_premium"
    | "double_balance"
    | "box";
  reward_value: number;
}
