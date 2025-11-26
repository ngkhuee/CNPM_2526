import React, { useContext, useState } from "react";
import { AuthContext, useAddresses } from "customer-shared";
import { useProfileForm } from "customer-shared";
import { useAddressForm } from "customer-shared";
import "./Profile.css";
import AddressList from "./AddressList";

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);
  const [activeTab, setActiveTab] = useState("account"); // "account" or "address"
  const {
    addresses,
    loading: addressLoading,
    addAddress: addAddressHook,
    deleteAddress: deleteAddressHook,
    setDefaultAddress,
  } = useAddresses(user?.id);

  // Profile form logic
  const {
    editing,
    setEditing,
    formData,
    loading: profileLoading,
    handleInputChange,
    handleSaveProfile,
  } = useProfileForm(user, setUser);

  // Address form logic
  const {
    showAddressForm,
    setShowAddressForm,
    loading: addressFormLoading,
    newAddress,
    handleAddressInputChange,
    handleGetGPS,
    handleAddAddress,
  } = useAddressForm(addAddressHook);

  // Address management handlers
  const handleDeleteAddress = async (addressId) => {
    if (!window.confirm("Bạn có chắc muốn xóa địa chỉ này?")) return;
    try {
      const result = await deleteAddressHook(addressId);
      if (result.success) {
        alert("Xóa địa chỉ thành công");
      } else {
        alert(`Lỗi xóa địa chỉ: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Lỗi xóa địa chỉ");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        alert("Đặt địa chỉ mặc định thành công");
      } else {
        alert(`Lỗi: ${result.message}`);
      }
    } catch (error) {
      console.error("Error setting default:", error);
      alert("Lỗi đặt địa chỉ mặc định");
    }
  };

  const handleSaveClick = async () => {
    const result = await handleSaveProfile();
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleAddAddressClick = async () => {
    const result = await handleAddAddress();
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleGetGPSClick = async () => {
    const result = await handleGetGPS();
    if (result.success) {
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  if (!user) {
    return <div className="profile-page">Vui lòng đăng nhập trước</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        {/* Sidebar */}
        <div className="profile-sidebar">
          <div className="sidebar-avatar">
            {user?.avatar ? (
              <img src={user.avatar} alt="Avatar" />
            ) : (
              <div className="avatar-placeholder">
                {formData.name?.charAt(0).toUpperCase() || "U"}
              </div>
            )}
          </div>
          <div className="sidebar-name">{formData.name}</div>
          <button
            className={`sidebar-btn ${activeTab === "account" ? "active" : ""}`}
            onClick={() => setActiveTab("account")}
          >
            Thông tin tài khoản
          </button>
          <button
            className={`sidebar-btn ${activeTab === "address" ? "active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            Địa chỉ của tôi
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Account Info Section */}
          {activeTab === "account" && (
            <div className="profile-content-section">
              <h2>Thông tin tài khoản</h2>
              <div className="profile-form">
                <div className="form-group">
                  <label>Email</label>
                  <input
                    type="email"
                    value={formData.email}
                    disabled
                    className="readonly"
                  />
                </div>

                <div className="form-group">
                  <label>Họ và tên</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!editing}
                    placeholder="Nhập họ và tên"
                  />
                  {editing && <div className="checkmark">✓</div>}
                </div>

                <div className="form-group">
                  <label>Số điện thoại</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!editing}
                    placeholder="Nhập số điện thoại"
                  />
                  {editing && <div className="checkmark">✓</div>}
                </div>

                <div className="form-group">
                  <label>Giới tính</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        disabled={!editing}
                      />
                      Nam
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        disabled={!editing}
                      />
                      Nữ
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Ngày sinh</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => {
                      const dob = new Date(e.target.value);
                      const today = new Date();
                      if (dob <= today) {
                        handleInputChange("dob", e.target.value);
                      } else {
                        alert("Ngày sinh không thể lớn hơn hôm nay");
                      }
                    }}
                    disabled={!editing}
                  />
                  {editing && <div className="checkmark">✓</div>}
                </div>

                <div className="profile-actions">
                  {editing ? (
                    <>
                      <button onClick={handleSaveClick} disabled={profileLoading} className="btn-primary">
                        {profileLoading ? "Đang lưu..." : "Lưu"}
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-secondary">
                        Hủy
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)} className="btn-primary">
                      Chỉnh sửa
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Address Section */}
          {activeTab === "address" && (
            <div className="profile-content-section">
              <div className="profile-addresses-header">
                <h2>Địa chỉ giao hàng</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn-add-address"
                >
                  + Thêm địa chỉ
                </button>
              </div>

              {showAddressForm && (
                <div className="address-form">
                  <h3>Thêm địa chỉ giao hàng mới</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>Tỉnh/Thành phố</label>
                      <select
                        value={newAddress.city}
                        onChange={(e) => {
                          handleAddressInputChange("city", e.target.value);
                          handleAddressInputChange("district", "");
                        }}
                      >
                        <option value="">Chọn tỉnh/thành phố</option>
                        <option value="Ho Chi Minh">TP. Hồ Chí Minh</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label>Quận/Huyện</label>
                      <select
                        value={newAddress.district}
                        onChange={(e) => handleAddressInputChange("district", e.target.value)}
                      >
                        <option value="">Chọn quận/huyện</option>
                        {newAddress.city === "Ho Chi Minh" && (
                          <>
                            <option value="District 1">Quận 1</option>
                            <option value="District 2">Quận 2</option>
                            <option value="District 3">Quận 3</option>
                            <option value="District 4">Quận 4</option>
                            <option value="District 5">Quận 5</option>
                            <option value="District 6">Quận 6</option>
                            <option value="District 7">Quận 7</option>
                            <option value="District 8">Quận 8</option>
                            <option value="District 9">Quận 9</option>
                            <option value="District 10">Quận 10</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>
                      Địa chỉ chi tiết
                      {newAddress.lat && newAddress.lng && (
                        <span style={{ color: "#4caf50", fontWeight: "600", marginLeft: "8px" }}>
                          (Đã lấy GPS)
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={newAddress.address_line}
                      onChange={(e) => handleAddressInputChange("address_line", e.target.value)}
                      placeholder="Số nhà, tên đường, tòa nhà, v.v."
                    />
                  </div>

                  <div className="form-group">
                    <label>Ghi chú (Tùy chọn)</label>
                    <input
                      type="text"
                      value={newAddress.note || ""}
                      onChange={(e) => handleAddressInputChange("note", e.target.value)}
                      placeholder="Ví dụ: Gần công viên, Cổng số 2, v.v."
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGetGPSClick}
                    className="gps-btn"
                  >
                    {newAddress.lat && newAddress.lng
                      ? "Lấy vị trí GPS hiện tại"
                      : "Lấy vị trí GPS hiện tại"}
                  </button>

                  <div className="form-group">
                    <label style={{ display: "flex", alignItems: "center", gap: "8px", fontWeight: "500" }}>
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault || false}
                        onChange={(e) => handleAddressInputChange("isDefault", e.target.checked)}
                        style={{ width: "18px", height: "18px", cursor: "pointer" }}
                      />
                      Đặt làm địa chỉ giao hàng mặc định
                    </label>
                  </div>

                  <div className="form-actions">
                    <button
                      onClick={handleAddAddressClick}
                      disabled={addressFormLoading}
                      className="btn-primary"
                    >
                      {addressFormLoading ? "Đang thêm..." : "Thêm địa chỉ"}
                    </button>
                  </div>
                </div>
              )}

              <AddressList
                addresses={addresses}
                loading={addressLoading}
                onSetDefault={handleSetDefault}
                onDeleteAddress={handleDeleteAddress}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Profile;
