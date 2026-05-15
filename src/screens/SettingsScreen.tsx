import React, { useState, useEffect } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  Linking,
  Switch,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserPrefs } from '../types';
import { useApp } from '../context/AppContext';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { Colors, Spacing, Typography, Radii, Shadows, GlobalStyles } from '../constants/theme';
import { TONES } from '../constants/config';
import { setApiKey as persistKey, deleteApiKey } from '../services/storage';
import { savePrefs } from '../services/prefs';
import { isValidKeyFormat, maskApiKey } from '../utils/emailParser';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ navigation, route }: Props) {
  const { state, setApiKey, clearApiKey, setPrefs } = useApp();
  const fromOnboarding = route.params?.fromOnboarding;

  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [isEditingKey, setIsEditingKey] = useState(!state.apiKey);
  const [keyError, setKeyError] = useState('');
  const [savedIndicator, setSavedIndicator] = useState(false);

  const [localPrefs, setLocalPrefs] = useState<UserPrefs>({ ...state.prefs });

  // Sync local prefs from context whenever context changes
  useEffect(() => {
    setLocalPrefs({ ...state.prefs });
  }, [state.prefs]);

  // ── API Key ───────────────────────────────────────────────────────────────
  async function handleSaveKey() {
    const trimmed = keyInput.trim();
    if (!isValidKeyFormat(trimmed)) {
      setKeyError('Key must start with "gsk_" and be at least 8 characters.');
      return;
    }
    setKeyError('');
    await persistKey(trimmed);
    setApiKey(trimmed);
    setIsEditingKey(false);
    setKeyInput('');
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  }

  async function handleDeleteKey() {
    Alert.alert(
      'Remove API Key',
      'Are you sure? You will need to re-enter your key to use MailMind.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: async () => {
            await deleteApiKey();
            clearApiKey();
            setIsEditingKey(true);
          },
        },
      ],
    );
  }

  // ── Prefs ─────────────────────────────────────────────────────────────────
  async function handleSavePrefs() {
    await savePrefs(localPrefs);
    setPrefs(localPrefs);
    setSavedIndicator(true);
    setTimeout(() => setSavedIndicator(false), 2000);
  }

  async function handleDone() {
    await handleSavePrefs();
    // If coming from onboarding or has back, go back; otherwise navigate to Home
    if (fromOnboarding) {
      // Reset to Home when exiting onboarding
      navigation.reset({
        index: 0,
        routes: [{ name: 'Home' }],
      });
    } else if (navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.navigate('Home');
    }
  }

  return (
    <View style={GlobalStyles.screen}>
      <ScreenHeader
        title="Settings"
        onBack={!fromOnboarding ? () => navigation.goBack() : undefined}
        rightAction={{ label: savedIndicator ? 'Saved' : 'Done', onPress: handleDone }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {fromOnboarding && (
          <View style={styles.onboardingBanner}>
            <Text style={styles.onboardingTitle}>Welcome to MailMind</Text>
            <Text style={styles.onboardingText}>
              Add your API key to get started. Your key is stored securely on your device only.
            </Text>
          </View>
        )}

        {/* ── API Key Section ──────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Key</Text>
          <Text style={styles.sectionSubtitle}>
            Used for all AI features. Never leaves your device.
          </Text>

          {!isEditingKey && state.apiKey ? (
            <View style={styles.card}>
              <View style={styles.keyDisplay}>
                <Text style={styles.keyMasked}>{maskApiKey(state.apiKey)}</Text>
                <View style={styles.keyBadge}>
                  <Text style={styles.keyBadgeText}>Active</Text>
                </View>
              </View>
              <View style={styles.keyActions}>
                <Button
                  label="Change Key"
                  variant="secondary"
                  size="sm"
                  onPress={() => setIsEditingKey(true)}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Remove"
                  variant="danger"
                  size="sm"
                  onPress={handleDeleteKey}
                  style={{ flex: 1 }}
                />
              </View>
            </View>
          ) : (
            <View style={styles.card}>
              <View style={styles.keyInputRow}>
                <TextInput
                  style={styles.keyInput}
                  value={keyInput}
                  onChangeText={v => { setKeyInput(v); setKeyError(''); }}
                  placeholder="gsk_…"
                  placeholderTextColor={Colors.subtle}
                  secureTextEntry={!showKey}
                  autoCorrect={false}
                  autoCapitalize="none"
                  accessibilityLabel="API key input"
                />
                <TouchableOpacity
                  onPress={() => setShowKey(p => !p)}
                  style={styles.eyeBtn}
                  accessibilityLabel={showKey ? 'Hide key' : 'Show key'}
                >
                  <Text style={styles.eyeIcon}>{showKey ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
              </View>
              {keyError ? <Text style={styles.keyError}>{keyError}</Text> : null}
              <Button
                label="Save API Key"
                onPress={handleSaveKey}
                disabled={keyInput.trim().length < 10}
                fullWidth
                style={{ marginTop: Spacing['3'] }}
              />
              <TouchableOpacity
                onPress={() => Linking.openURL('https://console.groq.com/keys')}
                style={styles.getKeyLink}
                accessibilityLabel="Get your free Groq API key"
              >
                <Text style={styles.getKeyText}>→ Get your free Groq API key from console.groq.com</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Default Tone Section ─────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Default Tone</Text>
          <Text style={styles.sectionSubtitle}>Your preferred email tone. Changeable per session.</Text>
          <View style={styles.card}>
            {TONES.map((tone, i) => {
              const selected = localPrefs.defaultTone === tone.key;
              return (
                <TouchableOpacity
                  key={tone.key}
                  onPress={() => setLocalPrefs(p => ({ ...p, defaultTone: tone.key }))}
                  style={[styles.optionRow, i > 0 && styles.optionRowBorder, selected && styles.optionRowSelected]}
                  accessibilityLabel={tone.label}
                  accessibilityState={{ selected }}
                >
                  <View style={styles.radioOuter}>
                    {selected && <View style={styles.radioInner} />}
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.optionHeader}>
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>
                        {tone.label}
                      </Text>
                    </View>
                    <Text style={styles.optionDesc}>{tone.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Signature ────────────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Signature</Text>
          <Text style={styles.sectionSubtitle}>Optional. Appended to every reply.</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.signatureInput}
              value={localPrefs.signature}
              onChangeText={v => setLocalPrefs(p => ({ ...p, signature: v }))}
              placeholder={'e.g.\nBest regards,\nJohn Smith\njohn@company.com'}
              placeholderTextColor={Colors.subtle}
              multiline
              textAlignVertical="top"
              autoCorrect={false}
              accessibilityLabel="Email signature"
            />
          </View>
        </View>

        <Button label="Save Settings" onPress={handleDone} fullWidth size="lg" />

        {/* Version */}
        <Text style={styles.version}>MailMind v1.0  ·  BYOK  ·  No backend</Text>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing['4'],
    paddingBottom: Spacing['12'],
    gap: Spacing['5'],
  },
  onboardingBanner: {
    backgroundColor: Colors.brandLight,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    borderWidth: 1,
    borderColor: Colors.brandBorder,
  },
  onboardingTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.brand,
    marginBottom: Spacing['2'],
  },
  onboardingText: {
    fontSize: Typography.sm,
    color: Colors.body,
    lineHeight: Typography.sm * 1.6,
  },
  section: { gap: Spacing['2'] },
  sectionTitle: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.ink,
  },
  sectionSubtitle: {
    fontSize: Typography.xs,
    color: Colors.muted,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    ...Shadows.sm,
  },
  // Key display
  keyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['3'],
  },
  keyMasked: {
    fontSize: Typography.base,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
    color: Colors.body,
    letterSpacing: 1,
  },
  keyBadge: {
    backgroundColor: Colors.greenLight,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 2,
  },
  keyBadgeText: { fontSize: Typography.xs, fontWeight: '700', color: Colors.green },
  keyActions: { flexDirection: 'row', gap: Spacing['3'] },
  keyInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.rule,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
  },
  keyInput: {
    flex: 1,
    fontSize: Typography.base,
    color: Colors.body,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  eyeBtn: { padding: Spacing['2'] },
  eyeIcon: { fontSize: Typography.md },
  keyError: {
    fontSize: Typography.xs,
    color: Colors.red,
    marginTop: Spacing['2'],
  },
  getKeyLink: { marginTop: Spacing['3'], alignItems: 'center' },
  getKeyText: {
    fontSize: Typography.xs,
    color: Colors.brand,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  // Options
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing['3'],
    gap: Spacing['3'],
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['2'],
  },
  optionRowBorder: { borderTopWidth: 1, borderTopColor: Colors.rule },
  optionRowSelected: { backgroundColor: Colors.brandLight },
  radioOuter: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.brand,
  },
  optionHeader: { flexDirection: 'row', alignItems: 'center', gap: Spacing['2'], marginBottom: 2 },
  optionEmoji: { fontSize: Typography.base },
  optionLabel: { fontSize: Typography.base, fontWeight: '600', color: Colors.body },
  optionLabelSelected: { color: Colors.brand },
  optionDesc: { fontSize: Typography.sm, color: Colors.muted, lineHeight: Typography.sm * 1.5 },
  badge: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing['2'],
    paddingVertical: 2,
  },
  badgeSelected: { backgroundColor: Colors.brand },
  badgeText: { fontSize: Typography.xs, color: Colors.muted, fontWeight: '600' },
  badgeTextSelected: { color: Colors.white },
  signatureInput: {
    minHeight: 80,
    fontSize: Typography.sm,
    color: Colors.body,
    lineHeight: Typography.sm * 1.6,
    textAlignVertical: 'top',
  },
  version: {
    fontSize: Typography.xs,
    color: Colors.subtle,
    textAlign: 'center',
    marginTop: Spacing['2'],
  },
});
