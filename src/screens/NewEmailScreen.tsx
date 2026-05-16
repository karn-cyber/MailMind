import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity, StyleSheet,
  Alert, ScrollView, ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { createSender, createMessage } from '../services/api';
import { getApiKey } from '../services/storage';
import { summarizeEmail } from '../services/groq';
import { stripHtml, truncateEmail } from '../utils/emailParser';
import { MAX_EMAIL_LENGTH, API_TIMEOUT_MS } from '../constants/config';
import { Colors, Radii, Spacing, Typography, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'NewEmail'>;

export function NewEmailScreen({ route, navigation }: Props) {
  const existingSender = route.params?.senderId;
  const isNewSender = !existingSender;

  // Step tracking for new sender mode
  const [step, setStep] = useState(isNewSender ? 1 : 2);

  // Sender fields (step 1)
  const [senderName, setSenderName] = useState(route.params?.senderName || '');
  const [senderEmail, setSenderEmail] = useState(route.params?.senderEmail || '');

  // Email field (step 2)
  const [emailBody, setEmailBody] = useState('');
  const [loading, setLoading] = useState(false);

  // ─── Paste from clipboard ──────────────────────────────────────────────────
  async function handlePaste() {
    const text = await Clipboard.getStringAsync();
    if (text) {
      setEmailBody(stripHtml(text));
    }
  }

  // ─── Submit ────────────────────────────────────────────────────────────────
  async function handleSubmit() {
    const apiKey = await getApiKey();
    if (!apiKey) {
      Alert.alert('No API Key', 'Add your Groq API key in Settings first.');
      return;
    }

    const { text: emailText, wasTruncated } = truncateEmail(emailBody.trim());
    if (emailText.length < 10) {
      Alert.alert('Too short', 'Please paste a longer email.');
      return;
    }

    setLoading(true);

    try {
      // 1. Create sender if new
      let senderId = existingSender;
      let finalName = senderName;
      let finalEmail = senderEmail;

      if (isNewSender) {
        if (!senderName.trim() || !senderEmail.trim()) {
          Alert.alert('Missing info', 'Please enter sender name and email.');
          setLoading(false);
          return;
        }
        const sender = await createSender(senderName.trim(), senderEmail.trim());
        senderId = sender._id;
        finalName = sender.name;
        finalEmail = sender.email;
      }

      // 2. Summarise with Groq
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      const summary = await summarizeEmail(apiKey, emailText, controller.signal);
      clearTimeout(timeout);

      // 3. Save message to MongoDB
      await createMessage({
        senderId: senderId!,
        type: 'email_in',
        content: emailText,
        summary,
      });

      if (wasTruncated) {
        Alert.alert('Note', 'Email was trimmed to 8,000 characters for processing.');
      }

      // 4. Navigate to chat
      navigation.replace('Chat', {
        senderId: senderId!,
        senderName: finalName || senderName,
        senderEmail: finalEmail || senderEmail,
      });
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  }

  // ─── Step 1: Sender Info ───────────────────────────────────────────────────
  if (step === 1 && isNewSender) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Ionicons name="chevron-back" size={18} color={Colors.brand} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Email</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
          <Text style={styles.stepLabel}>Step 1 of 2 · Sender Info</Text>

          <View style={styles.card}>
            <Text style={styles.fieldLabel}>Sender Name</Text>
            <TextInput
              style={styles.input}
              value={senderName}
              onChangeText={setSenderName}
              placeholder="e.g. John Smith"
              placeholderTextColor={Colors.muted}
              autoCapitalize="words"
              accessibilityLabel="Sender name"
            />

            <Text style={[styles.fieldLabel, { marginTop: Spacing['4'] }]}>Sender Email</Text>
            <TextInput
              style={styles.input}
              value={senderEmail}
              onChangeText={setSenderEmail}
              placeholder="e.g. john@company.com"
              placeholderTextColor={Colors.muted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              accessibilityLabel="Sender email"
            />
          </View>

          <TouchableOpacity
            style={[styles.primaryBtn, (!senderName.trim() || !senderEmail.trim()) && styles.primaryBtnDisabled]}
            onPress={() => setStep(2)}
            disabled={!senderName.trim() || !senderEmail.trim()}
          >
            <Text style={styles.primaryBtnText}>Next</Text>
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ─── Step 2: Paste Email ───────────────────────────────────────────────────
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => isNewSender ? setStep(1) : navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={18} color={Colors.brand} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {isNewSender ? 'New Email' : `Email from ${route.params?.senderName || ''}`}
        </Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView style={styles.content} keyboardShouldPersistTaps="handled">
        {isNewSender && <Text style={styles.stepLabel}>Step 2 of 2 · Paste Email</Text>}

        <View style={styles.card}>
          <View style={styles.pasteRow}>
            <Text style={styles.fieldLabel}>Email Body</Text>
            <TouchableOpacity onPress={handlePaste} style={styles.pasteBtn}>
              <Ionicons name="clipboard-outline" size={16} color={Colors.brand} />
              <Text style={styles.pasteBtnText}>Paste</Text>
            </TouchableOpacity>
          </View>

          <TextInput
            style={styles.emailInput}
            value={emailBody}
            onChangeText={setEmailBody}
            placeholder="Paste the email body here..."
            placeholderTextColor={Colors.muted}
            multiline
            textAlignVertical="top"
            accessibilityLabel="Email body"
          />

          <Text style={styles.charCount}>
            {emailBody.length} / {MAX_EMAIL_LENGTH}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.primaryBtn, (emailBody.trim().length < 10 || loading) && styles.primaryBtnDisabled]}
          onPress={handleSubmit}
          disabled={emailBody.trim().length < 10 || loading}
        >
          {loading ? (
            <View style={styles.loadingRow}>
              <ActivityIndicator size="small" color="#fff" />
              <Text style={[styles.primaryBtnText, { marginLeft: 8 }]}>Summarising…</Text>
            </View>
          ) : (
            <View style={styles.primaryActionRow}>
              <Ionicons name="sparkles" size={18} color="#fff" />
              <Text style={styles.primaryBtnText}>Summarise & Add to Chat</Text>
            </View>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rule,
  },
  backBtn: { padding: Spacing['2'] },
  backIcon: { fontSize: 22, color: Colors.brand, fontWeight: '600' },
  headerTitle: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.ink,
    flex: 1,
    textAlign: 'center',
  },
  content: {
    flex: 1,
    padding: Spacing['4'],
  },
  stepLabel: {
    fontSize: Typography.xs,
    color: Colors.brand,
    fontWeight: '600',
    marginBottom: Spacing['3'],
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    marginBottom: Spacing['4'],
    ...Shadows.sm,
  },
  fieldLabel: {
    fontSize: Typography.sm,
    fontWeight: '600',
    color: Colors.ink,
    marginBottom: Spacing['2'],
  },
  input: {
    borderWidth: 1.5,
    borderColor: Colors.rule,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['3'],
    fontSize: Typography.sm,
    color: Colors.body,
  },
  pasteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing['2'],
  },
  pasteBtn: {
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['1'],
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    borderRadius: Radii.md,
  },
  pasteBtnText: {
    fontSize: Typography.xs,
    color: Colors.brand,
    fontWeight: '600',
  },
  emailInput: {
    borderWidth: 1.5,
    borderColor: Colors.rule,
    borderRadius: Radii.md,
    padding: Spacing['3'],
    fontSize: Typography.sm,
    color: Colors.body,
    minHeight: 200,
    lineHeight: Typography.sm * 1.6,
  },
  charCount: {
    fontSize: Typography.xs,
    color: Colors.muted,
    textAlign: 'right',
    marginTop: Spacing['2'],
  },
  primaryBtn: {
    backgroundColor: Colors.brand,
    borderRadius: Radii.md,
    paddingVertical: Spacing['4'],
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnDisabled: {
    opacity: 0.5,
  },
  primaryBtnText: {
    color: '#fff',
    fontSize: Typography.base,
    fontWeight: '700',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  primaryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
});
