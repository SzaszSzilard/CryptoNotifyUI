import { InformationBox } from '@/components/ui/CNF/InformationBox';
import { useCryptoData, useLatestCryptoGetter, useUserId } from '@/components/ui/CNF/RealTimeCrypto';
import { CryptoPrice } from '@/models/CryptoPrice';
import { Mode } from '@/models/Mode';
import { Notification } from '@/models/Notification';
import { HttpService } from '@/services/httpService';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  ScrollView,
  StyleProp,
  StyleSheet,
  Text,
  TextInput,
  TextStyle,
  useColorScheme,
  View,
} from 'react-native';

function LiveSymbolPrice({ symbol, style }: { symbol?: string; style: StyleProp<TextStyle> }) {
  const { cryptos } = useCryptoData();
  const crypto = useMemo(
    () => cryptos.find((c: CryptoPrice) => c.symbol === symbol) ?? null,
    [cryptos, symbol]
  );

  return (
    <Text style={style}>
      {typeof symbol === 'string'
        ? `${symbol.replace('USDT', '/USD')}: $${
            crypto?.price !== undefined
              ? crypto.price.toLocaleString(undefined, { minimumFractionDigits: 2 })
              : '...'
          }`
        : ''}
    </Text>
  );
}

interface TargetSelectorProps {
  mode: Mode;
  isAbove: boolean;
  onSelectAbove: (value: boolean) => void;
  themedStyles: ReturnType<typeof styles>;
}

function TargetSelector({ mode, isAbove, onSelectAbove, themedStyles }: TargetSelectorProps) {
  return (
    <View style={themedStyles.selectorRow}>
      <Pressable
        style={[
          themedStyles.selectorButton,
          isAbove ? themedStyles.selectorActiveAbove : themedStyles.selectorInactive,
        ]}
        onPress={() => onSelectAbove(true)}
      >
        <Text
          style={[
            themedStyles.selectorText,
            isAbove ? themedStyles.selectorTextActive : themedStyles.selectorTextInactive,
          ]}
        >
          {mode === 'percent' ? 'Rises' : 'Above'}
        </Text>
      </Pressable>
      <View style={themedStyles.selectorDivider} />
      <Pressable
        style={[
          themedStyles.selectorButton,
          !isAbove ? themedStyles.selectorActiveBelow : themedStyles.selectorInactive,
        ]}
        onPress={() => onSelectAbove(false)}
      >
        <Text
          style={[
            themedStyles.selectorText,
            !isAbove ? themedStyles.selectorTextActive : themedStyles.selectorTextInactive,
          ]}
        >
          {mode === 'percent' ? 'Falls' : 'Below'}
        </Text>
      </Pressable>
    </View>
  );
}

export default function NotificationSetup() {
  const userId = useUserId();
  const getLatestCrypto = useLatestCryptoGetter();

  const colorScheme = useColorScheme() ?? 'light';
  const themedStyles = useMemo(() => styles(colorScheme), [colorScheme]);

  const { symbol, mode = 'target' } = useLocalSearchParams<{ symbol: string; mode?: Mode }>();
  const [inputText, setInputText] = useState<string>('');
  const [isAbove, setIsAbove] = useState(true);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async () => {
    Keyboard.dismiss();

    if (!userId) {
      Alert.alert('User ID error', 'Could not retrieve user ID.');
      return;
    }

    const parsedValue = parseFloat(inputText.replace(',', '.').trim());
    if (!inputText.trim() || isNaN(parsedValue) || parsedValue <= 0) {
      Alert.alert(
        'Invalid input',
        mode === 'percent' ? 'Please enter a valid percentage.' : 'Please enter a valid price.'
      );
      return;
    }

    const latestPrice = getLatestCrypto(symbol)?.price;
    const priceToSubmit = mode === 'percent' ? latestPrice : parsedValue;

    if (priceToSubmit === undefined || priceToSubmit === null || isNaN(Number(priceToSubmit))) {
      Alert.alert('Invalid input', 'Please enter a valid price.');
      return;
    }

    setLoading(true);

    let type = '';
    if (mode === 'target') {
      type = isAbove ? 'n-above' : 'n-below';
    } else if (mode === 'percent') {
      type = isAbove ? 'n-percent-above' : 'n-percent-below';
    }

    const body: Notification = {
      type,
      userId,
      symbol,
      price: priceToSubmit,
    };
    if (mode === 'percent') {
      body.percentage = parsedValue;
    }

    try {
      await HttpService.post<void>('notification/', body);
      Alert.alert('Success', 'Notification set!');
      router.replace({ pathname: '/screens/symbol', params: { symbol } });
    } catch (e) {
      console.error('Network error:', e);
      Alert.alert('Error', 'Failed to set notification.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView
      style={themedStyles.scroll}
      contentContainerStyle={themedStyles.main}
      keyboardShouldPersistTaps="handled"
    >
      <Text style={themedStyles.title}>
        {mode === 'percent' ? 'Percentage Change Notification' : 'Price Target Notification'}
      </Text>

      <LiveSymbolPrice symbol={symbol} style={[themedStyles.title, themedStyles.symbolPrice]} />

      <InformationBox mode={mode as Mode} />

      <Text style={themedStyles.label}>
        {mode === 'target' ? 'Target Price' : 'Target Percentage (%)'}
      </Text>
      {['target', 'percent'].includes(mode) && (
        <TextInput
          style={themedStyles.input}
          keyboardType="decimal-pad"
          value={inputText}
          onChangeText={setInputText}
          placeholder="6.66"
          placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
        />
      )}
      <TargetSelector
        mode={mode as Mode}
        isAbove={isAbove}
        onSelectAbove={setIsAbove}
        themedStyles={themedStyles}
      />
      <Pressable
        style={({ pressed }) => [
          themedStyles.button,
          pressed && { opacity: 0.85 },
        ]}
        onPress={handleSubmit}
        disabled={loading}
      >
        <Text style={themedStyles.buttonText}>{loading ? 'Submitting...' : 'Submit'}</Text>
      </Pressable>
    </ScrollView>
  );
}

const styles = (colorScheme: string | null) =>
  StyleSheet.create({
    scroll: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
    },
    main: {
      flexGrow: 1,
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
