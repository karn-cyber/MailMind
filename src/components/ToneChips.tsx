import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToneType } from '../types';
import { TONES } from '../constants/config';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';

interface Props {
  selected: ToneType;
  onChange: (tone: ToneType) => void;
}

export function ToneChips({ selected, onChange }: Props) {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>Tone</Text>
      <View style={styles.row}>
        {TONES.map(tone => {
          const active = selected === tone.key;
          return (
            <TouchableOpacity
              key={tone.key}
              onPress={() => onChange(tone.key)}
              activeOpacity={0.75}
              accessibilityLabel={`${tone.label} tone`}
              accessibilityState={{ selected: active }}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Ionicons name={tone.key === 'formal' ? 'business-outline' : tone.key === 'friendly' ? 'happy-outline' : 'briefcase-outline'} size={16} color={active ? Colors.brand : Colors.muted} />
              <Text style={[styles.chipText, active && styles.chipTextActive]}>
                {tone.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: Spacing['4'] },
  label: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.muted,
    marginBottom: Spacing['2'],
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  row: { flexDirection: 'row', gap: Spacing['2'] },
  chip: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing['1'],
    minHeight: 44,
    paddingVertical: Spacing['2'],
    paddingHorizontal: Spacing['3'],
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.rule,
    backgroundColor: Colors.white,
  },
  chipActive: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandLight,
  },
  chipText: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.muted,
  },
  chipTextActive: { color: Colors.brand },
});
