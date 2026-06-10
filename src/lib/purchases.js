let Purchases;
try {
  Purchases = require('react-native-purchases');
} catch (error) {
  Purchases = null;
}

import { REVENUECAT_API_KEY } from '../config/env';

if (typeof REVENUECAT_API_KEY === 'undefined') {
  console.warn('[Purchases] Variável REVENUECAT_API_KEY não configurada em src/config/env.js');
}

export const isPurchasesAvailable = () => !!Purchases;

export const initPurchases = async () => {
  if (!Purchases) {
    console.warn('[Purchases] react-native-purchases não está disponível. Use um build customizado ou retire o módulo.');
    return;
  }
  try {
    if (!REVENUECAT_API_KEY?.startsWith('public')) {
      console.warn('[Purchases] Chave do RevenueCat inválida. Configure sua chave pública.');
      return;
    }
    await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
  } catch (error) {
    console.warn('[Purchases] Falha ao inicializar:', error?.message || error);
  }
};

export const fetchOfferings = async () => {
  if (!Purchases) return null;
  try {
    const offerings = await Purchases.getOfferings();
    return offerings;
  } catch (error) {
    console.warn('[Purchases] Falha ao buscar ofertas:', error?.message || error);
    return null;
  }
};

export const purchasePackage = async (pkg) => {
  if (!Purchases) throw new Error('Compras não disponíveis neste ambiente');
  try {
    return await Purchases.purchasePackage(pkg);
  } catch (error) {
    throw error;
  }
};

export const restorePurchases = async () => {
  if (!Purchases) return null;
  try {
    return await Purchases.restorePurchases();
  } catch (error) {
    console.warn('[Purchases] Falha ao restaurar compras:', error?.message || error);
    return null;
  }
};
