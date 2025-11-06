import React, { useContext, useMemo } from "react";
import "./ExploreMenu.css";
import { StoreContext } from "customer-shared";
import { MdRestaurant, MdLocationOn, MdSearchOff } from "react-icons/md";
import { getImageUrl } from "@utils/imageHelper";

// Calculate distance between two GPS coordinates using Haversine formula
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  return distance;
};

const ExploreMenu = ({ selected, setSelected, userLocation }) => {
  const { restaurant_list, loading } = useContext(StoreContext);

  // Transform and filter restaurant data for display
  const restaurants = useMemo(() => {
    let filteredList = restaurant_list;

    // If user location is available, filter by 5km radius
    if (userLocation && userLocation.latitude && userLocation.longitude) {
      console.log("User location:", userLocation);
      console.log("Total restaurants:", restaurant_list.length);

      filteredList = restaurant_list
        .map((r) => {
          // Calculate distance if restaurant has coordinates
          // Support both formats: r.location.lat/lng OR r.latitude/longitude
          const lat = r.location?.lat || r.latitude;
          const lng = r.location?.lng || r.longitude;

          if (lat && lng) {
            const distance = calculateDistance(
              userLocation.latitude,
              userLocation.longitude,
              lat,
              lng
            );
            console.log(
              `${r.name}: ${distance.toFixed(2)} km (lat: ${lat}, lng: ${lng})`
            );
            return { ...r, distance };
          }
          console.log(`${r.name}: No coordinates available`);
          return { ...r, distance: null };
        })
        .filter((r) => {
          const isWithin5km = r.distance !== null && r.distance <= 5;
          if (!isWithin5km && r.distance !== null) {
            console.log(
              `${r.name} excluded: ${r.distance.toFixed(2)} km > 5 km`
            );
          }
          return isWithin5km;
        })
        .sort((a, b) => a.distance - b.distance); // Sort by distance (nearest first)

      console.log("Restaurants within 5km:", filteredList.length);
    }

    const result = filteredList.map((r) => {
      const imagePath = r.image || r.images?.[0] || "/default-restaurant.png";
      const imageUrl = getImageUrl(imagePath); // Convert to full URL
      console.log(
        `Restaurant: ${r.name}, image path: ${imagePath}, full URL: ${imageUrl}`
      );
      return {
        name: r.name,
        image: imageUrl,
        distance: r.distance || null,
      };
    });

    console.log("Final restaurants to display:", result);
    return result;
  }, [restaurant_list, userLocation]);

  return (
    <div className="explore-menu" id="explore-menu">
      <h1 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
        {userLocation ? (
          <>
            <MdLocationOn size={32} style={{ color: "#ff6b35" }} />
            Restaurants Near You (Within 5km)
          </>
        ) : (
          <>
            <MdRestaurant size={32} />
            Explore New Restaurants
          </>
        )}
      </h1>
      <p className="explore-menu-text">
        {userLocation
          ? `We found ${restaurants.length} restaurant${restaurants.length !== 1 ? "s" : ""} near your location. Click on any restaurant to explore their menu!`
          : "Choose from a wide selection of restaurants, each offering unique flavors and dining styles. Our mission is to satisfy your cravings and elevate your food journey, one memorable restaurant experience at a time."}
      </p>

      {/* Debug info - remove in production */}
      {userLocation && (
        <p style={{ fontSize: "12px", color: "#999", marginTop: "-10px" }}>
          Your location: {userLocation.latitude.toFixed(4)}°N,{" "}
          {userLocation.longitude.toFixed(4)}°E
        </p>
      )}

      {/* <div className="explore-menu-list">
        {menu_list.slice(0,6).map((item,index)=>{
            return (
                <div onClick={()=>setCategory(prev=>prev===item.menu_name?"All":item.menu_name)} key={index} className='explore-menu-list-item'>
                    <img src={item.menu_image} className={category===item.menu_name?"active":""} alt="" />
                    <p>{item.menu_name}</p>
                </div>
            )
        })}
      </div> */}

      <div className="explore-menu-list">
        {loading ? (
          <p>Loading restaurants...</p>
        ) : restaurants.length === 0 ? (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "#666",
              width: "100%",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "10px",
            }}
          >
            <MdSearchOff size={48} style={{ color: "#999" }} />
            <p
              style={{
                fontSize: "18px",
                marginBottom: "10px",
                fontWeight: "500",
              }}
            >
              No restaurants found within 5km
            </p>
            <p style={{ fontSize: "14px" }}>
              Try browsing all restaurants or check back later!
            </p>
          </div>
        ) : (
          restaurants.map((restaurant, index) => (
            <div
              key={index}
              className={`explore-menu-list-item ${selected === restaurant.name ? "active" : ""}`}
              onClick={() =>
                setSelected((prev) =>
                  prev === restaurant.name ? "All" : restaurant.name
                )
              }
            >
              <img
                src={restaurant.image}
                alt={restaurant.name}
                onError={(e) => {
                  console.error(
                    `Failed to load image for ${restaurant.name}:`,
                    restaurant.image
                  );
                  e.target.src = "/default-restaurant.png";
                }}
              />
              <p>{restaurant.name}</p>
              {restaurant.distance !== null && (
                <span
                  style={{
                    fontSize: "12px",
                    color: "#666",
                    marginTop: "4px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "4px",
                  }}
                >
                  <MdLocationOn size={14} />
                  {restaurant.distance.toFixed(1)} km
                </span>
              )}
            </div>
          ))
        )}
      </div>

      <hr />
    </div>
  );
};

export default ExploreMenu;
