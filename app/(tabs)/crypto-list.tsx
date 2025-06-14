import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { CryptoPrice } from '@/models/CryptoPrice';
import { FontAwesome } from '@expo/vector-icons';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function CryptoListScreen() {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const colorScheme = useColorScheme() ?? 'light';

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    const fetchData = () => {
      fetch('http://192.168.0.167:8080/api/crypto/list')
        .then(res => res.json())
        .then(data => {
          const prices = data.map(CryptoPrice.fromJson).sort((a: CryptoPrice, b: CryptoPrice) => b.price - a.price);
          setCryptos(prices.filter((crypto: CryptoPrice) => crypto.price > 0));
          setLoading(false);
        })
        .catch(err => {
          setError(err.message || 'Unknown error');
          setLoading(false);
        });
    };

    fetchData();
    intervalId = setInterval(fetchData, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const addToFavorites = (crypto: CryptoPrice) => {
    alert(`Added ${crypto.symbol.replace('USDT', '/USD')} to favorites!`);
  };

  const notifyMe = (crypto: CryptoPrice) => {
    alert(`Notifications enabled for ${crypto.symbol.replace('USDT', '/USD')}`);
  };

  const themedStyles = styles(colorScheme);

  // Filter cryptos as user types
  const filteredCryptos = useMemo(() => {
    if (!search.trim()) return cryptos;
    const lower = search.trim().toLowerCase();
    return cryptos.filter(crypto =>
      crypto.symbol.toLowerCase().includes(lower) ||
      crypto.symbol.replace('USDT', '/USD').toLowerCase().includes(lower)
    );
  }, [cryptos, search]);

  if (loading) return <Text style={themedStyles.loadingText}>Loading...</Text>;
  if (error) return <Text style={themedStyles.errorText}>Error: {error}</Text>;

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ThemedView style={themedStyles.container}>
          <ThemedView style={themedStyles.titleContainer}>
            <ThemedText type="title">CryptoNotify</ThemedText>
          </ThemedView>

          {/* Search Input */}
          <View style={themedStyles.inputRow}>
            <TextInput
              style={themedStyles.searchInput}
              placeholder="Search crypto..."
              placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
              value={search}
              onChangeText={setSearch}
            />
          </View>

          <FlatList
            data={filteredCryptos}
            keyExtractor={crypto => crypto.symbol}
            renderItem={({ item: crypto }) => {
              // Format symbol: BTCUSDT -> BTC/USD
              const name = crypto.symbol.replace('USDT', '/USD');
              return (
                <View style={themedStyles.itemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={themedStyles.cryptoName}>{name}</Text>
                    <Text style={themedStyles.cryptoPrice}>${crypto.price.toFixed(2)}</Text>
                  </View>
                  <View style={themedStyles.verticalDivider} />
                  <TouchableOpacity
                    style={themedStyles.iconButton}
                    onPress={() => addToFavorites(crypto)}
                    accessibilityLabel="Add to favorites"
                  >
                    <FontAwesome
                      name="heart"
                      size={22}
                      color={colorScheme === 'dark' ? '#ff6b81' : '#e74c3c'}
                    />
                  </TouchableOpacity>
                  <View style={themedStyles.verticalDivider} />
                  <TouchableOpacity
                    style={themedStyles.iconButton}
                    onPress={() => notifyMe(crypto)}
                    accessibilityLabel="Enable notifications"
                  >
                    <FontAwesome
                      name="bell"
                      size={22}
                      color={colorScheme === 'dark' ? '#f1c40f' : '#f39c12'}
                    />
                  </TouchableOpacity>
                </View>
              );
            }}
            ListEmptyComponent={<Text style={themedStyles.emptyText}>No cryptos found.</Text>}
            contentContainerStyle={{ paddingBottom: 24 }}
            style={{ flex: 1 }}
          />
        </ThemedView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const CARD_HEIGHT = 64;

const styles = (colorScheme: string | null) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
    },
    container: {
      flex: 1,
      padding: 16,
    },
    titleContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 16,
    },
    inputRow: {
      marginBottom: 16,
    },
    searchInput: {
      height: CARD_HEIGHT,
      borderWidth: 1,
      borderColor: '#ccc',
      borderRadius: 10,
      paddingHorizontal: 16,
      fontSize: 18,
      color: colorScheme === 'dark' ? '#fff' : '#222',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      fontWeight: 'normal',
    },
    itemRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      borderRadius: 10,
      padding: 12,
      marginBottom: 10,
      height: CARD_HEIGHT,
      shadowColor: colorScheme === 'dark' ? '#000' : '#aaa',
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
    cryptoName: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#222',
    },
    cryptoPrice: {
      fontSize: 15,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      marginTop: 2,
    },
    iconButton: {
      paddingHorizontal: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    verticalDivider: {
      width: 1,
      height: 32,
      backgroundColor: colorScheme === 'dark' ? '#353b48' : '#dfe4ea',
      marginHorizontal: 8,
      borderRadius: 1,
    },
    emptyText: {
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      textAlign: 'center',
      marginTop: 32,
    },
    loadingText: {
      color: colorScheme === 'dark' ? '#fff' : '#222',
      textAlign: 'center',
      marginTop: 32,
    },
    errorText: {
      color: '#e74c3c',
      textAlign: 'center',
      marginTop: 32,
    },
  });