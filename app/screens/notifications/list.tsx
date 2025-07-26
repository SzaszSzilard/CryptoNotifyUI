import { NotificationTypeButton } from '@/components/ui/CNF/NotificationTypeLink';
import { useLocalSearchParams } from 'expo-router';
import { StyleSheet, Text, useColorScheme, View } from 'react-native';

export default function NotificationTypes() {
    const colorScheme = useColorScheme() ?? 'light';
  const themedStyles = styles(colorScheme);
  const { symbol } = useLocalSearchParams();

  const notificationTypes = [
    { title: 'Price Target', mode: 'target' },
    { title: 'Percentage Change', mode: 'percent' },
    { title: 'Short term rally', mode: 'rally' },
    { title: 'Change of direction', mode: 'change' },
  ];

  return (
    <View style={themedStyles.safeArea}>
      <View style={themedStyles.titleContainer}>
        <Text style={themedStyles.title}>Select notification type</Text>
        <Text style={themedStyles.subtitle}>
          for {typeof symbol === 'string' ? symbol.replace('USDT', '/USD') : ''}
        </Text>
      </View>

      <View style={{ marginTop: 16 }}>
        {notificationTypes.map(({ title, mode }) => (
          <NotificationTypeButton
            key={title}
            title={title}
            mode={mode}
            symbol={symbol as string}
            colorScheme={colorScheme}
          />
        ))}
      </View>
    </View>
  );
}

const styles = (colorScheme: string | null) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
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
  });