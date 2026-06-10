import React, { useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { theme } from '../theme';
import { signOut, updateUserMetadata } from '../lib/supabase';
import { fetchOfferings, purchasePackage, restorePurchases } from '../lib/purchases';

const OPTIONS = [
  { icon: '🔒', label: 'Privacidade', sub: 'Seus dados são protegidos' },
  { icon: '📄', label: 'Exportar dados', sub: 'Baixar histórico do seu bem-estar' },
  { icon: '❓', label: 'Suporte', sub: 'Dúvidas ou ajuda rápida' },
  { icon: '⚙️', label: 'Preferências', sub: 'Ajustar notificações e tema' },
];

export default function ProfileScreen({ user }) {
  const [loading, setLoading] = useState(false);
  const [offerings, setOfferings] = useState(null);
  const [restoring, setRestoring] = useState(false);
  const tokens = user?.user_metadata?.tokens ?? 0;
  const isPremium = user?.user_metadata?.premium ?? false;

  useEffect(() => {
    const loadOfferings = async () => {
      const data = await fetchOfferings();
      setOfferings(data);
    };
    loadOfferings();
  }, []);

  const getPackageLabel = (identifier, defaultLabel) => {
    const pkg = offerings?.current?.availablePackages?.find((item) =>
      item.identifier?.includes(identifier) || item.storeProduct?.identifier?.includes(identifier)
    );
    return pkg;
  };

  const tokenPackage = getPackageLabel('token', 'tokens');
  const premiumPackage = getPackageLabel('premium', 'premium');

  const handleBuyTokens = async () => {
    if (!tokenPackage) {
      Alert.alert('Oferta indisponível', 'Nenhum pacote de tokens foi encontrado. Verifique sua configuração do RevenueCat.');
      return;
    }

    setLoading(true);
    try {
      await purchasePackage(tokenPackage);
      const nextTokens = tokens + 10;
      const { error } = await updateUserMetadata({ tokens: nextTokens });
      if (error) throw error;
      Alert.alert('Sucesso', 'Você recebeu +10 tokens.');
    } catch (error) {
      if (error?.code === 'PURCHASE_CANCELLED_ERROR') {
        return;
      }
      Alert.alert('Erro', error?.message || 'Não foi possível completar a compra de tokens.');
    } finally {
      setLoading(false);
    }
  };

  const handleActivatePremium = async () => {
    if (!premiumPackage) {
      Alert.alert('Oferta indisponível', 'Nenhum pacote premium foi encontrado. Verifique sua configuração do RevenueCat.');
      return;
    }

    setLoading(true);
    try {
      await purchasePackage(premiumPackage);
      const nextTokens = tokens + 20;
      const { error } = await updateUserMetadata({ premium: true, tokens: nextTokens });
      if (error) throw error;
      Alert.alert('Sucesso', 'Premium ativado e +20 tokens adicionados!');
    } catch (error) {
      if (error?.code === 'PURCHASE_CANCELLED_ERROR') {
        return;
      }
      Alert.alert('Erro', error?.message || 'Não foi possível ativar o premium.');
    } finally {
      setLoading(false);
    }
  };

  const handleRestorePurchases = async () => {
    setRestoring(true);
    try {
      await restorePurchases();
      Alert.alert('Restaurado', 'Suas compras foram restauradas com sucesso.');
    } catch (error) {
      Alert.alert('Erro', 'Não foi possível restaurar as compras.');
    } finally {
      setRestoring(false);
    }
  };

  const handleSignOut = () =>
    Alert.alert('Sair', 'Deseja sair da sua conta?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Sair', style: 'destructive', onPress: signOut },
    ]);

  return (
    <ScrollView style={p.screen} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={p.headerCard}>
        <View style={p.avatar}>
          <Text style={p.avatarEmoji}>🧠</Text>
        </View>
        <View style={p.profileInfo}>
          <Text style={p.name}>{user.email.split('@')[0]}</Text>
          <Text style={p.email}>{user.email}</Text>
          <Text style={p.since}>
            Membro desde {new Date(user.created_at).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
          </Text>
        </View>
      </View>

      <View style={p.premiumCard}>
        <View style={p.premiumLabel}>
          <Text style={p.premiumTitle}>Plano Lume</Text>
          <Text style={p.premiumBadge}>{isPremium ? 'Premium' : 'Gratuito'}</Text>
        </View>
        <Text style={p.premiumSub}>Use tokens para acessar a IA e bloqueie anúncios com o plano premium.</Text>
        <View style={p.premiumStats}>
          <View style={p.premiumStatBox}>
            <Text style={p.premiumStatLabel}>Tokens</Text>
            <Text style={p.premiumStatValue}>{tokens}</Text>
          </View>
          <TouchableOpacity
            style={[p.premiumBtn, loading && p.disabledButton]}
            activeOpacity={0.85}
            onPress={handleBuyTokens}
            disabled={loading}
          >
            <Text style={p.premiumBtnText}>
              {loading
                ? 'Aguarde...'
                : tokenPackage?.storeProduct?.priceString
                  ? `Comprar 10 tokens (${tokenPackage.storeProduct.priceString})`
                  : 'Comprar tokens'}
            </Text>
          </TouchableOpacity>
        </View>
        <TouchableOpacity
          style={[p.premiumBtn, p.premiumBtnSecondary, (isPremium || loading) && p.disabledButton]}
          activeOpacity={0.85}
          onPress={handleActivatePremium}
          disabled={isPremium || loading}
        >
          <Text style={[p.premiumBtnText, p.premiumBtnSecondaryText]}>
            {isPremium
              ? 'Premium ativo'
              : premiumPackage?.storeProduct?.priceString
                ? `Ativar premium (${premiumPackage.storeProduct.priceString})`
                : 'Bloquear anúncios'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[p.premiumBtn, p.restoreBtn, restoring && p.disabledButton]}
          activeOpacity={0.85}
          onPress={handleRestorePurchases}
          disabled={restoring}
        >
          <Text style={[p.premiumBtnText, p.restoreBtnText]}>
            {restoring ? 'Restaurando...' : 'Restaurar compras'}
          </Text>
        </TouchableOpacity>
      </View>

      <Text style={p.sectionTitle}>Gerenciar conta</Text>
      <View style={p.section}>
        {OPTIONS.map((item) => (
          <TouchableOpacity key={item.label} style={p.item} activeOpacity={0.78}>
            <View style={p.itemIcon}><Text style={p.itemIconText}>{item.icon}</Text></View>
            <View style={p.itemText}>
              <Text style={p.itemLabel}>{item.label}</Text>
              <Text style={p.itemSub}>{item.sub}</Text>
            </View>
            <Text style={p.arrow}>›</Text>
          </TouchableOpacity>
        ))}
      </View>

      <TouchableOpacity style={p.signOutBtn} onPress={handleSignOut} activeOpacity={0.85}>
        <Text style={p.signOutText}>Sair da conta</Text>
      </TouchableOpacity>

      <Text style={p.disclaimer}>
        MindTrack é um suporte complementar à saúde mental.{'\n'}
        Em caso de crise, ligue CVV: 188 (24h, gratuito)
      </Text>
    </ScrollView>
  );
}

