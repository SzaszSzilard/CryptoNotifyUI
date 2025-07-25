import { useCryptoData } from '@/components/ui/CNF/RealTimeCrypto';
import { CryptoPrice } from '@/models/CryptoPrice';
import { HttpService } from '@/services/httpService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Pressable, StyleSheet, Text, TextInput, useColorScheme, View } from 'react-native';


type Mode = 'target' | 'percent';

export default function NotificationSetup() {
  const { cryptos, userId } = useCryptoData();

  const { symbol, mode = 'target' } = useLocalSearchParams<{ symbol?: string; mode?: Mode }>();
  const colorScheme = useColorScheme() ?? 'light';
  const [crypto, setCrypto] = useState<CryptoPrice | null>(null);
  const [targetPrice, setTargetPrice] = useState<number | null>(null);
  const [percentage, setPercentage] = useState<number | null>(null);
  const [isAbove, setIsAbove] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const crypto = cryptos.filter(crypto => crypto.symbol === symbol).at(0);
    setCrypto(crypto || null);
    if (mode === 'percent' && crypto?.price !== null) {
      setTargetPrice(crypto?.price || null);
    }
  }, [mode, cryptos]);

  const handleSubmit = async () => {
    if (!userId) {
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
    if (mode === 'target') {
      type = isAbove ? 'n-above' : 'n-below';
    } else if (mode === 'percent') {
      type = isAbove ? 'n-percent-above' : 'n-percent-below';
    }

    const body: any = {
      type,
      userId: userId,
      symbol,
      price: targetPrice,
    };
    if (mode === 'percent') {
      body.percentage = percentage;
    }

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

  const themedStyles = styles(colorScheme);

  function TargetSelector() {
    return (
      <View style={themedStyles.selectorRow}>
        <Pressable
          style={[
            themedStyles.selectorButton,
            isAbove ? themedStyles.selectorActiveAbove : themedStyles.selectorInactive,
          ]}
          onPress={() => setIsAbove(true)}
        >
          <Text style={[
            themedStyles.selectorText,
            isAbove ? themedStyles.selectorTextActive : themedStyles.selectorTextInactive,
          ]}>
            {mode === 'percent' ? 'Rises' : 'Above'}
          </Text>
        </Pressable>
        <View style={themedStyles.selectorDivider} />
        <Pressable
          style={[
            themedStyles.selectorButton,
            !isAbove ? themedStyles.selectorActiveBelow : themedStyles.selectorInactive,
          ]}
          onPress={() => setIsAbove(false)}
        >
          <Text style={[
            themedStyles.selectorText,
            !isAbove ? themedStyles.selectorTextActive : themedStyles.selectorTextInactive,
          ]}>
            {mode === 'percent' ? 'Falls' : 'Below'}
          </Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={themedStyles.main}>
      <Text style={themedStyles.title}>
        {mode === 'percent' ? 'Percentage Change Notification' : 'Price Target Notification'}
      </Text>

      <Text style={[themedStyles.title, themedStyles.symbolPrice]}>
        {typeof symbol === 'string' ?
          `${symbol.replace('USDT', '/USD')}: $${crypto?.price.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
          : ''}
      </Text>

      {mode !== 'percent' && (
        <Text style={themedStyles.info}>Info: Setting a Price Target notification, will result in a push notification when the price goes above or falls below your specified target.</Text>
      )}
      { mode === 'percent' && (
        <Text style={themedStyles.info}>Info: Setting a Percentage Change notification, will result in a push notification when the price rises or falls by your specified percentage.</Text>
      )}

      <Text style={themedStyles.label}>{mode === 'target' ? "Target Price" : "Target Percentage (%)"}</Text>
      {['target', 'percent'].includes(mode) && (
        <TextInput
          style={themedStyles.input}
          keyboardType="numeric"
          value={(mode === 'target' ? targetPrice : percentage)?.toString() ?? ''}
          onChangeText={(text) => {
            const num = Number(text);
            if (!isNaN(num)) {
              mode === 'target' ? setTargetPrice(num) : setPercentage(num);
            } else if (text.trim() === '') {
              mode === 'target' ? setTargetPrice(null) : setPercentage(null);
            }
          }}
          placeholder="6.66"
          placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
          textAlign="left" />
      )}
      <TargetSelector />
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
    info: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      marginTop: 20,
      fontStyle: 'italic',
    },
    label: {
      marginTop: 35,
      marginBottom: 10,
      fontSize: 16,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
    },
    input: {
      height: 60,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 20,
      color: colorScheme === 'dark' ? '#fff' : '#222',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      marginBottom: 20,
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
      height: 60,
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