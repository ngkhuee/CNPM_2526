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
import axios from 'axios';
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
import { transformFoods, transformRestaurants } from '../../utils/dataTransformers';
import { getNearbyRestaurants } from '../../utils/locationUtils';
import ErrorBoundary from '../../utils/ErrorBoundary';
import { useNavigateToRestaurant } from '../../hooks/useNavigateToRestaurant';
import { useNavigateToRestaurantOnly } from '../../hooks/useNavigateToRestaurantOnly';
import { useGeolocation } from '../../hooks/useGeolocation';
import apiConfig from '../../config/api.config';

const API_BASE = apiConfig.api.baseURL;

export default function HomeScreen({ onNavigate }) {
  const { activeRoute, navigate } = useContext(NavigationContext);
  const [foodList, setFoodList] = useState([]);
  const [restaurantList, setRestaurantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [address, setAddress] = useState('Chọn vị trí');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [gpsLoading, setGpsLoading] = useState(true);

  // GPS Geolocation hook
  const { location, address: gpsAddress, loading: gpsLoading2, requestLocation } = useGeolocation();

  // Hook để navigate tới restaurant detail
  const navigateToRestaurant = useNavigateToRestaurant(onNavigate);
  const navigateToRestaurantOnly = useNavigateToRestaurantOnly(onNavigate);

  // Request GPS on mount
  useEffect(() => {
    const initLocation = async () => {
      setGpsLoading(true);
      console.log('[HomeScreen] Requesting GPS location on mount...');
      await requestLocation();
      setGpsLoading(false);
    };

    initLocation();
  }, []);

  // Update address and nearby restaurants when GPS location changes
  useEffect(() => {
    if (gpsAddress) {
      console.log('[HomeScreen] GPS location obtained:', gpsAddress);
      setAddress(gpsAddress);

      // Calculate nearby restaurants
      if (location && restaurantList.length > 0) {
        const nearby = getNearbyRestaurants(restaurantList, location, 5);
        console.log('[HomeScreen] Nearby restaurants:', nearby.length);
        setNearbyRestaurants(nearby);
      }
    }
  }, [gpsAddress, location, restaurantList]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [foodRes, restaurantRes] = await Promise.all([
        axios.get(`${API_BASE}/menus`),
        axios.get(`${API_BASE}/restaurants`),
      ]);

      setFoodList(transformFoods(foodRes.data || []));
      setRestaurantList(transformRestaurants(restaurantRes.data || []));
      setError(null);
    } catch (err) {
      console.error('Fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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

  const topRestaurants = restaurantList.slice(0, 6);

  // Handle location button press - request GPS
  const handleLocationPress = async () => {
    console.log('[HomeScreen] Location button pressed - requesting GPS...');
    setGpsLoading(true);
    try {
      await requestLocation();
    } catch (err) {
      console.error('[HomeScreen] Error requesting location:', err);
      Alert.alert('Lỗi', 'Không thể lấy vị trí. Vui lòng kiểm tra cài đặt GPS.');
    } finally {
      setGpsLoading(false);
    }
  };

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
    setShowSearchOverlay(false);
  };

  const handleSearchBlur = () => {
    setShowSearchOverlay(false);
  };

  const handleSearchSubmit = () => {
    if (searchQuery.trim() !== '') {
      setShowSearchOverlay(false);
      setShowSearchResults(true);
    }
  };

  const handleSelectSuggestion = (item) => {
    console.log('[HomeScreen] Suggestion selected:', item);
    // Set the search query to the selected item's name
    setSearchQuery(item.name);
    // Close overlay immediately
    setShowSearchOverlay(false);
    // Show search results
    setShowSearchResults(true);
  };

  const handleCloseSearchOverlay = () => {
    setShowSearchOverlay(false);
  };

  const handleNavigateBack = () => {
    setShowSearchResults(false);
    setSearchQuery('');
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

  const handleMenuPress = () => {
    setDrawerVisible(true);
  };

  const handleCloseDrawer = () => {
    setDrawerVisible(false);
  };

  const handleDrawerNavigate = (screen) => {
    setDrawerVisible(false);

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
            <View style={styles.gridContainer}>
              <View style={styles.gridWrapper}>
                {topRatedFoods.map((item) => (
                  <View key={item.id?.toString()} style={styles.gridItem}>
                    <ErrorBoundary>
                      <FoodCard
                        item={item}
                        onPress={navigateToRestaurant}
                      />
                    </ErrorBoundary>
                  </View>
                ))}
              </View>
            </View>
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
            <View style={styles.gridContainer}>
              <View style={styles.gridWrapper}>
                {bestSellerFoods.map((item) => (
                  <View key={item.id?.toString()} style={styles.gridItem}>
                    <ErrorBoundary>
                      <FoodCard
                        item={item}
                        onPress={navigateToRestaurant}
                      />
                    </ErrorBoundary>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Category Tabs */}
        <CategoryTabs
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
        />

        {/* Foods Grid */}
        <View style={styles.section}>
          <SectionTitle title="Món phổ biến" />
          <View style={styles.gridContainer}>
            <View style={styles.gridWrapper}>
              {filteredFoods.map((item) => (
                <View key={item.id?.toString()} style={styles.gridItem}>
                  <ErrorBoundary>
                    <FoodCard
                      item={item}
                      onPress={navigateToRestaurant}
                    />
                  </ErrorBoundary>
                </View>
              ))}
            </View>
          </View>
        </View>

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
