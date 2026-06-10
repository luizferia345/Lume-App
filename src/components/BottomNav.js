import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { theme } from '../theme';

const NAV_ITEMS = [
  { icon: '🏠', label: 'Início', key: 'Home' },
  { icon: '📓', label: 'Histórico', key: 'Journal' },
  { icon: '🧭', label: 'Check-in', key: 'Checkin' },
  { icon: '💬', label: 'IA', key: 'Chat' },
  { icon: '👤', label: 'Perfil', key: 'Profile' },
];

export default function BottomNav({ active, onNavigate }) {
  return (
    <View style={s.wrap}>
      <View style={s.container}>
        {NAV_ITEMS.map((item) => {
          const isActive = active === item.key;
          return (
            <TouchableOpacity
              key={item.key}
              style={[s.item, isActive && s.itemActive]}
              onPress={() => onNavigate(item.key)}
              activeOpacity={0.75}
            >
              <View style={[s.iconBubble, isActive && s.iconBubbleActive]}>
                <Text style={[s.icon, isActive && s.iconActive]}>{item.icon}</Text>
              </View>
              <Text style={[s.label, isActive && s.labelActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  wrap: {
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 18,
    backgroundColor: theme.bg,
  },
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: theme.bgCard,
    borderRadius: 28,
    borderWidth: 1,
    borderColor: theme.border,
    paddingVertical: 10,
    paddingHorizontal: 10,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  itemActive: {
    backgroundColor: theme.accentSoft,
    borderRadius: 20,
  },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.bg,
  },
  iconBubbleActive: {
    backgroundColor: theme.accent,
    shadowColor: theme.accent,
    shadowOpacity: 0.25,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  icon: { fontSize: 18, color: theme.textSecondary },
  iconActive: { color: theme.textInverse },
  label: { fontSize: 10, fontWeight: '700', color: theme.textSecondary },
  labelActive: { color: theme.accent },
});
