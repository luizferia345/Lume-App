import React, { useEffect, useState } from 'react';
import {
  View, StatusBar, StyleSheet, ActivityIndicator, BackHandler,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { registerRootComponent } from 'expo';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
import { initializeAds } from './src/lib/ads';

import { theme } from './src/theme';
import { useAuth } from './src/hooks/useAuth';
import { initPurchases } from './src/lib/purchases';

import BottomNav from './src/components/BottomNav';
import OnboardingScreen from './src/screens/OnboardingScreen';
import AuthScreen from './src/screens/AuthScreen';
import HomeScreen from './src/screens/HomeScreen';
import ChatScreen from './src/screens/ChatScreen';
import CheckinScreen from './src/screens/CheckinScreen';
import JournalScreen from './src/screens/JournalScreen';
import ProfileScreen from './src/screens/ProfileScreen';

const ONBOARDING_KEY = '@lume:onboarding_completed_v1';

function App() {
  const { user, loading } = useAuth();
  const [screen, setScreen] = useState('Home');
  const [initialMood, setInitialMood] = useState(2);
  const [onboardingChecked, setOnboardingChecked] = useState(false);
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(false);

  useEffect(() => {
    initializeAds();
    initPurchases();
    AsyncStorage.getItem(ONBOARDING_KEY)
      .then((val) => {
        setHasSeenOnboarding(val === 'true');
      })
      .finally(() => {
        setOnboardingChecked(true);
      });
  }, []);

  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (user && screen !== 'Home') {
        setScreen('Home');
        return true;
      }
      return false;
    });
    return () => sub.remove();
  }, [user, screen]);

  const handleCompleteOnboarding = async () => {
    setHasSeenOnboarding(true);
    try {
      await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
    } catch (_e) {
      // Ignora erro local
    }
  };

  if (loading || !onboardingChecked) {
    return (
      <View style={s.loading}>
        <ActivityIndicator color={theme.accent} size="large" />
      </View>
    );
  }

  if (!hasSeenOnboarding && !user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={s.safe}>
          <StatusBar barStyle="dark-content" backgroundColor={theme.bg} />
          <OnboardingScreen onStart={handleCompleteOnboarding} />
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!user) {
    return (
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor="#121339" />
        <AuthScreen />
      </SafeAreaProvider>
    );
  }

  const openCheckin = (moodIdx = 2) => {
    setInitialMood(typeof moodIdx === 'number' ? moodIdx : 2);
    setScreen('Checkin');
  };

  const renderScreen = () => {
    switch (screen) {
      case 'Chat':
        return <ChatScreen user={user} onNavigateProfile={() => setScreen('Profile')} />;
      case 'Checkin':
        return (
          <CheckinScreen
            user={user}
            initialMood={initialMood}
            onDone={() => setScreen('Home')}
          />
        );
      case 'Journal':
        return <JournalScreen user={user} />;
      case 'Profile':
        return <ProfileScreen user={user} />;
      default:
        return <HomeScreen user={user} onCheckin={openCheckin} />;
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
