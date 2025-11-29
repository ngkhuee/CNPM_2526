import React, { useState, useContext, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { StoreContext, CartContext } from 'customer-shared';
import { MdChevronLeft, MdChevronRight, MdRestaurant, MdSearch, MdStar } from 'react-icons/md';
import { getImageUrl } from 'shared-utils';
import AppDownload from '../../components/AppDownload/AppDownload';
import './Menu.css';

const Menu = () => {
  const { food_list, restaurant_list, loading } = useContext(StoreContext);
  const { addItem } = useContext(CartContext);
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');

  // Debug logging
  useEffect(() => {
    console.log('[Menu] Data loaded:', {
      foods: food_list?.length || 0,
      restaurants: restaurant_list?.length || 0,
      sampleFood: food_list?.[0]
    });
  }, [food_list, restaurant_list]);

  // Group foods by restaurant
  const restaurantsWithFoods = restaurant_list
    .filter(restaurant => restaurant.status === 'active')
    .map(restaurant => {
      let restaurantFoods = food_list.filter(
        food => food.restaurantId === restaurant.id && food.isAvailable !== false
      );

      // Filter foods by search query if exists
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchRestaurant = restaurant.name.toLowerCase().includes(query);

        // If restaurant name matches, show all foods
        // Otherwise, only show foods that match the query
        if (!matchRestaurant) {
          restaurantFoods = restaurantFoods.filter(food =>
            food.name.toLowerCase().includes(query) ||
            (food.description && food.description.toLowerCase().includes(query))
          );
        }
      }

      console.log(`[Menu] Restaurant "${restaurant.name}": ${restaurantFoods.length} foods`);

      return {
        ...restaurant,
        foods: restaurantFoods
      };
    })
    .filter(restaurant => restaurant.foods.length > 0);

  console.log('[Menu] Final restaurants with foods:', restaurantsWithFoods.length); const handleViewRestaurant = (restaurantId) => {
    navigate(`/restaurant/${restaurantId}`);
  };

  if (loading) {
    return (
      <div className="menu-page">
        <div className="menu-loading">
          <p>Đang tải thực đơn...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="menu-page">
        {/* Header Section */}
        <div className="menu-header">
          <h1>
            <MdRestaurant size={36} />
            Thực đơn
          </h1>
          <p>Khám phá món ăn từ các nhà hàng xung quanh bạn</p>

          {/* Search Bar */}
          <div className="menu-search">
            <MdSearch size={24} />
            <input
              type="text"
              placeholder="Tìm nhà hàng hoặc món ăn..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Restaurant Sections */}
        <div className="menu-restaurants">
          {restaurantsWithFoods.length === 0 ? (
            <div className="menu-empty">
              <p>Không tìm thấy món ăn nào</p>
            </div>
          ) : (
            restaurantsWithFoods.map((restaurant) => (
              <RestaurantSection
                key={restaurant.id}
                restaurant={restaurant}
                onViewRestaurant={handleViewRestaurant}
                onAddToCart={addItem}
              />
            ))
          )}
        </div>
      </div>
      <AppDownload />
    </>
  );
};

// Restaurant Section Component with Horizontal Scroll
const RestaurantSection = ({ restaurant, onViewRestaurant, onAddToCart }) => {
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  useEffect(() => {
    checkScroll();
  }, [restaurant.foods]);

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = 300;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });

      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="menu-restaurant-section">
      {/* Restaurant Header */}
      <div className="menu-restaurant-header">
        <div className="menu-restaurant-info">
          <img
            src={getImageUrl(restaurant.image)}
            alt={restaurant.name}
            className="menu-restaurant-avatar"
          />
          <div className="menu-restaurant-details">
            <h2>{restaurant.name}</h2>
            <div className="menu-restaurant-meta">
              <span className="menu-rating">
                <MdStar /> {(restaurant.rating || 0).toFixed(1)}
              </span>
              <span className="menu-food-count">{restaurant.foods.length} món</span>
            </div>
          </div>
        </div>
        <a
          href={`/restaurant/${restaurant.id}`}
          className="menu-link-view-restaurant"
          onClick={(e) => {
            e.preventDefault();
            onViewRestaurant(restaurant.id);
          }}
        >
          Xem chi tiết <MdChevronRight size={20} style={{ verticalAlign: 'middle' }} />
        </a>
      </div>

      {/* Food Items Horizontal Scroll */}
      <div className="food-scroll-container">
        {canScrollLeft && (
          <button
            className="scroll-btn scroll-left"
            onClick={() => scroll('left')}
          >
            <MdChevronLeft size={24} />
          </button>
        )}

        <div
          className="food-items-scroll"
          ref={scrollRef}
          onScroll={checkScroll}
        >
          {restaurant.foods.map((food) => (
            <FoodCard
              key={food.id}
              food={food}
              restaurantId={restaurant.id}
            />
          ))}
        </div>

        {canScrollRight && (
          <button
            className="scroll-btn scroll-right"
            onClick={() => scroll('right')}
          >
            <MdChevronRight size={24} />
          </button>
        )}
      </div>
    </div>
  );
};

// Food Card Component
const FoodCard = ({ food, restaurantId }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    // Navigate to restaurant page with food ID as query param to open modal
    navigate(`/restaurant/${restaurantId}?food=${food.id}`);
  };

  return (
    <div className="menu-food-card" onClick={handleClick}>
      <img src={getImageUrl(food.image)} alt={food.name} />
      <div className="food-card-content">
        <h3>{food.name}</h3>
        {food.description && (
          <p className="food-description">{food.description}</p>
        )}
        <div className="food-card-footer">
          <div className="food-price">
            {food.price?.toLocaleString('vi-VN')}₫
          </div>
          {food.rating > 0 && (
            <div className="food-rating">
              <MdStar size={14} /> {food.rating.toFixed(1)}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Menu;
