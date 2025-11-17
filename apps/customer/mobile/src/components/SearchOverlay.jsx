// components/SearchOverlay.jsx
import React from 'react';
import {
    View,
    StyleSheet,
    TouchableOpacity,
    Text,
    FlatList,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

export default function SearchOverlay({
    visible,
    searchQuery,
    suggestions,
    onClose,
    onSelectSuggestion,
}) {
    if (!visible) {
        return null;
    }

    return (
        <>
            {/* Backdrop - tap to close */}
            <TouchableOpacity
                style={styles.backdrop}
                activeOpacity={1}
                onPress={onClose}
            />

            {/* Suggestions Container */}
            <View style={styles.suggestionsContainer}>
                {suggestions.length > 0 && (
                    <FlatList
                        data={suggestions}
                        keyExtractor={(item, index) => `${item.id || index}-${item.name}`}
                        renderItem={({ item }) => (
                            <TouchableOpacity
                                style={styles.suggestionItem}
                                activeOpacity={0.7}
                                onPress={() => {
                                    console.log('[SearchOverlay] Suggestion selected:', item);
                                    onSelectSuggestion(item);
                                }}
                            >
                                <MaterialIcons name="history" size={16} color="#999" />
                                <Text style={styles.suggestionText} numberOfLines={1}>
                                    {item.name}
                                </Text>
                            </TouchableOpacity>
                        )}
                        scrollEnabled={true}
                        nestedScrollEnabled={true}
                    />
                )}
            </View>
        </>
    );
}

const styles = StyleSheet.create({
    overlayContainer: {
        ...StyleSheet.absoluteFillObject,
        zIndex: 999,
    },
    backdrop: {
        position: 'absolute',
        top: 150,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
        zIndex: 1,
    },
    suggestionsContainer: {
        position: 'absolute',
        top: 150,
        left: 16,
        right: 16,
        backgroundColor: '#fff',
        borderRadius: 12,
        zIndex: 2,
        maxHeight: 350,
        borderWidth: 1,
        borderColor: '#f0f0f0',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.15,
        shadowRadius: 8,
        elevation: 5,
        overflow: 'hidden',
    },
    suggestionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 16,
        paddingVertical: 14,
        borderBottomWidth: 1,
        borderBottomColor: '#f5f5f5',
        minHeight: 44,
    },
    suggestionText: {
        marginLeft: 12,
        fontSize: 14,
        color: '#333',
        flex: 1,
    },
});
