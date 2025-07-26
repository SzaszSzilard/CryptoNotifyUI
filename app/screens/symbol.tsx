import { useCryptoData } from '@/components/ui/CNF/RealTimeCrypto';
import { Notification } from '@/models/Notification';
import { HttpService } from '@/services/httpService';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, Text, TouchableOpacity, View, useColorScheme } from 'react-native';


export default function TrackedNotifications() {
  const { _, userId } = useCryptoData();

  const colorScheme = useColorScheme() ?? 'light';
  const themedStyles = styles(colorScheme);

  const { symbol } = useLocalSearchParams<{ symbol: string }>();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useFocusEffect(
    React.useCallback(() => {
      if (!userId || !symbol) return;
      setLoading(true);

      HttpService.get<Notification[]>(`user/${userId}/notifications`)
        .then((notifications) => {
          setNotifications(notifications.filter(n => n.symbol === symbol));
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }, [userId, symbol])
  );

  const handleDelete = (notif: Notification & { percentage?: number }) => {
    Alert.alert('Delete Notification', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          const body: any = {
            id: notif.id,
            type: notif.type,
            userId: userId,
            symbol: notif.symbol,
            price: notif.price,
          };
          if (notif.percentage !== undefined && notif.percentage !== null) {
            body.percentage = notif.percentage;
          }

          HttpService.delete<Notification>('notification/', body)
            .then(() => {
              setNotifications(notifications.filter(n => n.id !== notif.id));
            })
        },
      },
    ]);
  };

  return (
    <View style={themedStyles.container}>
      <TouchableOpacity
        style={themedStyles.newButton}
        onPress={() => {
          router.push({ pathname: '../screens/notifications/list', params: { symbol } });
        }}
      >
        <Text style={themedStyles.newButtonText}>
          + New Notification for{' '}
          <Text style={themedStyles.symbolHighlight}>
            {String(symbol).replace('USDT', '/USD')}
          </Text>
        </Text>
      </TouchableOpacity>
      {loading ? (
        <ActivityIndicator size="large" color={colorScheme === 'dark' ? '#87ceeb' : '#2980ff'} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={n => n.id.toString()}
          renderItem={({ item: notification }) => {

            let typeText = '';
            switch (notification.type) {
              case 'n-above':
                typeText = `When price goes Above`;
                break;
              case 'n-below':
                typeText = `When price goes Below`;
                break;
              case 'n-percent-above':
                typeText = `When price Rises by ${notification.percentage ?? '?'}%`;
                break;
              case 'n-percent-below':
                typeText = `When price Falls by ${notification.percentage ?? '?'}%`;
                break;
              case 'n-rally':
                typeText = `When crypto is Rallying`;
                break;
              case 'n-change':
                typeText = `When price trend changes direction`;
                break;
              default:
                typeText = `Unknown notification type: ${notification.type}`;
            }

            return (
              <View style={themedStyles.notifCard}>
                <View style={{ flex: 1 }}>
                  <Text style={themedStyles.notifText}>
                    {typeText}
                  </Text>
                  {notification.type.includes('percent') ? (
                    <Text style={themedStyles.notifText}>
                      Price at creation: ${notification.price}
                    </Text>
                  ) : (
                    <Text style={themedStyles.notifText}>
                      Target price: ${notification.price}
                    </Text>
                  )}
                </View>
                <TouchableOpacity onPress={() => handleDelete(notification)}>
                  <FontAwesome name="trash" size={24} color={colorScheme === 'dark' ? '#e74c3c' : '#d35400'} />
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={<Text style={themedStyles.empty}>No notifications for this symbol.</Text>}
        />
      )}
    </View>
  );
}

const styles = (colorScheme: string) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colorScheme === 'dark' ? '#181a20' : '#f5f6fa',
      padding: 16,
    },
    newButton: {
      backgroundColor: colorScheme === 'dark' ? '#47ceeb' : '#87ceeb', // skyblue for both themes
      borderRadius: 10,
      padding: 14,
      alignItems: 'center',
      marginBottom: 18,
    },
    newButtonText: {
      color: colorScheme === 'dark' ? '#181a20' : '#fff',
      fontWeight: 'bold',
      fontSize: 18,
    },
    notifCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      borderRadius: 12,
      padding: 18,
      marginBottom: 14,
      elevation: colorScheme === 'dark' ? 0 : 2,
      shadowColor: colorScheme === 'dark' ? 'transparent' : '#b2bec3',
      shadowOpacity: colorScheme === 'dark' ? 0 : 0.08,
      shadowRadius: 4,
    },
    notifText: {
      fontSize: 16,
      color: colorScheme === 'dark' ? '#fff' : '#222',
    },
    empty: {
      textAlign: 'center',
      color: colorScheme === 'dark' ? '#b2bec3' : '#888',
      marginTop: 40,
      fontSize: 16,
    },
    symbolHighlight: {
      color: colorScheme === 'dark' ? '#C20C0CFF' : '#1a237e',
      fontWeight: 'bold',
    },
  });