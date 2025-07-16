import { ThemedView } from '@/components/ThemedView';
import { CryptoPrice } from '@/models/CryptoPrice';
import { HttpService } from '@/services/httpService';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, TouchableOpacity, useColorScheme, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


export default function CryptoListScreen() {
  const [cryptos, setCryptos] = useState<CryptoPrice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const router = useRouter();
  
  useFocusEffect(
    React.useCallback(() => {
      let intervalId: ReturnType<typeof setInterval>;
      
      const fetchData = () => {
        HttpService.get<CryptoPrice[]>('crypto/list')
        .then((data) => {
          const prices = data.sort((a, b) => b.price - a.price);
          setCryptos(prices.filter(crypto => crypto.price > 0));
          setLoading(false);
        })
        .catch((err) => {
          setLoading(false);
          console.log('Error fetching crypto list:', err);
        });
      };
      
      fetchData();
      intervalId = setInterval(fetchData, 1000);
      return () => clearInterval(intervalId);
    }, [])
  );
  
  const themedStyles = styles(colorScheme);
  
  const filteredCryptos = useMemo(() => {
    if (!search.trim()) return cryptos;
    const lower = search.trim().toLowerCase();
    return cryptos.filter(crypto =>
      crypto.symbol.toLowerCase().includes(lower) ||
      crypto.symbol.replace('USDT', '/USD').toLowerCase().includes(lower)
    );
  }, [cryptos, search]);
  
  if (loading) {
      return (
        <View style={themedStyles.centered}>
          <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#87ceeb' : '#36525E'} />
        </View>
      );
    }

  if (error) {
    return <Text style={themedStyles.errorText}>Network Error</Text>;
  }
  
  return (
    <SafeAreaView style={themedStyles.safeArea}>
    <KeyboardAvoidingView style={themedStyles.keyboardAvoidingView}>
    
      <ThemedView style={themedStyles.container}>
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
            const name = crypto.symbol.replace('USDT', '/USD'); 
            return (
              <TouchableOpacity
              style={themedStyles.itemRow}
              activeOpacity={0.85}
              onPress={() => router.push({
                pathname: '../screens/notifications/list',
                params: { symbol: crypto.symbol },
              })}
              >
                <View style={{ flex: 1 }}>
                <Text style={themedStyles.cryptoName}>{name}</Text>
                <Text style={themedStyles.cryptoPrice}>${crypto.price.toFixed(2)}</Text>
                </View>
                <FontAwesome
                name="bell"
                size={22}
                color={colorScheme === 'dark' ? '#87ceeb' : '#36525E'}
                style={{ marginLeft: 8 }}
                />
              </TouchableOpacity>
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
    keyboardAvoidingView: {
      flex: 1,
    },
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