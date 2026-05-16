import React, { useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { Colors, Spacing, Typography, Radii, Shadows, GlobalStyles } from '../constants/theme';
import { MIN_EMAIL_LENGTH, MAX_EMAIL_LENGTH } from '../constants/config';

type Props = NativeStackScreenProps<RootStackParamList, 'Home'>;

export function HomeScreen({ navigation }: Props) {
  const { state, setEmail, runSummarise, clearError, cancelCurrentRequest, reset } = useApp();
  const inputRef = useRef<TextInput>(null);

  const charCount = state.currentEmail.length;
  const canSummarise = charCount >= MIN_EMAIL_LENGTH && !state.isLoading;
  const isTruncated = charCount >= MAX_EMAIL_LENGTH;

  async function handlePaste() {
    const text = await Clipboard.getStringAsync();
    if (!text?.trim()) {
      Alert.alert('Nothing to paste', 'Your clipboard is empty.');
      return;
    }
    setEmail(text);
    inputRef.current?.focus();
  }

  async function handleSummarise() {
    const success = await runSummarise();
    if (success) {
      navigation.navigate('Summary');
    }
  }

  return (
    <KeyboardAvoidingView
      style={GlobalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Top bar */}
      <View style={styles.topBar}>
        <View>
          <Text style={styles.logo}>MailMind</Text>
          <Text style={styles.tagline}>Paste · Summarise · Reply</Text>
        </View>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings', {})}
          style={styles.settingsBtn}
          accessibilityLabel="Open Settings"
        >
          <Ionicons name="settings-outline" size={24} color={Colors.ink} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        {state.error && (
          <ErrorBanner
            error={state.error}
            onRetry={handleSummarise}
            onGoToSettings={() => navigation.navigate('Settings', {})}
            onDismiss={clearError}
          />
        )}

        {/* Input card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}><Ionicons name="mail-outline" size={16} color={Colors.ink} />  Paste Email</Text>
            <TouchableOpacity onPress={handlePaste} style={styles.pasteChip} accessibilityLabel="Paste from clipboard">
              <Text style={styles.pasteChipText}><Ionicons name="clipboard-outline" size={14} color={Colors.brand} />  Paste</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            ref={inputRef}
            style={styles.input}
            value={state.currentEmail}
            onChangeText={setEmail}
            placeholder="Paste the email you received here…"
            placeholderTextColor={Colors.subtle}
            multiline
            textAlignVertical="top"
            autoCorrect={false}
            autoCapitalize="none"
            accessibilityLabel="Email input"
            accessibilityHint="Paste the email you want to summarise"
            maxLength={MAX_EMAIL_LENGTH + 100}
          />

          <View style={styles.cardFooter}>
            <Text style={[styles.charCount, isTruncated && styles.charCountWarn]}>
              {charCount.toLocaleString()} / {MAX_EMAIL_LENGTH.toLocaleString()} chars
            </Text>
            {charCount > 0 && (
              <TouchableOpacity onPress={() => { setEmail(''); }} accessibilityLabel="Clear input">
                <Text style={styles.clearText}>Clear</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>

        {/* Help text */}
        {charCount === 0 && (
          <View style={styles.helpSection}>
            <Text style={styles.helpTitle}>How it works</Text>
            {[
              { icon: <Ionicons key="paste" name="clipboard-outline" size={18} color={Colors.ink} />, text: 'Paste any email you received' },
              { icon: <Ionicons key="star" name="sparkles" size={18} color={Colors.ink} />, text: 'Get a 3-second AI summary' },
              { icon: <Ionicons key="edit" name="pencil-outline" size={18} color={Colors.ink} />, text: 'Type your reply in plain words' },
              { icon: <Ionicons key="send" name="arrow-up" size={18} color={Colors.ink} />, text: 'Send a polished professional email' },
            ].map(item => (
              <View key={item.text} style={styles.helpRow}>
                <View style={styles.helpIcon}>{item.icon}</View>
                <Text style={styles.helpText}>{item.text}</Text>
              </View>
            ))}
          </View>
        )}

        <Button
          label="Summarise Email"
          onPress={handleSummarise}
          disabled={!canSummarise}
          fullWidth
          size="lg"
          style={styles.cta}
        />
      </ScrollView>

      <LoadingOverlay
        visible={state.isLoading}
        message={state.loadingMessage}
        onCancel={cancelCurrentRequest}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
    paddingHorizontal: Spacing['5'],
    paddingVertical: Spacing['4'],
    borderBottomWidth: 1,
    borderBottomColor: Colors.rule,
  },
  logo: {
    fontSize: Typography['2xl'],
    fontWeight: '800',
    color: Colors.brand,
    letterSpacing: -0.5,
  },
  tagline: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 2,
  },
  settingsBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingsIcon: { fontSize: Typography.xl },
  content: {
    padding: Spacing['4'],
    paddingBottom: Spacing['10'],
    gap: Spacing['4'],
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    ...Shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['3'],
  },
  cardLabel: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  pasteChip: {
    backgroundColor: Colors.brandLight,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1'],
    borderWidth: 1,
    borderColor: Colors.brandBorder,
  },
  pasteChipText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.brand,
  },
  input: {
    minHeight: 200,
    fontSize: Typography.base,
    color: Colors.body,
    lineHeight: Typography.base * 1.6,
    textAlignVertical: 'top',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing['2'],
    paddingTop: Spacing['2'],
    borderTopWidth: 1,
    borderTopColor: Colors.rule,
  },
  charCount: {
    fontSize: Typography.xs,
    color: Colors.subtle,
  },
  charCountWarn: { color: Colors.amber },
  clearText: {
    fontSize: Typography.xs,
    color: Colors.red,
    fontWeight: '600',
  },
  helpSection: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    gap: Spacing['3'],
    ...Shadows.sm,
  },
  helpTitle: {
    fontSize: Typography.sm,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing['1'],
  },
  helpRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
  },
  helpIcon: { fontSize: Typography.lg, width: 28 },
  helpText: { fontSize: Typography.base, color: Colors.body },
  cta: { marginTop: Spacing['2'] },
});
