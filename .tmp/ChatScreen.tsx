import React, { useState, useCallback, useRef } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet, SafeAreaView, Alert,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList, Message, ToneType } from '../types';
import { fetchMessages, createMessage } from '../services/api';
import { getApiKey } from '../services/storage';
import { getPrefs } from '../services/prefs';
import { formalizeReply } from '../services/groq';
import { MessageBubble } from '../components/MessageBubble';
import { ChatInputBar } from '../components/ChatInputBar';
import { TransformingAnimation } from '../components/TransformingAnimation';
import { ReviewModal } from '../components/ReviewModal';
import { TONES, API_TIMEOUT_MS } from '../constants/config';
import { Colors, Spacing, Typography } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Chat'>;

export function ChatScreen({ route, navigation }: Props) {
  const { senderId, senderName, senderEmail } = route.params;
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [transforming, setTransforming] = useState(false);
  const [tone, setTone] = useState<ToneType>('semi-formal');
  const [reviewVisible, setReviewVisible] = useState(false);
  const [formalReply, setFormalReply] = useState('');
  const [casualDraft, setCasualDraft] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const [msgs, prefs] = await Promise.all([fetchMessages(senderId), getPrefs()]);
          setMessages(msgs);
          setTone(prefs.defaultTone);
        } catch (err) {
          console.log('Failed to load messages:', err);
        } finally {
          setLoading(false);
        }
      })();
    }, [senderId])
  );

  function getLastEmailContent(): string {
    const incoming = messages.filter(m => m.type === 'email_in');
    return incoming.length > 0 ? incoming[incoming.length - 1].content : '';
  }

  const hasEmail = messages.some(m => m.type === 'email_in');

  async function handleSend(casualText: string) {
    const emailContent = getLastEmailContent();
    if (!emailContent) {
      Alert.alert('No email', 'Add an email first before sending a reply.');
      return;
    }

    setCasualDraft(casualText);
    setTransforming(true);

    try {
      const apiKey = await getApiKey();
      if (!apiKey) return;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      const prefs = await getPrefs();

      const formal = await formalizeReply(
        apiKey, emailContent, casualText, tone, prefs.signature, controller.signal
      );
      clearTimeout(timeout);

      setFormalReply(formal);
      setReviewVisible(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to generate reply. Please try again.');
    } finally {
      setTransforming(false);
    }
  }

  async function handleAutoGenerate() {
    const emailContent = getLastEmailContent();
    if (!emailContent) return;

    setCasualDraft('[auto-generated]');
    setTransforming(true);

    try {
      const apiKey = await getApiKey();
      if (!apiKey) return;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), API_TIMEOUT_MS);
      const prefs = await getPrefs();

      const formal = await formalizeReply(
        apiKey, emailContent,
        'Write an appropriate professional reply to this email.',
        tone, prefs.signature, controller.signal
      );
      clearTimeout(timeout);

      setFormalReply(formal);
      setReviewVisible(true);
    } catch (err: any) {
      Alert.alert('Error', err?.message || 'Failed to auto-generate reply.');
    } finally {
      setTransforming(false);
    }
  }

  async function handleConfirmReply(editedText: string) {
    setReviewVisible(false);

    try {
      const msg = await createMessage({
        senderId,
        type: 'reply_out',
        content: editedText,
        casualDraft,
        tone,
      });
      setMessages(prev => [...prev, msg]);

      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 200);
    } catch (err) {
      Alert.alert('Error', 'Failed to save reply. Please try again.');
    }
  }

  const currentToneLabel = TONES.find(t => t.key === tone)?.label || 'Semi-formal';
  const inputBarHeight = 100;

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={0}
      >
        <View style={styles.shell}>
          <View style={[styles.header, { paddingTop: insets.top }]}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn} accessibilityRole="button" accessibilityLabel="Go back">
              <Ionicons name="chevron-back" size={24} color={Colors.brand} />
            </TouchableOpacity>
            <View style={styles.headerInfo}>
              <Text style={styles.headerName} numberOfLines={1}>{senderName}</Text>
              <Text style={styles.headerEmail} numberOfLines={1}>{senderEmail}</Text>
            </View>
            <TouchableOpacity
              onPress={() => navigation.navigate('NewEmail', { senderId, senderName, senderEmail })}
              style={styles.addBtn}
              accessibilityLabel="Add new email from this sender"
              accessibilityRole="button"
            >
              <Ionicons name="add" size={22} color={Colors.brand} />
            </TouchableOpacity>
          </View>

          <View style={styles.body}>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={item => item._id}
              renderItem={({ item }) => <MessageBubble message={item} senderEmail={senderEmail} />}
              contentContainerStyle={[styles.messageList, { paddingBottom: insets.bottom + inputBarHeight + Spacing['6'] }]}
              keyboardShouldPersistTaps="handled"
              onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
              ListEmptyComponent={
                !loading ? (
                  <View style={styles.empty}>
                    <Text style={styles.emptyText}>No messages yet</Text>
                  </View>
                ) : null
              }
            />

            {transforming && (
              <View style={[styles.transformingWrap, { bottom: inputBarHeight + insets.bottom }]}>
                <TransformingAnimation />
              </View>
            )}

            <View style={[styles.inputWrap, { paddingBottom: insets.bottom }]}>
              <ChatInputBar
                tone={tone}
                onToneChange={setTone}
                onSend={handleSend}
                onAutoGenerate={handleAutoGenerate}
                disabled={transforming}
                hasEmail={hasEmail}
              />
            </View>
          </View>
        </View>

        <ReviewModal
          visible={reviewVisible}
          replyText={formalReply}
          toneName={currentToneLabel}
          onConfirm={handleConfirmReply}
          onCancel={() => setReviewVisible(false)}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  safe: { flex: 1, backgroundColor: Colors.surface },
  shell: {
    flex: 1,
    paddingHorizontal: Spacing['2'],
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing['4'],
    paddingVertical: Spacing['3'],
    marginHorizontal: Spacing['1'],
    marginBottom: Spacing['3'],
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.rule,
    borderRadius: 22,
  },
  backBtn: {
    width: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing['2'],
  },
  headerInfo: { flex: 1 },
  headerName: {
    fontSize: Typography.base,
    fontWeight: '700',
    color: Colors.ink,
  },
  headerEmail: {
    fontSize: Typography.xs,
    color: Colors.muted,
    marginTop: 1,
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: Spacing['2'],
  },
  body: {
    flex: 1,
    position: 'relative',
  },
  messageList: {
    paddingTop: Spacing['3'],
    paddingHorizontal: Spacing['2'],
    flexGrow: 1,
  },
  inputWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
  },
  transformingWrap: {
    position: 'absolute',
    left: 0,
    right: 0,
  },
  empty: {
    alignItems: 'center',
    paddingTop: 60,
  },
  emptyText: {
    fontSize: Typography.sm,
    color: Colors.muted,
  },
});
EOF