import React, { useState, useEffect } from "react";
import "./RestaurantProfile.css";
import defaultLogo from "../../assets/default_logo.png";
import defaultBanner from "../../assets/default_banner.png";

const RestaurantProfile = () => {
  const [restaurant, setRestaurant] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    openTime: "",
    closeTime: "",
    description: "",
    logo: "",
    banner: "",
  });

  const [editing, setEditing] = useState(false);

  // Load dữ liệu từ localStorage khi vào trang
//   useEffect(() => {
//     const storedData = JSON.parse(localStorage.getItem("restaurantInfo") || "{}");
//     if (storedData.name) setRestaurant(storedData);
//   }, []);
    useEffect(() => {
    const currentUser = JSON.parse(localStorage.getItem("loggedInRestaurant"));
    if (currentUser) {
        const storedData = JSON.parse(localStorage.getItem(`restaurantInfo_${currentUser}`) || "{}");
        if (storedData.name) setRestaurant(storedData);
    }
    }, []);


  // Hàm lưu dữ liệu
    //   const handleSave = (e) => {
    //     e.preventDefault();
    //     localStorage.setItem("restaurantInfo", JSON.stringify(restaurant));
    //     setEditing(false);
    //     alert("✅ Restaurant information updated successfully!");
    //   };
    const handleSave = (e) => {
    e.preventDefault();
    const currentUser = JSON.parse(localStorage.getItem("loggedInRestaurant"));
    if (currentUser) {
        localStorage.setItem(`restaurantInfo_${currentUser}`, JSON.stringify(restaurant));
    }
    setEditing(false);
    alert("✅ Restaurant information updated successfully!");
    };


  // Upload ảnh logo hoặc banner
  const handleImageUpload = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setRestaurant((prev) => ({ ...prev, [type]: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="main-content">
        <div className="restaurant-profile">
        <h2>🏠 Restaurant Profile</h2>

        {/* BANNER */}
        <div className="banner-section">
            <img
            src={restaurant.banner || defaultBanner}
            alt="banner"
            className="restaurant-banner"
            />
            {editing && (
            <label className="upload-banner-btn">
                📷 Change Banner
                <input
                type="file"
                accept="image/*"
                hidden
                onChange={(e) => handleImageUpload(e, "banner")}
                />
            </label>
            )}
        </div>

        {/* LOGO + INFO */}
        <div className="profile-container">
            <div className="left">
            <img
                src={restaurant.logo || defaultLogo}
                alt="logo"
                className="restaurant-logo"
            />
            {editing && (
                <label className="upload-logo-btn">
                📸 Change Logo
                <input
                    type="file"
                    accept="image/*"
                    hidden
                    onChange={(e) => handleImageUpload(e, "logo")}
                />
                </label>
            )}
            </div>

            <div className="right">
            <form onSubmit={handleSave}>
                <label>
                Name:
                <input
                    type="text"
                    value={restaurant.name}
                    onChange={(e) =>
                    setRestaurant({ ...restaurant, name: e.target.value })
                    }
                    disabled={!editing}
                    required
                />
                </label>

                <label>
                Address:
                <input
                    type="text"
                    value={restaurant.address}
                    onChange={(e) =>
                    setRestaurant({ ...restaurant, address: e.target.value })
                    }
                    disabled={!editing}
                    required
                />
                </label>

                <label>
                Phone:
                <input
                    type="tel"
                    value={restaurant.phone}
                    onChange={(e) =>
                    setRestaurant({ ...restaurant, phone: e.target.value })
                    }
                    disabled={!editing}
                    required
                />
                </label>

                <label>
                Email:
                <input
                    type="email"
                    value={restaurant.email}
                    onChange={(e) =>
                    setRestaurant({ ...restaurant, email: e.target.value })
                    }
                    disabled={!editing}
                    required
                />
                </label>

                <div className="time-row">
                <label>
                    Opens:
                    <input
                    type="time"
                    value={restaurant.openTime}
                    onChange={(e) =>
                        setRestaurant({ ...restaurant, openTime: e.target.value })
                    }
                    disabled={!editing}
                    />
                </label>
                <label>
                    Closes:
                    <input
                    type="time"
                    value={restaurant.closeTime}
                    onChange={(e) =>
                        setRestaurant({ ...restaurant, closeTime: e.target.value })
                    }
                    disabled={!editing}
                    />
                </label>
                </div>

                <label>
                Description:
                <textarea
                    value={restaurant.description}
                    onChange={(e) =>
                    setRestaurant({ ...restaurant, description: e.target.value })
                    }
                    disabled={!editing}
                    rows="4"
                />
                </label>

                <div className="button-group">
                {editing ? (
                    <>
                    <button type="submit" className="save-btn">
                        💾 Save
                    </button>
                    <button
                        type="button"
                        className="cancel-btn"
                        onClick={() => setEditing(false)}
                    >
                        ❌ Cancel
                    </button>
                    </>
                ) : (
                    <button
                    type="button"
                    className="edit-btn"
                    onClick={() => setEditing(true)}
                    >
                    ✏️ Edit Info
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
