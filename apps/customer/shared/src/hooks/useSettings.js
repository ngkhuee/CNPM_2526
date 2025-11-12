import { useState, useEffect } from "react";
import { settingsService } from "shared-services";

/**
 * Custom hook for fetching system settings
 * Provides delivery fee and other configurable settings
 */
export const useSettings = () => {
  const [deliveryFee, setDeliveryFee] = useState(15000); // Default fallback
  const [settings, setSettings] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isActive = true;

    const fetchSettings = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch all settings
        const allSettings = await settingsService.getAllSettings();
        if (isActive) {
          setSettings(allSettings);

          // Extract delivery fee
          const feeValue = await settingsService.getDeliveryFee();
          setDeliveryFee(feeValue);
        }
      } catch (err) {
        if (isActive) {
          console.error("Error fetching settings:", err);
          setError(err.message || "Failed to fetch settings");
          // Keep default delivery fee on error
        }
      } finally {
        if (isActive) {
          setLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isActive = false;
    };
  }, []);

  // Get specific setting by key
  const getSetting = (key, defaultValue = null) => {
    const setting = settings.find((s) => s.key === key);
    return setting ? setting.value : defaultValue;
  };

  return {
    deliveryFee,
    settings,
    loading,
    error,
    getSetting,
  };
};
