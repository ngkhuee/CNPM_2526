import React, { useContext, useState, useEffect } from "react";
import { StoreContext, useAddresses } from "customer-shared";
import "./Profile.css";
import {
  MdLocationOn,
  MdCheckCircle,
  MdEdit,
  MdDelete,
  MdAdd,
} from "react-icons/md";

const Profile = () => {
  const { user, setUser } = useContext(StoreContext);
  const {
    addresses,
    loading: addressLoading,
    addAddress: addAddressHook,
    deleteAddress: deleteAddressHook,
    setDefaultAddress,
  } = useAddresses(user?.id);

  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [newAddress, setNewAddress] = useState({
    address_line: "",
    city: "TP.HCM",
    district: "",
    lat: null,
    lng: null,
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setNewAddress((prev) => ({ ...prev, [name]: value }));
  };

  const handleGetGPS = () => {
    if (!navigator.geolocation) {
      alert("Trình duyệt không hỗ trợ GPS");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setNewAddress((prev) => ({
          ...prev,
          lat: latitude,
          lng: longitude,
        }));
        alert(`Đã lấy GPS: ${latitude.toFixed(4)}, ${longitude.toFixed(4)}`);
      },
      (error) => {
        console.error("GPS error:", error);
        alert("Không thể lấy GPS");
      }
    );
  };

  const handleSaveProfile = async () => {
    try {
      setLoading(true);
      // Update user info via API (you'd need to implement this endpoint)
      // For now, just update local storage
      const updatedUser = { ...user, ...formData };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      setEditing(false);
      alert("Cập nhật thông tin thành công!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Lỗi cập nhật thông tin");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAddress = async () => {
    if (!newAddress.address_line || !newAddress.district) {
      alert("Vui lòng nhập đầy đủ thông tin địa chỉ");
      return;
    }

    try {
      setLoading(true);
      const result = await addAddressHook(newAddress);

      if (result.success) {
        // Reset form
        setNewAddress({
          address_line: "",
          city: "TP.HCM",
          district: "",
          lat: null,
          lng: null,
        });
        setShowAddressForm(false);
        alert("Thêm địa chỉ thành công!");
      } else {
        alert(`Lỗi thêm địa chỉ: ${result.message}`);
      }
    } catch (error) {
      console.error("Error adding address:", error);
      alert("Lỗi thêm địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;

    try {
      setLoading(true);
      const result = await deleteAddressHook(addressId);
      if (result.success) {
        alert("Đã xóa địa chỉ");
      } else {
        alert(`Lỗi xóa địa chỉ: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Lỗi xóa địa chỉ");
    } finally {
      setLoading(false);
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      setLoading(true);
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        alert("Đã đặt làm địa chỉ mặc định");
      } else {
        alert(`Lỗi đặt địa chỉ mặc định: ${result.message}`);
      }
    } catch (error) {
      console.error("Error setting default:", error);
      alert("Lỗi đặt địa chỉ mặc định");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return <div className="profile-page">Vui lòng đăng nhập</div>;
  }

  return (
    <div className="profile-page">
      <h1>Thông tin cá nhân</h1>

      {/* User Info Section */}
      <div className="profile-section">
        <h2>Thông tin tài khoản</h2>
        <div className="profile-form">
          <div className="form-group">
            <label>Họ tên</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>
          <div className="form-group">
            <label>Số điện thoại</label>
            <input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!editing}
            />
          </div>

          <div className="profile-actions">
            {editing ? (
              <>
                <button onClick={handleSaveProfile} disabled={loading}>
                  {loading ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button onClick={() => setEditing(false)}>Hủy</button>
              </>
            ) : (
              <button onClick={() => setEditing(true)}>Chỉnh sửa</button>
            )}
          </div>
        </div>
      </div>

      {/* Addresses Section */}
      <div className="profile-section">
        <div className="section-header">
          <h2>Địa chỉ giao hàng</h2>
          <button
            onClick={() => setShowAddressForm(!showAddressForm)}
            style={{ display: "flex", alignItems: "center", gap: "8px" }}
          >
            {showAddressForm ? (
              "Đóng"
            ) : (
              <>
                <MdAdd /> Thêm địa chỉ
              </>
            )}
          </button>
        </div>

        {showAddressForm && (
          <div className="address-form">
            <div className="form-group">
              <label>Địa chỉ chi tiết</label>
              <input
                type="text"
                name="address_line"
                value={newAddress.address_line}
                onChange={handleAddressInputChange}
                placeholder="Số nhà, tên đường..."
              />
            </div>
            <div className="form-group">
              <label>Quận/Huyện</label>
              <input
                type="text"
                name="district"
                value={newAddress.district}
                onChange={handleAddressInputChange}
                placeholder="Quận 1, Quận 2..."
              />
            </div>
            <div className="form-group">
              <label>Thành phố</label>
              <input
                type="text"
                name="city"
                value={newAddress.city}
                onChange={handleAddressInputChange}
              />
            </div>

            <button
              type="button"
              onClick={handleGetGPS}
              className="gps-btn"
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                justifyContent: "center",
              }}
            >
              {newAddress.lat ? (
                <>
                  <MdCheckCircle /> Đã lấy GPS
                </>
              ) : (
                <>
                  <MdLocationOn /> Lấy vị trí GPS
                </>
              )}
            </button>

            <div className="form-actions">
              <button onClick={handleAddAddress} disabled={loading}>
                {loading ? "Đang thêm..." : "Thêm địa chỉ"}
              </button>
            </div>
          </div>
        )}

        <div className="addresses-list">
          {addresses.length === 0 ? (
            <p>Chưa có địa chỉ nào</p>
          ) : (
            addresses.map((addr) => (
              <div key={addr.id} className="address-item">
                <div className="address-content">
                  <p className="address-line">{addr.address_line}</p>
                  <p className="address-detail">
                    {addr.district}, {addr.city}
                  </p>
                  {addr.lat && addr.lng && (
                    <p className="address-gps">
                      GPS: {addr.lat.toFixed(4)}, {addr.lng.toFixed(4)}
                    </p>
                  )}
                  {addr.is_default && (
                    <span className="default-badge">Mặc định</span>
                  )}
                </div>
                <div className="address-actions">
                  {!addr.is_default && (
                    <button
                      onClick={() => handleSetDefault(addr.id)}
                      disabled={loading}
                    >
                      Đặt mặc định
                    </button>
                  )}
                  <button
                    onClick={() => handleDeleteAddress(addr.id)}
                    disabled={loading}
                    className="delete-btn"
                  >
                    Xóa
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