const p = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 20, paddingTop: 24 },
  headerCard: {
    backgroundColor: theme.accentSoft, borderRadius: 28,
    padding: 22, flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: theme.accent + '22',
    shadowColor: theme.accent, shadowOpacity: 0.16, shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 }, elevation: 10,
    marginBottom: 24,
  },
  avatar: {
    width: 88, height: 88, borderRadius: 24,
    backgroundColor: '#fff', borderWidth: 1, borderColor: theme.accent + '44',
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.accent, shadowOpacity: 0.18, shadowRadius: 18, elevation: 8,
  },
  avatarEmoji: { fontSize: 36 },
  profileInfo: { marginLeft: 16, flex: 1 },
  name: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginBottom: 4 },
  email: { fontSize: 14, color: theme.textSecondary, marginBottom: 6 },
  since: { fontSize: 12, color: theme.textMuted },
  premiumCard: {
    backgroundColor: theme.bgCard, borderRadius: 28,
    borderWidth: 1, borderColor: theme.border,
    padding: 20, marginBottom: 20,
    shadowColor: theme.accentGlow, shadowOpacity: 0.18,
    shadowRadius: 22, shadowOffset: { width: 0, height: 12 }, elevation: 9,
  },
  premiumLabel: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  premiumTitle: { fontSize: 15, fontWeight: '800', color: theme.textPrimary },
  premiumBadge: {
    fontSize: 11, fontWeight: '700', color: theme.accent,
    paddingVertical: 4, paddingHorizontal: 10,
    backgroundColor: theme.accent + '14', borderRadius: 999,
  },
  premiumSub: { fontSize: 12, color: theme.textSecondary, lineHeight: 18, marginBottom: 16 },
  premiumStats: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 12 },
  premiumStatBox: { flex: 1, backgroundColor: theme.surface, borderRadius: 16, padding: 14 },
  premiumStatLabel: { fontSize: 10, color: theme.textSecondary, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 1 },
  premiumStatValue: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  premiumBtn: {
    backgroundColor: theme.accent, borderRadius: 16, paddingVertical: 14,
    paddingHorizontal: 16, alignItems: 'center', justifyContent: 'center',
    marginTop: 12,
  },
  premiumBtnSecondary: {
    backgroundColor: theme.surface,
  },
  restoreBtn: {
    backgroundColor: theme.bg,
    borderWidth: 1,
    borderColor: theme.border,
  },
  premiumBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  premiumBtnSecondaryText: { color: theme.textPrimary },
  restoreBtnText: { color: theme.textSecondary },
  disabledButton: { opacity: 0.65 },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.textSecondary, letterSpacing: 1.2, marginBottom: 12 },
  section: {
    backgroundColor: theme.bgCard, borderRadius: 20,
    borderWidth: 1, borderColor: theme.border, overflow: 'hidden', marginBottom: 20,
  },
  item: {
    flexDirection: 'row', alignItems: 'center', paddingVertical: 18, paddingHorizontal: 16,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  itemIcon: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: theme.surface, alignItems: 'center', justifyContent: 'center',
    marginRight: 12,
  },
  itemIconText: { fontSize: 18 },
  itemText: { flex: 1 },
  itemLabel: { fontSize: 15, fontWeight: '700', color: theme.textPrimary },
  itemSub: { fontSize: 12, color: theme.textSecondary, marginTop: 4 },
  arrow: { color: theme.textMuted, fontSize: 20 },
  signOutBtn: {
    backgroundColor: theme.redSoft, borderRadius: 18,
    paddingVertical: 16, alignItems: 'center',
    borderWidth: 1, borderColor: theme.red + '44',
  },
  signOutText: { color: theme.red, fontSize: 15, fontWeight: '800' },
  disclaimer: {
    fontSize: 11, color: theme.textMuted,
    textAlign: 'center', lineHeight: 18, marginTop: 22,
  },
});
