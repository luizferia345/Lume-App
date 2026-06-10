import React, { useState } from 'react';
import {
  View, Text, TouchableOpacity, ScrollView,
  StyleSheet, TextInput, Alert, ActivityIndicator,
} from 'react-native';
import { theme } from '../theme';
import { saveCheckin } from '../lib/supabase';

const MOODS = [
  { emoji: '😞', label: 'Péssimo', score: 2, color: theme.red },
  { emoji: '😕', label: 'Ruim',    score: 4, color: theme.amber },
  { emoji: '😐', label: 'Ok',      score: 6, color: theme.accent },
  { emoji: '🙂', label: 'Bem',     score: 8, color: theme.green },
  { emoji: '😄', label: 'Ótimo',   score: 10, color: '#A8E063' },
];

function SliderSimple({ label, value, onChange, color }) {
  const steps = [1,2,3,4,5,6,7,8,9,10];
  return (
    <View style={ss.sliderBlock}>
      <View style={ss.sliderRow}>
        <Text style={ss.sliderLabel}>{label}</Text>
        <Text style={[ss.sliderVal, { color }]}>{value}/10</Text>
      </View>
      <View style={ss.stepsRow}>
        {steps.map((n) => (
          <TouchableOpacity
            key={n} onPress={() => onChange(n)} style={ss.stepWrapper} activeOpacity={0.7}>
            <View style={[
              ss.pip,
              n <= value && { backgroundColor: color, shadowColor: color, shadowOpacity: 0.26, shadowRadius: 14, elevation: 6 },
              n > value && { backgroundColor: '#F0F0F5' },
            ]} />
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

export default function CheckinScreen({ user, onDone }) {
  const [step, setStep] = useState(0);
  const [mood, setMood] = useState(2);
  const [anxiety, setAnxiety] = useState(5);
  const [sleep, setSleep] = useState(7);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  const selectedMood = MOODS[mood];

  const save = async () => {
    setSaving(true);
    const { error } = await saveCheckin(user.id, {
      moodScore: selectedMood.score,
      anxietyLevel: anxiety,
      sleepQuality: sleep,
      notes,
    });
    setSaving(false);
    if (error) Alert.alert('Erro', error.message);
    else onDone();
  };

  return (
    <ScrollView style={ss.screen} contentContainerStyle={{ paddingBottom: 32 }} showsVerticalScrollIndicator={false}>
      <View style={ss.header}>
        <TouchableOpacity onPress={onDone} style={ss.backButton}>
          <Text style={ss.backText}>←</Text>
        </TouchableOpacity>
        <View style={ss.titleBlock}>
          <Text style={ss.title}>Check-in diário</Text>
          <Text style={ss.subtitle}>Registre como você está se sentindo hoje.</Text>
        </View>
        <View style={ss.stepBadge}>
          <Text style={ss.stepBadgeText}>{step + 1}/2</Text>
        </View>
      </View>

      <View style={ss.progress}>
        {[0,1].map((i) => (
          <View key={i} style={[ss.progressBar, i <= step && ss.progressActive]} />
        ))}
      </View>

      {step === 0 && (
        <>
          <View style={ss.question}>
            <Text style={ss.questionEmoji}>{selectedMood.emoji}</Text>
            <Text style={ss.questionTitle}>Como está seu humor?</Text>
            <Text style={ss.questionSub}>Seja honesto — isso ajuda você a se entender melhor.</Text>
          </View>

          <View style={ss.moodGrid}>
            {MOODS.map((m, i) => (
              <TouchableOpacity
                key={m.label}
                style={[ss.moodBtn,
                  i === mood && { borderColor: m.color, backgroundColor: m.color + '18',
                    shadowColor: m.color, shadowOpacity: 0.22, shadowRadius: 16, elevation: 7 }
                ]}
                onPress={() => setMood(i)}
                activeOpacity={0.85}
              >
                <Text style={ss.moodEmoji}>{m.emoji}</Text>
                <Text style={[ss.moodLabel, i === mood && { color: m.color }]}>{m.label}</Text>
                {i === mood && (
                  <View style={[ss.moodCheck, { backgroundColor: m.color }]}> 
                    <Text style={ss.moodCheckIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            ))}
          </View>

          <TouchableOpacity style={ss.actionBtn} onPress={() => setStep(1)} activeOpacity={0.85}>
            <Text style={ss.actionBtnText}>Continuar</Text>
          </TouchableOpacity>
        </>
      )}

      {step === 1 && (
        <>
          <Text style={[ss.questionTitle, { marginTop: 22, marginBottom: 24 }]}>Como foi seu dia?</Text>

          <View style={ss.card}>
            <SliderSimple label="Ansiedade" value={anxiety} onChange={setAnxiety} color={theme.amber} />
            <SliderSimple label="Qualidade do sono" value={sleep} onChange={setSleep} color={theme.accent} />
          </View>

          <View style={ss.card}>
            <Text style={ss.sliderLabel}>NOTAS (opcional)</Text>
            <TextInput
              style={ss.textArea}
              value={notes} onChangeText={setNotes}
              placeholder="O que mais marcou seu dia?"
              placeholderTextColor={theme.textMuted}
              multiline numberOfLines={5}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity style={ss.actionBtn} onPress={save} disabled={saving} activeOpacity={0.85}>
            {saving
              ? <ActivityIndicator color="#fff" />
              : <Text style={ss.actionBtnText}>Salvar check-in</Text>
            }
          </TouchableOpacity>
        </>
      )}
    </ScrollView>
  );
}

const ss = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 20, paddingBottom: 14,
  },
  backButton: {
    width: 44, height: 44, borderRadius: 16,
    backgroundColor: theme.bgCard, alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: theme.border,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 }, elevation: 5,
  },
  backText: { fontSize: 20, color: theme.textSecondary },
  titleBlock: { flex: 1, paddingHorizontal: 14 },
  title: { fontSize: 22, fontWeight: '800', color: theme.textPrimary },
  subtitle: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
  stepBadge: {
    backgroundColor: theme.accentSoft, borderRadius: 16,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  stepBadgeText: { fontSize: 12, fontWeight: '700', color: theme.accent },
  progress: { flexDirection: 'row', gap: 8, marginBottom: 22 },
  progressBar: { flex: 1, height: 4, borderRadius: 4, backgroundColor: theme.border },
  progressActive: { backgroundColor: theme.accent },
  question: { alignItems: 'center', paddingVertical: 16 },
  questionEmoji: { fontSize: 56, marginBottom: 16 },
  questionTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary, textAlign: 'center' },
  questionSub: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', marginTop: 6, lineHeight: 20 },
  moodGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 22 },
  moodBtn: {
    width: '18%', aspectRatio: 1,
    backgroundColor: theme.bgCard, borderRadius: 22,
    borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
    paddingVertical: 10, position: 'relative',
  },
  moodEmoji: { fontSize: 28 },
  moodLabel: { fontSize: 10, fontWeight: '700', color: theme.textSecondary, marginTop: 6, textAlign: 'center' },
  moodCheck: {
    position: 'absolute', top: -6, right: -6,
    width: 18, height: 18, borderRadius: 9,
    alignItems: 'center', justifyContent: 'center',
  },
  moodCheckIcon: { color: '#fff', fontSize: 10, fontWeight: '800' },
  card: {
    backgroundColor: theme.bgCard, borderRadius: 24,
    borderWidth: 1, borderColor: theme.border,
    padding: 18, marginBottom: 18,
    shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 18,
    shadowOffset: { width: 0, height: 10 }, elevation: 6,
  },
  sliderBlock: { marginBottom: 22 },
  sliderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  sliderLabel: { fontSize: 12, fontWeight: '700', color: theme.textSecondary },
  sliderVal: { fontSize: 13, fontWeight: '800' },
  stepsRow: { flexDirection: 'row', gap: 6 },
  stepWrapper: { flex: 1 },
  pip: { height: 8, borderRadius: 5, backgroundColor: theme.border },
  textArea: {
    backgroundColor: theme.bg, borderRadius: 18,
    borderWidth: 1, borderColor: theme.border,
    padding: 16, color: theme.textPrimary,
    fontSize: 14, lineHeight: 22, minHeight: 140,
  },
  actionBtn: {
    backgroundColor: theme.accent, borderRadius: 20,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: theme.accent, shadowOpacity: 0.28,
    shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8,
  },
  actionBtnText: { color: theme.textInverse, fontSize: 15, fontWeight: '800' },
});
