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
} from 'react-native';
import axios from 'axios';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import Header from '../../components/Header';
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
import apiConfig from '../../config/api.config';

const API_BASE = apiConfig.api.baseURL;

export default function HomeScreen({ onNavigate }) {
  const [foodList, setFoodList] = useState([]);
  const [restaurantList, setRestaurantList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [nearbyRestaurants, setNearbyRestaurants] = useState([]);
  const [address, setAddress] = useState('Select location');
  const [activeRoute, setActiveRoute] = useState('home');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchOverlay, setShowSearchOverlay] = useState(false);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState([]);

  // Hook để navigate tới restaurant detail
  const navigateToRestaurant = useNavigateToRestaurant(onNavigate);
  const navigateToRestaurantOnly = useNavigateToRestaurantOnly(onNavigate);

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

  const handleLocationPress = () => {
    console.log('Location pressed - GPS pending');
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
    setShowSearchOverlay(true);

    // Show random suggestions if search is empty
    if (searchQuery.trim() === '') {
      const randomItems = foodList
        .sort(() => Math.random() - 0.5)
        .slice(0, 5);
      setSearchSuggestions(randomItems);
    }
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
    setActiveRoute(route);
    if (onNavigate) {
      onNavigate(route);
    }
    console.log('Navigate to:', route);
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
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#ff6b35" />
          <Text style={styles.loadingText}>Loading...</Text>
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
        />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryBtn} onPress={fetchData}>
            <Text style={styles.retryBtnText}>Retry</Text>
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
      />
      <SearchOverlay
        visible={showSearchOverlay}
        searchQuery={searchQuery}
        suggestions={searchSuggestions}
        onClose={handleCloseSearchOverlay}
        onSelectSuggestion={handleSelectSuggestion}
      />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Hero Banner */}
        <HomeHero onExplorePress={() => { }} />

        {/* Nearby Restaurants (when location available) */}
        {nearbyRestaurants.length > 0 && (
          <View style={styles.section}>
            <SectionTitle title="Nearby Restaurants" />
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
              title="Top Rated"
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
              title="Best Sellers"
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
          <SectionTitle title="Popular Items" />
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
            title="Top Rated Restaurants"
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
