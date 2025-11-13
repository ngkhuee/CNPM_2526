import { useState } from "react";
import { reverseGeocode } from "shared-utils";

/**
 * Custom hook for address form management (web + mobile)
 * @param {function} addAddressHook - addAddress function from useAddresses hook
 * @returns {object} Address form state and handlers
 */
export const useAddressForm = (addAddressHook) => {
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [newAddress, setNewAddress] = useState({
        address_line: "",
        city: "TP.HCM",
        district: "",
        lat: null,
        lng: null,
        note: "",
        isDefault: false,
    });

    const handleAddressInputChange = (field, value) => {
        setNewAddress((prev) => ({ ...prev, [field]: value }));
    };

    const handleGetGPS = () => {
        if (!navigator.geolocation) {
            return { success: false, message: "Browser does not support GPS" };
        }

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const { latitude, longitude } = position.coords;

                    // First, reverse geocode to get address text
                    try {
                        const geoResult = await reverseGeocode(latitude, longitude);

                        if (geoResult && geoResult.display_name) {
                            setNewAddress((prev) => ({
                                ...prev,
                                lat: latitude,
                                lng: longitude,
                                address_line: geoResult.display_name,
                            }));
                            resolve({
                                success: true,
                                message: `GPS obtained and address auto-filled: ${geoResult.display_name}`,
                            });
                        } else {
                            // If reverse geocoding fails, just store coordinates
                            setNewAddress((prev) => ({
                                ...prev,
                                lat: latitude,
                                lng: longitude,
                            }));
                            resolve({
                                success: true,
                                message: `GPS obtained: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Please enter address manually.`,
                            });
                        }
                    } catch (error) {
                        console.error("Reverse geocoding error:", error);
                        setNewAddress((prev) => ({
                            ...prev,
                            lat: latitude,
                            lng: longitude,
                        }));
                        resolve({
                            success: true,
                            message: `GPS obtained: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}. Please enter address manually.`,
                        });
                    }
                },
                (error) => {
                    console.error("GPS error:", error);
                    resolve({ success: false, message: "Unable to get GPS location" });
                }
            );
        });
    };

    const handleAddAddress = async () => {
        // Either address_line OR GPS coordinates must be provided
        if (!newAddress.address_line && (!newAddress.lat || !newAddress.lng)) {
            return { success: false, message: "Please enter address or use GPS" };
        }

        // District must always be provided
        if (!newAddress.district) {
            return { success: false, message: "Please select a district" };
        }

        try {
            setLoading(true);
            const result = await addAddressHook(newAddress);

            if (result.success) {
                // Reset form
                setNewAddress({
                    address_line: "",
                    city: "TP.HCM",
                    district: "",
                    lat: null,
                    lng: null,
                    note: "",
                    isDefault: false,
                });
                setShowAddressForm(false);
                return { success: true, message: "Address added successfully!" };
            } else {
                return { success: false, message: `Error adding address: ${result.message}` };
            }
        } catch (error) {
            console.error("Error adding address:", error);
            return { success: false, message: "Error adding address" };
        } finally {
            setLoading(false);
        }
    };

    return {
        showAddressForm,
        setShowAddressForm,
        loading,
        newAddress,
        handleAddressInputChange,
        handleGetGPS,
        handleAddAddress,
    };
};
