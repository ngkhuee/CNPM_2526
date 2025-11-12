import React, { useState, useEffect, useContext } from "react";
import "./RestaurantProfile.css";
import defaultLogo from "../../assets/default_logo.png";
import defaultBanner from "../../assets/default_banner.png";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { AuthContext } from "../../Context/AuthContext";
import { getImageUrl } from "@utils/imageHelper";
import {
  MdRestaurant,
  MdCamera,
  MdSave,
  MdClose,
  MdEdit,
  MdStar,
  MdAccessTime,
} from "react-icons/md";

const DAYS_OF_WEEK = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
];

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
    opening_hours: {
      monday: { open: "09:00", close: "22:00" },
      tuesday: { open: "09:00", close: "22:00" },
      wednesday: { open: "09:00", close: "22:00" },
      thursday: { open: "09:00", close: "22:00" },
      friday: { open: "09:00", close: "23:00" },
      saturday: { open: "09:00", close: "23:00" },
      sunday: { open: "09:00", close: "22:00" },
    },
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
        opening_hours: currentRestaurant.opening_hours || {
          monday: { open: "09:00", close: "22:00" },
          tuesday: { open: "09:00", close: "22:00" },
          wednesday: { open: "09:00", close: "22:00" },
          thursday: { open: "09:00", close: "22:00" },
          friday: { open: "09:00", close: "23:00" },
          saturday: { open: "09:00", close: "23:00" },
          sunday: { open: "09:00", close: "22:00" },
        },
      });
    }
  }, [currentRestaurant, editing]);

  const { currentUser } = useContext(AuthContext);

  // Save restaurant data
  const handleSave = async (e) => {
    e.preventDefault();

    if (!editing) {
      console.warn("Save called but not in editing mode!");
      return;
    }

    // Validate opening hours format
    for (const [day, times] of Object.entries(formData.opening_hours)) {
      if (times && times.open && times.close) {
        const timeRegex = /^\d{2}:\d{2}$/;
        if (!timeRegex.test(times.open) || !timeRegex.test(times.close)) {
          alert(`Invalid time format for ${day}. Use HH:mm format (e.g., 09:00)`);
          return;
        }
        if (times.open >= times.close) {
          alert(`Opening time must be earlier than closing time for ${day}`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (!currentUser || !currentUser.restaurantId) {
        alert("Restaurant ID not found!");
        return;
      }

      const result = await updateRestaurant(currentUser.restaurantId, formData);

      if (result.success) {
        setEditing(false);
        alert("Restaurant information updated successfully!");
      } else {
        alert(`Failed to update: ${result.message}`);
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert("An error occurred while saving!");
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh logo hoặc banner
  const handleImageUpload = (e, type) => {
    // Don't prevent default here - this is file input onChange, not form submit
    const file = e.target.files?.[0];
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
      const parts = field.split(".");
      if (parts.length === 3) {
        // For triple nested like opening_hours.monday.open
        const [parent, child, grandchild] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: {
              ...prev[parent][child],
              [grandchild]: value,
            },
          },
        }));
      } else {
        // For double nested like location.address
        const [parent, child] = parts;
        setFormData((prev) => ({
          ...prev,
          [parent]: {
            ...prev[parent],
            [child]: value,
          },
        }));
      }
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
            <form
              onSubmit={handleSave}
              onKeyDown={(e) => {
                // Prevent Enter key from submitting form when not in editing mode
                if (e.key === "Enter" && !editing) {
                  e.preventDefault();
                }
              }}
            >
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

              {editing && (
                <div className="opening-hours-section">
                  <div className="section-header">
                    <MdAccessTime style={{ fontSize: "18px" }} />
                    <label>Opening Hours</label>
                  </div>
                  <div className="hours-grid">
                    {DAYS_OF_WEEK.map((day) => (
                      <div key={day} className="hours-input-group">
                        <label htmlFor={`hours-${day}`} className="day-label">
                          {day.charAt(0).toUpperCase() + day.slice(1)}
                        </label>
                        <div className="time-inputs">
                          <input
                            id={`open-${day}`}
                            type="time"
                            value={formData.opening_hours[day]?.open || "09:00"}
                            onChange={(e) =>
                              handleChange(`opening_hours.${day}.open`, e.target.value)
                            }
                            className="hours-input"
                            title="Opening time (HH:mm)"
                          />
                          <span className="time-separator">to</span>
                          <input
                            id={`close-${day}`}
                            type="time"
                            value={formData.opening_hours[day]?.close || "22:00"}
                            onChange={(e) =>
                              handleChange(`opening_hours.${day}.close`, e.target.value)
                            }
                            className="hours-input"
                            title="Closing time (HH:mm)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <small style={{ color: "#666", marginTop: "8px", display: "block" }}>
                    Set opening and closing times separately for each day.
                  </small>
                </div>
              )}

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
                      onClick={(e) => {
                        e.preventDefault(); // Prevent form submission
                        e.stopPropagation(); // Stop event bubbling
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
                    onClick={(e) => {
                      e.preventDefault(); // Prevent any default behavior
                      e.stopPropagation(); // Stop event bubbling
                      setEditing(true);
                    }}
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
