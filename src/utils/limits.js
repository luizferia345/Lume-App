export const FREE_LIMIT = 5;

export const canSendMessage = (count, isPremium, tokens) => {
  if (isPremium) return true;
  return count < FREE_LIMIT || tokens > 0;
};