import React, { useState, useEffect, useRef, useContext } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SectionList,
    ScrollView,
    Image,
    TouchableOpacity,
    ActivityIndicator,
    SafeAreaView,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContext } from '../../contexts/NavigationContext';
import RestaurantSearchBar from './components/RestaurantSearchBar';
import CategoryFilter from './components/CategoryFilter';
import RestaurantFoodCard from './components/RestaurantFoodCard';
import RestaurantReviewsSection from './components/RestaurantReviewsSection';
import { restaurantDetailService } from '../../services/restaurantDetailService';
import { categoryService } from '../../services/categoryService';
import { formatRating } from '../../shared/formatters';
import { isRestaurantOpen, getTodayHours } from '../../utils/hoursHelper';
import { getRestaurantImageUrl, getRestaurantBannerUrl } from '../../shared/imageHelper';

/**
 * RestaurantDetail - Shopee-style restaurant page
 * - Sticky header (search + category filter) using SectionList
 * - Foods grouped by category
 * - Category highlight on scroll
 * - Click category button → scroll to section (bookmark style)
 */
export default function RestaurantDetail({ onNavigate, onSelectFood }) {
    const { targetRestaurantId, highlightedFoodId, resetNavigationState } =
        useContext(NavigationContext);

    const [restaurant, setRestaurant] = useState(null);
    const [allFoods, setAllFoods] = useState([]);
    const [filteredFoods, setFilteredFoods] = useState([]);
    const [categories, setCategories] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentCategoryId, setCurrentCategoryId] = useState(null);
    const [showStickyHeader, setShowStickyHeader] = useState(false);
    const [activeTab, setActiveTab] = useState('menu'); // 'menu' or 'reviews'
    const sectionListRef = useRef(null);
    const sectionIndexMap = useRef({});

    // Fetch data on mount
    useEffect(() => {
        if (targetRestaurantId) {
            fetchRestaurantData();
        }
    }, [targetRestaurantId]);

    // Filter foods based on search query only (not category)
    useEffect(() => {
        let result = [...allFoods];

        // Filter by search query
        if (searchQuery.trim()) {
            result = result.filter((food) =>
                food.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                (food.description &&
                    food.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        setFilteredFoods(result);
    }, [searchQuery, allFoods]);

    // Auto-scroll to highlighted food when it's set
    useEffect(() => {
        if (highlightedFoodId && sectionListRef.current && allFoods.length > 0) {
            const foodIndex = allFoods.findIndex((f) => f.id === highlightedFoodId);
            if (foodIndex >= 0) {
                // Find which category this food belongs to
                const food = allFoods[foodIndex];
                const categoryIndex = categories.findIndex((c) => c.id === food.categoryId);
                if (categoryIndex >= 0) {
                    // Scroll to the food's category section
                    setTimeout(() => {
                        sectionListRef.current?.scrollToLocation({
                            sectionIndex: categoryIndex,
                            itemIndex: allFoods.filter((f) => f.categoryId === food.categoryId).indexOf(food),
                            animated: true,
                        });
                    }, 300);
                }
            }
        }
    }, [highlightedFoodId, allFoods, categories]);

    const fetchRestaurantData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch restaurant & foods
            const { restaurant: restaurantData, foods: foodsData } =
                await restaurantDetailService.getRestaurantWithFoods(targetRestaurantId);

            setRestaurant(restaurantData);
            setAllFoods(foodsData);

            // Fetch categories for this restaurant
            const categoriesData = await categoryService.getByRestaurant(targetRestaurantId);
            setCategories(categoriesData);

            console.log('[RestaurantDetail] Data loaded:', {
                restaurant: restaurantData?.name,
                foods: foodsData?.length,
                categories: categoriesData?.length,
            });
        } catch (err) {
            console.error('[RestaurantDetail] Fetch error:', err);
            setError(err.message || 'Failed to load restaurant');
        } finally {
            setLoading(false);
        }
    };

    const handleFoodPress = (food) => {
        onSelectFood(food);
        if (onNavigate) {
            onNavigate('food-detail');
        }
    };

    // Scroll to category section by index
    const handleScrollToCategory = (categoryId) => {
        console.log('[RestaurantDetail] Scrolling to category:', categoryId);
        const sectionIndex = sectionIndexMap.current[categoryId];
        if (sectionIndex !== undefined && sectionListRef.current) {
            sectionListRef.current.scrollToLocation({
                sectionIndex,
                itemIndex: 0,
                animated: true,
            });
        }
    };

    // Track which section is visible + detect sticky trigger
    const handleViewableItemsChanged = useRef(({ viewableItems }) => {
        if (viewableItems.length > 0) {
            const firstViewable = viewableItems[0];
            if (firstViewable.section?.categoryId) {
                setCurrentCategoryId(firstViewable.section.categoryId);
            }
        }
    });

    // Detect when user scrolls to top to show sticky header
    const handleScroll = (event) => {
        const scrollY = event.nativeEvent.contentOffset.y;
        // Sticky header appears when scrolled past restaurant info section
        // Threshold is around the height of banner + restaurant info section
        const STICKY_THRESHOLD = 280; // Approx height of banner + restaurant info
        setShowStickyHeader(scrollY > STICKY_THRESHOLD);
    };

    const handleBack = () => {
        resetNavigationState();
        if (onNavigate) {
            onNavigate('home');
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.loadingContainer}>
                    <ActivityIndicator size="large" color="#ff6b35" />
                </View>
            </SafeAreaView>
        );
    }

    if (error || !restaurant) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>
                        {error || 'Restaurant not found'}
                    </Text>
                    <TouchableOpacity
                        style={styles.retryBtn}
                        onPress={fetchRestaurantData}
                    >
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    const imageUrl = getRestaurantImageUrl(restaurant);
    const bannerUrl = getRestaurantBannerUrl(restaurant);
    const rating = formatRating(restaurant.rating);
    const isOpen = isRestaurantOpen(restaurant.openingHours);
    const todayHours = getTodayHours(restaurant.openingHours);

    // Group foods by category for SectionList (keep all categories even if empty)
    const groupedFoods = categories
        .map((category, index) => {
            sectionIndexMap.current[category.id] = index;
            const categoryFoods = filteredFoods.filter((food) => food.categoryId === category.id);
            return {
                title: category.name,
                categoryId: category.id,
                // If no foods, include a placeholder; otherwise use actual foods
                data: categoryFoods.length > 0 ? categoryFoods : [null],
            };
        });

    // Header component - EVERYTHING (Restaurant Info + Tabs + Search)
    const renderListHeader = () => (
        <>
            {/* Header with Back Button */}
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            {/* Banner & Restaurant Info */}
            <Image source={{ uri: bannerUrl }} style={styles.banner} />

            <View style={styles.restaurantInfo}>
                <View style={styles.infoHeader}>
                    <Image source={{ uri: imageUrl }} style={styles.restaurantImage} />
                    <View style={styles.infoContent}>
                        <Text style={styles.restaurantName}>{restaurant.name}</Text>
                        <View style={styles.ratingRow}>
                            <MaterialIcons name="star" size={14} color="#ffc107" />
                            <Text style={styles.ratingText}>{rating}</Text>
                            <Text style={styles.reviewCount}>
                                ({restaurant.totalReviews})
                            </Text>
                        </View>
                        <Text style={styles.category}>{restaurant.primaryCategory}</Text>
                    </View>
                </View>

                {/* Quick Info */}
                <View style={styles.quickInfo}>
                    <View style={styles.quickInfoItem}>
                        <MaterialIcons name="schedule" size={16} color="#ff6b35" />
                        <Text style={styles.quickInfoText}>
                            {restaurant.deliveryTimeMinutes} mins
                        </Text>
                    </View>
                    <View style={styles.quickInfoItem}>
                        <MaterialIcons name="location-on" size={16} color="#ff6b35" />
                        <Text style={styles.quickInfoText} numberOfLines={1}>
                            {restaurant.address}
                        </Text>
                    </View>
                </View>

                {/* Opening Hours & Status */}
                <View style={styles.statusSection}>
                    <View style={[styles.statusBadge, isOpen ? styles.statusOpen : styles.statusClosed]}>
                        <MaterialIcons
                            name={isOpen ? "check-circle" : "cancel"}
                            size={16}
                            color="#fff"
                        />
                        <Text style={styles.statusText}>
                            {isOpen ? 'Open Now' : 'Closed'}
                        </Text>
                    </View>
                    {todayHours && (
                        <Text style={styles.hoursText}>
                            {todayHours.open} - {todayHours.close}
                        </Text>
                    )}
                </View>

                {/* Description */}
                {restaurant.description && (
                    <Text style={styles.description}>{restaurant.description}</Text>
                )}

                {/* Closed Notice Banner */}
                {!isOpen && (
                    <View style={styles.closedBanner}>
                        <MaterialIcons name="info" size={20} color="#ff9800" />
                        <View style={styles.closedBannerText}>
                            <Text style={styles.closedBannerTitle}>Currently Closed</Text>
                            {todayHours && (
                                <Text style={styles.closedBannerSubtitle}>
                                    Opens at {todayHours.open}
                                </Text>
                            )}
                        </View>
                    </View>
                )}

                {/* Blocked Restaurant Banner */}
                {restaurant.status === 'blocked' && (
                    <View style={styles.blockedBanner}>
                        <MaterialIcons name="lock" size={20} color="#d32f2f" />
                        <Text style={styles.blockedText}>Restaurant is closed</Text>
                    </View>
                )}
            </View>

            {/* Tab Buttons */}
            <View style={styles.tabContainer}>
                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'menu' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('menu')}
                >
                    <MaterialIcons
                        name="restaurant-menu"
                        size={18}
                        color={activeTab === 'menu' ? '#ff6b35' : '#999'}
                    />
                    <Text style={[styles.tabText, activeTab === 'menu' && styles.tabTextActive]}>
                        Menu
                    </Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.tabButton, activeTab === 'reviews' && styles.tabButtonActive]}
                    onPress={() => setActiveTab('reviews')}
                >
                    <MaterialIcons
                        name="rate-review"
                        size={18}
                        color={activeTab === 'reviews' ? '#ff6b35' : '#999'}
                    />
                    <Text style={[styles.tabText, activeTab === 'reviews' && styles.tabTextActive]}>
                        Reviews
                    </Text>
                </TouchableOpacity>
            </View>

            {/* Search Bar - Only for Menu tab */}
            {activeTab === 'menu' && (
                <RestaurantSearchBar
                    restaurantName={restaurant.name}
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                />
            )}

            {/* Category Filter - Only for Menu tab */}
            {activeTab === 'menu' && categories.length > 0 && (
                <CategoryFilter
                    categories={categories}
                    currentCategoryId={currentCategoryId}
                    onSelectCategory={handleScrollToCategory}
                />
            )}
        </>
    );

    // Render category section header (with sticky support)
    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.categoryTitle}>{section.title}</Text>
        </View>
    );

    // Render food item (or empty message for sections with no food)
    const renderFoodItem = ({ item, section }) => {
        // If section is empty, show "No food" message
        if (!item) {
            return (
                <View style={styles.noFoodContainer}>
                    <MaterialIcons name="fastfood" size={32} color="#ccc" />
                    <Text style={styles.noFoodText}>No products in this category</Text>
                </View>
            );
        }
        return (
            <RestaurantFoodCard
                item={item}
                onPress={handleFoodPress}
                isHighlighted={item.id === highlightedFoodId}
            />
        );
    };

    return (
        <SafeAreaView style={styles.container}>
            {activeTab === 'menu' ? (
                <>
                    <SectionList
                        ref={sectionListRef}
                        sections={groupedFoods}
                        keyExtractor={(item, index) => (item?.id?.toString() || `empty-${index}`)}
                        renderItem={renderFoodItem}
                        renderSectionHeader={renderSectionHeader}
                        ListHeaderComponent={renderListHeader}
                        contentContainerStyle={styles.sectionListContent}
                        scrollEventThrottle={16}
                        onScroll={handleScroll}
                        onViewableItemsChanged={handleViewableItemsChanged.current}
                        viewabilityConfig={{
                            itemVisiblePercentThreshold: 50,
                        }}
                        stickySectionHeadersEnabled={true}
                        ListEmptyComponent={
                            filteredFoods.length === 0 ? (
                                <View style={styles.emptyContainer}>
                                    <MaterialIcons name="search-off" size={48} color="#ccc" />
                                    <Text style={styles.emptyText}>No products found</Text>
                                </View>
                            ) : null
                        }
                    />

                    {/* Floating Sticky Header for Search + Category - Only visible after scrolling past restaurant info */}
                    {showStickyHeader && (
                        <View style={styles.floatingHeader} pointerEvents="box-none">
                            {/* Search Bar */}
                            <RestaurantSearchBar
                                restaurantName={restaurant.name}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />

                            {/* Category Filter */}
                            {categories.length > 0 && (
                                <CategoryFilter
                                    categories={categories}
                                    currentCategoryId={currentCategoryId}
                                    onSelectCategory={handleScrollToCategory}
                                />
                            )}
                        </View>
                    )}
                </>
            ) : (
                <ScrollView style={styles.reviewsTabContainer}>
                    {/* Reviews Section */}
                    <RestaurantReviewsSection restaurantId={restaurant.id} />
                </ScrollView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    sectionListContent: {
        paddingBottom: 20,
    },
    headerRow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingTop: 28, // 8 + 20px for camera notch offset
        backgroundColor: 'transparent',
    },
    backBtn: {
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
    restaurantInfo: {
        backgroundColor: '#fff',
        paddingHorizontal: 12,
        paddingVertical: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    infoHeader: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        marginBottom: 12,
    },
    restaurantImage: {
        width: 60,
        height: 60,
        borderRadius: 8,
        marginRight: 12,
        backgroundColor: '#eee',
    },
    infoContent: {
        flex: 1,
    },
    restaurantName: {
        fontSize: 16,
        fontWeight: '700',
        color: '#333',
        marginBottom: 4,
    },
    ratingRow: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 4,
    },
    ratingText: {
        fontSize: 12,
        fontWeight: '600',
        color: '#333',
        marginLeft: 4,
    },
    reviewCount: {
        fontSize: 12,
        color: '#999',
        marginLeft: 4,
    },
    category: {
        fontSize: 12,
        color: '#999',
    },
    quickInfo: {
        gap: 8,
    },
    quickInfoItem: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quickInfoText: {
        fontSize: 12,
        color: '#666',
        marginLeft: 8,
        flex: 1,
    },
    statusSection: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
        marginHorizontal: 12,
        marginTop: 12,
    },
    statusBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 20,
        gap: 6,
    },
    statusOpen: {
        backgroundColor: '#4CAF50',
    },
    statusClosed: {
        backgroundColor: '#f44336',
    },
    statusText: {
        fontSize: 12,
        color: '#fff',
        fontWeight: '600',
    },
    hoursText: {
        fontSize: 12,
        color: '#666',
        fontWeight: '500',
    },
    description: {
        fontSize: 13,
        color: '#666',
        lineHeight: 18,
        marginHorizontal: 12,
        marginTop: 12,
    },
    closedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff3e0',
        borderWidth: 1,
        borderColor: '#ffb74d',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 12,
        marginTop: 12,
        gap: 10,
    },
    closedBannerText: {
        flex: 1,
    },
    closedBannerTitle: {
        fontSize: 13,
        fontWeight: '600',
        color: '#e65100',
    },
    closedBannerSubtitle: {
        fontSize: 12,
        color: '#ef6c00',
        marginTop: 2,
    },
    // Floating sticky header (above SectionList)
    floatingHeader: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 5,
        backgroundColor: '#fff',
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
        elevation: 3,
    },
    stickyHeaderContainer: {
        backgroundColor: '#fff',
    },
    sectionHeader: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#f9f9f9',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    categoryTitle: {
        fontSize: 14,
        fontWeight: '700',
        color: '#333',
    },
    emptyContainer: {
        alignItems: 'center',
        paddingVertical: 40,
    },
    emptyText: {
        fontSize: 14,
        color: '#999',
        marginTop: 12,
    },
    noFoodContainer: {
        alignItems: 'center',
        paddingVertical: 32,
        paddingHorizontal: 20,
    },
    noFoodText: {
        fontSize: 13,
        color: '#999',
        marginTop: 8,
        fontStyle: 'italic',
    },
    blockedBanner: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#ffebee',
        borderWidth: 1,
        borderColor: '#ef5350',
        borderRadius: 6,
        paddingHorizontal: 12,
        paddingVertical: 10,
        marginHorizontal: 12,
        marginTop: 12,
        gap: 8,
    },
    blockedText: {
        fontSize: 13,
        color: '#d32f2f',
        fontWeight: '600',
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
        paddingHorizontal: 20,
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
    // Tab styles
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        justifyContent: 'space-around',
    },
    tabButton: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 14,
        gap: 6,
        borderBottomWidth: 2,
        borderBottomColor: 'transparent',
    },
    tabButtonActive: {
        borderBottomColor: '#ff6b35',
    },
    tabText: {
        fontSize: 13,
        fontWeight: '600',
        color: '#999',
    },
    tabTextActive: {
        color: '#ff6b35',
    },
    reviewsTabContainer: {
        flex: 1,
        backgroundColor: '#f8f8f8',
    },
});
