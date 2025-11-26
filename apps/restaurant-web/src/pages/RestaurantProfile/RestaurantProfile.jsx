import React, { useState, useEffect, useContext } from "react";
import "./RestaurantProfile.css";
import defaultLogo from "../../assets/default_logo.png";
import defaultBanner from "../../assets/default_banner.png";
import { RestaurantContext } from "../../Context/RestaurantContext";
import { AuthContext } from "../../Context/AuthContext";
import { getImageUrl } from "@utils/imageHelper";
import { formatRating } from "@utils/formatters";
import { uploadService } from "shared-services";
import { useRestaurantRating } from "shared-hooks";
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

  // Get dynamic rating from reviews
  const { rating, totalReviews } = useRestaurantRating(currentRestaurant?.id);

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
          alert(
            `Định dạng giờ không hợp lệ cho ${day}. Sử dụng định dạng HH:mm (ví dụ: 09:00)`
          );
          return;
        }
        if (times.open >= times.close) {
          alert(`Giờ mở cửa phải sớm hơn giờ đóng cửa cho ${day}`);
          return;
        }
      }
    }

    setLoading(true);

    try {
      if (!currentUser || !currentUser.restaurantId) {
        alert("Không tìm thấy ID nhà hàng!");
        return;
      }

      console.log("DEBUG - Saving restaurant data:");
      console.log("  User:", currentUser);
      console.log("  Restaurant ID:", currentUser.restaurantId);
      console.log("  Token in localStorage:", !!localStorage.getItem("token"));
      console.log("  Form data:", formData);
      const result = await updateRestaurant(currentUser.restaurantId, formData);
      console.log("DEBUG - Update result:", result);

      if (result.success) {
        setEditing(false);
        alert("Đã cập nhật thông tin nhà hàng thành công!");
        // Refresh restaurant data
        await fetchRestaurantInfo(currentUser.restaurantId);
      } else {
        console.error("Update failed:", result.message);

        // Check if token expired
        if (
          result.message.includes("Invalid or expired token") ||
          result.message.includes("Unauthorized")
        ) {
          alert("Phiên làm việc đã hết hạn. Vui lòng đăng nhập lại.");
          localStorage.removeItem("token");
          localStorage.removeItem("user");
          window.location.href = "/login";
        } else {
          alert(`Cập nhật thất bại: ${result.message}`);
        }
      }
    } catch (error) {
      console.error("Error saving restaurant:", error);
      alert(`Có lỗi xảy ra khi lưu: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Upload ảnh logo hoặc banner
  const handleImageUpload = async (e, type) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        setLoading(true);
        // Upload file to server
        // Use "restaurants" category for logo, "other" for banner
        const category = type === "banner" ? "other" : "restaurants";
        const uploadResult = await uploadService.uploadImage(file, category);

        if (uploadResult.success) {
          // Set form data with uploaded path (not base64)
          setFormData((prev) => ({ ...prev, [type]: uploadResult.path }));
        } else {
          alert("Tải ảnh lên thất bại");
        }
      } catch (error) {
        console.error("Error uploading image:", error);
        alert("Lỗi khi tải ảnh lên");
      } finally {
        setLoading(false);
      }
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
          <MdRestaurant /> Hồ sơ Nhà hàng
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
                <MdCamera /> Thay đổi Ảnh bìa
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
                  <MdCamera /> Thay đổi Logo
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
                <label htmlFor="restaurant-name">Tên nhà hàng:</label>
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
                <label htmlFor="restaurant-address">Địa chỉ:</label>
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
                <label htmlFor="restaurant-phone">Số điện thoại:</label>
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
                    <label>Giờ mở cửa</label>
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
                              handleChange(
                                `opening_hours.${day}.open`,
                                e.target.value
                              )
                            }
                            className="hours-input"
                            title="Opening time (HH:mm)"
                          />
                          <span className="time-separator">đến</span>
                          <input
                            id={`close-${day}`}
                            type="time"
                            value={
                              formData.opening_hours[day]?.close || "22:00"
                            }
                            onChange={(e) =>
                              handleChange(
                                `opening_hours.${day}.close`,
                                e.target.value
                              )
                            }
                            className="hours-input"
                            title="Closing time (HH:mm)"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                  <small
                    style={{
                      color: "#666",
                      marginTop: "8px",
                      display: "block",
                    }}
                  >
                    Đặt giờ mở cửa và đóng cửa riêng biệt cho từng ngày.
                  </small>
                </div>
              )}

              {currentRestaurant && (
                <div className="readonly-info">
                  <p>
                    <strong>Đánh giá:</strong> <MdStar />{" "}
                    {formatRating(rating !== null ? rating : currentRestaurant.rating)}
                  </p>
                  <p>
                    <strong>Lượt đánh giá:</strong> {totalReviews}
                  </p>
                  <p>
                    <strong>Trạng thái:</strong> {currentRestaurant.status}
                  </p>
                  <p>
                    <strong>Ngày mở:</strong>{" "}
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
                      <MdSave /> {loading ? "Đang lưu..." : "Lưu"}
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
                      <MdClose /> Hủy
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
                    <MdEdit /> Chỉnh sửa
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
