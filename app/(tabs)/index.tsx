import { useCryptoData } from '@/components/ui/CNF/RealTimeCrypto';
import { Notification } from '@/models/Notification';
import { HttpService } from '@/services/httpService';
import { FontAwesome } from '@expo/vector-icons';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CryptoCard } from '@/components/ui/CNF/CryptoCard';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const cryptos = useCryptoData();

  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getToken(getMessaging(getApp()))
      .then(token => setUserId(token))
      .catch(() => setUserId(null));
  }, []);

  useFocusEffect(
    useCallback(() => {
      let intervalId: ReturnType<typeof setInterval> | null = null;

      const fetchData = async () => {       
        HttpService.get<Notification[]>(`user/${userId}/notifications`)
        .then(setNotifications)
        .catch((e) => console.error('Failed to load notifications', e))
        .finally(() => setLoading(false));
      };

      fetchData();
      intervalId = setInterval(fetchData, 1000);
      return () => clearInterval(intervalId);
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
        <>
          <ThemedView style={themedStyles.titleContainer}>
          </ThemedView>
          <ThemedView style={themedStyles.container}>
            <ThemedText style={themedStyles.header}>Your Tracked Cryptos</ThemedText>
          </ThemedView>
        </>
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
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      marginTop: 24,
      marginBottom: 8,
    },
    container: {
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
      padding: 0,
    },
    header: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#181a20',
      marginBottom: 18,
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
    cryptoCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fafdff',
      borderRadius: 12,
      padding: 18,
      marginBottom: 14,
      elevation: colorScheme === 'dark' ? 0 : 2,
      shadowColor: colorScheme === 'dark' ? 'transparent' : '#b2bec3',
      shadowOpacity: colorScheme === 'dark' ? 0 : 0.08,
      shadowRadius: 4,
    },
  });
