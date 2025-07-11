import { getApp } from '@react-native-firebase/app';
import { getMessaging, getToken } from '@react-native-firebase/messaging';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';

type Mode = 'aboveBelow' | 'percent';

export default function NotificationSetup() {
  const { symbol, mode = 'aboveBelow' } = useLocalSearchParams<{ symbol?: string; mode?: Mode }>();
  const colorScheme = useColorScheme() ?? 'light';
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [targetPrice, setTargetPrice] = useState('');
  const [percentage, setPercentage] = useState('');
  const [isAbove, setIsAbove] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();


  // Poll current price every second
  useEffect(() => {
    if (!symbol) return;
    const interval = setInterval(() => {
      fetch(`http://192.168.0.167:8080/api/crypto/symbol/${symbol}`)
        .then(res => res.json())
        .then(data => setCurrentPrice(data.price))
        .catch(() => setCurrentPrice(null));
    }, 1000);
    return () => clearInterval(interval);
  }, [symbol]);

  // When mode is percent, always keep targetPrice in sync with currentPrice
  useEffect(() => {
    if (mode === 'percent' && currentPrice !== null) {
      setTargetPrice(currentPrice.toString());
    }
  }, [mode, currentPrice]);

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
      price: parseFloat(targetPrice),
    };
    if (mode === 'percent') {
      body.percentage = parseFloat(percentage);
    }

    try {
      const res = await fetch('http://192.168.0.167:8080/api/notification/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        Alert.alert('Success', 'Notification set!');
        router.back();
      } else {
        console.log(body, res.status, await res.text());
        Alert.alert('Error', 'Failed to set notification.');
      }
    } catch {
      Alert.alert('Error', 'Network error.');
    }
    setLoading(false);
  };

  const themedStyles = styles(colorScheme);

  // Elegant above/below selector
  function AboveBelowSelector() {
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
          ]}>Above</Text>
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
          ]}>Below</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={themedStyles.safeArea}>
      <View style={themedStyles.container}>
        <View style={themedStyles.spacer} />
        <Text style={themedStyles.title}>
          {mode === 'percent' ? 'Percentage Change Notification' : 'Above/Below Notification'}
        </Text>
        <Text style={themedStyles.subtitle}>
          for {typeof symbol === 'string' ? symbol.replace('USDT', '/USD') : ''}
        </Text>
        <Text style={themedStyles.label}>
          Current Price: {currentPrice !== null ? `$${currentPrice}` : <ActivityIndicator />}
        </Text>
        {mode === 'aboveBelow' && (
          <>
            <Text style={themedStyles.label}>Target Price</Text>
            <TextInput
              style={themedStyles.input}
              keyboardType="numeric"
              value={targetPrice}
              onChangeText={setTargetPrice}
              placeholder="Enter target price"
              placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
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
              placeholder="Enter percentage"
              placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
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
        <View style={themedStyles.spacer} />
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
      justifyContent: 'space-between',
    },
    spacer: {
      flex: 0.1,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#222',
      marginBottom: 8,
      textAlign: 'center',
    },
    subtitle: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      marginBottom: 18,
      textAlign: 'center',
    },
    label: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      marginBottom: 8,
      textAlign: 'center',
    },
    input: {
      height: 48,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 18,
      color: colorScheme === 'dark' ? '#fff' : '#222',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      marginBottom: 18,
      textAlign: 'center',
    },
    selectorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 24,
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
      backgroundColor: '#27ae60', // Green
      borderTopLeftRadius: 12,
      borderBottomLeftRadius: 12,
    },
    selectorActiveBelow: {
      backgroundColor: '#e74c3c', // Red
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
      fontSize: 18,
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
      marginTop: 12,
    },
    buttonText: {
      color: colorScheme === 'dark' ? '#222' : '#fff',
      fontSize: 20,
      fontWeight: 'bold',
    },
  });