import React from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  StyleSheet,
  TouchableOpacity,
  Modal,
} from 'react-native';
import { Colors, Radii, Spacing, Typography, Shadows } from '../constants/theme';

interface Props {
  visible: boolean;
  message?: string;
  onCancel?: () => void;
}

export function LoadingOverlay({ visible, message = 'Working…', onCancel }: Props) {
  return (
    <Modal visible={visible} transparent animationType="fade" statusBarTranslucent>
      <View style={styles.backdrop}>
        <View style={styles.card}>
          <ActivityIndicator size="large" color={Colors.brand} />
          <Text style={styles.message}>{message}</Text>
          {onCancel && (
            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} accessibilityLabel="Cancel request">
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.xl,
    paddingVertical: Spacing['8'],
    paddingHorizontal: Spacing['8'],
    alignItems: 'center',
    minWidth: 200,
    ...Shadows.lg,
  },
  message: {
    marginTop: Spacing['4'],
    fontSize: Typography.base,
    color: Colors.body,
    fontWeight: '500',
    textAlign: 'center',
  },
  cancelBtn: {
    marginTop: Spacing['5'],
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['2'],
    borderRadius: Radii.full,
    borderWidth: 1.5,
    borderColor: Colors.rule,
  },
  cancelText: {
    fontSize: Typography.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
});
