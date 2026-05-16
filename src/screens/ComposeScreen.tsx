import React, { useRef } from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { ToneChips } from '../components/ToneChips';
import { SummaryCard } from '../components/SummaryCard';
import { Button } from '../components/Button';
import { ErrorBanner } from '../components/ErrorBanner';
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ScreenHeader } from '../components/ScreenHeader';
import { Colors, Spacing, Typography, Radii, Shadows, GlobalStyles } from '../constants/theme';
import { MIN_REPLY_LENGTH } from '../constants/config';

type Props = NativeStackScreenProps<RootStackParamList, 'Compose'>;

export function ComposeScreen({ navigation }: Props) {
  const { state, setCasualReply, setTone, runFormalise, clearError, cancelCurrentRequest, reset } = useApp();
  const [summaryExpanded, setSummaryExpanded] = React.useState(false);
  const inputRef = useRef<TextInput>(null);

  const canFormalise = state.casualReply.trim().length >= MIN_REPLY_LENGTH && !state.isLoading;

  async function handleFormalise() {
    const success = await runFormalise();
    if (success) {
      navigation.navigate('Review');
    }
  }

  return (
    <KeyboardAvoidingView
      style={GlobalStyles.screen}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScreenHeader
        title="Write Reply"
        onBack={() => navigation.goBack()}
        rightAction={{ label: 'Start over', onPress: () => { reset(); navigation.navigate('Home'); } }}
      />

      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {state.error && (
          <ErrorBanner
            error={state.error}
            onRetry={handleFormalise}
            onGoToSettings={() => navigation.navigate('Settings', {})}
            onDismiss={clearError}
          />
        )}

        {/* Collapsible summary */}
        <TouchableOpacity
          onPress={() => setSummaryExpanded(p => !p)}
          activeOpacity={0.8}
          accessibilityLabel={summaryExpanded ? 'Collapse summary' : 'Expand summary'}
        >
          {summaryExpanded ? (
            <SummaryCard bullets={state.emailSummary} />
          ) : (
            <View style={styles.summaryCollapsed}>
              <Text style={styles.summaryCollapsedText} numberOfLines={1}>
                <Ionicons name="sparkles" size={16} color={Colors.ink} />  {state.emailSummary[0] ?? 'Summary'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={Colors.ink} style={styles.summaryExpandIcon} />
            </View>
          )}
        </TouchableOpacity>

        {/* Casual reply input */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>What do you want to say?</Text>
          <Text style={styles.cardHint}>
            Write in plain words — AI will make it formal
          </Text>
          <TextInput
            ref={inputRef}
            style={styles.input}
            value={state.casualReply}
            onChangeText={setCasualReply}
            placeholder="e.g. 'yes works for me, see you Thursday 3pm, I'll bring the slides'"
            placeholderTextColor={Colors.subtle}
            multiline
            textAlignVertical="top"
            autoFocus
            autoCorrect
            autoCapitalize="sentences"
            accessibilityLabel="Casual reply input"
            accessibilityHint="Type what you want to say in plain language"
          />
          <Text style={styles.charCount}>
            {state.casualReply.length} chars
          </Text>
        </View>

        {/* Quick actions */}
        <View>
          <Text style={styles.quickLabel}>Quick intents</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.quickRow}>
            {[
              "Yes, that works for me",
              "Let me get back to you",
              "I need more information",
              "Can we reschedule?",
              "Thank you, noted",
              "I'll decline this time",
            ].map(chip => (
              <TouchableOpacity
                key={chip}
                onPress={() => setCasualReply(chip)}
                style={styles.quickChip}
                accessibilityLabel={chip}
              >
                <Text style={styles.quickChipText}>{chip}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Tone selector */}
        <ToneChips selected={state.selectedTone} onChange={setTone} />

        {/* CTA */}
        <Button
          label="Formalise Reply"
          onPress={handleFormalise}
          disabled={!canFormalise}
          fullWidth
          size="lg"
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
  content: {
    padding: Spacing['4'],
    paddingBottom: Spacing['10'],
    gap: Spacing['4'],
  },
  summaryCollapsed: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.brandLight,
    borderRadius: Radii.md,
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    borderWidth: 1,
    borderColor: Colors.brandBorder,
  },
  summaryCollapsedText: {
    flex: 1,
    fontSize: Typography.sm,
    color: Colors.brand,
    fontWeight: '500',
  },
  summaryExpandIcon: {
    fontSize: Typography.xs,
    color: Colors.brand,
  },
  card: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    ...Shadows.md,
  },
  cardLabel: {
    fontSize: Typography.md,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing['1'],
  },
  cardHint: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginBottom: Spacing['3'],
  },
  input: {
    minHeight: 120,
    fontSize: Typography.base,
    color: Colors.body,
    lineHeight: Typography.base * 1.6,
    textAlignVertical: 'top',
  },
  charCount: {
    fontSize: Typography.xs,
    color: Colors.subtle,
    marginTop: Spacing['2'],
    textAlign: 'right',
  },
  quickLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginBottom: Spacing['2'],
  },
  quickRow: { flexDirection: 'row' },
  quickChip: {
    backgroundColor: Colors.surfaceAlt,
    borderRadius: Radii.full,
    paddingHorizontal: Spacing['3'],
    paddingVertical: Spacing['2'],
    marginRight: Spacing['2'],
    borderWidth: 1,
    borderColor: Colors.rule,
  },
  quickChipText: {
    fontSize: Typography.xs,
    color: Colors.body,
    fontWeight: '500',
  },
});
