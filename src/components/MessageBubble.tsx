import React, { useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import { Message } from '../types';
import { Colors, Radii, Spacing, Typography } from '../constants/theme';
import { SummaryCard } from './SummaryCard';

interface Props {
  message: Message;
  senderEmail?: string;
}

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

export function MessageBubble({ message, senderEmail }: Props) {
  const isIncoming = message.type === 'email_in';

  const handleLongPress = useCallback(async () => {
    if (!isIncoming && message.content) {
      await Clipboard.setStringAsync(message.content);
    }
  }, [isIncoming, message.content]);

  const handleOpenMail = useCallback(async () => {
    if (!senderEmail) {
      Alert.alert('Mail unavailable', 'No sender email is available for this conversation.');
      return;
    }

    const mailtoUrl = `mailto:${encodeURIComponent(senderEmail)}?subject=${encodeURIComponent('Re: Your message')}&body=${encodeURIComponent(message.content || '')}`;

    try {
      const canOpen = await Linking.canOpenURL(mailtoUrl);
      if (canOpen) {
        await Linking.openURL(mailtoUrl);
        return;
      }
    } catch {
      // Fall through to alert below.
    }

    Alert.alert('Mail unavailable', 'No mail app is available to handle this action.');
  }, [senderEmail, message.content]);

  if (isIncoming) {
    return (
      <View style={[styles.wrapper, styles.wrapperLeft]}>
        <View style={[styles.cardShell, styles.cardShellIn]}>
          <SummaryCard bullets={message.summary} />
          <Text style={styles.timeIn}>{formatTime(message.createdAt)}</Text>
        </View>
      </View>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.wrapper, styles.wrapperRight]}
      onLongPress={handleLongPress}
      activeOpacity={0.8}
      accessibilityLabel="Reply bubble. Long press to copy."
    >
      <View style={[styles.cardShell, styles.cardShellOut]}>
        <Text style={styles.replyText}>{message.content}</Text>
        <TouchableOpacity
          onPress={handleOpenMail}
          style={styles.mailAction}
          accessibilityLabel="Open in Mail App"
        >
          <Ionicons name="mail-outline" size={16} color="#fff" style={styles.mailActionIcon} />
          <Text style={styles.mailActionText}>Open in Mail App</Text>
        </TouchableOpacity>
        <Text style={styles.timeOut}>{formatTime(message.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
    paddingHorizontal: Spacing['1'],
    paddingVertical: Spacing['1'],
    marginBottom: Spacing['3'],
  },
  wrapperLeft: { alignItems: 'flex-start' },
  wrapperRight: { alignItems: 'flex-end' },
  cardShell: {
    width: '100%',
    maxWidth: '100%',
    alignSelf: 'stretch',
    borderRadius: Radii.lg,
    padding: Spacing['5'],
    backgroundColor: Colors.white,
    borderWidth: 1,
    borderColor: Colors.rule,
  },
  cardShellIn: {
    borderTopLeftRadius: 6,
  },
  cardShellOut: {
    backgroundColor: Colors.brand,
    borderTopRightRadius: 6,
    borderColor: Colors.brand,
  },
  timeIn: {
    fontSize: 10,
    color: Colors.muted,
    textAlign: 'right',
    marginTop: Spacing['2'],
  },
  replyText: {
    fontSize: Typography.sm,
    color: '#fff',
    lineHeight: Typography.sm * 1.6,
  },
  mailAction: {
    alignSelf: 'flex-start',
    marginTop: Spacing['3'],
    paddingVertical: Spacing['2'],
    paddingHorizontal: Spacing['3'],
    borderRadius: Radii.full,
    backgroundColor: 'rgba(255,255,255,0.14)',
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 44,
  },
  mailActionText: {
    fontSize: Typography.xs,
    fontWeight: '700',
    color: '#fff',
  },
  mailActionIcon: {
    marginRight: 4,
  },
  timeOut: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'right',
    marginTop: Spacing['2'],
  },
});
