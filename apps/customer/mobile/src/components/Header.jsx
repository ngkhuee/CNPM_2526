import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

export default function Header({
    userLocation,
    onLocationPress,
    onSearchPress,
    onSearchFocus,
    onSearchBlur,
    onSearchSubmit,
    onMenuPress,
}) {
    const [searchFocused, setSearchFocused] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Truncate address if too long (max 30 chars)
    const truncateAddress = (addr) => {
        if (!addr) return 'Select location';
        return addr.length > 30 ? addr.substring(0, 27) + '...' : addr;
    };

    const handleSearchFocus = () => {
        setSearchFocused(true);
        if (onSearchFocus) {
            onSearchFocus();
        }
    };

    const handleSearchBlur = () => {
        setSearchFocused(false);
        if (onSearchBlur) {
            onSearchBlur();
        }
    };

    const handleSearchChange = (text) => {
        setSearchQuery(text);
        if (onSearchPress) {
            onSearchPress(text);
        }
    };

    return (
        <View style={styles.headerContainer}>
            {/* Top row: Menu, Location, Avatar */}
            <View style={styles.topRow}>
                <TouchableOpacity
                    style={styles.menuBtn}
                    onPress={onMenuPress}
                >
                    <MaterialIcons name="menu" size={24} color="#333" />
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.locationBtn}
                    onPress={onLocationPress}
                >
                    <View style={styles.locationIcon}>
                        <MaterialIcons name="location-on" size={16} color="#ff6b35" />
                    </View>
                    <Text style={styles.locationText} numberOfLines={1}>
                        {truncateAddress(userLocation)}
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity style={styles.avatarBtn}>
                    <MaterialIcons name="account-circle" size={32} color="#ff6b35" />
                </TouchableOpacity>
            </View>

            {/* Search bar */}
            <View style={[styles.searchContainer, searchFocused && styles.searchFocused]}>
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search food..."
                    placeholderTextColor="#ccc"
                    onFocus={handleSearchFocus}
                    onBlur={handleSearchBlur}
                    onChangeText={handleSearchChange}
                    onSubmitEditing={() => {
                        if (onSearchSubmit && searchQuery.trim() !== '') {
                            onSearchSubmit(searchQuery);
                        }
                    }}
                    value={searchQuery}
                />
                {searchQuery !== '' && (
                    <TouchableOpacity
                        style={styles.clearBtn}
                        onPress={() => {
                            setSearchQuery('');
                            if (onSearchPress) {
                                onSearchPress('');
                            }
                        }}
                    >
                        <MaterialIcons name="close" size={18} color="#999" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    headerContainer: {
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        paddingTop: 55,
    },
    topRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: 16,
        paddingVertical: 12,
    },
    menuBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    locationBtn: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 12,
        paddingHorizontal: 12,
        paddingVertical: 8,
        backgroundColor: '#f5f5f5',
        borderRadius: 8,
    },
    locationIcon: {
        marginRight: 6,
    },
    locationText: {
        fontSize: 13,
        color: '#333',
        fontWeight: '500',
        flex: 1,
    },
    avatarBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginHorizontal: 16,
        marginBottom: 12,
        paddingHorizontal: 12,
        backgroundColor: '#f5f5f5',
        borderRadius: 20,
        height: 40,
        borderWidth: 1,
        borderColor: 'transparent',
    },
    searchFocused: {
        borderColor: '#ff6b35',
        backgroundColor: '#fff',
    },
    searchInput: {
        flex: 1,
        marginLeft: 8,
        fontSize: 14,
        color: '#333',
        paddingVertical: 0,
    },
    clearBtn: {
        padding: 4,
        marginRight: 4,
    },
});
