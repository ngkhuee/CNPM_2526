import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CATEGORIES = [
    { id: 0, name: 'All', keyword: '' },
    { id: 1, name: 'Burger', keyword: 'Burger' },
    { id: 2, name: 'Pizza', keyword: 'Pizza' },
    { id: 3, name: 'Cake', keyword: 'Cake' },
];

export default function CategoryTabs({ selectedCategory, onCategoryChange }) {
    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={[
                    styles.tab,
                    selectedCategory === '' && styles.tabActive,
                ]}
                onPress={() => onCategoryChange('')}
            >
                <Text
                    style={[
                        styles.tabText,
                        selectedCategory === '' && styles.tabTextActive,
                    ]}
                >
                    All
                </Text>
            </TouchableOpacity>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.scrollContainer}
            >
                {CATEGORIES.slice(1).map((cat) => (
                    <TouchableOpacity
                        key={cat.id}
                        style={[
                            styles.tab,
                            selectedCategory === cat.keyword && styles.tabActive,
                        ]}
                        onPress={() => onCategoryChange(cat.keyword)}
                    >
                        <Text
                            style={[
                                styles.tabText,
                                selectedCategory === cat.keyword && styles.tabTextActive,
                            ]}
                        >
                            {cat.name}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        paddingVertical: 12,
        marginBottom: 16,
    },
    scrollContainer: {
        flex: 1,
    },
    tab: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: '#f0f0f0',
        marginRight: 8,
    },
    tabActive: {
        backgroundColor: '#ff6b35',
    },
    tabText: {
        fontSize: 14,
        fontWeight: '500',
        color: '#666',
    },
    tabTextActive: {
        color: '#fff',
    },
});
