import React, { useState, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, Modal, StyleSheet,
  Share, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';

interface Props {
  visible: boolean;
  replyText: string;
  toneName: string;
  onConfirm: (editedText: string) => void;
  onCancel: () => void;
}

export function ReviewModal({ visible, replyText, toneName, onConfirm, onCancel }: Props) {
  const [text, setText] = useState(replyText);
  const [copied, setCopied] = useState(false);

  // Sync text when replyText changes
  React.useEffect(() => {
    setText(replyText);
  }, [replyText]);

  const handleCopy = useCallback(async () => {
    await Clipboard.setStringAsync(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [text]);

  const handleShare = useCallback(async () => {
    try {
      await Share.share({ message: text });
    } catch {}
  }, [text]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableOpacity style={styles.backdrop} activeOpacity={1} onPress={onCancel}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.keyboardView}
        >
          <TouchableOpacity activeOpacity={1} style={styles.sheet}>
            <View style={styles.handle} />
            <Text style={styles.title}>Your Formal Reply</Text>
            <Text style={styles.subtitle}>{toneName}</Text>

            <ScrollView style={styles.scroll}>
              <TextInput
                style={styles.textInput}
                value={text}
                onChangeText={setText}
                multiline
                textAlignVertical="top"
                accessibilityLabel="Edit reply"
              />
            </ScrollView>

            <View style={styles.actions}>
              <TouchableOpacity style={styles.actionBtn} onPress={handleCopy} accessibilityLabel="Copy reply">
                {copied ? (
                  <Ionicons name="checkmark-circle-outline" size={14} color={Colors.green} />
                ) : (
                  <Ionicons name="copy-outline" size={16} color={Colors.subtle} />
                )}
                <Text style={styles.actionLabel}>{copied ? 'Copied' : 'Copy'}</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionBtn} onPress={handleShare} accessibilityLabel="Share reply">
                <Ionicons name="share-outline" size={16} color={Colors.subtle} />
                <Text style={styles.actionLabel}>Share</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.actionBtn, styles.sendBtn]}
                onPress={() => onConfirm(text)}
                accessibilityLabel="Confirm and send reply"
              >
                <Ionicons name="checkmark" size={16} color="#fff" />
                <Text style={styles.sendIcon}>Send</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={onCancel} style={styles.cancelBtn} accessibilityLabel="Cancel">
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  keyboardView: {
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: Colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: Spacing['5'],
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: Colors.rule,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing['4'],
  },
  title: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.ink,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: Typography.sm,
    color: Colors.brand,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing['4'],
    fontWeight: '600',
  },
  scroll: {
    maxHeight: 300,
    marginBottom: Spacing['4'],
  },
  textInput: {
    fontSize: Typography.sm,
    color: Colors.body,
    lineHeight: Typography.sm * 1.6,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    padding: Spacing['4'],
    minHeight: 150,
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing['3'],
    marginBottom: Spacing['3'],
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 44,
    paddingVertical: Spacing['3'],
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    gap: 6,
  },
  actionLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.body,
  },
  sendBtn: {
    backgroundColor: Colors.brand,
  },
  sendIcon: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: '#fff',
    marginLeft: 6,
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: Spacing['2'],
  },
  cancelText: {
    fontSize: Typography.sm,
    color: Colors.muted,
    fontWeight: '500',
  },
});
