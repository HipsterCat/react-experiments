import { InventoryReward, ServiceBoxOpenResponse, ServiceBoxContentResponse } from '../types/rewards';

// Mock box data with different reward types
const MOCK_REWARDS: InventoryReward[] = [
  { reward_type: "coins", reward_value: 50 },
  { reward_type: "coins", reward_value: 100 },
  { reward_type: "coins", reward_value: 300 },
  { reward_type: "coins", reward_value: 1000 },
  { reward_type: "usdt", reward_value: 1 },
  { reward_type: "usdt", reward_value: 5 },
  { reward_type: "usdt", reward_value: 30 },
  { reward_type: "box", reward_value: 11 },
  { reward_type: "box", reward_value: 12 }, // rare
  { reward_type: "box", reward_value: 13 }, // epic
  { reward_type: "box", reward_value: 14 }, // legend
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock function to get box contents
export const getBoxContents = async (_boxId: string): Promise<ServiceBoxContentResponse> => {
  await delay(500); // Simulate network delay

  // Filter out some rewards to make it more realistic
  const filteredRewards = MOCK_REWARDS.filter(
    (reward) =>
      reward.reward_type !== "double_balance" &&
      reward.reward_type !== "telegram_premium"
  );

  console.log('getBoxContents', filteredRewards);

  return {
    rewards: [...filteredRewards, ...filteredRewards] // Duplicate for more variety
  };
};

// Mock function to open a box and get a random reward
export const openBox = async (_boxId: string): Promise<ServiceBoxOpenResponse> => {
  await delay(1000); // Simulate network delay for opening
  // Get available rewards (excluding some types)
  const availableRewards = MOCK_REWARDS.filter(
    (reward) =>
      reward.reward_type !== "double_balance" &&
      reward.reward_type !== "telegram_premium"
  );

  // Weighted random selection (coins are more common)
  const weights = availableRewards.map(reward => {
    switch (reward.reward_type) {
      case "coins": return 40; // Most common
      case "usdt": return 15;
      case "box": 
        // Rarer boxes have lower probability
        return reward.reward_value === 14 ? 2 : reward.reward_value === 13 ? 5 : 10;
      default: return 8;
    }
  });

  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  let selectedReward = availableRewards[0];
  for (let i = 0; i < availableRewards.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      selectedReward = availableRewards[i];
      break;
    }
  }

  // If it's a box reward, add extra data for nested box opening
  const extra = selectedReward.reward_type === "box" 
    ? `:${Math.floor(Math.random() * 1000) + 100}` // Random box ID
    : undefined;

  console.log('openBox', selectedReward, extra, totalWeight);
  return {
    reward_type: selectedReward.reward_type,
    reward_value: selectedReward.reward_value,
    extra
  };
};

// Mock function to get random box IDs for demo
export const getRandomBoxId = (): number => {
  return Math.floor(Math.random() * 1000) + 1;
};

// Mock purchase response interface
export interface PurchaseBoxResponse {
  transaction_id: number;
  box_id: number;
}

// Mock function to simulate box purchase
export const purchaseBox = async (): Promise<PurchaseBoxResponse> => {
  await delay(800); // Simulate network delay for purchase
  
  return {
    transaction_id: Math.floor(Math.random() * 10000000) + 10000000, // Random transaction ID
    box_id: getRandomBoxId()
  };
};
