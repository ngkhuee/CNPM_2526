// useOrderTracking hook - Order tracking logic cho web và mobile
import { useState, useEffect, useCallback } from "react";
import { orderService } from "shared-services";

export const useOrderTracking = (orderId) => {
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch order by ID
  const fetchOrder = useCallback(async () => {
    if (!orderId) return;

    try {
      setLoading(true);
      setError(null);
      const data = await orderService.getById(orderId);
      setOrder(data);
    } catch (err) {
      console.error("Error fetching order:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Initial fetch
  useEffect(() => {
    fetchOrder();
  }, [fetchOrder]);

  // Refresh order (for manual polling)
  const refreshOrder = useCallback(() => {
    fetchOrder();
  }, [fetchOrder]);

  return {
    order,
    loading,
    error,
    refreshOrder,
  };
};
