// SplashScreen.jsx - Loading screen displayed during app initialization
import React from 'react';
import {
    View,
    StyleSheet,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';

export default function SplashScreen() {
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.content}>
                <ActivityIndicator size="large" color="#FF6B35" />
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#fff',
    },
    content: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});
