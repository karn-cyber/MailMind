import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { Colors, Spacing, Typography } from '../constants/theme';

interface Props {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  rightAction?: { label: string; onPress: () => void };
}

export function ScreenHeader({ title, subtitle, onBack, rightAction }: Props) {
  return (
    <View style={styles.container}>
      <View style={styles.row}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={styles.backBtn}
            accessibilityLabel="Go back"
            accessibilityRole="button"
          >
            <Text style={styles.backIcon}>←</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}

        <View style={styles.titleGroup}>
          <Text style={styles.title} numberOfLines={1}>{title}</Text>
          {subtitle && <Text style={styles.subtitle} numberOfLines={1}>{subtitle}</Text>}
        </View>

        {rightAction ? (
          <TouchableOpacity
            onPress={rightAction.onPress}
            style={styles.rightBtn}
            accessibilityLabel={rightAction.label}
            accessibilityRole="button"
          >
            <Text style={styles.rightLabel}>{rightAction.label}</Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.backPlaceholder} />
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rule,
    paddingTop: Platform.OS === 'android' ? Spacing['4'] : 0,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    minHeight: 52,
  },
  backBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: Typography.xl,
    color: Colors.brand,
    fontWeight: '300',
  },
  backPlaceholder: { width: 40 },
  titleGroup: { flex: 1, alignItems: 'center' },
  title: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.ink,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  rightBtn: {
    width: 72,
    alignItems: 'flex-end',
    justifyContent: 'center',
  },
  rightLabel: {
    fontSize: Typography.sm,
    color: Colors.brand,
    fontWeight: '600',
  },
});
