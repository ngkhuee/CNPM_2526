import React, { useState, useEffect, useContext } from "react";
import "./RestaurantProfile.css";
import defaultLogo from "../../assets/default_logo.png";
import defaultBanner from "../../assets/default_banner.png";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { authService } from "@api/services";
import { getImageUrl } from "@utils/imageHelper";
import {
  MdRestaurant,
  MdCamera,
  MdSave,
  MdClose,
  MdEdit,
  MdStar,
} from "react-icons/md";

const RestaurantProfile = () => {
  const { currentRestaurant, updateRestaurant, fetchRestaurantInfo } =
    useContext(RestaurantContext);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    location: {
      address: "",
      lat: 0,
      lng: 0,
    },
    ownerPhone: "",
    ownerEmail: "",
    category: "",
    image: "",
    banner: "",
  });
  const [loading, setLoading] = useState(false);

  // Load restaurant data from context
  useEffect(() => {
    if (currentRestaurant && !editing) {
      setFormData({
        name: currentRestaurant.name || "",
        location: {
          address: currentRestaurant.location?.address || "",
          lat: currentRestaurant.location?.lat || 0,
          lng: currentRestaurant.location?.lng || 0,
        },
        ownerPhone: currentRestaurant.ownerPhone || "",
        ownerEmail: currentRestaurant.ownerEmail || "",
        category: currentRestaurant.category || "",
        image: currentRestaurant.image || "",
        banner: currentRestaurant.banner || "",
      });
    }
  }, [currentRestaurant, editing]);

  // Save restaurant data
  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const user = authService.getCurrentUser();
      if (!user || !user.restaurantId) {
        alert(" Restaurant ID not found!");
        return;
      }

      const result = await updateRestaurant(user.restaurantId, formData);

      if (result.success) {
        setEditing(false);
        alert("✅ Restaurant information updated successfully!");
      } else {
        alert(` Failed to update: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert(" An error occurred while saving!");
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh logo hoặc banner
  const handleImageUpload = (e, type) => {
    e.preventDefault(); // Prevent form submission
    e.stopPropagation(); // Stop event bubbling

    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle input change
  const handleChange = (field, value) => {
    if (field.includes(".")) {
      // For nested fields like location.address
      const [parent, child] = field.split(".");
      setFormData((prev) => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value,
        },
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  // Get image source with proper URL
  const getImageSrc = (imagePath) => {
    if (!imagePath) return null;

    // If base64 image (newly uploaded)
    if (imagePath.startsWith("data:image")) {
      return imagePath;
    }

    // If already full URL
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath;
    }

    // If path from backend, use helper
    const fullUrl = getImageUrl(imagePath);
    console.log("Image path:", imagePath, "→", fullUrl);
    return fullUrl;
  };
  return (
    <div className="main-content">
      <div className="restaurant-profile">
        <h2>
          <MdRestaurant /> Restaurant Profile
        </h2>

        {/* BANNER */}
        <div className="banner-section">
          <img
            src={getImageSrc(formData.banner) || defaultBanner}
            alt="banner"
            className="restaurant-banner"
            onError={(e) => {
              e.target.src = defaultBanner;
            }}
          />
          {editing && (
            <div className="upload-banner-btn">
              <label htmlFor="banner-upload">
                <MdCamera /> Change Banner
              </label>
              <input
                id="banner-upload"
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e, "banner")}
              />
            </div>
          )}
        </div>

        {/* LOGO + INFO */}
        <div className="profile-container">
          <div className="left">
            <img
              src={getImageSrc(formData.image) || defaultLogo}
              alt="logo"
              className="restaurant-logo"
              onError={(e) => {
                e.target.src = defaultLogo;
              }}
            />
            {editing && (
              <div className="upload-logo-btn">
                <label htmlFor="logo-upload">
                  <MdCamera /> Change Logo
                </label>
                <input
                  id="logo-upload"
                  type="file"
                  accept="image/*"
                  hidden
                  onChange={(e) => handleImageUpload(e, "image")}
                />
              </div>
            )}
          </div>

          <div className="right">
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label htmlFor="restaurant-name">Restaurant Name:</label>
                <input
                  id="restaurant-name"
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="restaurant-address">Address:</label>
                <input
                  id="restaurant-address"
                  type="text"
                  value={formData.location.address}
                  onChange={(e) =>
                    handleChange("location.address", e.target.value)
                  }
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="restaurant-phone">Phone:</label>
                <input
                  id="restaurant-phone"
                  type="tel"
                  value={formData.ownerPhone}
                  onChange={(e) => handleChange("ownerPhone", e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="restaurant-email">Email:</label>
                <input
                  id="restaurant-email"
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => handleChange("ownerEmail", e.target.value)}
                  disabled={!editing}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="restaurant-category">Category:</label>
                <input
                  id="restaurant-category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => handleChange("category", e.target.value)}
                  disabled={!editing}
                  placeholder="e.g., Pizza, Burger, Chicken"
                />
              </div>

              <div className="location-row">
                <div className="form-group">
                  <label htmlFor="restaurant-lat">Latitude:</label>
                  <input
                    id="restaurant-lat"
                    type="number"
                    step="0.000001"
                    value={formData.location.lat}
                    onChange={(e) =>
                      handleChange("location.lat", parseFloat(e.target.value))
                    }
                    disabled={!editing}
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="restaurant-lng">Longitude:</label>
                  <input
                    id="restaurant-lng"
                    type="number"
                    step="0.000001"
                    value={formData.location.lng}
                    onChange={(e) =>
                      handleChange("location.lng", parseFloat(e.target.value))
                    }
                    disabled={!editing}
                  />
                </div>
              </div>

              {currentRestaurant && (
                <div className="readonly-info">
                  <p>
                    <strong>Rating:</strong> <MdStar />{" "}
                    {currentRestaurant.rating}
                  </p>
                  <p>
                    <strong>Reviews:</strong> {currentRestaurant.reviewCount}
                  </p>
                  <p>
                    <strong>Status:</strong> {currentRestaurant.status}
                  </p>
                  <p>
                    <strong>Opened:</strong>{" "}
                    {new Date(currentRestaurant.openedAt).toLocaleDateString()}
                  </p>
                </div>
              )}

              <div className="button-group">
                {editing ? (
                  <>
                    <button
                      type="submit"
                      className="save-btn"
                      disabled={loading}
                    >
                      <MdSave /> {loading ? "Saving..." : "Save"}
                    </button>
                    <button
                      type="button"
                      className="cancel-btn"
                      onClick={() => {
                        setEditing(false);
                        // Reset form to current restaurant data
                        if (currentRestaurant) {
                          setFormData({
                            name: currentRestaurant.name || "",
                            location: currentRestaurant.location || {},
                            ownerPhone: currentRestaurant.ownerPhone || "",
                            ownerEmail: currentRestaurant.ownerEmail || "",
                            category: currentRestaurant.category || "",
                            image: currentRestaurant.image || "",
                            banner: currentRestaurant.banner || "",
                          });
                        }
                      }}
                      disabled={loading}
                    >
                      <MdClose /> Cancel
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className="edit-btn"
                    onClick={() => setEditing(true)}
                  >
                    <MdEdit /> Edit Info
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RestaurantProfile;
