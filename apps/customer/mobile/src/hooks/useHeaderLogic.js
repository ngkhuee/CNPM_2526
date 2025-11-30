/**
 * useHeaderLogic - Custom hook for shared header logic
 * Provides common handlers for location, menu, and search functionality
 */
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import { useGeolocation } from './useGeolocation';

export const useHeaderLogic = () => {
    const [address, setAddress] = useState('Chọn vị trí');
    const [searchQuery, setSearchQuery] = useState('');
    const [showSearchResults, setShowSearchResults] = useState(false);
    const [drawerVisible, setDrawerVisible] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(true);

    // GPS Geolocation hook
    const { location, address: gpsAddress, requestLocation } = useGeolocation();

    // Request GPS on mount
    useEffect(() => {
        const initLocation = async () => {
            setGpsLoading(true);
            await requestLocation();
            setGpsLoading(false);
        };
        initLocation();
    }, []);

    // Update address when GPS location changes
    useEffect(() => {
        if (gpsAddress) {
            setAddress(gpsAddress);
        }
    }, [gpsAddress]);

    // Handle location button press
    const handleLocationPress = async () => {
        console.log('[useHeaderLogic] Location button pressed - requesting GPS...');
        setGpsLoading(true);
        try {
            await requestLocation();
        } catch (err) {
            console.error('[useHeaderLogic] Error requesting location:', err);
            Alert.alert('Lỗi', 'Không thể lấy vị trí. Vui lòng kiểm tra cài đặt GPS.');
        } finally {
            setGpsLoading(false);
        }
    };

    // Handle menu button press
    const handleMenuPress = () => {
        setDrawerVisible(true);
    };

    // Handle drawer close
    const handleCloseDrawer = () => {
        setDrawerVisible(false);
    };

    // Handle search input change
    const handleSearchPress = (query) => {
        setSearchQuery(query);
    };

    // Handle search submit
    const handleSearchSubmit = (query) => {
        if (query.trim() !== '') {
            setShowSearchResults(true);
        }
    };

    // Handle back from search results
    const handleNavigateBack = () => {
        setShowSearchResults(false);
        setSearchQuery('');
    };

    // Handle avatar button press - navigate to profile
    const handleAvatarPress = (navigate) => {
        if (navigate && typeof navigate === 'function') {
            navigate('profile');
        }
    };

    return {
        // State
        address,
        searchQuery,
        showSearchResults,
        drawerVisible,
        gpsLoading,
        location,

        // Handlers
        handleLocationPress,
        handleMenuPress,
        handleCloseDrawer,
        handleSearchPress,
        handleSearchSubmit,
        handleNavigateBack,
        handleAvatarPress,
    };
};
