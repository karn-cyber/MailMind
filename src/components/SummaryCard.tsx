import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { Colors, Radii, Spacing, Typography, Shadows } from '../constants/theme';

interface Props {
  bullets: string[];
  compact?: boolean;
}

export function SummaryCard({ bullets, compact = false }: Props) {
  if (bullets.length === 0) return null;

  return (
    <View style={[styles.card, compact && styles.compact]}>
      <View style={styles.header}>
        <MaterialIcons name="star" size={18} color={Colors.ink} style={styles.headerIcon} />
        <Text style={styles.headerLabel}>Summary</Text>
      </View>
      {bullets.map((b, i) => (
        <View key={i} style={styles.bulletRow}>
          <View style={styles.dot} />
          <Text style={[styles.bulletText, compact && styles.bulletTextCompact]}>{b}</Text>
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.brandLight,
    borderRadius: Radii.lg,
    borderWidth: 1,
    borderColor: Colors.brandBorder,
    padding: Spacing['4'],
    ...Shadows.sm,
  },
  compact: {
    padding: Spacing['3'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    marginBottom: Spacing['3'],
  },
  headerIcon: {
    fontSize: Typography.sm,
    color: Colors.brand,
  },
  headerLabel: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.brand,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  bulletRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: Spacing['2'],
    gap: Spacing['2'],
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: Colors.brand,
    marginTop: 6,
    flexShrink: 0,
  },
  bulletText: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.body,
    lineHeight: Typography.base * 1.55,
  },
  bulletTextCompact: {
    fontSize: Typography.sm,
  },
});
