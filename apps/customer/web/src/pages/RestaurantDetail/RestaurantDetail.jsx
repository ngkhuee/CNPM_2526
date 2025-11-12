import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  MdArrowBack,
  MdLocationOn,
  MdStar,
  MdAccessTime,
  MdDeliveryDining,
  MdWarning,
} from "react-icons/md";
import useRestaurantDetail from "customer-shared/hooks/useRestaurantDetail";
import FoodItem from "../../components/FoodItem/FoodItem";
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
            {restaurant.rating > 0 && (
              <div className="restaurant-meta-item">
                <MdStar size={18} />
                <span>
                  {restaurant.rating.toFixed(1)} ({restaurant.reviewCount || 0}{" "}
                  reviews)
                </span>
              </div>
            )}

            {restaurant.deliveryTime && (
              <div className="restaurant-meta-item">
                <MdAccessTime size={18} />
                <span>{restaurant.deliveryTime} mins</span>
              </div>
            )}

            {restaurant.minOrderAmount && (
              <div className="restaurant-meta-item">
                <MdDeliveryDining size={18} />
                <span>Min. order: ${restaurant.minOrderAmount}</span>
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
                isRestaurantOpen={isOpen}
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
    </div>
  );
};

export default RestaurantDetail;
