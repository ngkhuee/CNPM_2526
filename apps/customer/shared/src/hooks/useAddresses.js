import { useState, useEffect } from "react";
import { addressService } from "shared-services";

/**
 * Custom hook for managing user addresses
 * Provides CRUD operations for user delivery addresses
 */
export const useAddresses = (userId) => {
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch addresses for user
  useEffect(() => {
    if (!userId) {
      setAddresses([]);
      return;
    }

    let isActive = true;

    const fetchAddresses = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await addressService.getByUser(userId);
        if (isActive) {
          setAddresses(data);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching addresses:", err);
          setError(err.message || "Failed to fetch addresses");
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchAddresses();

    return () => {
      isActive = false;
    };
  }, [userId]);

  // Refresh addresses manually
  const refreshAddresses = async () => {
    if (!userId) return { success: false, message: "No user ID provided" };

    try {
      setLoading(true);
      setError(null);
      const data = await addressService.getByUser(userId);
      setAddresses(data);
      return { success: true, addresses: data };
    } catch (err) {
      console.error("Error refreshing addresses:", err);
      setError(err.message || "Failed to refresh addresses");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Add new address
  const addAddress = async (addressData) => {
    try {
      setLoading(true);
      const newAddress = await addressService.create({
        ...addressData,
        userId,
      });
      setAddresses((prev) => [...prev, newAddress]);
      return { success: true, address: newAddress };
    } catch (err) {
      console.error("Error adding address:", err);
      setError(err.message || "Failed to add address");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Update existing address
  const updateAddress = async (addressId, updatedData) => {
    try {
      setLoading(true);
      const updated = await addressService.update(addressId, updatedData);
      setAddresses((prev) =>
        prev.map((addr) => (addr.id === addressId ? updated : addr))
      );
      return { success: true, address: updated };
    } catch (err) {
      console.error("Error updating address:", err);
      setError(err.message || "Failed to update address");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Delete address
  const deleteAddress = async (addressId) => {
    try {
      setLoading(true);
      await addressService.delete(addressId);
      setAddresses((prev) => prev.filter((addr) => addr.id !== addressId));
      return { success: true };
    } catch (err) {
      console.error("Error deleting address:", err);
      setError(err.message || "Failed to delete address");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Set default address
  const setDefaultAddress = async (addressId) => {
    try {
      setLoading(true);
      await addressService.setDefault(userId, addressId);
      // Update local state
      setAddresses((prev) =>
        prev.map((addr) => ({
          ...addr,
          is_default: addr.id === addressId,
        }))
      );
      return { success: true };
    } catch (err) {
      console.error("Error setting default address:", err);
      setError(err.message || "Failed to set default address");
      return { success: false, message: err.message };
    } finally {
      setLoading(false);
    }
  };

  // Get default address
  const getDefaultAddress = () => {
    return addresses.find((addr) => addr.is_default) || addresses[0] || null;
  };

  return {
    addresses,
    loading,
    error,
    refreshAddresses,
    addAddress,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress,
  };
};
