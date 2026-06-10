import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Image,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
  Dimensions
} from 'react-native';
import { theme } from '../theme';
import { signIn, signUp } from '../lib/supabase';
import logo from '../../assets/logo.png';

export default function AuthScreen() {
  const [mode, setMode] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handle = async () => {
    if (!email || !password) return Alert.alert('Preencha todos os campos');
    setLoading(true);
    try {
      const { error } = mode === 'login'
        ? await signIn(email, password)
        : await signUp(email, password);
      if (error) {
        Alert.alert('Erro', error.message);
      } else if (mode === 'signup') {
        Alert.alert('Conta criada!', 'Verifique seu e-mail para confirmar.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={s.screenOuter} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.screen} showsVerticalScrollIndicator={false}>
        <View style={s.heroContainer}>
          <View style={s.heroGradient} />
          <View style={s.logoBubble}>
            <Image source={logo} style={s.logoImage} />
          </View>
          <Text style={s.heroTitle}>Lume</Text>
          <Text style={s.heroSubtitle}>Seu companheiro para uma mente mais leve</Text>
        </View>

        <View style={s.card}>
          <View style={s.modeRow}>
            <TouchableOpacity
              style={[s.modeButton, mode === 'login' && s.modeButtonActive]}
              activeOpacity={0.85}
              onPress={() => setMode('login')}
            >
              <Text style={[s.modeText, mode === 'login' && s.modeTextActive]}>Entrar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[s.modeButton, mode === 'signup' && s.modeButtonActive]}
              activeOpacity={0.85}
              onPress={() => setMode('signup')}
            >
              <Text style={[s.modeText, mode === 'signup' && s.modeTextActive]}>Cadastrar</Text>
            </TouchableOpacity>
          </View>

          {mode === 'signup' && (
            <View style={s.field}>
              <Text style={s.fieldLabel}>NOME</Text>
              <TextInput
                style={s.input}
                value={name}
                onChangeText={setName}
                placeholder="Seu nome"
                placeholderTextColor={theme.textMuted}
              />
            </View>
          )}

          <View style={s.field}>
            <Text style={s.fieldLabel}>E-MAIL</Text>
            <TextInput
              style={s.input}
              value={email}
              onChangeText={setEmail}
              placeholder="seu@email.com"
              placeholderTextColor={theme.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={s.field}>
            <Text style={s.fieldLabel}>SENHA</Text>
            <TextInput
              style={s.input}
              value={password}
              onChangeText={setPassword}
              placeholder="••••••••"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
            />
          </View>

          <TouchableOpacity style={s.primaryButton} onPress={handle} disabled={loading} activeOpacity={0.85}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={s.primaryButtonText}>{mode === 'login' ? 'Continuar com E-mail' : 'Criar conta'}</Text>
            )}
          </TouchableOpacity>

          <View style={s.dividerRow}>
            <View style={s.divider} />
            <Text style={s.dividerText}>ou</Text>
            <View style={s.divider} />
          </View>

          <TouchableOpacity style={s.socialButton} activeOpacity={0.85}>
            <Text style={s.socialButtonText}>Continuar com Google</Text>
          </TouchableOpacity>
          <TouchableOpacity style={s.socialButton} activeOpacity={0.85}>
            <Text style={s.socialButtonText}>Continuar com Apple</Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.switchRow} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            <Text style={s.switchText}>
              {mode === 'login' ? 'Não tem uma conta? Criar agora' : 'Já tem uma conta? Entrar'}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={s.disclaimer}>
          Seus dados são privados e criptografados.{"\n"}Este app é um suporte complementar, não substitui atendimento profissional.
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  screenOuter: {
    flex: 1,
    backgroundColor: '#121339',
  },
  screen: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingVertical: 42,
  },
  heroContainer: {
    alignItems: 'center',
    marginBottom: 34,
    position: 'relative',
    minHeight: 260,
    justifyContent: 'flex-end',
  },
  heroGradient: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
    backgroundColor: '#262A67',
    opacity: 0.98,
    zIndex: 0,
  },
  logoBubble: {
    width: 120,
    height: 120,
    borderRadius: 40,
    backgroundColor: '#23255A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 18,
    shadowColor: '#7C8CFF',
    shadowOpacity: 0.18,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
    zIndex: 2,
  },
  logoImage: {
    width: 84,
    height: 84,
    resizeMode: 'contain',
  },
  heroTitle: {
    fontSize: 44,
    fontWeight: '900',
    color: '#F8F8FF',
    letterSpacing: -1.5,
    marginBottom: 8,
    zIndex: 2,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#C8CCF8',
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
    zIndex: 2,
  },
  card: {
    backgroundColor: '#F9F8FF',
    borderRadius: 34,
    padding: 22,
    shadowColor: '#0A0E32',
    shadowOpacity: 0.08,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 16 },
    elevation: 10,
    marginTop: -18,
    zIndex: 3,
  },
  modeRow: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  modeButton: {
    flex: 1,
    paddingVertical: 16,
    marginHorizontal: 4,
    borderRadius: 18,
    backgroundColor: '#EFF0FF',
    alignItems: 'center',
  },
  modeButtonActive: {
    backgroundColor: theme.accent,
  },
  modeText: {
    color: '#5A6080',
    fontWeight: '700',
  },
  modeTextActive: {
    color: '#FFFFFF',
  },
  field: {
    marginBottom: 18,
  },
  fieldLabel: {
    fontSize: 11,
    color: '#9CA3AF',
    letterSpacing: 1,
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F4F3FF',
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    color: theme.textPrimary,
    fontSize: 15,
    borderWidth: 1,
    borderColor: '#E8E9FF',
  },
  primaryButton: {
    backgroundColor: theme.accent,
    borderRadius: 18,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 18,
  },
  primaryButtonText: {
    color: theme.textInverse,
    fontSize: 15,
    fontWeight: '800',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 18,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: '#E7E8FF',
  },
  dividerText: {
    marginHorizontal: 14,
    color: '#A3AED0',
    fontSize: 12,
    fontWeight: '700',
  },
  socialButton: {
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E7E8FF',
    backgroundColor: '#FFFFFF',
    paddingVertical: 15,
    alignItems: 'center',
    marginBottom: 12,
  },
  socialButtonText: {
    color: theme.textPrimary,
    fontWeight: '700',
  },
  switchRow: {
    alignItems: 'center',
    marginTop: 10,
  },
  switchText: {
    color: theme.accent,
    fontWeight: '700',
  },
  disclaimer: {
    marginTop: 28,
    color: '#B7BCDF',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 10,
  },
});
