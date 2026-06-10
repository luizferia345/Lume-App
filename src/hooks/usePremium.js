export function usePremium(user) {
  const isPremium = !!user?.user_metadata?.premium;
  const tokens = user?.user_metadata?.tokens ?? 0;
  return { isPremium, tokens };
}
