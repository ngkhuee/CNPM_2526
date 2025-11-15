import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { ExploreIcon } from '../../../components/Icons';

export function Banner({ onExplorePress }) {
    return (
        <View style={styles.banner}>
            <View style={styles.content}>
                <Text style={styles.title}>Order Your Favorite Food</Text>
                <Text style={styles.subtitle}>Discover delicious meals from top-rated restaurants</Text>

                <TouchableOpacity style={styles.btn} onPress={onExplorePress}>
                    <ExploreIcon size={18} color="#ff6b35" />
                    <Text style={styles.btnText}>Explore Now</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
} const styles = StyleSheet.create({
    banner: {
        backgroundColor: '#ff6b35',
        borderRadius: 12,
        padding: 24,
        marginBottom: 20,
        elevation: 3,
    },
    content: {
        gap: 8,
    },
    title: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#fff',
    },
    subtitle: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    btn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderRadius: 20,
        alignSelf: 'flex-start',
        marginTop: 8,
    },
    btnText: {
        color: '#ff6b35',
        fontWeight: '600',
        fontSize: 14,
    },
});
