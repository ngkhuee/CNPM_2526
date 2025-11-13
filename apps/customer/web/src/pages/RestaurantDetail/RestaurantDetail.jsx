import React, { useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdLocationOn,
  MdStar,
  MdWarning,
} from "react-icons/md";
import useRestaurantDetail from "customer-shared/hooks/useRestaurantDetail";
import { useRestaurantRating } from "shared-hooks";
import { CartContext } from "customer-shared";
import { SwitchRestaurantDialog } from "shared-ui";
import FoodItem from "../../components/FoodItem/FoodItem";
import FoodDetailPopup from "../../components/FoodDetailPopup/FoodDetailPopup";
import RestaurantReviews from "../../components/ReviewSection/RestaurantReviews";
import { getImageUrl, isRestaurantOpen, getTodayHours } from "@utils";
import "./RestaurantDetail.css";

const RestaurantDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const {
    restaurant,
    filteredMenuItems,
    categories,
    selectedCategory,
    setSelectedCategory,
    loading,
    menuLoading,
    error,
  } = useRestaurantDetail(id);

  // Get dynamic rating from reviews
  const { rating, totalReviews } = useRestaurantRating(restaurant?.id);

  // Cart management - Use CartContext to share state across app
  const { cart, addItem, clearCart, canAddFromRestaurant } = useContext(CartContext);

  // Local state for food detail popup
  const [selectedFood, setSelectedFood] = useState(null);
  const [showFoodPopup, setShowFoodPopup] = useState(false);

  // Dialog state for switching restaurant
  const [showSwitchDialog, setShowSwitchDialog] = useState(false);
  const [pendingFoodData, setPendingFoodData] = useState(null);

  if (loading) {
    return (
      <div className="restaurant-detail">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>Loading restaurant...</p>
        </div>
      </div>
    );
  }

  if (error || !restaurant) {
    return (
      <div className="restaurant-detail">
        <button className="back-button" onClick={() => navigate(-1)}>
          <MdArrowBack size={20} />
          Back
        </button>
        <div className="error-container">
          <p className="error-message">{error || "Restaurant not found"}</p>
        </div>
      </div>
    );
  }

  const bannerUrl = getImageUrl(restaurant.banner || restaurant.image);
  const isOpen = isRestaurantOpen(restaurant.opening_hours);
  const todayHours = getTodayHours(restaurant.opening_hours);

  console.log("Restaurant data:", restaurant);
  console.log("Banner URL:", bannerUrl);
  console.log("Is Open:", isOpen);
  console.log("Today Hours:", todayHours);

  /**
   * Handle food item click
   * Opens popup to add to cart
   */
  const handleFoodClick = (food) => {
    setSelectedFood(food);
    setShowFoodPopup(true);
  };

  /**
   * Handle adding food to cart
   * Check if can add from current restaurant, show dialog if switching
   */
  const handleAddToCart = async (foodId, quantity = 1) => {
    try {
      const can = canAddFromRestaurant(restaurant.id);

      if (can) {
        // Same restaurant or empty cart, add directly
        await addItem(restaurant.id, foodId, quantity, "");
        alert("✅ Added to cart!");
        setShowFoodPopup(false);
      } else {
        // Different restaurant, show warning dialog
        setPendingFoodData({ foodId, quantity });
        setShowSwitchDialog(true);
      }
    } catch (error) {
      console.error("Error adding to cart:", error);

      // Check if error is about different restaurant
      if (error.message?.includes("different restaurant")) {
        setPendingFoodData({ foodId, quantity });
        setShowSwitchDialog(true);
      } else {
        alert("❌ Error adding to cart: " + error.message);
      }
    }
  };

  /**
   * Handle confirming restaurant switch
   */
  const handleConfirmSwitch = async () => {
    try {
      // Clear old cart
      await clearCart();

      // Add new item from this restaurant
      if (pendingFoodData) {
        await addItem(
          restaurant.id,
          pendingFoodData.foodId,
          pendingFoodData.quantity,
          ""
        );
      }

      alert("✅ Cart updated!");
      setShowSwitchDialog(false);
      setPendingFoodData(null);
      setShowFoodPopup(false);
    } catch (error) {
      console.error("Error switching restaurant:", error);
      alert("❌ Error updating cart: " + error.message);
    }
  };

  /**
   * Handle cancel switching
   */
  const handleCancelSwitch = () => {
    setShowSwitchDialog(false);
    setPendingFoodData(null);
  };

  /**
   * Handle go to checkout with current cart
   */
  const handleGoToCheckout = () => {
    setShowSwitchDialog(false);
    setPendingFoodData(null);
    navigate("/cart");
  };

  return (
    <div className="restaurant-detail">
      {/* Back Button */}
      <button className="back-button" onClick={() => navigate(-1)}>
        <MdArrowBack size={20} />
        Back
      </button>

      {/* Restaurant Header */}
      <div className="restaurant-header">
        {/* Banner Image */}
        <div className="restaurant-banner">
          <img src={bannerUrl} alt={restaurant.name} />
        </div>

        {/* Restaurant Info Card */}
        <div className="restaurant-info">
          <h1 className="restaurant-name">{restaurant.name}</h1>

          <div className="restaurant-meta">
            {rating !== null || restaurant.rating > 0 && (
              <div className="restaurant-meta-item">
                <MdStar size={18} />
                <span>
                  {rating !== null ? rating.toFixed(1) : restaurant.rating.toFixed(1)} ({totalReviews || restaurant.reviewCount || 0}{" "}
                  reviews)
                </span>
              </div>
            )}

            {restaurant.address && (
              <div className="restaurant-meta-item">
                <MdLocationOn size={18} />
                <span>{restaurant.address}</span>
              </div>
            )}

            <span
              className={`restaurant-status ${isOpen ? "open" : "closed"
                }`}
            >
              {isOpen ? "Open Now" : "Closed"}
              {todayHours && (
                <span className="hours-info">
                  {todayHours.open} - {todayHours.close}
                </span>
              )}
            </span>
          </div>

          {restaurant.description && (
            <p className="restaurant-description">{restaurant.description}</p>
          )}
        </div>
      </div>

      {/* Menu Section */}
      <div className="restaurant-menu">
        {!isOpen && (
          <div className="closed-notice">
            <MdWarning size={20} />
            <div className="notice-content">
              <strong>This restaurant is currently closed</strong>
              {todayHours && <p>Hours: {todayHours.open} - {todayHours.close}</p>}
              <p>You can browse the menu, but cannot place an order now.</p>
            </div>
          </div>
        )}

        <div className="menu-header">
          <h2 className="menu-title">Menu</h2>

          {/* Category Filter */}
          {categories.length > 1 && (
            <div className="category-filter">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`category-button ${selectedCategory === category ? "active" : ""
                    }`}
                  onClick={() => setSelectedCategory(category)}
                >
                  {category}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Menu Items Grid */}
        {menuLoading ? (
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Loading menu...</p>
          </div>
        ) : filteredMenuItems.length > 0 ? (
          <div className="menu-items-grid">
            {filteredMenuItems.map((item) => (
              <FoodItem
                key={item.id}
                id={item.id}
                name={item.name}
                desc={item.description}
                price={item.price}
                image={item.image}
                restaurant={restaurant.name}
                rating={item.rating}
                sold={item.sold}
                restaurantId={restaurant.id}
                isRestaurantOpen={isOpen}
                onItemClick={handleFoodClick}
              />
            ))}
          </div>
        ) : (
          <div className="empty-container">
            <p className="empty-message">
              {selectedCategory === "All"
                ? "No menu items available"
                : `No items in ${selectedCategory} category`}
            </p>
          </div>
        )}
      </div>

      {/* Reviews Section */}
      <div className="restaurant-reviews">
        <RestaurantReviews
          restaurantId={restaurant.id || restaurant._id}
          maxReviews={5}
        />
      </div>

      {/* Food Detail Popup */}
      {showFoodPopup && selectedFood && (
        <FoodDetailPopup
          food={selectedFood}
          onClose={() => setShowFoodPopup(false)}
          addToCart={handleAddToCart}
          fromRestaurantDetail={true}
        />
      )}

      {/* Switch Restaurant Dialog */}
      <SwitchRestaurantDialog
        isOpen={showSwitchDialog}
        currentRestaurant={cart?.restaurant_name || "Unknown Restaurant"}
        newRestaurant={restaurant.name}
        onConfirm={handleConfirmSwitch}
        onCancel={handleCancelSwitch}
        onGoToCheckout={handleGoToCheckout}
        isLoading={false}
      />
    </div>
  );
};

export default RestaurantDetail;
