// ==================== CONTEXTS ====================
// Core contexts for state management
export { OrderContext, OrderProvider } from "./contexts/OrderContext";
export {
  RestaurantContext,
  RestaurantProvider,
} from "./contexts/RestaurantContext";
export { StoreContext } from "./contexts/StoreContext";
export { AuthContext, AuthProvider } from "./contexts/AuthContext";
export { CartContext, CartProvider } from "./contexts/CartContext";
export {
  GeolocationContext,
  GeolocationProvider,
} from "./contexts/GeolocationContext";

import StoreContextProvider from "./contexts/StoreContext";
export default StoreContextProvider;

// ==================== HOOKS ====================
// Core hooks for business logic (shared for web & mobile)
export { useCart } from "./hooks/useCart";
export { useAuth } from "./hooks/useAuth";
export { useOrderTracking } from "./hooks/useOrderTracking";
export { useAddresses } from "./hooks/useAddresses";
export { usePromotions } from "./hooks/usePromotions";
export { useSettings } from "./hooks/useSettings";
export { default as useRestaurantDetail } from "./hooks/useRestaurantDetail";

// New hooks for checkout & order management (refactored)
export { useCheckout } from "./hooks/useCheckout";
export { useCheckoutProcessing } from "./hooks/useCheckoutProcessing";
export { useCheckoutValidation } from "./hooks/useCheckoutValidation";
export { useGPSLocation } from "./hooks/useGPSLocation";
export { useAddressManagement } from "./hooks/useAddressManagement";
export { useTrackingLogic } from "./hooks/useTrackingLogic";
export { useOrderActions } from "./hooks/useOrderActions";
export { useRestaurantHours, getTodayHours, isRestaurantOpen } from "./hooks/useRestaurantHours";

// Existing hooks
export { useReview } from "./hooks/useReview";
export { useOrderFiltering } from "./hooks/useOrderFiltering";
export { useUserOrderHistory } from "./hooks/useUserOrderHistory";

// ==================== COMPONENTS ====================
// Shared UI components
export {
  OrderCard,
  OrderStatusBadge,
  OrderTimeline,
  OrderCardHeader,
  OrderItemsTable,
  ReviewModal,
} from "./components/order";
export { DeliveryStatusCard, TrackingHeader } from "./components/tracking";

// ==================== UTILS ====================
// Utility functions and helpers
export * from "./utils/cartHelpers";
export * from "./utils/orderHelpers";
export * from "./utils/statusHelpers";
export * from "./utils/orderProcessing";
