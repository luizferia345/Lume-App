import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator, Alert,
} from 'react-native';
import { theme } from '../theme';
import { getCheckins, signOut, updateUserMetadata } from '../lib/supabase';
import { createRewardedAd, isAdsAvailable } from '../lib/ads';

const DAYS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
const BAR_H = 72;
const MOOD_ICONS = ['😞', '😕', '😐', '🙂', '😄'];
const AD_TOKEN_REWARD = 5;

function GlowCard({ children, style, color }) {
  return (
    <View style={[s.glowCard, color && { borderColor: color + '22', shadowColor: color }, style]}>
      {children}
    </View>
  );
}

export default function HomeScreen({ user, onCheckin }) {
  const [checkins, setCheckins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [streak, setStreak] = useState(0);
  const [avgMood, setAvgMood] = useState(0);
  const [adLoaded, setAdLoaded] = useState(false);
  const [adLoading, setAdLoading] = useState(false);
  const [rewardedAd, setRewardedAd] = useState(null);
  const isPremium = user?.user_metadata?.premium ?? false;
  const adsAvailable = isAdsAvailable();

  useEffect(() => { load(); }, []);

  useEffect(() => {
    if (!adsAvailable) return;

    const ad = createRewardedAd();
    if (!ad) return;
    setRewardedAd(ad);

    const loadAd = () => {
      setAdLoading(true);
      try {
        ad.load();
      } catch (e) {
        setAdLoading(false);
      }
    };

    const loadedListener = ad.addAdEventListener(
      'loaded',
      () => {
        setAdLoaded(true);
        setAdLoading(false);
      }
    );

    const errorListener = ad.addAdEventListener(
      'error',
      () => {
        setAdLoaded(false);
        setAdLoading(false);
      }
    );

    const rewardListener = ad.addAdEventListener(
      'earnedReward',
      async () => {
        try {
          const nextTokens = (user?.user_metadata?.tokens ?? 0) + AD_TOKEN_REWARD;
          await updateUserMetadata({ tokens: nextTokens });
          Alert.alert('Obrigado', `Você ganhou +${AD_TOKEN_REWARD} tokens!`);
        } catch (error) {
          Alert.alert('Erro', 'Não foi possível atualizar os tokens após o anúncio.');
        }
      }
    );

    loadAd();
    return () => {
      loadedListener();
      errorListener();
      rewardListener();
    };
  }, [user, adsAvailable]);

  const load = async () => {
    const { data } = await getCheckins(user.id, 30);
    if (data) {
      setCheckins(data);
      calcStreak(data);
      const avg = data.length ? (data.reduce((a, c) => a + c.mood_score, 0) / data.length).toFixed(1) : 0;
      setAvgMood(avg);
    }
    setLoading(false);
  };

  const calcStreak = (data) => {
    if (!data.length) return;
    let count = 0;
    let now = new Date();
    now.setHours(0, 0, 0, 0);
    for (const c of data) {
      const d = new Date(c.created_at);
      d.setHours(0, 0, 0, 0);
      if (d.getTime() === now.getTime()) {
        count += 1;
        now.setDate(now.getDate() - 1);
      } else break;
    }
    setStreak(count);
  };

  const last7 = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    d.setHours(0, 0, 0, 0);
    const match = checkins.find((c) => {
      const cd = new Date(c.created_at);
      cd.setHours(0, 0, 0, 0);
      return cd.getTime() === d.getTime();
    });
    return { day: DAYS[d.getDay()], score: match?.mood_score ?? 0, today: i === 6 };
  });

  const moodColor = (score) => {
    if (score >= 8) return theme.green;
    if (score >= 5) return theme.accent;
    if (score >= 3) return theme.amber;
    return theme.red;
  };

  if (loading) {
    return (
      <View style={s.loadingFallback}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  const todayCheckin = checkins.find((checkin) => {
    const d = new Date(checkin.created_at);
    const today = new Date();
    return d.toDateString() === today.toDateString();
  });

  return (
    <ScrollView style={s.screen} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={s.pageHeader}>
        <View>
          <Text style={s.greeting}>Olá,</Text>
          <Text style={s.userName}>{user.email?.split('@')[0]}</Text>
          <Text style={s.pageIntro}>Seu espaço para cuidar da mente com mais leveza.</Text>
        </View>
        <TouchableOpacity style={s.avatarBtn} onPress={signOut}>
          <Text style={s.avatarIcon}>⊗</Text>
        </TouchableOpacity>
      </View>

      <View style={s.heroCard}>
        <Text style={s.heroTitle}>Como você está se sentindo hoje?</Text>
        <Text style={s.heroSubtitle}>Registre seu humor para descobrir padrões e cuidar da sua rotina.</Text>
        <View style={s.moodRow}>
          {MOOD_ICONS.map((emoji) => (
            <View key={emoji} style={s.moodBubble}>
              <Text style={s.moodEmoji}>{emoji}</Text>
            </View>
          ))}
        </View>
        <TouchableOpacity style={s.heroButton} onPress={onCheckin} activeOpacity={0.85}>
          <Text style={s.heroButtonText}>Continuar</Text>
        </TouchableOpacity>
      </View>

      {!isPremium && (
        <TouchableOpacity
          style={s.adCard}
          activeOpacity={0.85}
          onPress={async () => {
            if (!adsAvailable) {
              Alert.alert(
                'Anúncios não disponíveis',
                'Os anúncios só funcionam em um build customizado ou app instalado, não no Expo Go.'
              );
              return;
            }
            if (!adLoaded || !rewardedAd) {
              Alert.alert('Aguarde', 'O anúncio ainda está carregando. Por favor, tente novamente em alguns instantes.');
              return;
            }
            try {
              await rewardedAd.show();
              setAdLoaded(false);
            } catch (error) {
              Alert.alert('Erro', 'Não foi possível exibir o anúncio agora.');
            }
          }}
        >
          <Text style={s.adLabel}>Anúncio Lume</Text>
          <Text style={s.adTitle}>Assista e ganhe 5 tokens</Text>
          <Text style={s.adText}>
            {adsAvailable
              ? adLoaded
                ? 'Anúncio pronto para exibir.'
                : 'Carregando anúncio...'
              : 'Anúncios indisponíveis no Expo Go.'}
          </Text>
        </TouchableOpacity>
      )}

      <View style={s.quickStats}>
        <GlowCard style={s.statCard} color={theme.amberSoft}>
          <Text style={[s.statValue, { color: theme.textPrimary }]}>🔥 {streak}</Text>
          <Text style={s.statLabel}>dias seguidos</Text>
        </GlowCard>
        <GlowCard style={s.statCard} color={theme.bgCard}>
          <Text style={[s.statValue, { color: theme.textPrimary }]}>{avgMood || '—'}</Text>
          <Text style={s.statLabel}>humor médio</Text>
        </GlowCard>
      </View>

      <GlowCard style={s.trendCard}>
        <Text style={s.cardTitle}>Seu humor nos últimos 7 dias</Text>
        <View style={s.chartRow}>
          {last7.map((item, index) => (
            <View key={index} style={s.chartColumn}>
              <View style={[s.chartBar, {
                height: item.score > 0 ? (item.score / 10) * BAR_H : BAR_H * 0.15,
                backgroundColor: moodColor(item.score),
                opacity: item.today ? 1 : 0.55,
              }]} />
              <Text style={[s.chartLabel, item.today && { color: theme.accent }]}>{item.day}</Text>
            </View>
          ))}
        </View>
      </GlowCard>

      {!todayCheckin ? (
        <TouchableOpacity style={s.checkinCard} onPress={onCheckin} activeOpacity={0.85}>
          <View style={s.checkinInner}>
            <Text style={s.checkinLabel}>🎯 Check-in diário</Text>
            <Text style={s.checkinTitle}>Registre como você se sente hoje</Text>
          </View>
          <Text style={s.checkinArrow}>→</Text>
        </TouchableOpacity>
      ) : (
        <GlowCard style={s.doneCard} color={theme.green}>
          <Text style={s.doneText}>✓ Check-in de hoje concluído</Text>
          <Text style={s.doneSub}>Humor: {todayCheckin.mood_score}/10</Text>
        </GlowCard>
      )}

      {checkins.length > 0 && (
        <View style={s.recentSection}>
          <Text style={s.sectionTitle}>Últimos registros</Text>
          {checkins.slice(0, 3).map((entry, idx) => {
            const mood = moodColor(entry.mood_score);
            const date = new Date(entry.created_at);
            return (
              <GlowCard key={idx} style={[s.entryCard, { borderColor: mood + '22', shadowColor: mood }]}> 
                <View style={s.entryHeader}> 
                  <Text style={s.entryDate}>{date.toLocaleDateString('pt-BR')} · {date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</Text>
                  <View style={[s.entryBadge, { backgroundColor: mood + '22', borderColor: mood + '44' }]}> 
                    <Text style={[s.entryBadgeText, { color: mood }]}>{entry.mood_score}/10</Text>
                  </View>
                </View>
                {entry.notes ? <Text style={s.entryNote} numberOfLines={2}>{entry.notes}</Text> : null}
              </GlowCard>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 20 },
  pageHeader: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start',
    paddingTop: 18, paddingBottom: 18,
  },
  greeting: { fontSize: 14, color: theme.textSecondary },
  pageIntro: { fontSize: 12, color: theme.textSecondary, marginTop: 6, lineHeight: 18, maxWidth: '78%' },
  userName: { fontSize: 26, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.5 },
  avatarBtn: {
    width: 44, height: 44, borderRadius: 16,
    backgroundColor: theme.bgCard, borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarIcon: { fontSize: 18, color: theme.textPrimary },
  heroCard: {
    backgroundColor: theme.bgCard, borderRadius: 28,
    borderWidth: 1, borderColor: theme.border,
    padding: 22, marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.08, shadowOffset: { width: 0, height: 14 },
    shadowRadius: 24, elevation: 8,
  },
  heroTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, marginBottom: 8, lineHeight: 28 },
  heroSubtitle: { fontSize: 13, color: theme.textSecondary, marginBottom: 18, lineHeight: 20 },
  moodRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  moodBubble: {
    width: 52, height: 52, borderRadius: 18,
    backgroundColor: theme.bg,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  moodEmoji: { fontSize: 24 },
  heroButton: {
    borderRadius: 18, backgroundColor: theme.accent,
    alignItems: 'center', justifyContent: 'center', paddingVertical: 14,
    shadowColor: theme.accent, shadowOpacity: 0.24, shadowRadius: 18, shadowOffset: { width: 0, height: 12 },
    elevation: 8,
  },
  heroButtonText: { color: theme.textInverse, fontSize: 15, fontWeight: '700' },
  quickStats: { flexDirection: 'row', gap: 12, marginBottom: 18 },
  statCard: { flex: 1, alignItems: 'center', paddingVertical: 18 },
  statValue: { fontSize: 22, fontWeight: '800', marginBottom: 4 },
  statLabel: { fontSize: 11, color: theme.textSecondary, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.8 },
  trendCard: { marginBottom: 18 },
  cardTitle: { fontSize: 11, fontWeight: '800', color: theme.textSecondary, letterSpacing: 1.8, marginBottom: 16 },
  chartRow: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', height: BAR_H + 22 },
  chartColumn: { flex: 1, alignItems: 'center', justifyContent: 'flex-end' },
  chartBar: { width: '100%', borderRadius: 10 },
  chartLabel: { marginTop: 10, fontSize: 10, color: theme.textSecondary, fontWeight: '700' },
  checkinCard: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    backgroundColor: theme.accent, borderRadius: 22,
    padding: 18, marginBottom: 18,
    shadowColor: theme.accent, shadowOpacity: 0.22,
    shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8,
  },
  checkinInner: { flex: 1, marginRight: 12 },
  checkinLabel: { fontSize: 12, color: '#F8F8FF', marginBottom: 6, fontWeight: '700' },
  checkinTitle: { fontSize: 16, color: theme.textInverse, fontWeight: '800' },
  checkinArrow: { fontSize: 20, color: theme.textInverse },
  doneCard: { paddingVertical: 18, paddingHorizontal: 20, marginBottom: 18, backgroundColor: theme.green, borderRadius: 24 },
  doneText: { color: '#fff', fontSize: 15, fontWeight: '700', marginBottom: 4 },
  doneSub: { color: '#F0F7EA', fontSize: 12 },
  recentSection: { marginBottom: 18 },
  adCard: {
    backgroundColor: theme.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: theme.border,
    padding: 18,
    marginBottom: 18,
  },
  adLabel: {
    fontSize: 12,
    color: theme.textSecondary,
    fontWeight: '700',
    marginBottom: 8,
  },
  adTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: theme.textPrimary,
    marginBottom: 6,
  },
  adText: {
    fontSize: 12,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  sectionTitle: { fontSize: 13, fontWeight: '800', color: theme.textPrimary, marginBottom: 12 },
  entryCard: { marginBottom: 12, padding: 16 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  entryDate: { fontSize: 11, color: theme.textSecondary },
  entryBadge: {
    borderRadius: 999, borderWidth: 1, paddingHorizontal: 10, paddingVertical: 4,
  },
  entryBadgeText: { fontSize: 11, fontWeight: '700' },
  entryNote: { fontSize: 13, color: theme.textSecondary, lineHeight: 20 },
  loadingFallback: { flex: 1, backgroundColor: theme.bg, justifyContent: 'center', alignItems: 'center' },
});
