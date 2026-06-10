import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  ScrollView, StyleSheet, Alert
} from 'react-native';

import { theme } from '../theme';
import { usePremium } from '../hooks/usePremium';
import { canSendMessage, FREE_LIMIT } from '../utils/limits';
import { updateUserMetadata } from '../lib/supabase';
import { sendToAI } from '../lib/ai';

const SUGGESTIONS = [
  'Ansioso',
  'Não consegui dormir',
  'Sobrecarregado',
  'Quero me acalmar'
];

export default function ChatScreen({ user }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const { isPremium, tokens } = usePremium(user);

  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: 'Oi, eu estou aqui com você 💙\n\nPode me contar com calma como você está se sentindo hoje.'
      }
    ]);
  }, []);

 const send = async (text) => {
  const msg = text || input;
  if (!msg) return;

  if (!canSendMessage(count, isPremium, tokens)) {
    Alert.alert(
      'Limite atingido',
      'Seu limite gratuito acabou. Compre tokens ou ative o plano premium para continuar.'
    );
    setLoading(false);
    return;
  }

  const useToken = !isPremium && count >= FREE_LIMIT;
  if (useToken && tokens <= 0) {
    Alert.alert('Sem tokens', 'Você precisa comprar tokens para continuar usando a IA.');
    setLoading(false);
    return;
  }

  if (useToken) {
    const nextTokens = tokens - 1;
    const { error } = await updateUserMetadata({ tokens: nextTokens });
    if (error) {
      Alert.alert('Erro', 'Não foi possível usar o token. Tente novamente.');
      setLoading(false);
      return;
    }
  }

  const newMessages = [...messages, { role: 'user', content: msg }];
  setMessages(newMessages);
  setInput('');
  setCount(count + 1);
  setLoading(true);

  try {
    const reply = await sendToAI(newMessages);

    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: reply }
    ]);

  } catch (e) {
    setMessages((prev) => [
      ...prev,
      { role: 'assistant', content: 'Tive um problema agora, mas continuo aqui com você 💙' }
    ]);
  } finally {
    setLoading(false);
  }
};

  return (
    <View style={s.container}>
      <View style={s.chatHeader}>
        <Text style={s.chatTitle}>Converse com Lume</Text>
        <Text style={s.chatSubtitle}>Desabafe sempre que precisar e receba orientações práticas.</Text>
      </View>
      <View style={s.statusBar}>
        <Text style={s.statusText}>
          {isPremium
            ? 'Premium ativado — IA ilimitada'
            : `Tokens: ${tokens} · Gratuito restantes: ${Math.max(0, FREE_LIMIT - count)}`}
        </Text>
      </View>
      <ScrollView style={{ flex: 1, padding: 16 }}>
        {messages.map((m, i) => (
          <View key={i} style={m.role === 'user' ? s.user : s.ai}>
            <Text style={s.text}>{m.content}</Text>
          </View>
        ))}
        {loading && <Text style={{ color: '#999', fontSize: 13 }}>digitando...</Text>}
      </ScrollView>

      <View style={{ marginBottom: 2, marginTop: 2 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.suggestionsScroll}>
          {SUGGESTIONS.map((sug) => (
            <TouchableOpacity key={sug} onPress={() => send(sug)} style={s.sug}>
              <Text style={s.sugText}>{sug}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={s.inputRow}>
        <TextInput
          value={input}
          onChangeText={setInput}
          placeholder="Como você está?"
          style={s.input}
          placeholderTextColor={theme.textMuted}
        />
        <TouchableOpacity onPress={() => send()} style={s.btn}>
          <Text style={{ color: '#fff' }}>→</Text>
        </TouchableOpacity>
      </View>

      <Text style={s.disclaimer}>
        Este app oferece apoio emocional e não substitui profissionais. Em crise, ligue 188 (CVV).
      </Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.bg },
  chatHeader: {
    paddingHorizontal: 20, paddingTop: 18, paddingBottom: 12,
  },
  chatTitle: { fontSize: 24, fontWeight: '900', color: theme.textPrimary, marginBottom: 6 },
  chatSubtitle: { fontSize: 13, color: theme.textSecondary, lineHeight: 20 },
  user: {
    alignSelf: 'flex-end',
    backgroundColor: theme.accentSoft,
    padding: 14,
    borderRadius: 22,
    marginBottom: 10,
    maxWidth: '78%',
  },
  ai: {
    alignSelf: 'flex-start',
    backgroundColor: theme.bgCard,
    padding: 14,
    borderRadius: 22,
    marginBottom: 10,
    maxWidth: '78%',
    borderWidth: 1,
    borderColor: theme.border,
  },
  text: { color: theme.textPrimary, lineHeight: 20 },
  sug: {
    backgroundColor: theme.bgCard,
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 18,
    marginRight: 7,
    borderWidth: 1,
    borderColor: theme.border,
    minHeight: 34,
    minWidth: 0,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    backgroundColor: theme.bgCard,
    borderTopWidth: 1,
    borderColor: theme.border,
    marginBottom: 2,
  },
  input: {
    flex: 1,
    backgroundColor: theme.bg,
    borderRadius: 18,
    paddingHorizontal: 16,
    paddingVertical: 12,
    color: theme.textPrimary,
    fontSize: 14,
  },
  btn: {
    backgroundColor: theme.accent,
    padding: 14,
    borderRadius: 18,
    marginLeft: 10,
    shadowColor: theme.accent,
    shadowOpacity: 0.25,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 10 },
    elevation: 8,
  },
  statusBar: {
    backgroundColor: theme.bgCard,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderColor: theme.border,
  },
  statusText: {
    color: theme.textSecondary,
    fontSize: 12,
    textAlign: 'center',
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: 10,
    color: theme.textMuted,
    paddingBottom: 6,
  },
});
