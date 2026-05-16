import React, { useState, useCallback } from 'react';
import {
  View, Text, FlatList, TouchableOpacity, StyleSheet,
  RefreshControl, Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFocusEffect } from '@react-navigation/native';
import { RootStackParamList, Sender } from '../types';
import { fetchSenders, deleteSender } from '../services/api';
import { getApiKey } from '../services/storage';
import { SenderRow } from '../components/SenderRow';
import { Colors, Spacing, Typography, Shadows } from '../constants/theme';

type Props = NativeStackScreenProps<RootStackParamList, 'Inbox'>;

export function InboxScreen({ navigation }: Props) {
  const [senders, setSenders] = useState<Sender[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadSenders = useCallback(async () => {
    try {
      const data = await fetchSenders();
      setSenders(data);
    } catch (err) {
      console.log('Failed to load senders:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Check API key and load senders on focus
  useFocusEffect(
    useCallback(() => {
      (async () => {
        const key = await getApiKey();
        if (!key) {
          navigation.navigate('Settings', { fromOnboarding: true });
          return;
        }
        loadSenders();
      })();
    }, [loadSenders, navigation])
  );

  function handleRefresh() {
    setRefreshing(true);
    loadSenders();
  }

  function handleDelete(sender: Sender) {
    Alert.alert(
      'Delete Conversation',
      `Delete all messages with ${sender.name}? This cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteSender(sender._id);
              setSenders(prev => prev.filter(s => s._id !== sender._id));
            } catch (err) {
              Alert.alert('Error', 'Failed to delete conversation. Please try again.');
            }
          },
        },
      ]
    );
  }

  const renderItem = ({ item }: { item: Sender }) => (
    <SenderRow
      sender={item}
      onPress={() => navigation.navigate('Chat', {
        senderId: item._id,
        senderName: item.name,
        senderEmail: item.email,
      })}
      onLongPress={() => handleDelete(item)}
    />
  );

  const emptyState = !loading && senders.length === 0 && (
    <View style={styles.empty}>
      <Text style={styles.emptyIcon}>📬</Text>
      <Text style={styles.emptyTitle}>No conversations yet</Text>
      <Text style={styles.emptyBody}>Tap + to paste your first email</Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>MailMind</Text>
        <TouchableOpacity
          onPress={() => navigation.navigate('Settings', {})}
          accessibilityLabel="Settings"
          style={styles.settingsBtn}
        >
          <Text style={styles.settingsIcon}>⚙️</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={senders}
        keyExtractor={item => item._id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
        ListEmptyComponent={emptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={Colors.brand} />
        }
      />

      {/* FAB */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('NewEmail', {})}
        accessibilityLabel="Paste new email"
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.surface },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing['5'],
    paddingTop: Spacing['4'],
    paddingBottom: Spacing['3'],
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: '900',
    color: Colors.ink,
    letterSpacing: -0.5,
  },
  settingsBtn: { padding: Spacing['2'] },
  settingsIcon: { fontSize: 22 },
  list: {
    paddingTop: Spacing['2'],
    paddingBottom: 100,
  },
  empty: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 120,
    paddingHorizontal: Spacing['6'],
  },
  emptyIcon: { fontSize: 48, marginBottom: Spacing['4'] },
  emptyTitle: {
    fontSize: Typography.lg,
    fontWeight: '700',
    color: Colors.ink,
    marginBottom: Spacing['2'],
  },
  emptyBody: {
    fontSize: Typography.sm,
    color: Colors.muted,
    textAlign: 'center',
  },
  fab: {
    position: 'absolute',
    right: Spacing['5'],
    bottom: Spacing['8'],
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.brand,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.md,
    elevation: 6,
  },
  fabIcon: {
    fontSize: 28,
    color: '#fff',
    fontWeight: '300',
    marginTop: -2,
  },
});
