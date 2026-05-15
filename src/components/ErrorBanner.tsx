import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { AppError } from '../types';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';

interface Props {
  error: AppError;
  onRetry?: () => void;
  onGoToSettings?: () => void;
  onDismiss?: () => void;
}

export function ErrorBanner({ error, onRetry, onGoToSettings, onDismiss }: Props) {
  return (
    <View style={styles.container} accessibilityRole="alert">
      <Text style={styles.message}>{error.message}</Text>
      <View style={styles.actions}>
        {error.retryable && onRetry && (
          <TouchableOpacity onPress={onRetry} style={styles.btn} accessibilityLabel="Retry">
            <Text style={styles.btnText}>Retry</Text>
          </TouchableOpacity>
        )}
        {error.navigateToSettings && onGoToSettings && (
          <TouchableOpacity onPress={onGoToSettings} style={styles.btn} accessibilityLabel="Open Settings">
            <Text style={styles.btnText}>Open Settings</Text>
          </TouchableOpacity>
        )}
        {onDismiss && (
          <TouchableOpacity onPress={onDismiss} style={styles.dismiss} accessibilityLabel="Dismiss error">
            <Text style={styles.dismissText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: Colors.redLight,
    borderLeftWidth: 4,
    borderLeftColor: Colors.red,
    borderRadius: Radii.md,
    padding: Spacing['4'],
    marginHorizontal: Spacing['4'],
    marginBottom: Spacing['4'],
  },
  message: {
    fontSize: Typography.sm,
    color: Colors.red,
    lineHeight: Typography.sm * 1.5,
    fontWeight: '500',
  },
  actions: {
    flexDirection: 'row',
    marginTop: Spacing['2'],
    gap: Spacing['3'],
  },
  btn: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1'],
    backgroundColor: Colors.red,
    borderRadius: Radii.sm,
  },
  btnText: {
    color: Colors.white,
    fontSize: Typography.xs,
    fontWeight: '600',
  },
  dismiss: {
    marginLeft: 'auto',
    padding: Spacing['1'],
  },
  dismissText: {
    color: Colors.red,
    fontSize: Typography.base,
    fontWeight: '600',
  },
});
