export const REWARD_TITLES_BY_STAMP = {
  1: "Free Topping (Single topping)",
  2: "Free Cup Upgrade",
  3: "Free Yogurt Small Cup",
  4: "Free Spin (1 spin)",
  5: "Voucher SGD 5",
  6: "Free Topping (Choose 2)",
  7: "Free Cup Upgrade (Double toppings)",
  8: "Voucher SGD 10",
  9: "Surprise Treat",
  10: "Big Reward: Free Yogurt Medium Cup + Voucher SGD 15",
};

export function normalizeSingaporePhone(input) {
  const digits = String(input || "").replace(/\D/g, "");
  if (digits.length === 8) return `+65${digits}`;
  if (digits.length === 10 && digits.startsWith("65")) return `+${digits}`;
  if (digits.length === 9 && digits.startsWith("0")) return `+65${digits.slice(1)}`;
  throw new Error("Please enter a valid Singapore phone number.");
}
