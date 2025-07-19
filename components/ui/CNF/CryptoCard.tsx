import { CryptoPrice } from '@/models/CryptoPrice';
import { FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useColorScheme,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from 'react-native-reanimated';

type CryptoCardProps = {
  crypto: CryptoPrice;
  notifCount: Record<string, number>;
};

export function CryptoCard({ crypto, notifCount }: CryptoCardProps) {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themedStyles = getStyles(colorScheme);

  const rotationAnimation = useSharedValue(0);

  useEffect(() => {
    rotationAnimation.value = withRepeat(
      withSequence(
        withTiming(25, { duration: 150 }),
        withTiming(0, { duration: 150 })
      ),
      4
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotationAnimation.value}deg` }],
  }));

  return (
    <TouchableOpacity
      style={themedStyles.cryptoCard}
      activeOpacity={0.85}
      onPress={() =>
        router.push({
          pathname: '/screens/notifications/list',
          params: { symbol: crypto.symbol },
        })
      }
    >
      <View style={{ flex: 1 }}>
        <Text style={themedStyles.cryptoName}>
          {crypto.symbol.replace('USDT', '/USD')}
        </Text>
        <Text style={themedStyles.cryptoPrice}>
          ${crypto.price > 1 ? crypto.price.toFixed(2) : crypto.price.toFixed(8)}
        </Text>
      </View>
      <TouchableOpacity style={{ position: 'relative', justifyContent: 'center', alignItems: 'center' }}
      onPress={() =>
        router.push({
          pathname: '/screens/symbol',
          params: { symbol: crypto.symbol },
        })
      }>
        <Animated.View style={animatedStyle}>
          <FontAwesome name="bell" size={24} color="#87ceeb" />
        </Animated.View>
        {notifCount[crypto.symbol] > 0 && (
          <View style={themedStyles.bubble}>
            <Text style={themedStyles.bubbleText}>{notifCount[crypto.symbol]}</Text>
          </View>
        )}
      </TouchableOpacity>
    </TouchableOpacity>
  );
}

const getStyles = (colorScheme: string) =>
  StyleSheet.create({
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
