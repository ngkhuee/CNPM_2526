// screens/restaurant/RestaurantDetail.jsx - REFACTORED VERSION
import React, { useState, useContext, useEffect } from 'react';
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
    Animated,
} from 'react-native';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContext } from '../../contexts/NavigationContext';
import { CartContext } from '../../contexts/CartContext';
import RestaurantSearchBar from './components/RestaurantSearchBar';
import CategoryFilter from './components/CategoryFilter';
import RestaurantFoodCard from './components/RestaurantFoodCard';
import { MiniCartBubble } from '../../components/MiniCartBubble';
import { CartModal } from '../../components/CartModal';
import { RestaurantHeader } from '../../components/restaurant/RestaurantHeader';
import { RestaurantHeaderCompact } from '../../components/restaurant/RestaurantHeaderCompact';
import { RestaurantTabs } from '../../components/restaurant/RestaurantTabs';
import { ReviewsList } from '../../components/restaurant/ReviewsList';
import { useRestaurantDetail } from '../../hooks/useRestaurantDetail';
import { useRestaurantCart } from '../../hooks/useRestaurantCart';
import { useRestaurantScroll } from '../../hooks/useRestaurantScroll';
import { useFoodSearch } from '../../hooks/useFoodSearch';
import { useLocalCart } from '../../hooks/useLocalCart';

