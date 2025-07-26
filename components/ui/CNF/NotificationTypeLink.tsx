import { Mode } from '@/models/Mode';
import { useRouter } from 'expo-router';
import React from 'react';
import { Pressable, StyleSheet, Text, useColorScheme } from 'react-native';

interface Props {
  title: string;
  mode: Mode;
  symbol: string;
}

export const NotificationTypeButton: React.FC<Props> = ({ title, mode, symbol }) => {
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const themedStyles = getStyles(colorScheme);
  const isTargetMode = mode === 'target' || mode === 'percent';

  return (
    <Pressable
      onPress={() =>
        router.push({
          pathname: '/screens/notifications/' + (isTargetMode ? 'target' : 'nonTarget'),
          params: { symbol, mode },
        })
      }
      style={({ pressed }) => [
        themedStyles.card,
        { opacity: pressed ? 0.85 : 1 },
      ]}
    >
      <Text style={themedStyles.cardText}>{title}</Text>
    </Pressable>
  );
};

const getStyles = (colorScheme: string) =>
  StyleSheet.create({
    card: {
      backgroundColor: colorScheme === 'dark' ? '#23272f' : '#fff',
      borderRadius: 10,
      padding: 18,
      marginBottom: 14,
      height: 70,
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
