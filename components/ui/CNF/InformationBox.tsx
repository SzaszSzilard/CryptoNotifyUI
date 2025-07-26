import { useColorScheme } from '@/hooks/useColorScheme.web';
import { Mode } from '@/models/Mode';
import React from 'react';
import { StyleSheet, Text } from 'react-native';

export function InformationBox({ mode }: { mode: Mode }) {
    const colorScheme = useColorScheme() ?? 'light';
    const themedStyles = getStyles(colorScheme);

    return (
        <>
            {mode === 'target' && (
                <Text style={themedStyles.info}>Info: Setting a Price Target notification, will result in a push notification when the price goes above or falls below your specified target.</Text>
            )}
            {mode === 'percent' && (
                <Text style={themedStyles.info}>Info: Setting a Percentage Change notification, will result in a push notification when the price rises or falls by your specified percentage.</Text>
            )}
            {mode === 'rally' && (
                <Text style={themedStyles.info}>Info: Setting a Short Term Rally notification, will result in a push notification when the price rises or falls rapidly in a short time frame. The time frame for this is currently set to 60 minutes and 2% minimum change, future updates will bring more flexibility.</Text>
            )}
            {mode === 'change' && (
                <Text style={themedStyles.info}>Info: Setting a Change of Direction notification, will result in a push notification when the price trend changes direction. The time frame for this is currently set to 60 minutes, future updates will bring more flexibility.</Text>
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