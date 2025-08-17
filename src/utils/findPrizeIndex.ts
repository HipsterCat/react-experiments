import type { InventoryReward } from "../types/rewards";

interface FindPrizeIndexParams {
  prizes: InventoryReward[];
  targetReward: InventoryReward;
  currentIndex: number;
}

/**
 * Finds the index of the closest prize to the target reward.
 * For coins, finds the closest value.
 * For other rewards, finds exact match.
 * Always tries to find the next occurrence after current position.
 * Returns null if no valid index is found.
 */
export function findPrizeIndex({
  prizes,
  targetReward,
  currentIndex,
}: FindPrizeIndexParams): number | null {
  // Find all indices of matching prizes
  const targetIndices = prizes.reduce<number[]>((acc, prize, index) => {
    if (targetReward.reward_type === "coins") {
      if (prize.reward_type === "coins") {
        acc.push(index);
      }
    } else if (prize.reward_type === targetReward.reward_type) {
      // For other rewards, we might have multiple items of same type with different values.
      // e.g. TON 1, TON 10, TON 100. So we need to match value as well.
      if (prize.reward_value === targetReward.reward_value) {
        acc.push(index);
      }
    }
    return acc;
  }, []);

  if (targetIndices.length === 0) {
    return null;
  }

  if (targetReward.reward_type === "coins") {
    // Find the closest coin value
    const currentValue = targetReward.reward_value;

    // First find the index with the closest value among all coin prizes
    const closestIndexOverall = targetIndices.reduce((closest, index) => {
      const currentDiff = Math.abs(prizes[index].reward_value - currentValue);
      const closestDiff = Math.abs(prizes[closest].reward_value - currentValue);
      return currentDiff < closestDiff ? index : closest;
    }, targetIndices[0]);

    const closestValue = prizes[closestIndexOverall].reward_value;

    const allIndicesForClosestValue = targetIndices.filter(
      (index) => prizes[index].reward_value === closestValue
    );

    // Try to find the next occurrence of this value after current position
    const nextIndex = allIndicesForClosestValue.find(
      (index) => index > currentIndex
    );

    return nextIndex ?? allIndicesForClosestValue[0];
  }

  // For non-coin rewards, find the next exact match after current position
  const nextIndex = targetIndices.find((index) => index > currentIndex);
  return nextIndex ?? targetIndices[0];
}
