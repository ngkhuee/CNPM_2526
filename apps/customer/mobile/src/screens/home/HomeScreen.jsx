import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useContext } from 'react';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { NavigationContext } from '../../contexts/NavigationContext';
import Header from '../../components/Header';
import MenuDrawer from '../../components/MenuDrawer';
import SearchOverlay from '../../components/SearchOverlay';
import HomeHero from './components/HomeHero';
import FoodCard from './components/FoodCard';
import RestaurantCard from './components/RestaurantCard';
import NearbyRestaurantCard from './components/NearbyRestaurantCard';
import SectionTitle from './components/SectionTitle';
import SectionTitleWithIcon from './components/SectionTitleWithIcon';
import CategoryTabs from '../../components/CategoryTabs';
import BottomNavigation from '../../components/BottomNavigation';
import SearchResultsScreen from '../search/SearchResultsScreen';
import { getNearbyRestaurants } from '../../utils/locationUtils';
import ErrorBoundary from '../../utils/ErrorBoundary';
import { useNavigateToRestaurant } from '../../hooks/useNavigateToRestaurant';
import { useNavigateToRestaurantOnly } from '../../hooks/useNavigateToRestaurantOnly';
import { useHeaderLogic } from '../../hooks/useHeaderLogic';
import { useFoodsAndRestaurants } from '../../hooks/useFoodsAndRestaurants';

