import React, { useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    TouchableOpacity,
    Image,
    FlatList,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContext } from '../../contexts/NavigationContext';
import Header from '../../components/Header';
import MenuDrawer from '../../components/MenuDrawer';
import BottomNavigation from '../../components/BottomNavigation';
import SearchResultsScreen from '../search/SearchResultsScreen';
import { getImageUrl } from '../../shared/imageHelper';
import { useHeaderLogic } from '../../hooks/useHeaderLogic';
import { useFoodsAndRestaurants } from '../../hooks/useFoodsAndRestaurants';
import { useRestaurantFiltering } from '../../hooks/useRestaurantFiltering';
import { useNavigateToRestaurant } from '../../hooks/useNavigateToRestaurant';
import { useNavigateToRestaurantOnly } from '../../hooks/useNavigateToRestaurantOnly';

export default function ExploreScreen({ onNavigate }) {
    const { navigate } = useContext(NavigationContext);

    // Use shared header logic
    const {
        address,
        searchQuery,
        showSearchResults,
        drawerVisible,
        handleLocationPress,
        handleMenuPress,
        handleCloseDrawer,
        handleSearchPress,
        handleSearchSubmit,
        handleNavigateBack,
        handleAvatarPress,
    } = useHeaderLogic();

    // Use shared data fetching hook
    const { foodList, restaurantList, loading, error } = useFoodsAndRestaurants();

    // Use shared filtering hook (no search query, show all restaurants)
    const { restaurantsWithFoods } = useRestaurantFiltering(restaurantList, foodList, '');

    // Use navigation hooks for proper restaurant navigation
    const navigateToRestaurant = useNavigateToRestaurant(onNavigate);
    const navigateToRestaurantOnly = useNavigateToRestaurantOnly(onNavigate);

    const handleViewRestaurant = (restaurantId) => {
        navigateToRestaurantOnly(restaurantId);
    };

    const handleFoodPress = (food, restaurantId) => {
        navigateToRestaurant({ ...food, restaurantId });
    };

    const handleDrawerNavigate = (screen) => {
        handleCloseDrawer();
        navigate(screen);
    };

    // Show search results screen when user submits search
    if (showSearchResults) {
        return (
            <SearchResultsScreen
                searchQuery={searchQuery}
                onBack={handleNavigateBack}
                onNavigate={onNavigate}
            />
        );
    }

    if (loading) {
        return (
            <View style={styles.container}>
                <Header
                    userLocation={address}
                    onLocationPress={handleLocationPress}
                    onSearchPress={handleSearchPress}
                    onSearchSubmit={handleSearchSubmit}
                    onMenuPress={handleMenuPress}
                    onAvatarPress={() => handleAvatarPress(onNavigate)}
                    searchPlaceholder="Tìm nhà hàng hoặc món ăn..."
                />
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff6b35" />
                    <Text style={styles.loadingText}>Đang tải thực đơn...</Text>
                </View>
                <BottomNavigation activeRoute="Explore" onNavigate={onNavigate} />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Header
                userLocation={address}
                onLocationPress={handleLocationPress}
                onSearchPress={handleSearchPress}
                onAvatarPress={() => handleAvatarPress(onNavigate)}
                onSearchSubmit={handleSearchSubmit}
                onMenuPress={handleMenuPress}
                searchPlaceholder="Tìm nhà hàng hoặc món ăn..."
            />

            <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>

                {/* Restaurant Sections */}
                {restaurantsWithFoods.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="search-off" size={48} color="#ccc" />
                        <Text style={styles.emptyText}>Không có nhà hàng nào</Text>
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
            </ScrollView>

            {/* Menu Drawer */}
            <MenuDrawer
                isVisible={drawerVisible}
                onClose={handleCloseDrawer}
                onNavigate={handleDrawerNavigate}
            />

            <BottomNavigation activeRoute="Explore" onNavigate={onNavigate} />
        </View>
    );
}

// Restaurant Section Component
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
                        restaurantId={restaurant.id}
                        onPress={() => onFoodPress(item, restaurant.id)}
                    />
                )}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.foodList}
            />
        </View>
    );
};

// Food Card Component
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
        backgroundColor: '#f8f9fa',
    },
    content: {
        flex: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 12,
        fontSize: 14,
        color: '#666',
    },

    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 60,
    },
    emptyText: {
        marginTop: 12,
        fontSize: 14,
        color: '#999',
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
