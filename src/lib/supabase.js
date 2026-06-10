import { createClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '../config/env';

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn('[Supabase] Variáveis de ambiente não configuradas em src/config/env.js');
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth ──────────────────────────────────────────────
export const signUp = (email, password) =>
  supabase.auth.signUp({ email, password });

export const signIn = (email, password) =>
  supabase.auth.signInWithPassword({ email, password });

export const signOut = () => supabase.auth.signOut();

export const getUser = () => supabase.auth.getUser();

// ── Check-ins ─────────────────────────────────────────
export const saveCheckin = async (userId, data) => {
  const { error } = await supabase.from('checkins').insert({
    user_id: userId,
    mood_score: data.moodScore,
    anxiety_level: data.anxietyLevel,
    sleep_quality: data.sleepQuality,
    notes: data.notes || '',
  });
  return { error };
};

export const getCheckins = async (userId, limit = 30) => {
  const { data, error } = await supabase
    .from('checkins')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

// ── Journal ───────────────────────────────────────────
export const saveJournalEntry = async (userId, entry) => {
  const { data, error } = await supabase.from('journal_entries').insert({
    user_id: userId,
    content: entry.content,
    mood_label: entry.moodLabel,
    mood_emoji: entry.moodEmoji,
    tags: entry.tags,
  }).select().single();
  return { data, error };
};

export const getJournalEntries = async (userId, limit = 20) => {
  const { data, error } = await supabase
    .from('journal_entries')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);
  return { data, error };
};

export const updateUserMetadata = async (metadata) => {
  const { data, error } = await supabase.auth.updateUser({ data: metadata });
  return { data, error };
};

// ── Chat ──────────────────────────────────────────────
export const saveChatMessage = async (userId, role, content) => {
  await supabase.from('chat_messages').insert({ user_id: userId, role, content });
};

export const getChatHistory = async (userId, limit = 20) => {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })
    .limit(limit);
  return { data, error };
};
