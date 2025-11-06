// Export contexts
export { OrderContext, OrderProvider } from "./contexts/OrderContext";
export {
  RestaurantContext,
  RestaurantProvider,
} from "./contexts/RestaurantContext";
export { StoreContext } from "./contexts/StoreContext";
export { AuthContext, AuthProvider } from "./contexts/AuthContext";
export { CartContext, CartProvider } from "./contexts/CartContext";

import StoreContextProvider from "./contexts/StoreContext";
export default StoreContextProvider;

// Export hooks
export { useCart } from "./hooks/useCart";
export { useAuth } from "./hooks/useAuth";
export { useOrderTracking } from "./hooks/useOrderTracking";
export { useAddresses } from "./hooks/useAddresses";
export { usePromotions } from "./hooks/usePromotions";
export { useSettings } from "./hooks/useSettings";
export { default as useRestaurantDetail } from "./hooks/useRestaurantDetail";

// Export utils (cartHelpers, orderHelpers)
export * from "./utils/cartHelpers";
export * from "./utils/orderHelpers";
