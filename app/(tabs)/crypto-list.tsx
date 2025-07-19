import { CryptoCard } from '@/components/ui/CNF/CryptoCard';
import { useCryptoData } from '@/components/ui/CNF/RealTimeCrypto';
import React, { useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, StyleSheet, Text, TextInput, useColorScheme } from 'react-native';


export default function CryptoListScreen() {
  const cryptos = useCryptoData();

  const [search, setSearch] = useState('');
  const colorScheme = useColorScheme() ?? 'light';
  const notifCount: Record<string, number> = {};

  const themedStyles = styles(colorScheme);

  const filteredCryptos = useMemo(() => {
    if (!search.trim()) return cryptos;
    const lower = search.trim().toLowerCase();
    return cryptos.filter(crypto =>
      crypto.symbol.toLowerCase().includes(lower) ||
      crypto.symbol.replace('USDT', '/USD').toLowerCase().includes(lower)
    );
  }, [cryptos, search]);

  return (

    <KeyboardAvoidingView style={themedStyles.container}>
      <TextInput
        style={themedStyles.searchInput}
        placeholder="Search crypto..."
        placeholderTextColor={colorScheme === 'dark' ? '#b2bec3' : '#636e72'}
        value={search}
        onChangeText={setSearch}
      />

      <FlatList
        data={filteredCryptos}
        keyExtractor={crypto => crypto.symbol}
        renderItem={({ item }) => <CryptoCard crypto={item} notifCount={notifCount} />}
        ListEmptyComponent={<Text style={themedStyles.emptyText}>No cryptos found.</Text>}
        style={{ flex: 1 }}
      />
    </KeyboardAvoidingView>
  );
};

const CARD_HEIGHT = 64;
const styles = (colorScheme: string | null) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
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
      marginBottom: 16,
    },
    emptyText: {
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
      textAlign: 'center',
      marginTop: 32,
    },
  });