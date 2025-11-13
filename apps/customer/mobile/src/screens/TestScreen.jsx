import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useAuthStack } from '../navigation/useAuthStackNavigation';

export default function TestScreen() {
    const { user, isLoading } = useAuth();
    const authNav = useAuthStack();

    const handleGoToLogin = () => {
        authNav.navigate('Login');
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>Mobile App - Test Screen</Text>

            <View style={styles.section}>
                <Text style={styles.label}>Auth Status:</Text>
                <Text style={styles.value}>
                    {isLoading ? 'Loading...' : user ? 'Logged In' : 'Not Logged In'}
                </Text>
            </View>

            {user && (
                <View style={styles.section}>
                    <Text style={styles.label}>User:</Text>
                    <Text style={styles.value}>{user.email || 'Unknown'}</Text>
                </View>
            )}

            <Button
                title="App is Running!"
                onPress={() => Alert.alert('Success', 'Mobile app loaded successfully')}
            />

            <View style={styles.spacer} />

            <Button
                title="Go to Login"
                onPress={handleGoToLogin}
                color="#FF6B35"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        justifyContent: 'center',
        backgroundColor: '#f5f5f5',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 30,
        textAlign: 'center',
    },
    section: {
        marginBottom: 20,
        padding: 15,
        backgroundColor: '#fff',
        borderRadius: 8,
    },
    label: {
        fontSize: 14,
        fontWeight: '600',
        marginBottom: 5,
        color: '#666',
    },
    value: {
        fontSize: 16,
        color: '#333',
    },
    spacer: {
        height: 20,
    },
});
