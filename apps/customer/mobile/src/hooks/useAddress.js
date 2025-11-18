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
            if (!newAddress.city || !newAddress.district || !newAddress.address_line) {
                Alert.alert('Error', 'Please fill in all required fields');
                return;
            }

            setSaveLoading(true);
            const result = await addressService.addAddress(userId, newAddress);
            const addressToAdd = result.id ? result : { id: Date.now().toString(), ...newAddress };

            setAddresses(prev => [...prev, addressToAdd]);
            resetAddressForm();
            Alert.alert('Success', 'Address added successfully');
        } catch (error) {
            console.error('Error adding address:', error);
            Alert.alert('Error', 'Failed to add address');
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

            // Reverse geocode to get address text
            let addressText = `${latitude.toFixed(4)}, ${longitude.toFixed(4)}`;
            try {
                const addresses = await Location.reverseGeocodeAsync({
                    latitude,
                    longitude,
                });

                if (addresses && addresses.length > 0) {
                    const addr = addresses[0];
                    addressText = [
                        addr.street,
                        addr.district,
                        addr.city,
                    ]
                        .filter(Boolean)
                        .join(', ') || addressText;
                }
            } catch (geocodeError) {
                console.error('Geocoding error:', geocodeError);
            }

            // Update address form with GPS data
            setNewAddress(prev => ({
                ...prev,
                lat: latitude,
                lng: longitude,
                address_line: addressText,
            }));

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
