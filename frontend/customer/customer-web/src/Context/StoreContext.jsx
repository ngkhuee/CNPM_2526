import { createContext, useEffect, useState } from "react";
import { menu_list } from "../assets/assets";
import {
  authService,
  foodService,
  restaurantService,
  cartService,
} from "@api/services";

export const StoreContext = createContext(null);

const StoreContextProvider = (props) => {
  const [cartItems, setCartItems] = useState({});
  const [token, setToken] = useState("");
  const [user, setUser] = useState(null);
  const [food_list, setFoodList] = useState([]);
  const [restaurant_list, setRestaurantList] = useState([]);
  const [loading, setLoading] = useState(false);

  // Fetch data on mount
  useEffect(() => {
    // Load user from localStorage
    const savedUser = authService.getCurrentUser();
    const savedToken = localStorage.getItem("token");

    if (savedUser && savedToken) {
      setUser(savedUser);
      setToken(savedToken);
    }

    // Fetch initial data
    fetchFoods();
    fetchRestaurants();

    // Load cart if user logged in
    if (savedUser) {
      loadCart(savedUser.id);
    }
  }, []);

  // Fetch foods from API
  const fetchFoods = async () => {
    try {
      setLoading(true);
      const foods = await foodService.getAll();
      const restaurants = await restaurantService.getAll();

      // Enrich food data with restaurant name and category name
      const enrichedFoods = foods.map((food) => {
        const restaurant = restaurants.find((r) => r.id === food.restaurantId);
        return {
          ...food,
          restaurant: restaurant?.name || "Unknown Restaurant",
          category: food.categoryId, // Keep categoryId for now, will map later if needed
        };
      });

      setFoodList(enrichedFoods);
      setRestaurantList(restaurants);
    } catch (error) {
      console.error("Error fetching foods:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch restaurants from API
  const fetchRestaurants = async () => {
    try {
      const restaurants = await restaurantService.getAll();
      setRestaurantList(restaurants);
    } catch (error) {
      console.error("Error fetching restaurants:", error);
    }
  };

  // Load cart from API
  const loadCart = async (userId) => {
    try {
      const cart = await cartService.getByUser(userId);
      const cartObj = {};
      cart.items.forEach((item) => {
        cartObj[item.foodId] = item.quantity;
      });
      setCartItems(cartObj);
    } catch (error) {
      console.error("Error loading cart:", error);
    }
  };

  // Login with API
  const login = async (email, password) => {
    try {
      setLoading(true);
      const response = await authService.login(email, password);

      if (response.success) {
        setUser(response.user);
        setToken(response.token);

        // Load cart after login
        await loadCart(response.user.id);

        return { success: true };
      } else {
        return { success: false, message: response.message };
      }
    } catch (error) {
      return { success: false, message: error.message };
    } finally {
      setLoading(false);
    }
  };

  // Logout
  const logout = () => {
    authService.logout();
    setUser(null);
    setToken("");
    setCartItems({});
  };

  // Add to cart with API
  const addToCart = async (itemId, qty = 1) => {
    if (!user) {
      alert("Please login to add items to cart");
      return;
    }

    try {
      // Update local state
      setCartItems((prev) => ({
        ...prev,
        [itemId]: (prev[itemId] || 0) + qty,
      }));

      // Sync with backend
      await cartService.addItem(user.id, itemId, qty);
    } catch (error) {
      console.error("Error adding to cart:", error);
      // Rollback on error
      setCartItems((prev) => {
        const newCart = { ...prev };
        if (newCart[itemId] === qty) {
          delete newCart[itemId];
        } else {
          newCart[itemId] -= qty;
        }
        return newCart;
      });
    }
  };

  // Remove from cart with API
  const removeFromCart = async (itemId) => {
    if (!user) return;

    try {
      const newQuantity = cartItems[itemId] - 1;

      // Update local state
      setCartItems((prev) => {
        const newCart = { ...prev };
        if (newQuantity <= 0) {
          delete newCart[itemId];
        } else {
          newCart[itemId] = newQuantity;
        }
        return newCart;
      });

      // Sync with backend
      if (newQuantity <= 0) {
        await cartService.removeItem(user.id, itemId);
      } else {
        await cartService.addItem(user.id, itemId, -1);
      }
    } catch (error) {
      console.error("Error removing from cart:", error);
    }
  };

  // Calculate total cart amount
  const getTotalCartAmount = () => {
    let totalAmount = 0;
    for (const item in cartItems) {
      if (cartItems[item] > 0) {
        let itemInfo = food_list.find(
          (product) => String(product.id) === String(item)
        );
        if (itemInfo) {
          totalAmount += itemInfo.price * cartItems[item];
        } else {
          console.warn("Không tìm thấy sản phẩm:", item);
        }
      }
    }
    return totalAmount;
  };

  // Get cart count
  const getCartCount = () => {
    return Object.values(cartItems).reduce((sum, qty) => sum + qty, 0);
  };

  const contextValue = {
    food_list,
    restaurant_list,
    menu_list,
    cartItems,
    addToCart,
    removeFromCart,
    getTotalCartAmount,
    getCartCount,
    token,
    setToken,
    setCartItems,
    user,
    login,
    logout,
    loading,
    fetchFoods,
    fetchRestaurants,
  };

  return (
    <StoreContext.Provider value={contextValue}>
      {props.children}
    </StoreContext.Provider>
  );
};

export default StoreContextProvider;
