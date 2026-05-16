import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { ToneType } from '../types';
import { TonePicker } from './TonePicker';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';

interface Props {
  tone: ToneType;
  onToneChange: (tone: ToneType) => void;
  onSend: (text: string) => void;
  onAutoGenerate: () => void;
  disabled: boolean;
  hasEmail: boolean;
}

export function ChatInputBar({ tone, onToneChange, onSend, onAutoGenerate, disabled, hasEmail }: Props) {
  const [text, setText] = useState('');
  const [showTonePicker, setShowTonePicker] = useState(false);
  const canSend = text.trim().length > 0 && !disabled;

  function handleSend() {
    if (!canSend) return;
    onSend(text.trim());
    setText('');
  }

  function handleToneSelect(t: ToneType) {
    onToneChange(t);
    setShowTonePicker(false);
  }

  return (
    <View>
      {showTonePicker && <TonePicker selected={tone} onSelect={handleToneSelect} />}
      <View style={styles.container}>
        <TouchableOpacity
          style={styles.toneBtn}
          onPress={() => setShowTonePicker(p => !p)}
          accessibilityLabel="Select tone"
          disabled={disabled}
        >
          <Ionicons
            name={tone === 'formal' ? 'business-outline' : tone === 'friendly' ? 'happy-outline' : 'briefcase-outline'}
            size={16}
            color={Colors.brand}
          />
        </TouchableOpacity>

        <TextInput
          style={styles.input}
          value={text}
          onChangeText={setText}
          placeholder="Type your reply in plain words…"
          placeholderTextColor={Colors.muted}
          multiline
          editable={!disabled}
          accessibilityLabel="Reply input"
        />

        <TouchableOpacity
          style={[styles.autoBtn, (!hasEmail || disabled) && styles.btnDisabled]}
          onPress={onAutoGenerate}
          disabled={!hasEmail || disabled}
          accessibilityLabel="Auto-generate reply"
        >
          <Ionicons name="sparkles" size={14} color={(!hasEmail || disabled) ? Colors.muted : Colors.brand} />
          <Text style={[styles.autoBtnText, (!hasEmail || disabled) && styles.btnTextDisabled]}>Auto</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.sendBtn, !canSend && styles.btnDisabled]}
          onPress={handleSend}
          disabled={!canSend}
          accessibilityLabel="Send reply"
        >
          <Ionicons name="arrow-up" size={20} color={canSend ? '#fff' : Colors.muted} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginHorizontal: Spacing['3'],
    marginBottom: Spacing['3'],
    paddingHorizontal: Spacing['3'],
    paddingTop: Spacing['3'],
    paddingBottom: Spacing['3'],
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.rule,
    borderRadius: Radii.lg,
    gap: Spacing['2'],
  },
  toneBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    minHeight: 44,
    maxHeight: 100,
    backgroundColor: Colors.surface,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    fontSize: Typography.sm,
    color: Colors.body,
  },
  autoBtn: {
    minHeight: 44,
    paddingHorizontal: Spacing['3'],
    borderRadius: 22,
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 6,
  },
  autoBtnText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.brand,
  },
  sendBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnDisabled: {
    backgroundColor: Colors.surfaceAlt,
    opacity: 0.5,
  },
  btnTextDisabled: {
    color: Colors.muted,
  },
});
