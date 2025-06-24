import { FontAwesome } from '@expo/vector-icons';
import messaging from '@react-native-firebase/messaging';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

type Notification = {
  id: number;
  symbol: string;
  price: number;
  type: string;
};

type CryptoPrice = {
  symbol: string;
  price: number;
};

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cryptoPrices, setCryptoPrices] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Get FCM token as userId
  useEffect(() => {
    messaging()
      .getToken()
      .then(token => setUserId(token))
      .catch(() => setUserId(null));
  }, []);

  // Fetch notifications once
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch(`http://192.168.0.167:8080/api/user/${userId}/notifications`)
      .then(res => res.json())
      .then((notifs: Notification[] | Notification) => {
        const notifArr = Array.isArray(notifs) ? notifs : [notifs];
        setNotifications(notifArr);
        setLoading(false);
      })
      .catch((e) => {
        setNotifications([]);
        setLoading(false);
      });
  }, [userId]);

  // Fetch prices every second for tracked symbols
  useEffect(() => {
    if (!notifications.length) return;

    const fetchPrices = () => {
      fetch('http://192.168.0.167:8080/api/crypto/list')
        .then(res => res.json())
        .then((prices: CryptoPrice[]) => {
          const trackedSymbols = notifications.map(n => n.symbol);
          setCryptoPrices(
            prices.filter(c => trackedSymbols.includes(c.symbol))
          );
        })
        .catch(() => {});
    };

    fetchPrices();
    intervalRef.current = setInterval(fetchPrices, 1000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [notifications]);

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
          activeOpacity={0.8}
        >
          <FontAwesome name="bell" size={48} color="#87ceeb" style={{ marginBottom: 24 }} />
          <Text style={themedStyles.emptyTitle}>Go set some notifications!</Text>
          <Text style={themedStyles.emptySubtitle}>
            All cryptos you track will appear here once you add a notification.
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Count notifications per symbol
  const notifCount: Record<string, number> = {};
  notifications.forEach(n => {
    notifCount[n.symbol] = (notifCount[n.symbol] || 0) + 1;
  });

  return (
    <FlatList
      data={cryptoPrices}
      keyExtractor={item => item.symbol}
      ListHeaderComponent={
        <>
          <ThemedView style={themedStyles.titleContainer}>
          </ThemedView>
          <View style={themedStyles.container}>
            <Text style={themedStyles.header}>Your Tracked Cryptos</Text>
          </View>
        </>
      }
      renderItem={({ item }) => (
        <View style={themedStyles.cryptoCard}>
          <View style={{ flex: 1 }}>
            <Text style={themedStyles.cryptoName}>
              {item.symbol.replace('USDT', '/USD')}
            </Text>
            <Text style={themedStyles.cryptoPrice}>${item.price}</Text>
          </View>
          <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
            <FontAwesome name="bell" size={24} color="#87ceeb" />
            {notifCount[item.symbol] > 0 && (
              <View style={themedStyles.bubble}>
                <Text style={themedStyles.bubbleText}>{notifCount[item.symbol]}</Text>
              </View>
            )}
          </View>
        </View>
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
      color: colorScheme === 'dark' ? '#fff' : '#222',
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
      color: colorScheme === 'dark' ? '#fff' : '#222',
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
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      borderRadius: 12,
      padding: 18,
      marginBottom: 14,
      elevation: 2,
    },
    cryptoName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#222',
    },
    cryptoPrice: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#f1c40f' : '#636e72',
      marginTop: 2,
    },
    bubble: {
      position: 'absolute',
      top: -6,
      right: -6,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: '#e74c3c',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      zIndex: 1,
    },
    bubbleText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