export default function HomeScreen({ onNavigate }) {
  const { activeRoute, navigate } = useContext(NavigationContext);

  // HomeScreen unique states (not in shared hooks)
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);

  // Use shared header logic
  const {
    address,
    searchQuery,
    showSearchResults,
    drawerVisible,
    location,
    handleLocationPress,
    handleMenuPress,
    handleCloseDrawer,
    handleSearchPress: setSearchQuery,
    handleSearchSubmit,
    handleNavigateBack,
    handleAvatarPress,
  } = useHeaderLogic();

  // Use shared data fetching hook
  const { foodList, restaurantList, loading, error } = useFoodsAndRestaurants();

  // Hook để navigate tới restaurant detail
  const navigateToRestaurant = useNavigateToRestaurant(onNavigate);
  const navigateToRestaurantOnly = useNavigateToRestaurantOnly(onNavigate);

  // Calculate nearby restaurants whenever location OR restaurantList changes
  useEffect(() => {
    if (location && restaurantList.length > 0) {
      console.log('[HomeScreen] Calculating nearby restaurants...');
      console.log('[HomeScreen] User location:', location);
      console.log('[HomeScreen] Total restaurants:', restaurantList.length);

      const nearby = getNearbyRestaurants(restaurantList, location, 5);
      console.log('[HomeScreen] Nearby restaurants found:', nearby.length);
      setNearbyRestaurants(nearby);
    } else {
      console.log('[HomeScreen] Cannot calculate nearby - location:', !!location, 'restaurants:', restaurantList.length);
      setNearbyRestaurants([]);
    }
  }, [location, restaurantList]);

  // Filter foods by category AND search query
  const filteredFoods = foodList.filter(f => {
    const matchCategory = selectedCategory ? f.name.includes(selectedCategory) : true;
    const matchSearch = searchQuery
      ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (f.description && f.description.toLowerCase().includes(searchQuery.toLowerCase()))
      : true;
    return matchCategory && matchSearch;
  });

  // Get top rated foods (rating > 0, sorted by rating DESC)
  const topRatedFoods = [...foodList]
    .filter(f => f.rating && f.rating > 0)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 8);

  // Get best sellers (sold > 0, sorted by sold DESC)
  const bestSellerFoods = [...foodList]
    .filter(f => f.sold && f.sold > 0)
    .sort((a, b) => (b.sold || 0) - (a.sold || 0))
    .slice(0, 8);

  // Top restaurants sorted by rating (highest first)
  const topRestaurants = [...restaurantList]
    .sort((a, b) => (b.rating || 0) - (a.rating || 0))
    .slice(0, 6)
    .map((restaurant) => {
      // Calculate distance if location is available
      if (location && restaurant.latitude && restaurant.longitude) {
        const userLat = location.lat || location.latitude;
        const userLon = location.lng || location.longitude;
        const R = 6371; // Earth's radius in km
        const dLat = (restaurant.latitude - userLat) * (Math.PI / 180);
        const dLon = (restaurant.longitude - userLon) * (Math.PI / 180);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(userLat * (Math.PI / 180)) *
          Math.cos(restaurant.latitude * (Math.PI / 180)) *
          Math.sin(dLon / 2) *
          Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        return { ...restaurant, distance };
      }
      return { ...restaurant, distance: 0 };
    });

  const handleSearchPress = (query) => {
    setSearchQuery(query);

    // Generate suggestions based on current query
    if (query.trim() === '') {
      setSearchSuggestions([]);
    } else {
      const suggestions = foodList
        .filter(f =>
          f.name.toLowerCase().includes(query.toLowerCase()) ||
          (f.description && f.description.toLowerCase().includes(query.toLowerCase()))
        )
        .slice(0, 5);
      setSearchSuggestions(suggestions);
    }
  };

  const handleSearchFocus = () => {
    setShowSearchOverlay(true);
  };

  const handleSearchBlur = () => {
    setTimeout(() => setShowSearchOverlay(false), 200);
  };

  const handleSelectSuggestion = (item) => {
    console.log('[HomeScreen] Suggestion selected:', item);
    setSearchQuery(item.name);
    setShowSearchOverlay(false);
    handleSearchSubmit(item.name);
  };

  const handleCloseSearchOverlay = () => {
    setShowSearchOverlay(false);
  };

  const handleNavigate = (route) => {
    if (route === 'home') {
      // Ở lại HomeScreen
      onNavigate('home');
    } else if (route === 'cart') {
      onNavigate('cart');
    } else if (route === 'orders') {
      onNavigate('orders');
    } else if (route === 'profile') {
      onNavigate('profile');
    }
    navigate(route);
  };

  const handleDrawerNavigate = (screen) => {
    handleCloseDrawer();

    if (screen === 'register-restaurant') {
      navigate('register-restaurant');
    } else if (screen === 'profile') {
      navigate('profile');
    }
    // Add more cases as needed
  };

  // Show search results if requested
  if (showSearchResults && searchQuery) {
    return (
      <SearchResultsScreen
        searchQuery={searchQuery}
        onBack={handleNavigateBack}
      />
    );
  }

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          userLocation={address}
          onLocationPress={handleLocationPress}
          onSearchPress={handleSearchPress}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          onSearchSubmit={handleSearchSubmit}
          onMenuPress={handleMenuPress}
          onAvatarPress={() => handleAvatarPress(onNavigate)}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Đang tải...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <Header
          userLocation={address}
          onLocationPress={handleLocationPress}
          onSearchPress={handleSearchPress}
          onSearchFocus={handleSearchFocus}
          onSearchBlur={handleSearchBlur}
          onSearchSubmit={handleSearchSubmit}
          onMenuPress={handleMenuPress}
          onAvatarPress={() => handleAvatarPress(onNavigate)}
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryBtnText}>Thử lại</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header
        userLocation={address}
        onLocationPress={handleLocationPress}
        onSearchPress={handleSearchPress}
        onSearchFocus={handleSearchFocus}
        onSearchBlur={handleSearchBlur}
        onSearchSubmit={handleSearchSubmit}
        onMenuPress={handleMenuPress}
        onAvatarPress={() => handleAvatarPress(onNavigate)}
      />
      <SearchOverlay
        visible={showSearchOverlay}
        searchQuery={searchQuery}
        suggestions={searchSuggestions}
        onClose={handleCloseSearchOverlay}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <MenuDrawer
        isVisible={drawerVisible}
        onClose={handleCloseDrawer}
        onNavigate={handleDrawerNavigate}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <HomeHero onExplorePress={() => { }} />

        {/* Nearby Restaurants (when location available) */}
        {nearbyRestaurants.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Nhà hàng gần đây" />
            <FlatList
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              data={nearbyRestaurants}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={({ item }) => (
                <ErrorBoundary>
                  <NearbyRestaurantCard
                    item={item}
                    onPress={navigateToRestaurantOnly}
                  />
                </ErrorBoundary>
              )}
              contentContainerStyle={styles.horizontalListContent}
            />
          </View>
        )}

        {/* Top Rated Foods */}
        {topRatedFoods.length > 0 && (
          <View style={styles.section}>
            <SectionTitleWithIcon
              title="Đánh giá cao"
              icon="star"
              iconColor="#FFB800"
            />
            <FlatList
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              data={topRatedFoods}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={({ item }) => (
                <View style={styles.horizontalFoodItem}>
                  <ErrorBoundary>
                    <FoodCard
                      item={item}
                      onPress={navigateToRestaurant}
                    />
                  </ErrorBoundary>
                </View>
              )}
              contentContainerStyle={styles.horizontalListContent}
            />
          </View>
        )}

        {/* Best Sellers */}
        {bestSellerFoods.length > 0 && (
          <View style={styles.section}>
            <SectionTitleWithIcon
              title="Bán chạy"
              icon="local-fire-department"
              iconColor="#FF6B35"
            />
            <FlatList
              horizontal
              scrollEnabled
              showsHorizontalScrollIndicator={false}
              data={bestSellerFoods}
              keyExtractor={(item) => item.id?.toString()}
              renderItem={({ item }) => (
                <View style={styles.horizontalFoodItem}>
                  <ErrorBoundary>
                    <FoodCard
                      item={item}
                      onPress={navigateToRestaurant}
                    />
                  </ErrorBoundary>
                </View>
              )}
              contentContainerStyle={styles.horizontalListContent}
            />
          </View>
        )}

        {/* Top Rated Restaurants */}
        <View style={styles.section}>
          <SectionTitle
            title="Nhà hàng đánh giá cao"
          />
          <FlatList
            scrollEnabled={false}
            data={topRestaurants}
            keyExtractor={(item) => item.id?.toString()}
            renderItem={({ item }) => (
              <RestaurantCard item={item} onPress={navigateToRestaurantOnly} />
            )}
          />
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
      <BottomNavigation activeRoute={activeRoute} onNavigate={handleNavigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  gridContainer: {
    marginHorizontal: -6,
  },
  gridWrapper: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -6,
  },
  gridItem: {
    width: '50%',
  },
  horizontalFoodItem: {
    width: 160,
    marginRight: 12,
  },
  horizontalListContent: {
    paddingRight: 16,
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
