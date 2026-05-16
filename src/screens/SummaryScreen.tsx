import React from 'react';
import { Ionicons } from '@expo/vector-icons';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { useApp } from '../context/AppContext';
import { SummaryCard } from '../components/SummaryCard';
import { Button } from '../components/Button';
import { ScreenHeader } from '../components/ScreenHeader';
import { Colors, Spacing, Typography, Radii, Shadows, GlobalStyles } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Summary'>;

export function SummaryScreen({ navigation }: Props) {
  const { state, reset } = useApp();

  // Word count of original email
  const wordCount = state.currentEmail
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return (
    <View style={GlobalStyles.screen}>
      <ScreenHeader
        title="Summary"
        subtitle={`${wordCount} words to ${state.emailSummary.length} key points`}
        onBack={() => navigation.goBack()}
        rightAction={{ label: 'Start over', onPress: () => { reset(); navigation.navigate('Home'); } }}
      />

      <ScrollView contentContainerStyle={styles.content}>
        {/* Summary card */}
        <SummaryCard bullets={state.emailSummary} />

        {/* Original email preview */}
        <View style={styles.section}>
          <Text style={styles.sectionLabel}>Original email</Text>
          <View style={styles.emailPreview}>
            <Text style={styles.emailText} numberOfLines={6}>
              {state.currentEmail}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            label="Write My Reply"
            onPress={() => navigation.navigate('Compose')}
            fullWidth
            size="lg"
          />
          <Button
            label="Start over"
            onPress={() => { reset(); navigation.navigate('Home'); }}
            variant="ghost"
            fullWidth
            size="md"
          />
        </View>

        {/* Info callout */}
        <View style={styles.infoBox}>
          <View style={{ flexDirection: 'row', gap: Spacing['2'] }}>
            <Ionicons name="information-circle-outline" size={16} color={Colors.ink} />
            <Text style={styles.infoText}>
              Your email was summarised using <Text style={styles.infoBold}>Claude AI</Text> with your API key. Nothing was stored on any server.
            </Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: Spacing['4'],
    paddingBottom: Spacing['10'],
    gap: Spacing['4'],
  },
  section: { gap: Spacing['2'] },
  sectionLabel: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: Colors.muted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  emailPreview: {
    backgroundColor: Colors.white,
    borderRadius: Radii.lg,
    padding: Spacing['4'],
    borderWidth: 1,
    borderColor: Colors.rule,
    ...Shadows.sm,
  },
  emailText: {
    fontSize: Typography.sm,
    color: Colors.muted,
    lineHeight: Typography.sm * 1.6,
  },
  actions: { gap: Spacing['2'] },
  infoBox: {
    backgroundColor: Colors.tealLight,
    borderRadius: Radii.md,
    padding: Spacing['3'],
    borderWidth: 1,
    borderColor: '#99F6E4',
  },
  infoText: {
    fontSize: Typography.xs,
    color: Colors.teal,
    lineHeight: Typography.xs * 1.6,
  },
  infoBold: { fontWeight: '700' },
});
