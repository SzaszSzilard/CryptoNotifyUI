import { useCryptoData } from '@/components/ui/CNF/RealTimeCrypto';
import { Notification } from '@/models/Notification';
import { HttpService } from '@/services/httpService';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { CryptoCard } from '@/components/ui/CNF/CryptoCard';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const { cryptos, userId } = useCryptoData();

  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
        if (!userId) return;

        HttpService.get<Notification[]>(`user/${userId}/notifications`)
        .then(setNotifications)
        .catch((e) => console.error('Failed to load notifications', e))
        .finally(() => setLoading(false));
    }, [userId])
  );

  const themedStyles = styles(colorScheme);

  if (loading) {
    return (
      <View style={themedStyles.centered}>
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#87ceeb' : '#36525E'} />
      </View>
    );
  }

  if (!notifications.length) {
    return (
      <View style={themedStyles.centered}>
        <TouchableOpacity
          onPress={() => router.push('/crypto-list')}
          style={{ alignItems: 'center' }}
        >
          <FontAwesome name="bell" size={48} color="#87ceeb" style={{ marginBottom: 24 }} />
          <Text style={themedStyles.emptyTitle}>Go set some notifications!</Text>
          <Text style={themedStyles.emptySubtitle}>
            All cryptos you track will appear here once you set a notification.
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const notifCount: Record<string, number> = {};
  notifications.forEach(n => {
    notifCount[n.symbol] = (notifCount[n.symbol] || 0) + 1;
  });

  return (
    <FlatList
      data={cryptos.filter(crypto => notifCount[crypto.symbol] > 0)}
      keyExtractor={crypto => crypto.symbol}
      ListHeaderComponent={
        <ThemedText style={themedStyles.header}>Your Tracked Cryptos</ThemedText>
      }
      renderItem={({ item: crypto }) => (
        <CryptoCard crypto={crypto} notifCount={notifCount} />
      )}
      contentContainerStyle={{ paddingBottom: 24, paddingHorizontal: 16 }}
    />
  );
}

const styles = (colorScheme: string) =>
  StyleSheet.create({
    header: {
      marginTop: 16,
      fontSize: 22,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#181a20',
      marginBottom: 16,
      textAlign: 'center',
    },
    centered: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
      padding: 24,
    },
    emptyTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#181a20',
      marginBottom: 8,
      textAlign: 'center',
    },
    emptySubtitle: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      textAlign: 'center',
    },
  });
