import { useColorScheme } from '@/hooks/useColorScheme.web';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

type Mode = 'target' | 'percent';

export function InformationBox({ mode }: { mode: Mode }) {
    const colorScheme = useColorScheme() ?? 'light';
    const themedStyles = getStyles(colorScheme);

    return (
        <>
            {mode !== 'percent' && (
                <Text style={themedStyles.info}>Info: Setting a Price Target notification, will result in a push notification when the price goes above or falls below your specified target.</Text>
            )}
            {mode === 'percent' && (
                <Text style={themedStyles.info}>Info: Setting a Percentage Change notification, will result in a push notification when the price rises or falls by your specified percentage.</Text>
            )}
        </>
    );
}

const getStyles = (colorScheme: string) =>
    StyleSheet.create({
        info: {
            fontSize: 16,
            color: colorScheme === 'dark' ? '#b2bec3' : '#636e72',
            marginTop: 20,
            fontStyle: 'italic',
        }
    });