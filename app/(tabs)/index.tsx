import { HttpService } from '@/services/httpService';
import { FontAwesome } from '@expo/vector-icons';
import messaging from '@react-native-firebase/messaging';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';
import { CryptoPrice } from '@/models/CryptoPrice';
import { Notification } from '@/models/Notification';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { useRouter } from 'expo-router';

export default function HomeScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const [userId, setUserId] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);

  // Get FCM token as userId
  useEffect(() => {
    messaging()
      .getToken()
      .then(token => setUserId(token))
      .catch(() => setUserId(null));
  }, []);

  // Fetch notifications every time the screen is focused
  useFocusEffect(
    useCallback(() => {
      let intervalId: ReturnType<typeof setInterval> | null = null;

      // Fetch notifications first
      const fetchData = async () => {       
        try {
          const notifications = await HttpService.get<Notification[]>(`user/${userId}/notifications`);
          setNotifications(notifications);

          if (notifications.length) {
            const trackedSymbols = notifications.map(n => n.symbol);
            const fetchPrices = () => {
              HttpService.get<CryptoPrice[]>('crypto/list')
                .then((cryptos) => {
                  setCryptos(cryptos
                    .filter(c => trackedSymbols.includes(c.symbol))
                    .sort((a, b) => b.price - a.price)
                  );
                  setLoading(false);
                })
              };

            fetchPrices();
            intervalId = setInterval(fetchPrices, 1000);
          }
        } catch {
          setNotifications([]);
          setCryptos([]);
          setLoading(false);
        }
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

  // Count notifications per symbol
  const notifCount: Record<string, number> = {};
  notifications.forEach(n => {
    notifCount[n.symbol] = (notifCount[n.symbol] || 0) + 1;
  });

  return (
    <FlatList
      data={cryptos}
      keyExtractor={item => item.symbol}
      ListHeaderComponent={
        <>
          <ThemedView style={themedStyles.titleContainer}>
          </ThemedView>
          <ThemedView style={themedStyles.container}>
            <ThemedText style={themedStyles.header}>Your Tracked Cryptos</ThemedText>
          </ThemedView>
        </>
      }
      renderItem={({ item }) => (
        <TouchableOpacity
          style={themedStyles.cryptoCard}
          activeOpacity={0.85}
          onPress={() => router.push({ pathname: '/tracked/[symbol]', params: { symbol: item.symbol } })}
        >
          <View style={{ flex: 1 }}>
            <Text style={themedStyles.cryptoName}>
              {item.symbol.replace('USDT', '/USD')}
            </Text>
            <Text style={themedStyles.cryptoPrice}>${item.price.toFixed(2)}</Text>
          </View>
          <View style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}>
            <FontAwesome name="bell" size={24} color="#87ceeb" />
            {notifCount[item.symbol] > 0 && (
              <View style={themedStyles.bubble}>
                <Text style={themedStyles.bubbleText}>{notifCount[item.symbol]}</Text>
              </View>
            )}
          </View>
        </TouchableOpacity>
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
    cryptoName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#181a20',
    },
    cryptoPrice: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#f1c40f' : '#2980ff',
      marginTop: 2,
    },
    bubble: {
      position: 'absolute',
      top: -6,
      right: -6,
      minWidth: 18,
      height: 18,
      borderRadius: 9,
      backgroundColor: colorScheme === 'dark' ? '#e74c3c' : '#d35400',
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: 4,
      zIndex: 1,
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#181a20' : '#fff',
    },
    bubbleText: {
      color: '#fff',
      fontSize: 12,
      fontWeight: 'bold',
      textAlign: 'center',
    },
  });
