import React, { useEffect, useState } from 'react';
import { View, StatusBar, StyleSheet, ActivityIndicator } from 'react-native';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initializeAds } from './src/lib/ads';

import { theme } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { initPurchases } from './src/lib/purchases';

import BottomNav from './src/components/BottomNav';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import CheckinScreen from './src/screens/CheckinScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProfileScreen from './src/screens/ProfileScreen';

function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('Home');

  useEffect(() => {
    initializeAds();
    initPurchases();
  }, []);

  if (loading) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  if (!user) return <AuthScreen />;

  const renderScreen = () => {
    switch (screen) {
      case 'Chat': return <ChatScreen user={user} />;
      case 'Checkin': return <CheckinScreen user={user} onDone={() => setScreen('Home')} />;
      case 'Journal': return <JournalScreen user={user} />;
      case 'Profile': return <ProfileScreen user={user} />;
      default: return <HomeScreen user={user} onCheckin={() => setScreen('Checkin')} />;
    }
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={s.safe}>
        <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
        <View style={s.appWrap}>
          {renderScreen()}
          <BottomNav active={screen} onNavigate={setScreen} />
        </View>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  appWrap: { flex: 1, backgroundColor: theme.bg },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.bg,
  },
});

registerRootComponent(App);
export default App;