export default function RestaurantDetail({ onNavigate, onSelectFood }) {
    const navigationContext = useContext(NavigationContext);
    const cartContext = useContext(CartContext);

    const {
        targetRestaurantId,
        highlightedFoodId,
        resetNavigationState,
        pendingLocalCart,
        setNavigationState,
    } = navigationContext;

    // Custom hooks
    const { restaurant, allFoods, categories, reviews, avgRating, loading, error, refetch } =
        useRestaurantDetail(targetRestaurantId);

    const { localCart: initialLocalCart, setLocalCart } = useLocalCart(targetRestaurantId);

    const { localCart, setLocalCart: setLocalCartState, handleAddToCart, getTotalItems, bubbleAnimation } =
        useRestaurantCart(
            restaurant,
            initialLocalCart,
            pendingLocalCart,
            () => setNavigationState({ pendingLocalCart: null }),
            cartContext  // Pass CartContext để sync
        );

    const { searchQuery, setSearchQuery, filteredFoods } = useFoodSearch(allFoods);

    const {
        currentCategoryId,
        showStickyHeader,
        sectionListRef,
        handleScrollToCategory,
        handleViewableItemsChanged,
        handleScroll,
    } = useRestaurantScroll(categories, allFoods, highlightedFoodId);

    // UI state
    const [activeTab, setActiveTab] = useState('menu');
    const [showCartModal, setShowCartModal] = useState(false);

    // Restore cart when coming back from FoodDetailScreen
    useEffect(() => {
        if (pendingLocalCart && Object.keys(pendingLocalCart).length > 0) {
            setLocalCartState(pendingLocalCart);
            console.log('[RestaurantDetail] Restored cart from FoodDetailScreen:', pendingLocalCart.items.length, 'items');
        }
    }, [pendingLocalCart, setLocalCartState]);

    /**
     * CRITICAL: Sync local cart to global cart when screen mounts or restaurant changes
     * This ensures backend knows which restaurant is currently active
     * So when adding items, backend doesn't auto-clear the current restaurant's cart
     * Use merge=false because local cart from AsyncStorage is the latest state
     */
    useEffect(() => {
        const syncCartToGlobal = async () => {
            if (localCart && localCart.items && localCart.items.length > 0) {
                const restaurantId = localCart.restaurant_id || targetRestaurantId;
                if (restaurantId) {
                    try {
                        if (cartContext?.syncLocalCartToGlobal) {
                            await cartContext.syncLocalCartToGlobal(localCart, false);
                            console.log('[RestaurantDetail] Synced local cart to global on mount:', restaurantId);
                        }
                        if (cartContext?.setLastActive) {
                            await cartContext.setLastActive(restaurantId);
                        }
                    } catch (error) {
                        console.error('[RestaurantDetail] Error syncing cart on mount:', error.message);
                    }
                }
            }
        };

        syncCartToGlobal();
    }, [targetRestaurantId]); // Run when restaurant changes

    /**
     * Save cart to AsyncStorage when component unmounts
     * Use empty dependency array to avoid loop - only run once on unmount
     */
    useEffect(() => {
        return () => {
            // Save current cart when leaving this screen
            if (localCart && localCart.items && localCart.items.length > 0) {
                const restaurantId = localCart.restaurant_id || targetRestaurantId;
                if (restaurantId) {
                    cartContext?.saveLocalCart(restaurantId, localCart);
                    console.log('[RestaurantDetail] Saved cart on unmount:', restaurantId);
                }
            }
        };
    }, []); // Empty dependency - only run cleanup on unmount

    /**
     * Handle cart changes from CartModal (update quantity, remove item)
     * Updates local cart + AsyncStorage + Global cart
     */
    const handleCartChange = async (updatedCart) => {
        setLocalCartState(updatedCart);

        // Sync to AsyncStorage + Global cart
        const restaurantId = updatedCart.restaurant_id || restaurant?.id;
        if (restaurantId && updatedCart.items && updatedCart.items.length > 0) {
            if (cartContext?.saveLocalCart) {
                await cartContext.saveLocalCart(restaurantId, updatedCart);
            }
            if (cartContext?.syncLocalCartToGlobal) {
                await cartContext.syncLocalCartToGlobal(updatedCart, false);
            }
            // CRITICAL: Set this as last active restaurant so checkout can fetch it
            if (cartContext?.setLastActive) {
                await cartContext.setLastActive(restaurantId);
            }
        }
    };

    // Navigation handlers
    const handleBack = () => {
        resetNavigationState();
        if (onNavigate) {
            onNavigate('home');
        }
    };

    const handleFoodPress = (food) => {
        onSelectFood(food);
        // Pass current cart to FoodDetailScreen so it can add items to the same cart
        setNavigationState({
            selectedRestaurant: restaurant,
            pendingLocalCart: localCart
        });
        if (onNavigate) {
            onNavigate('food-detail');
        }
    };

    const handleNavigateToCheckout = async () => {
        // CRITICAL: Sync local cart to global cart BEFORE navigating to checkout
        // This ensures CheckoutScreen gets the correct restaurant's cart
        try {
            const restaurantId = localCart?.restaurant_id || restaurant?.id;
            if (localCart && localCart.items && localCart.items.length > 0) {
                // Save to AsyncStorage
                if (cartContext?.saveLocalCart) {
                    await cartContext.saveLocalCart(restaurantId, localCart);
                    console.log('[RestaurantDetail] Saved local cart to AsyncStorage before checkout:', restaurantId);
                }

                // Sync to global cart - MUST complete before navigation
                if (cartContext?.syncLocalCartToGlobal) {
                    await cartContext.syncLocalCartToGlobal(localCart, false);
                    console.log('[RestaurantDetail] Synced local cart to global cart before checkout');
                }

                // Set as last active restaurant - MUST complete before navigation
                if (cartContext?.setLastActive) {
                    await cartContext.setLastActive(restaurantId);
                    console.log('[RestaurantDetail] Set last active restaurant before checkout:', restaurantId);
                }
            } else {
                console.warn('[RestaurantDetail] Local cart empty or no items when navigating to checkout');
            }
        } catch (error) {
            console.error('[RestaurantDetail] Error syncing cart before checkout:', error.message);
            // Continue navigation even if sync fails - CheckoutScreen can handle it
        } finally {
            // Navigate after all async operations complete
            if (onNavigate) {
                onNavigate('checkout');
            }
        }
    };

    // Loading state
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

    // Error state
    if (error || !restaurant) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.headerRow}>
                    <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                        <MaterialIcons name="arrow-back" size={24} color="#fff" />
                    </TouchableOpacity>
                </View>
                <View style={styles.errorContainer}>
                    <Text style={styles.errorText}>{error || 'Restaurant not found'}</Text>
                    <TouchableOpacity style={styles.retryBtn} onPress={refetch}>
                        <Text style={styles.retryBtnText}>Retry</Text>
                    </TouchableOpacity>
                </View>
            </SafeAreaView>
        );
    }

    // Group foods by category for SectionList
    const groupedFoods = categories.map((category, index) => {
        const categoryFoods = filteredFoods.filter((food) => food.categoryId === category.id);
        return {
            title: category.name,
            categoryId: category.id,
            data: categoryFoods.length > 0 ? categoryFoods : [null],
        };
    });

    // Render list header
    const renderListHeader = () => (
        <>
            <View style={styles.headerRow}>
                <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                    <MaterialIcons name="arrow-back" size={24} color="#fff" />
                </TouchableOpacity>
            </View>

            <RestaurantHeader restaurant={restaurant} />
            <RestaurantTabs activeTab={activeTab} onTabChange={setActiveTab} />

            {activeTab === 'menu' && (
                <>
                    <RestaurantSearchBar
                        restaurantName={restaurant.name}
                        searchQuery={searchQuery}
                        onSearchChange={setSearchQuery}
                    />
                    {categories.length > 0 && (
                        <CategoryFilter
                            categories={categories}
                            currentCategoryId={currentCategoryId}
                            onSelectCategory={handleScrollToCategory}
                        />
                    )}
                </>
            )}
        </>
    );

    // Render section header
    const renderSectionHeader = ({ section }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.categoryTitle}>{section.title}</Text>
        </View>
    );

    // Render food item
    const renderFoodItem = ({ item }) => {
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
                onAddToCart={handleAddToCart}
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
                        keyExtractor={(item, index) => {
                            // For items with id, use the id
                            if (item?.id) {
                                return item.id.toString();
                            }
                            // For placeholder items (null), create unique key
                            // This prevents duplicate key warnings when multiple sections have no foods
                            return `placeholder-${Math.random().toString(36).substr(2, 9)}`;
                        }}
                        renderItem={renderFoodItem}
                        renderSectionHeader={renderSectionHeader}
                        ListHeaderComponent={renderListHeader}
                        contentContainerStyle={styles.sectionListContent}
                        scrollEventThrottle={16}
                        onScroll={handleScroll}
                        onViewableItemsChanged={handleViewableItemsChanged.current}
                        viewabilityConfig={{ itemVisiblePercentThreshold: 50 }}
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

                    {/* Floating sticky header */}
                    {showStickyHeader && (
                        <View style={styles.floatingHeader} pointerEvents="box-none">
                            <RestaurantSearchBar
                                restaurantName={restaurant.name}
                                searchQuery={searchQuery}
                                onSearchChange={setSearchQuery}
                            />
                            {categories.length > 0 && (
                                <CategoryFilter
                                    categories={categories}
                                    currentCategoryId={currentCategoryId}
                                    onSelectCategory={handleScrollToCategory}
                                />
                            )}
                        </View>
                    )}

                    <CartModal
                        visible={showCartModal}
                        localCart={localCart}
                        setLocalCart={handleCartChange}
                        onClose={() => setShowCartModal(false)}
                        onCheckout={() => {
                            setShowCartModal(false);
                            handleNavigateToCheckout();
                        }}
                    />

                    <MiniCartBubble
                        totalItems={getTotalItems()}
                        onPress={() => setShowCartModal(true)}
                        animatedScale={bubbleAnimation?.scale || new Animated.Value(1)}
                    />
                </>
            ) : (
                <SafeAreaView style={styles.container}>
                    <ScrollView style={styles.reviewsTabContainer} showsVerticalScrollIndicator={false}>
                        <View style={styles.headerRow}>
                            <TouchableOpacity style={styles.backBtn} onPress={handleBack}>
                                <MaterialIcons name="arrow-back" size={24} color="#fff" />
                            </TouchableOpacity>
                        </View>

                        <RestaurantHeaderCompact restaurant={restaurant} />
                        <RestaurantTabs activeTab={activeTab} onTabChange={setActiveTab} />

                        <View style={styles.reviewsContent}>
                            <ReviewsList reviews={reviews} avgRating={avgRating} />
                        </View>

                        <View style={{ height: 30 }} />
                    </ScrollView>
                </SafeAreaView>
            )}
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: '#f5f5f5' },
    sectionListContent: { paddingBottom: 20 },
    headerRow: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 10,
        paddingHorizontal: 12,
        paddingVertical: 8,
        paddingTop: 28,
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
    banner: { width: '100%', height: 200, backgroundColor: '#eee' },
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
    sectionHeader: {
        paddingHorizontal: 12,
        paddingVertical: 10,
        backgroundColor: '#f9f9f9',
        borderTopWidth: 1,
        borderTopColor: '#eee',
    },
    categoryTitle: { fontSize: 14, fontWeight: '700', color: '#333' },
    emptyContainer: { alignItems: 'center', paddingVertical: 40 },
    emptyText: { fontSize: 14, color: '#999', marginTop: 12 },
    noFoodContainer: { alignItems: 'center', paddingVertical: 32, paddingHorizontal: 20 },
    noFoodText: { fontSize: 13, color: '#999', marginTop: 8, fontStyle: 'italic' },
    loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
    errorContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 20 },
    errorText: { fontSize: 14, color: '#d32f2f', textAlign: 'center', marginBottom: 16 },
    retryBtn: { backgroundColor: '#ff6b35', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 20 },
    retryBtnText: { color: '#fff', fontWeight: '600', fontSize: 14 },
    reviewsTabContainer: { flex: 1, backgroundColor: '#f8f8f8' },
    reviewsContent: {
        backgroundColor: '#fff',
        paddingHorizontal: 16,
        paddingVertical: 16,
        marginTop: 8,
    },
});
