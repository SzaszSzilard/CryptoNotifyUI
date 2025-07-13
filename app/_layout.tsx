import { FontAwesome } from '@expo/vector-icons';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useState } from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme as useDeviceColorScheme } from '@/hooks/useColorScheme';

function CryptoNotifyHeader({
  colorScheme,
  toggleTheme,
}: {
  colorScheme: string;
  toggleTheme: () => void;
}) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14, justifyContent: 'space-between', width: '100%' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <View
          style={{
            backgroundColor: '#fff', // Always white for the icon background
            borderRadius: 999,
            padding: 4,
            marginRight: 8,
          }}
        >
          <Image
            source={require('../assets/images/alternateIcon.png')}
            style={{ width: 40, height: 40, borderRadius: 20 }}
            resizeMode="contain"
          />
        </View>
        <Text
          style={{
            fontSize: 28,
            fontWeight: 'bold',
            color: colorScheme === 'dark' ? '#fff' : '#222',
            letterSpacing: 0.5,
          }}
        >
          CryptoNotify
        </Text>
      </View>
      <TouchableOpacity onPress={toggleTheme} style={{ padding: 6 }}>
        <FontAwesome
          name={colorScheme === 'dark' ? 'sun-o' : 'moon-o'}
          size={28}
          color={colorScheme === 'dark' ? '#f1c40f' : '#222'}
        />
      </TouchableOpacity>
    </View>
  );
}

export default function RootLayout() {
  // Use a state to override the device color scheme
  const deviceColorScheme = useDeviceColorScheme();
  const [theme, setTheme] = useState<'light' | 'dark'>(deviceColorScheme === 'dark' ? 'dark' : 'light');

  const toggleTheme = () => setTheme(t => (t === 'dark' ? 'light' : 'dark'));

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) {
    return null;
  }

  const themedStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#181a20' : '#f5f6fa',
    },
  });

  return (
    <SafeAreaView style={themedStyles.safeArea}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerTitle: () => (
              <CryptoNotifyHeader colorScheme={theme} toggleTheme={toggleTheme} />
            ),
            headerStyle: {
              backgroundColor: theme === 'dark' ? '#181a20' : '#fff',
            },
            headerTitleAlign: 'left',
          }}
        >
          <Stack.Screen name="(tabs)" options={{ headerShown: true }} />
          <Stack.Screen name="+not-found" />
        </Stack>
        <StatusBar style="auto" />
      </ThemeProvider>
    </SafeAreaView>
  );
}
