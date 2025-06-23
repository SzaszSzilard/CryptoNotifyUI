import { FontAwesome } from '@expo/vector-icons';
import messaging from '@react-native-firebase/messaging';
import { Image } from 'expo-image';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Platform, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';

import { HelloWave } from '@/components/HelloWave';
import ParallaxScrollView from '@/components/ParallaxScrollView';
import { ThemedText } from '@/components/ThemedText';
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

  // Get FCM token as userId
  useEffect(() => {
    messaging()
      .getToken()
      .then(token => setUserId(token))
      .catch(() => setUserId(null));
  }, []);

  // Fetch notifications and prices
  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    console.log(`Fetching notifications for userId: ${userId}`);
    
    fetch(`http://192.168.0.167:8080/api/user/${userId}/notifications`)
      .then(res => {
        console.log(`Response status: ${res}`);
        return res.json()
      })
      .then((notifs: Notification[] | Notification) => {
        console.log('Fetched notificationst:', notifs);
        const notifArr = Array.isArray(notifs) ? notifs : [notifs];
        console.log(notifs);

        setNotifications(notifArr);
        if (notifArr.length === 0) {
          setCryptoPrices([]);
          setLoading(false);
          return;
        }
        fetch('http://192.168.0.167:8080/api/crypto/list')
          .then(res => res.json())
          .then((prices: CryptoPrice[]) => {
            const trackedSymbols = notifArr.map(n => n.symbol);
            setCryptoPrices(
              prices.filter(c => trackedSymbols.includes(c.symbol))
            );
            setLoading(false);
          })
          .catch(() => setLoading(false));
      })
      .catch((e) => {
        console.log('Error fetching notifications', e);
        
        setNotifications([]);
        setCryptoPrices([]);
        setLoading(false);
      });
  }, [userId]);

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

  return (
    <ParallaxScrollView
      headerBackgroundColor={{
        light: '#A1CEDC',
        dark: '#1D3D47',
      }}
      headerImage={
        <Image
          source={require('@/assets/images/partial-react-logo.png')}
          style={themedStyles.reactLogo}
        />
      }>
      <ThemedView style={themedStyles.titleContainer}>
        <HelloWave />
      </ThemedView>

      <ThemedView style={themedStyles.stepContainer}>
        <ThemedText type="subtitle">Step 1: Try it</ThemedText>
        <ThemedText>
          Edit <ThemedText type="defaultSemiBold">app/(tabs)/index.tsx</ThemedText> to see changes.
          Press{' '}
          <ThemedText type="defaultSemiBold">
            {Platform.select({
              ios: 'cmd + d',
              android: 'cmd + m',
              web: 'F12',
            })}
          </ThemedText>{' '}
          to open developer tools.
        </ThemedText>
      </ThemedView>

      <View style={themedStyles.container}>
        <Text style={themedStyles.header}>Your Tracked Cryptos</Text>
        <FlatList
          data={cryptoPrices}
          keyExtractor={item => item.symbol}
          renderItem={({ item }) => (
            <View style={themedStyles.cryptoCard}>
              <View style={{ flex: 1 }}>
                <Text style={themedStyles.cryptoName}>{item.symbol.replace('USDT', '/USD')}</Text>
                <Text style={themedStyles.cryptoPrice}>${item.price}</Text>
              </View>
              <FontAwesome name="bell" size={24} color="#87ceeb" />
            </View>
          )}
          contentContainerStyle={{ paddingBottom: 24 }}
        />
      </View>
    </ParallaxScrollView>
  );
}

const styles = (colorScheme: string) =>
  StyleSheet.create({
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    stepContainer: {
      gap: 8,
      marginBottom: 8,
    },
    reactLogo: {
      height: 178,
      width: 290,
      bottom: 0,
      left: 0,
      position: 'absolute',
    },
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
      padding: 16,
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
  });
