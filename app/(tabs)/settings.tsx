import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Stack } from 'expo-router';
import Colors from '@/constants/colors';

export default function SettingsScreen() {
    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Settings',
                    headerStyle: {
                        backgroundColor: Colors.background.primary,
                    },
                    headerTintColor: Colors.text.primary,
                }}
            />
            <Text style={styles.text}>Settings Screen</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.background.secondary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: Colors.text.primary,
        fontSize: 18,
    },
});