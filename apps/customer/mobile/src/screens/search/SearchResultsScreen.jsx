// screens/search/SearchResultsScreen.jsx
import React, { useContext } from 'react';
import {
    View,
    StyleSheet,
    SafeAreaView,
    Text,
    ScrollView,
    TouchableOpacity,
    FlatList,
    ActivityIndicator,
    Image,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { getImageUrl } from '../../shared/imageHelper';
import { useFoodsAndRestaurants } from '../../hooks/useFoodsAndRestaurants';
import { useRestaurantFiltering } from '../../hooks/useRestaurantFiltering';
import { useNavigateToRestaurant } from '../../hooks/useNavigateToRestaurant';
import { useNavigateToRestaurantOnly } from '../../hooks/useNavigateToRestaurantOnly';

export default function SearchResultsScreen({ searchQuery, onBack, onNavigate }) {
    const { navigate } = useContext(NavigationContext);

    // Use shared data fetching hook
    const { foodList, restaurantList, loading, error } = useFoodsAndRestaurants();

    // Use shared filtering hook with search query
    const { restaurantsWithFoods, totalResults } = useRestaurantFiltering(
        restaurantList,
        foodList,
        searchQuery
    );

    // Use navigation hooks for proper restaurant navigation
    const navigateToRestaurant = useNavigateToRestaurant(onNavigate);
    const navigateToRestaurantOnly = useNavigateToRestaurantOnly(onNavigate);

    const handleViewRestaurant = (restaurantId) => {
        navigateToRestaurantOnly(restaurantId);
    };

    const handleFoodPress = (food, restaurantId) => {
        navigateToRestaurant({ ...food, restaurantId });
    };

    return (
        <SafeAreaView style={styles.container}>
            {/* Header */}
            <View style={styles.header}>
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#333" />
                </TouchableOpacity>
                <View style={styles.headerContent}>
                    <Text style={styles.headerTitle}>Kết quả tìm kiếm</Text>
                    <Text style={styles.searchQuery} numberOfLines={1}>
                        "{searchQuery}"
                    </Text>
                </View>
            </View>

            {/* Results Count */}
            {!loading && (
                <View style={styles.resultsInfo}>
                    <Text style={styles.resultsCount}>
                        Tìm thấy {totalResults} món ăn từ {restaurantsWithFoods.length} nhà hàng
                    </Text>
                </View>
            )}

            {/* Content */}
            <ScrollView
                style={styles.content}
                showsVerticalScrollIndicator={false}
            >
                {loading ? (
                    <View style={styles.centerContainer}>
                        <ActivityIndicator size="large" color="#FF6B35" />
                        <Text style={styles.loadingText}>Đang tìm kiếm...</Text>
                    </View>
                ) : error ? (
                    <View style={styles.centerContainer}>
                        <MaterialIcons name="error-outline" size={48} color="#f44336" />
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : restaurantsWithFoods.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search-off" size={48} color="#ddd" />
                        <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
                        <Text style={styles.emptyText}>
                            Hãy thử tìm kiếm với từ khóa khác
                        </Text>
                    </View>
                ) : (
                    restaurantsWithFoods.map((restaurant) => (
                        <RestaurantSection
                            key={restaurant.id}
                            restaurant={restaurant}
                            onViewRestaurant={handleViewRestaurant}
                            onFoodPress={handleFoodPress}
                        />
                    ))
                )}

                <View style={{ height: 20 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

// Restaurant Section Component (same as ExploreScreen)
const RestaurantSection = ({ restaurant, onViewRestaurant, onFoodPress }) => {
    return (
        <View style={styles.restaurantSection}>
            {/* Restaurant Header */}
            <View style={styles.restaurantHeader}>
                <View style={styles.restaurantInfo}>
                    <Image
                        source={{ uri: getImageUrl(restaurant.image) }}
                        style={styles.restaurantAvatar}
                    />
                    <View style={styles.restaurantDetails}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        <View style={styles.restaurantMeta}>
                            <View style={styles.ratingBadge}>
                                <MaterialIcons name="star" size={14} color="#ffc107" />
                                <Text style={styles.ratingText}>
                                    {(restaurant.rating || 0).toFixed(1)}
                                </Text>
                            </View>
                            <Text style={styles.foodCount}>{restaurant.foods.length} món</Text>
                        </View>
                    </View>
                </View>
                <TouchableOpacity
                    style={styles.viewRestaurantBtn}
                    onPress={() => onViewRestaurant(restaurant.id)}
                >
                    <Text style={styles.viewRestaurantText}>Xem chi tiết</Text>
                    <MaterialIcons name="chevron-right" size={20} color="#ff6b35" />
                </TouchableOpacity>
            </View>

            {/* Food Items Horizontal Scroll */}
            <FlatList
                horizontal
                data={restaurant.foods}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <FoodCard
                        food={item}
                        onPress={() => onFoodPress(item, restaurant.id)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.foodList}
            />
        </View>
    );
};

// Food Card Component (same as ExploreScreen)
const FoodCard = ({ food, onPress }) => {
    return (
        <TouchableOpacity style={styles.foodCard} onPress={onPress}>
            <Image
                source={{ uri: getImageUrl(food.image) }}
                style={styles.foodImage}
            />
            <View style={styles.foodContent}>
                <Text style={styles.foodName} numberOfLines={2}>
                    {food.name}
                </Text>
                {food.description && (
                    <Text style={styles.foodDescription} numberOfLines={2}>
                        {food.description}
                    </Text>
                )}
                <View style={styles.foodFooter}>
                    <Text style={styles.foodPrice}>
                        {food.price?.toLocaleString('vi-VN')}₫
                    </Text>
                    {food.rating > 0 && (
                        <View style={styles.foodRating}>
                            <MaterialIcons name="star" size={12} color="#ffc107" />
                            <Text style={styles.foodRatingText}>{food.rating.toFixed(1)}</Text>
                        </View>
                    )}
                </View>
            </View>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        paddingTop: 40,
        backgroundColor: '#f8f9fa',
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
    restaurantSection: {
        marginBottom: 24,
        backgroundColor: '#fff',
        paddingVertical: 16,
    },
    restaurantHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 16,
        marginBottom: 12,
    },
    restaurantInfo: {
        flexDirection: 'row',
        alignItems: 'center',
        flex: 1,
    },
    restaurantAvatar: {
        width: 48,
        height: 48,
        borderRadius: 8,
        marginRight: 12,
    },
    restaurantDetails: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    restaurantMeta: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    ratingBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    ratingText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
    },
    foodCount: {
        fontSize: 13,
        color: '#999',
    },
    viewRestaurantBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingLeft: 8,
    },
    viewRestaurantText: {
        fontSize: 13,
        color: '#ff6b35',
        fontWeight: '600',
    },
    foodList: {
        paddingHorizontal: 12,
    },
    foodCard: {
        width: 160,
        marginHorizontal: 4,
        backgroundColor: '#fff',
        borderRadius: 8,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    foodImage: {
        width: '100%',
        height: 120,
        backgroundColor: '#f0f0f0',
    },
    foodContent: {
        padding: 10,
    },
    foodName: {
        fontSize: 14,
        fontWeight: '600',
        color: '#333',
        marginBottom: 4,
    },
    foodDescription: {
        fontSize: 12,
        color: '#999',
        marginBottom: 8,
    },
    foodFooter: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    foodPrice: {
        fontSize: 14,
        fontWeight: '700',
        color: '#ff6b35',
    },
    foodRating: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
    },
    foodRatingText: {
        fontSize: 12,
        color: '#333',
        fontWeight: '600',
    },
});
