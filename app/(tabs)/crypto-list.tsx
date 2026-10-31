import { CryptoCard } from '@/components/ui/CNF/CryptoCard';
import { useCryptoData, useUserId } from '@/components/ui/CNF/RealTimeCrypto';
import { CryptoPrice } from '@/models/CryptoPrice';
import { Notification } from '@/models/Notification';
import { HttpService } from '@/services/httpService';
import { useFocusEffect } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  StyleSheet,
  Text,
  TextInput,
  useColorScheme,
} from 'react-native';

interface CryptoListContentProps {
  search: string;
  notifCount: Record<string, number>;
  emptyTextStyle: object;
}

function CryptoListContent({ search, notifCount, emptyTextStyle }: CryptoListContentProps) {
  const { cryptos } = useCryptoData();

  const filteredCryptos = useMemo(() => {
    if (!search.trim()) return cryptos;
    const lower = search.trim().toLowerCase();
    return cryptos.filter(
      crypto =>
        crypto.symbol.toLowerCase().includes(lower) ||
        crypto.symbol.replace('USDT', '/USD').toLowerCase().includes(lower)
    );
  }, [cryptos, search]);

  const renderItem = useCallback(
    ({ item }: { item: CryptoPrice }) => (
      <CryptoCard crypto={item} notifCount={notifCount} />
    ),
    [notifCount]
  );

  return (
    <FlatList
      data={filteredCryptos}
      keyExtractor={crypto => crypto.symbol}
      renderItem={renderItem}
      keyboardShouldPersistTaps="handled"
      ListEmptyComponent={<Text style={emptyTextStyle}>No cryptos found.</Text>}
      style={{ flex: 1 }}
    />
  );
}

export default function CryptoListScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const themedStyles = useMemo(() => styles(colorScheme), [colorScheme]);

  const userId = useUserId();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [search, setSearch] = useState('');

  useFocusEffect(
    useCallback(() => {
      if (!userId) return;

      HttpService.get<Notification[]>(`user/${userId}/notifications`)
        .then(setNotifications)
        .catch(e => console.error('Failed to load notifications', e));
    }, [userId])
  );

  const notifCount = useMemo(() => {
    const counts: Record<string, number> = {};
    notifications.forEach(n => {
      counts[n.symbol] = (counts[n.symbol] || 0) + 1;
    });
    return counts;
  }, [notifications]);

  return (
    <KeyboardAvoidingView style={themedStyles.container}>
      <TextInput
        style={themedStyles.searchInput}
        placeholder="Search crypto..."
        placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
        value={search}
        onChangeText={setSearch}
      />

      <CryptoListContent
        search={search}
        notifCount={notifCount}
        emptyTextStyle={themedStyles.emptyText}
      />
    </KeyboardAvoidingView>
  );
}

const CARD_HEIGHT = 64;
const styles = (colorScheme: string | null) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    searchInput: {
      height: CARD_HEIGHT,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 18,
      color: colorScheme === 'dark' ? '#fff' : '#222',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      fontWeight: 'normal',
      marginBottom: 16,
    },
    emptyText: {
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      textAlign: 'center',
      marginTop: 32,
    },
  });
