import React from 'react';
import {
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  ViewStyle,
  TextStyle,
} from 'react-native';
import { Colors, Radii, Spacing, Typography, Shadows } from '../constants/theme';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

interface ButtonProps {
  label: string;
  onPress: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  loading?: boolean;
  fullWidth?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  accessibilityLabel?: string;
}

export function Button({
  label,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  fullWidth = false,
  style,
  textStyle,
  accessibilityLabel,
}: ButtonProps) {
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.75}
      accessibilityLabel={accessibilityLabel ?? label}
      accessibilityRole="button"
      accessibilityState={{ disabled: isDisabled }}
      style={[
        styles.base,
        styles[variant],
        styles[`size_${size}`],
        fullWidth && styles.fullWidth,
        isDisabled && styles.disabled,
        isDisabled && styles[`${variant}_disabled`],
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === 'primary' ? Colors.white : Colors.brand}
        />
      ) : (
        <Text
          style={[
            styles.text,
            styles[`text_${variant}`],
            styles[`textSize_${size}`],
            isDisabled && styles.textDisabled,
            textStyle,
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: Radii.md,
    minHeight: 44,
  },
  fullWidth: { width: '100%' },

  // Variants
  primary: {
    backgroundColor: Colors.brand,
    ...Shadows.md,
  },
  secondary: {
    backgroundColor: Colors.white,
    borderWidth: 1.5,
    borderColor: Colors.brand,
  },
  ghost: {
    backgroundColor: 'transparent',
  },
  danger: {
    backgroundColor: Colors.red,
  },

  // Disabled
  disabled: { opacity: 0.5 },
  primary_disabled: {},
  secondary_disabled: {},
  ghost_disabled: {},
  danger_disabled: {},

  // Sizes
  size_sm: { paddingHorizontal: Spacing['3'], paddingVertical: Spacing['2'] },
  size_md: { paddingHorizontal: Spacing['5'], paddingVertical: Spacing['3'] },
  size_lg: { paddingHorizontal: Spacing['6'], paddingVertical: Spacing['4'] },

  // Text
  text: { fontWeight: '600', letterSpacing: 0.2 },
  text_primary: { color: Colors.white },
  text_secondary: { color: Colors.brand },
  text_ghost: { color: Colors.brand },
  text_danger: { color: Colors.white },
  textDisabled: {},

  textSize_sm: { fontSize: Typography.sm },
  textSize_md: { fontSize: Typography.base },
  textSize_lg: { fontSize: Typography.md },
});
