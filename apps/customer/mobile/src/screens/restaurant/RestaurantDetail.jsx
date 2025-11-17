import React, { useState, useEffect, useRef } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Image,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import axios from 'axios';
import FoodCard from '../home/components/FoodCard';
import { formatRating } from '../../shared/formatters';

const API_BASE = 'http://192.168.0.127:4000';

export default function RestaurantDetail({ route, navigation }) {
    const { restaurantId, foodIdToHighlight } = route.params || {};
    const [restaurant, setRestaurant] = useState(null);
    const [foods, setFoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const scrollViewRef = useRef(null);
    const [highlightedFoodId, setHighlightedFoodId] = useState(foodIdToHighlight);

    useEffect(() => {
        fetchRestaurantData();
    }, [restaurantId]);

    // Scroll to food and highlight when highlight ID changes
    useEffect(() => {
        if (highlightedFoodId && foods.length > 0 && scrollViewRef.current) {
            const foodIndex = foods.findIndex(f => f.id === highlightedFoodId);
            if (foodIndex !== -1) {
                setTimeout(() => {
                    const yPosition = foodIndex * 200; // Approximate height
                    scrollViewRef.current?.scrollTo({
                        y: yPosition,
                        animated: true,
                    });
                    // Highlight for 2 seconds then remove
                    setTimeout(() => setHighlightedFoodId(null), 2000);
                }, 300);
            }
        }
    }, [highlightedFoodId, foods]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);
            // Fetch restaurant info from restaurants endpoint
            const restaurantsRes = await axios.get(`${API_BASE}/restaurants`);
            const restaurantData = restaurantsRes.data.find(r => r.id === restaurantId);
            setRestaurant(restaurantData);

            // Fetch menu items
            const foodsRes = await axios.get(`${API_BASE}/menus`);
            const restaurantFoods = foodsRes.data.filter(
                f => f.restaurant_id === restaurantId
            );
            setFoods(restaurantFoods);
            setError(null);
        } catch (err) {
            console.error('Fetch error:', err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff6b35" />
                </View>
            </View>
        );
    }

    if (error || !restaurant) {
        return (
            <View style={styles.container}>
                <TouchableOpacity
                    style={styles.backBtn}
                    onPress={() => navigation.goBack()}
                >
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>Error: {error || 'Restaurant not found'}</Text>
                    <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={fetchRestaurantData}
                    >
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    const imageUrl = `${API_BASE}${restaurant.image}`;
    const bannerUrl = `${API_BASE}${restaurant.banner_image}`;
    const rating = formatRating(restaurant.rating);

    return (
        <View style={styles.container}>
            {/* Header with back button */}
            <TouchableOpacity
                style={styles.backBtn}
                onPress={() => navigation.goBack()}
            >
                <MaterialIcons name="arrow-back" size={24} color="#fff" />
            </TouchableOpacity>

            <ScrollView ref={scrollViewRef} showsVerticalScrollIndicator={false}>
                {/* Banner */}
                <Image
                    source={{ uri: bannerUrl }}
                    style={styles.banner}
                    defaultSource={require('../../../assets/icon.png')}
                />

                {/* Restaurant Info */}
                <View style={styles.infoContainer}>
                    <View style={styles.headerRow}>
                        <Image
                            source={{ uri: imageUrl }}
                            style={styles.avatar}
                        />
                        <View style={styles.nameSection}>
                            <Text style={styles.name}>{restaurant.name}</Text>
                            <Text style={styles.cuisine}>{restaurant.primary_category}</Text>
                            <View style={styles.ratingRow}>
                                <MaterialIcons name="star" size={14} color="#ffc107" />
                                <Text style={styles.ratingText}>{rating}</Text>
                                <Text style={styles.reviewCount}>
                                    ({restaurant.total_reviews} reviews)
                                </Text>
                            </View>
                        </View>
                    </View>

                    {/* Details */}
                    <View style={styles.detailsRow}>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="location-on" size={16} color="#ff6b35" />
                            <Text style={styles.detailText} numberOfLines={2}>
                                {restaurant.address}
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="schedule" size={16} color="#ff6b35" />
                            <Text style={styles.detailText}>
                                {restaurant.delivery_time_minutes} mins
                            </Text>
                        </View>
                        <View style={styles.detailItem}>
                            <MaterialIcons name="payments" size={16} color="#ff6b35" />
                            <Text style={styles.detailText}>
                                Min: {(restaurant.min_order_amount / 1000).toFixed(0)}k
                            </Text>
                        </View>
                    </View>

                    {/* Status */}
                    <View style={styles.statusRow}>
                        <View
                            style={[
                                styles.statusBadge,
                                restaurant.is_open
                                    ? styles.openBadge
                                    : styles.closedBadge,
                            ]}
                        >
                            <Text
                                style={[
                                    styles.statusText,
                                    restaurant.is_open
                                        ? styles.openText
                                        : styles.closedText,
                                ]}
                            >
                                {restaurant.is_open ? 'Open' : 'Closed'}
                            </Text>
                        </View>
                    </View>
                </View>

                {/* Menu Section */}
                <View style={styles.menuSection}>
                    <Text style={styles.sectionTitle}>Menu</Text>
                    <View style={styles.foodGrid}>
                        {foods.map((food) => (
                            <View
                                key={food.id}
                                style={[
                                    styles.foodItem,
                                    highlightedFoodId === food.id && styles.highlightedFood,
                                ]}
                            >
                                <FoodCard
                                    item={food}
                                    onPress={() => {
                                        // Can add to cart or show detail modal
                                    }}
                                />
                            </View>
                        ))}
                    </View>
                </View>

                <View style={{ height: 100 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
    backBtn: {
        position: 'absolute',
        top: 16,
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.5)',
        justifyContent: 'center',
        alignItems: 'center',
    },
    banner: {
        width: '100%',
        height: 200,
        backgroundColor: '#eee',
    },
    infoContainer: {
        backgroundColor: '#fff',
        padding: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 16,
    },
    avatar: {
        width: 80,
        height: 80,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    nameSection: {
        flex: 1,
    },
    name: {
        fontSize: 18,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    cuisine: {
        fontSize: 13,
        color: '#999',
        marginBottom: 6,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4,
        marginRight: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: '#999',
    },
    detailsRow: {
        marginBottom: 12,
    },
    detailItem: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 8,
    },
    detailText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    statusRow: {
        flexDirection: 'row',
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 12,
    },
    openBadge: {
        backgroundColor: '#e8f5e9',
    },
    closedBadge: {
        backgroundColor: '#ffebee',
    },
    statusText: {
        fontSize: 12,
        fontWeight: '600',
    },
    openText: {
        color: '#4caf50',
    },
    closedText: {
        color: '#f44336',
    },
    menuSection: {
        padding: 16,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 12,
    },
    foodGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -6,
    },
    foodItem: {
        width: '50%',
        marginBottom: 12,
    },
    highlightedFood: {
        opacity: 1,
        backgroundColor: '#fff8f3',
        borderRadius: 8,
        borderWidth: 2,
        borderColor: '#ff6b35',
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    errorContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
    },
    errorText: {
        fontSize: 14,
        color: '#d32f2f',
        textAlign: 'center',
        marginBottom: 16,
    },
    retryBtn: {
        backgroundColor: '#ff6b35',
        paddingHorizontal: 24,
        paddingVertical: 12,
        borderRadius: 20,
    },
    retryBtnText: {
        color: '#fff',
        fontWeight: '600',
        fontSize: 14,
    },
});
