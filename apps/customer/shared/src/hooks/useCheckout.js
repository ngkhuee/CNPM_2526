import { useState, useCallback } from "react";
import { addressService, restaurantService } from "shared-services";
import { reverseGeocode, geocodeAddress } from "shared-utils";

/**
 * Custom hook for managing checkout process
 * Handles address selection, GPS geocoding, and order preparation
 * Shared between web and mobile customer apps
 */
export const useCheckout = (user) => {
    const [gpsLocation, setGpsLocation] = useState(null);
    const [loadingGPS, setLoadingGPS] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    /**
     * Get GPS location from browser
     */
    const handleGetGPS = useCallback(async () => {
        if (!navigator.geolocation) {
            return {
                success: false,
                message: "Browser does not support GPS",
            };
        }

        setLoadingGPS(true);

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;
                    setGpsLocation({ lat: latitude, lng: longitude });

                    // Convert GPS coordinates to address text
                    try {
                        const result = await reverseGeocode(latitude, longitude);
                        if (result && result.display_name) {
                            resolve({
                                success: true,
                                location: { lat: latitude, lng: longitude },
                                address: result.display_name,
                            });
                        } else {
                            resolve({
                                success: true,
                                location: { lat: latitude, lng: longitude },
                                address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(
                                    6
                                )}`,
                            });
                        }
                    } catch (error) {
                        console.error("Reverse geocoding error:", error);
                        resolve({
                            success: true,
                            location: { lat: latitude, lng: longitude },
                            address: `Lat: ${latitude.toFixed(6)}, Lng: ${longitude.toFixed(6)}`,
                        });
                    } finally {
                        setLoadingGPS(false);
                    }
                },
                (error) => {
                    setLoadingGPS(false);
                    console.error("GPS error:", error);
                    resolve({
                        success: false,
                        message: "Cannot get GPS location. Please enter address manually.",
                    });
                }
            );
        });
    }, []);

    /**
     * Geocode address to get GPS coordinates
     */
    const geocodeAddressToCoords = useCallback(
        async (address) => {
            if (!address) return null;

            try {
                console.log("🗺️ Geocoding address to get GPS coordinates...");
                const result = await geocodeAddress(address);
                if (result) {
                    console.log("✅ Geocoded GPS:", result);
                    return { lat: result.lat, lng: result.lng };
                }
            } catch (error) {
                console.error("❌ Geocoding error:", error);
            }
            return null;
        },
        []
    );

    /**
     * Save address to database
     */
    const saveAddressToDatabase = useCallback(
        async (addressData, shouldSave = false) => {
            if (!user || !user.id) {
                console.warn("⚠️ No user ID for saving address");
                return null;
            }

            try {
                console.log(
                    shouldSave
                        ? "💾 Saving new address..."
                        : "📍 Creating temporary address for order..."
                );

                const savedAddress = await addressService.create({
                    userId: user.id,
                    addressLine: addressData.address,
                    phone: addressData.phone,
                    district: addressData.district || "",
                    city: addressData.city || "",
                    lat: addressData.lat || null,
                    lng: addressData.lng || null,
                    isDefault: shouldSave && addressData.isDefault,
                });

                console.log("✅ Address created successfully:", savedAddress);
                return savedAddress;
            } catch (error) {
                console.error("❌ Error creating address:", error);
                return null;
            }
        },
        [user]
    );

    /**
     * Group order items by restaurant
     */
    const groupOrdersByRestaurant = useCallback((orderItems) => {
        const grouped = {};

        orderItems.forEach((item) => {
            if (!grouped[item.restaurantId]) {
                grouped[item.restaurantId] = [];
            }
            grouped[item.restaurantId].push(item);
        });

        return grouped;
    }, []);

    /**
     * Get restaurant pickup location
     */
    const getRestaurantLocation = useCallback(async (restaurantId) => {
        try {
            const restaurant = await restaurantService.getById(restaurantId);
            if (restaurant && restaurant.location) {
                console.log("📍 Restaurant location:", restaurant.name, restaurant.location);
                return restaurant.location;
            }
        } catch (error) {
            console.warn("⚠️ Could not fetch restaurant location:", error);
        }
        return null;
    }, []);

    /**
     * Prepare order data for each restaurant
     */
    const prepareOrderData = useCallback(
        async (
            restaurantId,
            items,
            customer,
            addressIdForOrder,
            gpsLocation
        ) => {
            const pickupGPS = await getRestaurantLocation(restaurantId);

            const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

            return {
                customerId: customer.id || "guest",
                restaurantId: restaurantId,
                addressId: addressIdForOrder || null,
                items: items,
                customer: {
                    name: customer.name,
                    phone: customer.phone,
                    address: customer.address,
                },
                pickup_gps: pickupGPS,
                dropoff_gps: gpsLocation || null,
                total_amount: total,
                subtotal: total,
                deliveryFee: 0,
                discountAmount: 0,
                status: "pending",
                payment_method: "online",
            };
        },
        [getRestaurantLocation]
    );

    /**
     * Process checkout submission
     * Handles address geocoding, saving, and order preparation
     */
    const processCheckout = useCallback(
        async (
            customer,
            orderItems,
            useNewAddress,
            selectedAddressId,
            saveAddress,
            currentAddresses
        ) => {
            setLoadingSubmit(true);

            try {
                let finalGpsLocation = gpsLocation;

                // If using new address and GPS not obtained, try to geocode the address
                if (useNewAddress && !gpsLocation) {
                    const geocodedCoords = await geocodeAddressToCoords(customer.address);
                    if (geocodedCoords) {
                        finalGpsLocation = geocodedCoords;
                    }
                }

                // Save new address if requested
                let addressIdForOrder = selectedAddressId;

                if (useNewAddress && user) {
                    const savedAddress = await saveAddressToDatabase(
                        {
                            address: customer.address,
                            phone: customer.phone,
                            lat: finalGpsLocation?.lat || null,
                            lng: finalGpsLocation?.lng || null,
                            isDefault: saveAddress && currentAddresses.length === 0,
                        },
                        saveAddress
                    );

                    if (savedAddress) {
                        addressIdForOrder = savedAddress.id;
                    }
                }

                // Group items by restaurant
                const groupedOrders = groupOrdersByRestaurant(orderItems);

                // Prepare orders for each restaurant
                const orders = [];
                for (const [restaurantId, items] of Object.entries(groupedOrders)) {
                    const orderData = await prepareOrderData(
                        restaurantId,
                        items,
                        user,
                        addressIdForOrder,
                        finalGpsLocation
                    );

                    orders.push(orderData);
                }

                return {
                    success: true,
                    orders: orders,
                    addressId: addressIdForOrder,
                    gpsLocation: finalGpsLocation,
                };
            } catch (error) {
                console.error("❌ Checkout processing error:", error);
                return {
                    success: false,
                    message: error.message || "Error processing checkout",
                };
            } finally {
                setLoadingSubmit(false);
            }
        },
        [
            user,
            gpsLocation,
            geocodeAddressToCoords,
            saveAddressToDatabase,
            groupOrdersByRestaurant,
            prepareOrderData,
        ]
    );

    return {
        gpsLocation,
        loadingGPS,
        loadingSubmit,
        setGpsLocation,
        handleGetGPS,
        geocodeAddressToCoords,
        saveAddressToDatabase,
        groupOrdersByRestaurant,
        getRestaurantLocation,
        prepareOrderData,
        processCheckout,
    };
};
