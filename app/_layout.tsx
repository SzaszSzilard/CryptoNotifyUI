import { CryptoDataProvider } from '@/components/ui/CNF/RealTimeCrypto';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Image, StyleSheet, Text, View } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaView } from 'react-native-safe-area-context';

import { useColorScheme as useDeviceColorScheme } from '@/hooks/useColorScheme';

function CryptoNotifyHeader({ colorScheme }: { colorScheme: string }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
      <View
        style={{
          backgroundColor: colorScheme === 'dark' ? '#fff' : '#181a20',
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
  );
}

export default function RootLayout() {
  const deviceColorScheme = useDeviceColorScheme();

  const [loaded] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
  });

  if (!loaded) return null;

  const theme = deviceColorScheme === 'dark' ? 'dark' : 'light';

  const themedStyles = StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme === 'dark' ? '#181a20' : '#f5f6fa',
    },
  });

  return (
    <CryptoDataProvider>
    <SafeAreaView style={themedStyles.safeArea}>
      <ThemeProvider value={theme === 'dark' ? DarkTheme : DefaultTheme}>
        <Stack
          screenOptions={{
            headerTitle: () => <CryptoNotifyHeader colorScheme={theme} />,
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
    </CryptoDataProvider>
  );
}
