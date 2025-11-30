// hooks/useAddress.js
import { useState, useEffect } from 'react';
import { Alert } from 'react-native';
import * as Location from 'expo-location';
import { addressService } from '../services/profileService';

export const useAddress = (userId) => {
    const [addresses, setAddresses] = useState([]);
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [saveLoading, setSaveLoading] = useState(false);
    const [gpsLoading, setGpsLoading] = useState(false);
    const [newAddress, setNewAddress] = useState({
        city: '',
        district: '',
        address_line: '',
        note: '',
        isDefault: false,
        lat: null,
        lng: null,
    });

    useEffect(() => {
        if (userId) {
            fetchAddresses();
        }
    }, [userId]);

    const fetchAddresses = async () => {
        try {
            const data = await addressService.getAddresses(userId);
            setAddresses(Array.isArray(data) ? data : (data.addresses || []));
        } catch (error) {
            console.error('Error fetching addresses:', error);
            Alert.alert('Error', 'Failed to load addresses');
        }
    };

    const handleAddressInputChange = (field, value) => {
        setNewAddress(prev => ({
            ...prev,
            [field]: value,
        }));
    };

    const handleAddAddress = async () => {
        try {
            // If has GPS coordinates, allow save even without city/district
            const hasGPS = newAddress.lat && newAddress.lng;
            const hasRequiredFields = newAddress.address_line;
            const hasFullAddress = newAddress.city && newAddress.district && newAddress.address_line;

            if (!hasGPS && !hasFullAddress) {
                Alert.alert('Lỗi', 'Vui lòng nhập đầy đủ thông tin địa chỉ hoặc sử dụng GPS');
                return;
            }

            if (!hasRequiredFields) {
                Alert.alert('Lỗi', 'Vui lòng nhập địa chỉ chi tiết');
                return;
            }

            setSaveLoading(true);
            const result = await addressService.addAddress(userId, newAddress);
            console.log('[useAddress.handleAddAddress] API response:', result);

            // Refresh addresses from server to ensure sync
            await fetchAddresses();

            resetAddressForm();
            Alert.alert('Thành công', 'Địa chỉ đã được thêm');
        } catch (error) {
            console.error('[useAddress.handleAddAddress] Error:', error);
            Alert.alert('Lỗi', 'Không thể thêm địa chỉ');
        } finally {
            setSaveLoading(false);
        }
    };

    const handleDeleteAddress = (addressId) => {
        Alert.alert(
            'Delete Address',
            'Are you sure you want to delete this address?',
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            await addressService.deleteAddress(addressId);
                            setAddresses(prev => prev.filter(addr => addr.id !== addressId));
                            Alert.alert('Success', 'Address deleted successfully');
                        } catch (error) {
                            console.error('Error deleting address:', error);
                            Alert.alert('Error', 'Failed to delete address');
                        }
                    },
                },
            ]
        );
    };

    const handleSetDefaultAddress = async (addressId) => {
        try {
            await addressService.setDefaultAddress(userId, addressId);
            setAddresses(prev =>
                prev.map(addr => ({
                    ...addr,
                    isDefault: addr.id === addressId,
                }))
            );
            Alert.alert('Success', 'Default address updated');
        } catch (error) {
            console.error('Error setting default:', error);
            Alert.alert('Error', 'Failed to set default address');
        }
    };

    const handleGetGPS = async () => {
        try {
            setGpsLoading(true);

            // Request permission
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                Alert.alert('Permission Denied', 'Please enable location permission in settings');
                setGpsLoading(false);
                return;
            }

            // Get current location
            const result = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.Balanced,
            });

            const { latitude, longitude } = result.coords;

            // Reverse geocode to get full address info
            let addressData = {
                city: '',
                district: '',
                address_line: `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`,
            };

            try {
                const addresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                if (addresses && addresses.length > 0) {
                    const addr = addresses[0];
                    console.log('[useAddress.handleGetGPS] Geocoded address:', addr);

                    // Parse full address components
                    addressData = {
                        city: addr.city || addr.region || '',
                        district: addr.district || addr.subregion || '',
                        address_line: [
                            addr.streetNumber,
                            addr.street,
                            addr.name,
                        ]
                            .filter(Boolean)
                            .join(' ') || addressData.address_line,
                    };
                }
            } catch (geocodeError) {
                console.error('Geocoding error:', geocodeError);
            }

            // Check for duplicate address by coordinates (within 100m radius)
            const isDuplicate = addresses.some(existingAddr => {
                if (!existingAddr.lat || !existingAddr.lng) return false;

                const distance = Math.sqrt(
                    Math.pow(existingAddr.lat - latitude, 2) +
                    Math.pow(existingAddr.lng - longitude, 2)
                ) * 111000; // Convert to meters approximately

                return distance < 100; // Less than 100 meters
            });

            if (isDuplicate) {
                Alert.alert(
                    'Địa chỉ đã tồn tại',
                    'Địa chỉ này đã được lưu trong danh sách của bạn.',
                    [{ text: 'OK' }]
                );
                setGpsLoading(false);
                return;
            }

            // Update address form with GPS data
            setNewAddress(prev => ({
                ...prev,
                lat: latitude,
                lng: longitude,
                city: addressData.city,
                district: addressData.district,
                address_line: addressData.address_line,
            }));

            console.log('[useAddress.handleGetGPS] Updated address form:', addressData);

            Alert.alert('Success', 'GPS location added to address');
        } catch (error) {
            console.error('GPS error:', error);
            Alert.alert('Error', 'Failed to get GPS location');
        } finally {
            setGpsLoading(false);
        }
    };

    const resetAddressForm = () => {
        setNewAddress({
            city: '',
            district: '',
            address_line: '',
            note: '',
            isDefault: false,
            lat: null,
            lng: null,
        });
        setShowAddressForm(false);
    };

    return {
        addresses,
        showAddressForm,
        saveLoading,
        gpsLoading,
        newAddress,
        setShowAddressForm,
        handleAddressInputChange,
        handleAddAddress,
        handleDeleteAddress,
        handleSetDefaultAddress,
        handleGetGPS,
    };
};
