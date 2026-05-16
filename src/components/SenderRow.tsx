import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Sender } from '../types';
import { Colors, Radii, Spacing, Typography, Shadows } from '../constants/theme';

interface Props {
  sender: Sender;
  onPress: () => void;
  onLongPress: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map(w => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}w`;
}

const AVATAR_COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f59e0b', '#10b981', '#3b82f6', '#ef4444'];

function avatarColor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash);
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function SenderRow({ sender, onPress, onLongPress }: Props) {
  return (
    <TouchableOpacity
      style={styles.row}
      onPress={onPress}
      onLongPress={onLongPress}
      activeOpacity={0.7}
      accessibilityLabel={`Conversation with ${sender.name}`}
    >
      <View style={[styles.avatar, { backgroundColor: avatarColor(sender.name) }]}>
        <Text style={styles.initials}>{getInitials(sender.name)}</Text>
      </View>
      <View style={styles.info}>
        <View style={styles.topRow}>
          <Text style={styles.name} numberOfLines={1}>{sender.name}</Text>
          <Text style={styles.time}>{timeAgo(sender.lastMessageAt)}</Text>
        </View>
        <View style={styles.bottomRow}>
          <Text style={styles.email} numberOfLines={1}>{sender.email}</Text>
          {sender.unreadCount > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{sender.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing['4'],
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['2'],
    ...Shadows.sm,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing['3'],
  },
  initials: {
    color: '#fff',
    fontSize: Typography.base,
    fontWeight: '700',
  },
  info: { flex: 1 },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  name: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.ink,
    flex: 1,
    marginRight: Spacing['2'],
  },
  time: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  email: {
    fontSize: Typography.sm,
    color: Colors.muted,
    flex: 1,
    marginRight: Spacing['2'],
  },
  badge: {
    backgroundColor: Colors.brand,
    borderRadius: Radii.full,
    minWidth: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  badgeText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
});
