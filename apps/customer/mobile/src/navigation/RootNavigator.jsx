/**
 * Root Navigator - Simple version bypassing React Navigation React 19 issues
 */
import React from 'react';
import { ActivityIndicator, View, Text } from 'react-native';
import { SimpleNavigator } from './SimpleNavigator';

export default function RootNavigatorContent({ user, isLoading }) {
    console.log('[RootNavigatorContent] rendering with:', { user: !!user, isLoading });

    if (isLoading) {
        return (
            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5' }}>
                <ActivityIndicator size="large" color="#FF6B35" />
                <Text style={{ marginTop: 10, fontSize: 14, color: '#666' }}>Loading authentication...</Text>
            </View>
        );
    }

    return <SimpleNavigator user={user} isLoading={isLoading} />;
}
