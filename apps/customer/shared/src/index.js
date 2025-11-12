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

// New hooks for checkout & order management
export { useCheckout } from "./hooks/useCheckout";
export { useOrderActions } from "./hooks/useOrderActions";
export { useReview } from "./hooks/useReview";
export { useOrderFiltering } from "./hooks/useOrderFiltering";

// ==================== UTILS ====================
// Utility functions and helpers
export * from "./utils/cartHelpers";
export * from "./utils/orderHelpers";
export * from "./utils/statusHelpers";
export * from "./utils/orderProcessing";
