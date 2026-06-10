let GoogleMobileAds;
try {
  GoogleMobileAds = require('react-native-google-mobile-ads');
} catch (error) {
  GoogleMobileAds = null;
}

const getMobileAds = () => {
  if (!GoogleMobileAds) return null;
  return GoogleMobileAds.default || GoogleMobileAds;
};

export const isAdsAvailable = () => !!getMobileAds();

export const initializeAds = async () => {
  const mobileAds = getMobileAds();
  if (!mobileAds) {
    console.warn('[Ads] react-native-google-mobile-ads não está disponível. Use um build customizado ou retire o módulo.');
    return;
  }
  try {
    await mobileAds().initialize();
  } catch (error) {
    console.warn('[Ads] Falha ao inicializar anúncios:', error?.message || error);
  }
};

export const createRewardedAd = () => {
  const mobileAds = getMobileAds();
  if (!mobileAds) return null;
  const { RewardedAd, TestIds } = mobileAds;
  try {
    return RewardedAd.createForAdRequest(TestIds.REWARDED, {
      requestNonPersonalizedAdsOnly: true,
    });
  } catch (error) {
    console.warn('[Ads] Falha ao criar RewardedAd:', error?.message || error);
    return null;
  }
};
