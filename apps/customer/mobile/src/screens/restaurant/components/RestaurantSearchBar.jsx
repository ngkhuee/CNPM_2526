import React, { useState } from 'react';
import { View, TextInput, StyleSheet, TouchableOpacity } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

/**
 * RestaurantSearchBar - Search foods trong nhà hàng
 * Sticky phía trên categories
 */
export default function RestaurantSearchBar({ restaurantName, searchQuery, onSearchChange }) {
    const [isFocused, setIsFocused] = useState(false);

    return (
        <View style={styles.container}>
            <View style={[styles.searchBox, isFocused && styles.searchBoxFocused]}>
                <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
                <TextInput
                    style={styles.input}
                    placeholder={`Searching in ${restaurantName}`}
                    placeholderTextColor="#ccc"
                    value={searchQuery}
                    onChangeText={onSearchChange}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                />
                {searchQuery ? (
                    <TouchableOpacity onPress={() => onSearchChange('')}>
                        <MaterialIcons name="close" size={20} color="#999" />
                    </TouchableOpacity>
                ) : null}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    searchBox: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        paddingHorizontal: 12,
        height: 38,
        borderWidth: 1,
        borderColor: '#f5f5f5',
    },
    searchBoxFocused: {
        borderColor: '#ff6b35',
        backgroundColor: '#fff',
    },
    searchIcon: {
        marginRight: 8,
    },
    input: {
        flex: 1,
        fontSize: 14,
        color: '#333',
        padding: 0,
    },
});
