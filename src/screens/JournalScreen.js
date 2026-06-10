import React, { useState, useEffect } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity, StyleSheet,
  TextInput, Modal, ActivityIndicator, Alert,
} from 'react-native';
import { theme } from '../theme';
import { saveJournalEntry, getJournalEntries } from '../lib/supabase';

const MOOD_OPTIONS = [
  { emoji: '😄', label: 'Ótimo',   color: '#A8E063' },
  { emoji: '🙂', label: 'Bem',     color: theme.green },
  { emoji: '😐', label: 'Ok',      color: theme.accent },
  { emoji: '😕', label: 'Ruim',    color: theme.amber },
  { emoji: '😞', label: 'Difícil', color: theme.red },
];

const TAG_OPTIONS = ['Trabalho', 'Família', 'Ansiedade', 'Conquista', 'Relacionamento', 'Saúde', 'Sono', 'Lazer'];

export default function JournalScreen({ user }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);

  // New entry state
  const [content, setContent] = useState('');
  const [selectedMood, setSelectedMood] = useState(0);
  const [selectedTags, setSelectedTags] = useState([]);

  useEffect(() => { load(); }, []);

  const load = async () => {
    const { data } = await getJournalEntries(user.id);
    if (data) setEntries(data);
    setLoading(false);
  };

  const handleSave = async () => {
    if (!content.trim()) return Alert.alert('Escreva algo antes de salvar');
    setSaving(true);
    const mood = MOOD_OPTIONS[selectedMood];
    const { error } = await saveJournalEntry(user.id, {
      content: content.trim(),
      moodLabel: mood.label,
      moodEmoji: mood.emoji,
      tags: selectedTags,
    });
    setSaving(false);
    if (error) { Alert.alert('Erro', error.message); return; }
    setContent(''); setSelectedMood(0); setSelectedTags([]);
    setShowModal(false);
    load();
  };

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const moodColor = (label) =>
    MOOD_OPTIONS.find((m) => m.label === label)?.color ?? theme.accent;

  const formatDate = (iso) => {
    const d = new Date(iso);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    if (d.toDateString() === today.toDateString())
      return `Hoje · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    if (d.toDateString() === yesterday.toDateString())
      return `Ontem · ${d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    return d.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' }) +
      ' · ' + d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <View style={j.screen}>
      <View style={j.header}>
        <View style={j.headerText}>
          <Text style={j.title}>Histórico emocional</Text>
          <Text style={j.sub}>{entries.length} entradas registradas</Text>
        </View>
        <TouchableOpacity style={j.newBtn} onPress={() => setShowModal(true)} activeOpacity={0.85}>
          <Text style={j.newBtnText}>Adicionar</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator color={theme.accent} />
        </View>
      ) : entries.length === 0 ? (
        <View style={j.emptyState}>
          <Text style={j.emptyIcon}>📓</Text>
          <Text style={j.emptyTitle}>Ainda não há entradas</Text>
          <Text style={j.emptySubtitle}>Registre seus pensamentos para ver o seu histórico emocional.</Text>
          <TouchableOpacity style={j.newBtn} onPress={() => setShowModal(true)}>
            <Text style={j.newBtnText}>Criar primeira entrada</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 24 }}>
          {entries.map((entry, i) => {
            const mc = moodColor(entry.mood_label);
            return (
              <View key={i} style={[j.card, { borderColor: mc + '33', shadowColor: mc }]}>
                <View style={j.cardTop}>
                  <Text style={j.date}>{formatDate(entry.created_at)}</Text>
                  <View style={[j.moodTag, { backgroundColor: mc + '18' }]}>
                    <Text style={{ fontSize: 13 }}>{entry.mood_emoji}</Text>
                    <Text style={[j.moodTagText, { color: mc }]}>{entry.mood_label}</Text>
                  </View>
                </View>
                <Text style={j.content} numberOfLines={4}>{entry.content}</Text>
                {entry.tags?.length > 0 && (
                  <View style={j.tags}>
                    {entry.tags.map((tag) => (
                      <View key={tag} style={[j.tag, { backgroundColor: mc + '18' }]}>
                        <Text style={[j.tagText, { color: mc }]}>{tag}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </ScrollView>
      )}

      {/* Modal nova entrada */}
      <Modal visible={showModal} animationType="slide" transparent>
        <View style={j.modalOverlay}>
          <View style={j.modalCard}>
            <View style={j.modalHeader}>
              <Text style={j.modalTitle}>Nova entrada</Text>
              <TouchableOpacity onPress={() => setShowModal(false)}>
                <Text style={{ color: theme.textSecondary, fontSize: 20 }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={j.fieldLabel}>COMO VOCÊ ESTÁ?</Text>
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              {MOOD_OPTIONS.map((m, i) => (
                <TouchableOpacity
                  key={m.label}
                  style={[j.moodOpt, i === selectedMood && {
                    borderColor: m.color, backgroundColor: m.color + '18',
                  }]}
                  onPress={() => setSelectedMood(i)}
                  activeOpacity={0.8}
                >
                  <Text style={{ fontSize: 22 }}>{m.emoji}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={j.fieldLabel}>O QUE ACONTECEU?</Text>
            <TextInput
              style={j.textArea}
              value={content} onChangeText={setContent}
              placeholder="Escreva livremente..."
              placeholderTextColor={theme.textMuted}
              multiline numberOfLines={5}
              textAlignVertical="top"
            />

            <Text style={[j.fieldLabel, { marginTop: 12 }]}>TAGS</Text>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 20 }}>
              {TAG_OPTIONS.map((tag) => (
                <TouchableOpacity
                  key={tag}
                  style={[j.tagOpt, selectedTags.includes(tag) && {
                    backgroundColor: theme.accentSoft, borderColor: theme.accent + '44',
                  }]}
                  onPress={() => toggleTag(tag)}
                  activeOpacity={0.8}
                >
                  <Text style={[j.tagOptText, selectedTags.includes(tag) && { color: theme.accent }]}>
                    {tag}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={j.saveBtn} onPress={handleSave} disabled={saving} activeOpacity={0.85}>
              {saving ? <ActivityIndicator color="#fff" /> : <Text style={j.saveBtnText}>Salvar entrada ✓</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const j = StyleSheet.create({
  screen: { flex: 1, backgroundColor: theme.bg, paddingHorizontal: 20 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', paddingTop: 22, paddingBottom: 18,
    paddingHorizontal: 4,
  },
  title: { fontSize: 24, fontWeight: '800', color: theme.textPrimary, letterSpacing: -0.6 },
  sub: { fontSize: 13, color: theme.textSecondary, marginTop: 4 },
  headerText: { flex: 1, paddingRight: 12 },
  newBtn: {
    backgroundColor: theme.accent, borderRadius: 16,
    paddingHorizontal: 18, paddingVertical: 12,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: theme.accent, shadowOpacity: 0.22,
    shadowRadius: 16, shadowOffset: { width: 0, height: 8 }, elevation: 6,
  },
  newBtnText: { color: theme.textInverse, fontSize: 13, fontWeight: '800' },
  card: {
    backgroundColor: theme.bgCard, borderRadius: 28,
    borderWidth: 1, borderColor: theme.border,
    padding: 18, marginBottom: 14,
    shadowColor: '#000', shadowOpacity: 0.1, shadowRadius: 22,
    shadowOffset: { width: 0, height: 12 }, elevation: 7,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  date: { fontSize: 11, color: theme.textSecondary, fontWeight: '700' },
  moodTag: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5 },
  moodTagText: { fontSize: 11, fontWeight: '700' },
  content: { fontSize: 14, color: theme.textPrimary, lineHeight: 22, marginTop: 4 },
  tags: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 12 },
  tag: { borderRadius: 12, paddingHorizontal: 10, paddingVertical: 6 },
  tagText: { fontSize: 11, fontWeight: '700' },
  emptyState: {
    flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 20,
    backgroundColor: theme.bg,
  },
  emptyIcon: { fontSize: 42 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: theme.textPrimary, marginTop: 10 },
  emptySubtitle: { fontSize: 13, color: theme.textSecondary, textAlign: 'center', lineHeight: 20, marginBottom: 16 },
  modalOverlay: {
    flex: 1, backgroundColor: '#0A142DCC',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: theme.bgCard, borderTopLeftRadius: 32,
    borderTopRightRadius: 32, borderWidth: 1, borderColor: theme.border,
    padding: 24, paddingBottom: 40,
    shadowColor: '#000', shadowOpacity: 0.18, shadowRadius: 24,
    shadowOffset: { width: 0, height: -12 }, elevation: 12,
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 22 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: theme.textPrimary },
  fieldLabel: { fontSize: 11, fontWeight: '800', color: theme.textSecondary, letterSpacing: 1.4, marginBottom: 10 },
  moodOpt: {
    flex: 1, aspectRatio: 1, minWidth: 48, borderRadius: 18,
    backgroundColor: theme.bg, borderWidth: 1, borderColor: theme.border,
    alignItems: 'center', justifyContent: 'center',
  },
  textArea: {
    backgroundColor: theme.bg, borderRadius: 16,
    borderWidth: 1, borderColor: theme.border,
    padding: 14, color: theme.textPrimary,
    fontSize: 14, lineHeight: 22, minHeight: 140,
  },
  tagOpt: {
    backgroundColor: theme.bg, borderWidth: 1,
    borderColor: theme.border, borderRadius: 20,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  tagOptText: { fontSize: 12, color: theme.textSecondary, fontWeight: '600' },
  saveBtn: {
    backgroundColor: theme.accent, borderRadius: 18,
    paddingVertical: 16, alignItems: 'center',
    shadowColor: theme.accent, shadowOpacity: 0.28,
    shadowRadius: 16, shadowOffset: { width: 0, height: 10 }, elevation: 8,
  },
  saveBtnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
});
