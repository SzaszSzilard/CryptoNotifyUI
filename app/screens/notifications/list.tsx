import { useLocalSearchParams, useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, useColorScheme, View } from 'react-native';

export default function NotificationTypes() {
  const { symbol } = useLocalSearchParams();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';

  const notificationTypes = [
    'Above/Below',
    'Percentage Change',
    'Short term rally',
    'Change of direction',
  ];

  const themedStyles = styles(colorScheme);

  return (
    <View style={themedStyles.safeArea}>
      <View style={themedStyles.container}>
        <View style={themedStyles.titleContainer}>
          <Text style={themedStyles.title}>
            Select Notification Type
          </Text>
          <Text style={themedStyles.subtitle}>
            for {typeof symbol === 'string' ? symbol.replace('USDT', '/USD') : ''}
          </Text>
        </View>
        <View style={{ marginTop: 16 }}>
          <TouchableOpacity
            style={themedStyles.card}
            onPress={() => router.push({ pathname: '/screens/notifications/aboveBelow', params: { symbol } })}
            activeOpacity={0.85}
          >
            <Text style={themedStyles.cardText}>Above/Below</Text>
          </TouchableOpacity>
          {notificationTypes.slice(1).map(type => (
            <TouchableOpacity
              key={type}
              style={themedStyles.card}
              onPress={() => router.push({ pathname: '/screens/notifications/aboveBelow', params: { symbol, mode: 'percent' } })}
              activeOpacity={0.85}
            >
              <Text style={themedStyles.cardText}>{type}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
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
      justifyContent: 'flex-start',
    },
    titleContainer: {
      marginBottom: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#222',
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
    },
    card: {
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      borderRadius: 10,
      padding: 18,
      marginBottom: 14,
      height: CARD_HEIGHT,
      justifyContent: 'center',
      shadowColor: colorScheme === 'dark' ? '#000' : '#aaa',
      shadowOpacity: 0.07,
      shadowRadius: 4,
      elevation: 2,
    },
    cardText: {
      fontSize: 18,
      fontWeight: 'bold',
      color: colorScheme === 'dark' ? '#fff' : '#222',
      textAlign: 'center',
    },
  });