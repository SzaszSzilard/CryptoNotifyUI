import { InformationBox } from '@/components/ui/CNF/InformationBox';
import { useCryptoData } from '@/components/ui/CNF/RealTimeCrypto';
import { CryptoPrice } from '@/models/CryptoPrice';
import { Mode } from '@/models/Mode';
import { Notification } from '@/models/Notification';
import { HttpService } from '@/services/httpService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function NotificationSetup() {
  const { cryptos, userId } = useCryptoData();

  const colorScheme = useColorScheme() ?? 'light';
  const themedStyles = styles(colorScheme);

  const { symbol, mode = 'target' } = useLocalSearchParams<{ symbol: string; mode?: Mode }>();
  const [crypto, setCrypto] = useState<CryptoPrice | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!userId) {
      Alert.alert('User ID error', 'Could not retrieve user ID.');
      return;
    }

    setLoading(true);

    const body: Notification = {
      type: 'n-' + mode,
      userId: userId,
      symbol,
      time: 60,
    };

    try {
      await HttpService.post<void>(`notification/`, body);
      Alert.alert('Success', 'Notification set!');
      router.replace({ pathname: '/screens/symbol', params: { symbol } });
    } catch (e) {
      console.error('Network error:', e);
      Alert.alert('Error', 'Failed to set notification.');
    }

    setLoading(false);
  };


  return (
    <View style={themedStyles.main}>
      <Text style={themedStyles.title}>
        {mode === 'rally' ? 'Short term rally Notification' : 'Change of direction Notification'}
      </Text>

      <Text style={[themedStyles.title, themedStyles.symbolPrice]}>
        {typeof symbol === 'string' ?
          `${symbol.replace('USDT', '/USD')}: $${crypto?.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : ''}
      </Text>

      <InformationBox mode={mode as Mode} />

      <Pressable
        style={themedStyles.button}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={themedStyles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
      </Pressable>
    </View>
  );
}

const styles = (colorScheme: string | null) =>
  StyleSheet.create({
    main: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
      padding: 24,
    },
    title: {
      fontSize: 25,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#222',
    },
    symbolPrice: {
      color: colorScheme === 'dark' ? '#f1c40f' : '#222',
      fontSize: 20,
    },
    button: {
      backgroundColor: colorScheme === 'dark' ? '#f1c40f' : '#f39c12',
      borderRadius: 10,
      alignItems: 'center',
      justifyContent: 'center',
      marginTop: 35,
      height: 60,
    },
    buttonText: {
      color: colorScheme === 'dark' ? '#222' : '#fff',
      fontSize: 21,
      fontWeight: 'bold',
    },
  });