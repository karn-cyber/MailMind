import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToneType } from '../types';
import { TONES } from '../constants/config';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';

interface Props {
  selected: ToneType;
  onSelect: (tone: ToneType) => void;
}

export function TonePicker({ selected, onSelect }: Props) {
  return (
    <View style={styles.container}>
      {TONES.map(tone => {
        const isSelected = tone.key === selected;
        return (
          <TouchableOpacity
            key={tone.key}
            style={[styles.option, isSelected && styles.optionSelected]}
            onPress={() => onSelect(tone.key)}
            accessibilityLabel={`${tone.label} tone`}
            accessibilityState={{ selected: isSelected }}
          >
            <Ionicons name={tone.key === 'formal' ? 'business-outline' : tone.key === 'friendly' ? 'happy-outline' : 'briefcase-outline'} size={16} color={isSelected ? Colors.brand : Colors.muted} />
            <Text style={[styles.label, isSelected && styles.labelSelected]}>{tone.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.rule,
    paddingVertical: Spacing['3'],
    paddingHorizontal: Spacing['4'],
    gap: Spacing['2'],
  },
  option: {
    flex: 1,
    alignItems: 'center',
    minHeight: 44,
    paddingVertical: Spacing['2'],
    borderRadius: Radii.md,
    borderWidth: 1.5,
    borderColor: 'transparent',
    backgroundColor: Colors.white,
  },
  optionSelected: {
    borderColor: Colors.brand,
    backgroundColor: 'rgba(99, 102, 241, 0.08)',
  },
  label: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.body,
  },
  labelSelected: {
    color: Colors.brand,
  },
});
