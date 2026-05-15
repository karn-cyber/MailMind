import React, { useState } from 'react';
import { MaterialIcons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  Alert,
  Linking,
  Share,
  Platform,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { SummaryCard } from '../components/SummaryCard';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ScreenHeader } from '../components/ScreenHeader';
import { Colors, Spacing, Typography, Radii, Shadows, GlobalStyles } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Review'>;

export function ReviewScreen({ navigation }: Props) {
  const { state, setFormalReply, runFormalise, clearError, cancelCurrentRequest, reset } = useApp();
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await Clipboard.setStringAsync(state.formalReply);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleSend() {
    const mailtoUrl = `mailto:?subject=${encodeURIComponent('MailMind reply')}&body=${encodeURIComponent(state.formalReply)}`;

    try {
      const canOpenMail = await Linking.canOpenURL(mailtoUrl);
      if (canOpenMail) {
        await Linking.openURL(mailtoUrl);
        return;
      }
    } catch {
      // Fall through to share.
    }

    await Share.share({ message: state.formalReply });
  }

  async function handleRegenerate() {
    if (state.formalReply) {
      Alert.alert(
        'Re-generate reply?',
        'This will replace the current reply with a new version.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Re-generate', onPress: () => runFormalise() },
        ],
      );
    } else {
      await runFormalise();
    }
  }

  const wordCount = state.formalReply.trim().split(/\s+/).filter(Boolean).length;

  return (
    <View style={GlobalStyles.screen}>
      <ScreenHeader
        title="Review Reply"
        subtitle={`${wordCount} words`}
        onBack={() => navigation.goBack()}
        rightAction={{ label: 'Start over', onPress: () => { reset(); navigation.navigate('Home'); } }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {state.error && (
          <ErrorBanner
            error={state.error}
            onRetry={handleRegenerate}
            onGoToSettings={() => navigation.navigate('Settings', {})}
            onDismiss={clearError}
          />
        )}

        {/* Summary reminder */}
        <SummaryCard bullets={state.emailSummary} compact />

        {/* Formal reply editor */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>Your Professional Reply</Text>
            <View style={styles.toneBadge}>
              <Text style={styles.toneBadgeText}>{state.selectedTone}</Text>
            </View>
          </View>
          <TextInput
            style={styles.replyInput}
            value={state.formalReply}
            onChangeText={setFormalReply}
            multiline
            textAlignVertical="top"
            autoCorrect
            accessibilityLabel="Formal reply editor"
            accessibilityHint="Edit your professional reply before sending"
          />
          <Text style={styles.editHint}>Tap to edit</Text>
        </View>

        {/* Action buttons */}
        <View style={styles.actions}>
          <Button
            label={copied ? 'Copied!' : 'Copy'}
            onPress={handleCopy}
            variant="secondary"
            style={styles.actionBtn}
          />
          <Button
            label="Re-generate"
            onPress={handleRegenerate}
            variant="secondary"
            style={styles.actionBtn}
          />
        </View>

        <Button
          label="Open in Mail App"
          onPress={handleSend}
          fullWidth
          size="lg"
        />

        {/* Privacy note */}
        <View style={styles.privacyBox}>
          <View style={{ flexDirection: 'row', gap: Spacing['2'] }}>
            <MaterialIcons name="lock" size={16} color={Colors.ink} />
            <Text style={styles.privacyText}>
              This reply was generated using your personal API key. It was never stored on any server.
            </Text>
          </View>
        </View>
      </ScrollView>

      <LoadingOverlay
        visible={state.isLoading}
        message={state.loadingMessage}
        onCancel={cancelCurrentRequest}
      />
    </View>
  );
}

const styles = StyleSheet.create({
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
  toneBadge: {
    backgroundColor: Colors.brandLight,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: 2,
    borderWidth: 1,
    borderColor: Colors.brandBorder,
  },
  toneBadgeText: {
    fontSize: Typography.xs,
    fontWeight: '600',
    color: Colors.brand,
    textTransform: 'capitalize',
  },
  replyInput: {
    minHeight: 180,
    fontSize: Typography.base,
    color: Colors.body,
    lineHeight: Typography.base * 1.65,
    textAlignVertical: 'top',
  },
  editHint: {
    fontSize: Typography.xs,
    color: Colors.subtle,
    marginTop: Spacing['2'],
    textAlign: 'right',
  },
  actions: {
    flexDirection: 'row',
    gap: Spacing['3'],
  },
  actionBtn: { flex: 1 },
  privacyBox: {
    backgroundColor: Colors.greenLight,
    borderRadius: Radii.md,
    padding: Spacing['3'],
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  privacyText: {
    fontSize: Typography.xs,
    color: Colors.green,
    lineHeight: Typography.xs * 1.6,
  },
});
