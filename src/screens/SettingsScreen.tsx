import React, { useState, useEffect, useCallback } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet,
  Alert, Linking, Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList, UserPrefs } from '../types';
import { getApiKey, setApiKey, deleteApiKey } from '../services/storage';
import { getPrefs, savePrefs } from '../services/prefs';
import { isValidKeyFormat, maskApiKey } from '../utils/emailParser';
import { Button } from '../components/Button';
import { TONES, DEFAULT_PREFS } from '../constants/config';
import { Colors, Radii, Spacing, Typography, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Settings'>;

export function SettingsScreen({ route, navigation }: Props) {
  const fromOnboarding = route.params?.fromOnboarding ?? false;

  const [hasKey, setHasKey] = useState(false);
  const [maskedKey, setMaskedKey] = useState('');
  const [keyInput, setKeyInput] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [keyError, setKeyError] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<UserPrefs>(DEFAULT_PREFS);

  useEffect(() => {
    (async () => {
      const key = await getApiKey();
      if (key) {
        setHasKey(true);
        setMaskedKey(maskApiKey(key));
      }
      const prefs = await getPrefs();
      setLocalPrefs(prefs);
    })();
  }, []);

  // ── API Key ───────────────────────────────────────────────────────────────
  async function handleSaveKey() {
    const trimmed = keyInput.trim();
    if (!isValidKeyFormat(trimmed)) {
      setKeyError('Key must start with "gsk_" and be at least 8 characters.');
      return;
    }
    setKeyError('');
    await setApiKey(trimmed);
    setHasKey(true);
    setMaskedKey(maskApiKey(trimmed));
    setKeyInput('');
    setJustSaved(true);
    setTimeout(() => setJustSaved(false), 2000);
  }

  function handleRemoveKey() {
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
            setHasKey(false);
            setMaskedKey('');
          },
        },
      ]
    );
  }

  // ── Save Preferences ──────────────────────────────────────────────────────
  async function handleSavePrefs() {
    await savePrefs(localPrefs);
    if (fromOnboarding && hasKey) {
      navigation.goBack();
    } else {
      Alert.alert('Saved', 'Your settings have been saved.');
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: Colors.surface }}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.headerRow}>
          {!fromOnboarding && (
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
              <Ionicons name="chevron-back" size={18} color={Colors.brand} />
            </TouchableOpacity>
          )}
          <Text style={styles.pageTitle}>Settings</Text>
        </View>

        {fromOnboarding && !hasKey && (
          <View style={styles.onboardingBanner}>
            <Text style={styles.onboardingTitle}>Welcome to MailMind</Text>
            <Text style={styles.onboardingText}>
              To get started, add your free Groq API key below. Your key stays on this device only.
            </Text>
          </View>
        )}

        {/* ── API Key Section ─────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>API Key</Text>
          <Text style={styles.sectionSubtitle}>Your key is stored securely on this device.</Text>

          {hasKey ? (
            <View style={styles.card}>
              <View style={styles.keyDisplay}>
                <Text style={styles.keyMasked}>{maskedKey}</Text>
                <View style={styles.keyBadge}>
                  <Text style={styles.keyBadgeText}>{justSaved ? 'Saved' : 'Active'}</Text>
                </View>
              </View>
              <View style={styles.keyActions}>
                <Button
                  label="Change Key"
                  variant="outline"
                  size="sm"
                  onPress={() => { setHasKey(false); setKeyInput(''); }}
                  style={{ flex: 1 }}
                />
                <Button
                  label="Remove"
                  variant="danger"
                  size="sm"
                  onPress={handleRemoveKey}
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
                  <Ionicons name={showKey ? 'eye-off-outline' : 'eye-outline'} size={18} color={Colors.brand} />
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
                <View style={styles.getKeyRow}>
                  <Ionicons name="open-outline" size={16} color={Colors.brand} />
                  <Text style={styles.getKeyText}>Get your free Groq API key from console.groq.com</Text>
                </View>
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
                      <Ionicons
                        name={tone.key === 'formal' ? 'business-outline' : tone.key === 'friendly' ? 'happy-outline' : 'briefcase-outline'}
                        size={18}
                        color={selected ? Colors.brand : Colors.muted}
                      />
                      <Text style={[styles.optionLabel, selected && styles.optionLabelSelected]}>{tone.label}</Text>
                    </View>
                    <Text style={styles.optionDesc}>{tone.description}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* ── Signature Section ────────────────────────────────────── */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Email Signature</Text>
          <Text style={styles.sectionSubtitle}>Optional. Appended to every reply.</Text>
          <View style={styles.card}>
            <TextInput
              style={styles.signatureInput}
              value={localPrefs.signature}
              onChangeText={s => setLocalPrefs(p => ({ ...p, signature: s }))}
              placeholder={'e.g.\nBest regards,\nJohn Smith\njohn@company.com'}
              placeholderTextColor={Colors.subtle}
              multiline
              textAlignVertical="top"
              autoCorrect={false}
              accessibilityLabel="Email signature"
            />
          </View>
        </View>

        <Button label="Save Settings" onPress={handleSavePrefs} fullWidth size="lg" />
        <Text style={styles.version}>MailMind v2.0  ·  Groq  ·  MongoDB</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing['4'],
    paddingBottom: Spacing['12'],
    gap: Spacing['5'],
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['3'],
  },
  backBtn: { padding: Spacing['2'] },
  pageTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  onboardingBanner: {
    backgroundColor: 'rgba(99,102,241,0.08)',
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    borderWidth: 1,
    borderColor: 'rgba(99,102,241,0.2)',
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
  keyDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing['3'],
  },
  keyMasked: {
    fontSize: Typography.base,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    color: Colors.body,
    letterSpacing: 1,
  },
  keyBadge: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
    borderRadius: Radii.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 2,
  },
  keyBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: '#10b981',
  },
  keyActions: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
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
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  eyeBtn: { padding: Spacing['2'] },
  keyError: {
    fontSize: Typography.xs,
    color: Colors.red,
    marginTop: Spacing['2'],
  },
  getKeyLink: {
    marginTop: Spacing['3'],
    alignItems: 'center',
  },
  getKeyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  getKeyText: {
    fontSize: Typography.xs,
    color: Colors.brand,
    textDecorationLine: 'underline',
    fontWeight: '500',
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: Spacing['3'],
    gap: Spacing['3'],
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['2'],
  },
  optionRowBorder: {
    borderTopWidth: 1,
    borderTopColor: Colors.rule,
  },
  optionRowSelected: {
    backgroundColor: 'rgba(99,102,241,0.06)',
  },
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
  optionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing['2'],
    marginBottom: 2,
  },
  optionLabel: {
    fontSize: Typography.base,
    fontWeight: '600',
    color: Colors.body,
  },
  optionLabelSelected: { color: Colors.brand },
  optionDesc: {
    fontSize: Typography.sm,
    color: Colors.muted,
    lineHeight: Typography.sm * 1.5,
  },
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
