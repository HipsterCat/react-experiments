// Mock translation hook to replace react-i18next
export const useTranslation = () => {
  const translations: Record<string, string> = {
    "box_open.you_ve_got": "You've got",
    "box_open.button_reveal_reward": "Reveal Reward",
    "box_open.button_open_now": "Open Now",
    "box_open.button_save_inventory": "Save to Inventory", 
    "box_open.later_open_later_inventory": "You can open this later from your inventory",
    "common.button_continue": "Continue",
    "profilePage.dailyModal.error": "Something went wrong",
    "reward_type.coins": "{{count}} COINS",
    "reward_type.usdt": "{{count}} USDT",
    "reward_type.ton": "{{count}} TON",
    "reward_type.telegram_premium": "Telegram Premium",
    "reward_type.double_balance": "Double Balance",
    "reward_type.box": "LOOT BOX",
    "reward_type.box_rare": "RARE",
    "reward_type.box_epic": "EPIC", 
    "reward_type.box_legend": "LEGENDARY",
    "reward_type.box_basic": "BASIC",
  };

  const t = (key: string, options?: { count?: number }) => {
    let translation = translations[key] || key;
    
    if (options?.count !== undefined) {
      translation = translation.replace('{{count}}', options.count.toString());
    }
    
    return translation;
  };

  return { t };
};
