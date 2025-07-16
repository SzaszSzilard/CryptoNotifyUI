import { CryptoPrice } from '@/models/CryptoPrice';
import { HttpService } from '@/services/httpService';
import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

type Mode = 'aboveBelow' | 'percent';

export default function NotificationSetup() {
  const { symbol, mode = 'aboveBelow' } = useLocalSearchParams<{ symbol?: string; mode?: Mode }>();
  const colorScheme = useColorScheme() ?? 'light';
  const [crypto, setCrypto] = useState<CryptoPrice | null>(null);
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [percentage, setPercentage] = useState('');
  const [isAbove, setIsAbove] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  // Poll current price every second
  useEffect(() => {
    if (!symbol) return;
    const interval = setInterval(() => 
      HttpService.get<CryptoPrice>(`crypto/symbol/${symbol}`)
        .then(crypto => setCrypto(crypto))
    , 1000);

    return () => clearInterval(interval);
  }, [symbol]);

  // When mode is percent, always keep targetPrice in sync with currentPrice
  useEffect(() => {
    if (mode === 'percent' && crypto?.price !== null) {
      setTargetPrice(crypto?.price || null);
    }
  }, [mode, crypto?.price]);

  const handleSubmit = async () => {
    const userToken = await getToken(getMessaging(getApp()));

    if (!userToken) {
      Alert.alert('User ID error', 'Could not retrieve user ID.');
      return;
    }
    if (!targetPrice || isNaN(Number(targetPrice))) {
      Alert.alert('Invalid input', 'Please enter a valid price.');
      return;
    }
    if (mode === 'percent' && (!percentage || isNaN(Number(percentage)))) {
      Alert.alert('Invalid input', 'Please enter a valid percentage.');
      return;
    }
    setLoading(true);

    let type = '';
    if (mode === 'aboveBelow') {
      type = isAbove ? 'n-above' : 'n-below';
    } else if (mode === 'percent') {
      type = isAbove ? 'n-percent-above' : 'n-percent-below';
    }

    const body: any = {
      type,
      userId: userToken,
      symbol,
      price: targetPrice,
    };
    if (mode === 'percent') {
      body.percentage = percentage;
    }

    try {
      await HttpService.post<void>(`notification/`, body);
      Alert.alert('Success', 'Notification set!');
      router.replace({ pathname: '/tracked/[symbol]', params: { symbol } });
    } catch(e) {
      console.error('Network error:', e);
      Alert.alert('Error', 'Failed to set notification.');
    }
    setLoading(false);
  };

  const themedStyles = styles(colorScheme);

  // Elegant above/below selector
  function AboveBelowSelector() {
    const isPercent = mode === 'percent';
    return (
      <View style={themedStyles.selectorRow}>
        <TouchableOpacity
          style={[
            themedStyles.selectorButton,
            isAbove ? themedStyles.selectorActiveAbove : themedStyles.selectorInactive,
          ]}
          onPress={() => setIsAbove(true)}
          activeOpacity={0.85}
        >
          <Text style={[
            themedStyles.selectorText,
            isAbove ? themedStyles.selectorTextActive : themedStyles.selectorTextInactive,
          ]}>
            {isPercent ? 'Rises' : 'Above'}
          </Text>
        </TouchableOpacity>
        <View style={themedStyles.selectorDivider} />
        <TouchableOpacity
          style={[
            themedStyles.selectorButton,
            !isAbove ? themedStyles.selectorActiveBelow : themedStyles.selectorInactive,
          ]}
          onPress={() => setIsAbove(false)}
          activeOpacity={0.85}
        >
          <Text style={[
            themedStyles.selectorText,
            !isAbove ? themedStyles.selectorTextActive : themedStyles.selectorTextInactive,
          ]}>
            {isPercent ? 'Falls' : 'Below'}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={themedStyles.safeArea}>
      <View style={themedStyles.container}>
        <Text style={themedStyles.title}>
          {mode === 'percent' ? 'Percentage Change Notification' : 'Above/Below Notification'}
        </Text>
        
        <Text style={themedStyles.symbolPriceLine}>
          {typeof symbol === 'string' ? 
            `${symbol.replace('USDT', '/USD')} ${crypto?.price}`
          : ''}
        </Text>

        <View style={{ height: 18 }} />
        {mode === 'aboveBelow' && (
          <>
            <Text style={themedStyles.label}>Target Price</Text>
            <TextInput
              style={themedStyles.input}
              keyboardType="numeric"
              value={targetPrice}
              onChangeText={setTargetPrice}
              placeholder="66.66% "
              placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
              textAlign="left"
            />
          </>
        )}
        {mode === 'percent' && (
          <>
            <Text style={themedStyles.label}>Percentage (%)</Text>
            <TextInput
              style={themedStyles.input}
              keyboardType="numeric"
              value={percentage}
              onChangeText={setPercentage}
              placeholder="66.66"
              placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
              textAlign="left"
            />
          </>
        )}
        <AboveBelowSelector />
        <TouchableOpacity
          style={themedStyles.button}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={themedStyles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colorScheme: string | null) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
    },
    container: {
      flex: 1,
      padding: 24,
      justifyContent: 'flex-start',
    },
    title: {
      fontSize: 26,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#222',
      marginBottom: 4,
      textAlign: 'left',
    },
    subtitle: {
      fontSize: 18,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      marginBottom: 6,
      textAlign: 'left',
    },
    currentPriceLabel: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#b2bec3' : '#2980ff',
      marginBottom: 12,
      textAlign: 'left',
    },
    currentPriceValue: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#f1c40f' : '#222',
    },
    label: {
      fontSize: 17,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      marginBottom: 6,
      textAlign: 'left',
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 19,
      color: colorScheme === 'dark' ? '#fff' : '#222',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      marginBottom: 14,
      textAlign: 'left',
    },
    selectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 18,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#eaf0fb',
      borderWidth: 1,
      borderColor: colorScheme === 'dark' ? '#353b48' : '#b2bec3',
      height: 56,
    },
    selectorButton: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      height: '100%',
      paddingVertical: 0,
    },
    selectorActiveAbove: {
      backgroundColor: '#27ae60',
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    selectorActiveBelow: {
      backgroundColor: '#e74c3c',
      borderTopRightRadius: 12,
      borderBottomRightRadius: 12,
    },
    selectorInactive: {
      backgroundColor: 'transparent',
    },
    selectorDivider: {
      width: 2,
      height: '70%',
      backgroundColor: colorScheme === 'dark' ? '#353b48' : '#b2bec3',
    },
    selectorText: {
      fontSize: 19,
      fontWeight: 'bold',
      color: '#fff',
    },
    selectorTextActive: {
      color: '#fff',
    },
    selectorTextInactive: {
      color: '#fff',
      opacity: 0.6,
    },
    button: {
      backgroundColor: colorScheme === 'dark' ? '#f1c40f' : '#f39c12',
      borderRadius: 10,
      padding: 18,
      alignItems: 'center',
      marginTop: 10,
    },
    buttonText: {
      color: colorScheme === 'dark' ? '#222' : '#fff',
      fontSize: 21,
      fontWeight: 'bold',
    },
    symbolPriceLine: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#f1c40f' : '#222',
      textAlign: 'left',
      marginBottom: 0,
    },
  });