// screens/search/SearchResultsScreen.jsx
import React, { useEffect, useState } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import axios from 'axios';
import FoodCard from '../home/components/FoodCard';
import { transformFoods } from '../../utils/dataTransformers';
import { useNavigateToRestaurant } from '../../hooks/useNavigateToRestaurant';
import apiConfig from '../../config/api.config';

const API_BASE = apiConfig.api.baseURL;

export default function SearchResultsScreen({ searchQuery, onBack, onNavigate }) {
    const [foodList, setFoodList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Hook để navigate tới restaurant detail
    const navigateToRestaurant = useNavigateToRestaurant(onNavigate);

    useEffect(() => {
        fetchSearchResults();
    }, [searchQuery]);

    const fetchSearchResults = async () => {
        try {
            setLoading(true);
            setError(null);

            if (!searchQuery || searchQuery.trim() === '') {
                setFoodList([]);
                setLoading(false);
                return;
            }

            // Fetch all foods from API
            const response = await axios.get(`${API_BASE}/menus`);
            const allFoods = transformFoods(response.data || []);

            // Filter by search query (name or description)
            const results = allFoods.filter(food =>
                food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (food.description && food.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );

            setFoodList(results);
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const renderGrid = () => {
        const numColumns = 2;
        const rows = [];

        for (let i = 0; i < foodList.length; i += numColumns) {
            rows.push(foodList.slice(i, i + numColumns));
        }

        return (
            <View style={styles.gridWrapper}>
                {rows.map((row, rowIndex) => (
                    <View key={rowIndex} style={styles.gridRow}>
                        {row.map(food => (
                            <View key={food.id} style={styles.gridItem}>
                                <FoodCard item={food} onPress={navigateToRestaurant} />
                            </View>
                        ))}
                        {row.length < numColumns &&
                            [...Array(numColumns - row.length)].map((_, idx) => (
                                <View key={`empty-${idx}`} style={styles.gridItem} />
                            ))}
                    </View>
                ))}
            </View>
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Search Results</Text>
                    <Text style={styles.searchQuery} numberOfLines={1}>
                        "{searchQuery}"
                    </Text>
                </View>
            </View>

            {/* Results Count */}
            {!loading && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsCount}>
                        {foodList.length} result{foodList.length !== 1 ? 's' : ''} found
                    </Text>
                </View>
            )}

            {/* Content */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
                contentContainerStyle={styles.contentPadding}
            >
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#FF6B35" />
                        <Text style={styles.loadingText}>Searching...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <MaterialIcons name="error-outline" size={48} color="#f44336" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : foodList.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search-off" size={48} color="#ddd" />
                        <Text style={styles.emptyTitle}>No Results Found</Text>
                        <Text style={styles.emptyText}>
                            Try searching with different keywords
                        </Text>
                    </View>
                ) : (
                    renderGrid()
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    backBtn: {
        width: 40,
        height: 40,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    headerContent: {
        flex: 1,
    },
    headerTitle: {
        fontSize: 16,
        fontWeight: '600',
        color: '#333',
    },
    searchQuery: {
        fontSize: 13,
        color: '#FF6B35',
        fontWeight: '500',
        marginTop: 2,
    },
    resultsInfo: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 10,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    resultsCount: {
        fontSize: 13,
        color: '#666',
        fontWeight: '500',
    },
    content: {
        flex: 1,
    },
    contentPadding: {
        paddingHorizontal: 12,
        paddingTop: 12,
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 300,
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
    },
    errorText: {
        marginTop: 12,
        fontSize: 14,
        color: '#f44336',
        textAlign: 'center',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 80,
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#999',
        marginTop: 12,
    },
    emptyText: {
        fontSize: 14,
        color: '#bbb',
        marginTop: 8,
        textAlign: 'center',
    },
    gridWrapper: {
        marginBottom: 12,
    },
    gridRow: {
        flexDirection: 'row',
        marginBottom: 12,
    },
    gridItem: {
        flex: 1,
        marginHorizontal: 6,
    },
});
