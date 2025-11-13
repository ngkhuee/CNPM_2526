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
    if (!window.confirm("Are you sure you want to delete this address?")) return;
    try {
      const result = await deleteAddressHook(addressId);
      if (result.success) {
        alert("Address deleted successfully");
      } else {
        alert(`Error deleting address: ${result.message}`);
      }
    } catch (error) {
      console.error("Error deleting address:", error);
      alert("Error deleting address");
    }
  };

  const handleSetDefault = async (addressId) => {
    try {
      const result = await setDefaultAddress(addressId);
      if (result.success) {
        alert("Address set as default successfully");
      } else {
        alert(`Error: ${result.message}`);
      }
    } catch (error) {
      console.error("Error setting default:", error);
      alert("Error setting default address");
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
    return <div className="profile-page">Please login first</div>;
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
            Account Info
          </button>
          <button
            className={`sidebar-btn ${activeTab === "address" ? "active" : ""}`}
            onClick={() => setActiveTab("address")}
          >
            My Addresses
          </button>
        </div>

        {/* Main Content */}
        <div className="profile-content">
          {/* Account Info Section */}
          {activeTab === "account" && (
            <div className="profile-content-section">
              <h2>Account Information</h2>
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
                  <label>Full Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    disabled={!editing}
                    placeholder="Enter full name"
                  />
                  {editing && <div className="checkmark">✓</div>}
                </div>

                <div className="form-group">
                  <label>Phone Number</label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    disabled={!editing}
                    placeholder="Enter phone number"
                  />
                  {editing && <div className="checkmark">✓</div>}
                </div>

                <div className="form-group">
                  <label>Gender</label>
                  <div className="radio-group">
                    <label>
                      <input
                        type="radio"
                        value="Male"
                        checked={formData.gender === "Male"}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        disabled={!editing}
                      />
                      Male
                    </label>
                    <label>
                      <input
                        type="radio"
                        value="Female"
                        checked={formData.gender === "Female"}
                        onChange={(e) => handleInputChange("gender", e.target.value)}
                        disabled={!editing}
                      />
                      Female
                    </label>
                  </div>
                </div>

                <div className="form-group">
                  <label>Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dob}
                    onChange={(e) => {
                      const dob = new Date(e.target.value);
                      const today = new Date();
                      if (dob <= today) {
                        handleInputChange("dob", e.target.value);
                      } else {
                        alert("Date of birth cannot be greater than today");
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
                        {profileLoading ? "Saving..." : "Save"}
                      </button>
                      <button onClick={() => setEditing(false)} className="btn-secondary">
                        Cancel
                      </button>
                    </>
                  ) : (
                    <button onClick={() => setEditing(true)} className="btn-primary">
                      Edit
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
                <h2>Delivery Addresses</h2>
                <button
                  onClick={() => setShowAddressForm(!showAddressForm)}
                  className="btn-add-address"
                >
                  + Add Address
                </button>
              </div>

              {showAddressForm && (
                <div className="address-form">
                  <h3>Add New Address</h3>
                  <div className="form-row">
                    <div className="form-group">
                      <label>City/Province</label>
                      <select
                        value={newAddress.city}
                        onChange={(e) => {
                          handleAddressInputChange("city", e.target.value);
                          handleAddressInputChange("district", "");
                        }}
                      >
                        <option value="">Select city/province</option>
                        <option value="Ho Chi Minh">Ho Chi Minh City</option>
                        {/* <option value="Hanoi">Hanoi</option>
                        <option value="Da Nang">Da Nang</option> */}
                      </select>
                    </div>

                    <div className="form-group">
                      <label>District</label>
                      <select
                        value={newAddress.district}
                        onChange={(e) => handleAddressInputChange("district", e.target.value)}
                      >
                        <option value="">Select district</option>
                        {newAddress.city === "Ho Chi Minh" && (
                          <>
                            <option value="District 1">District 1</option>
                            <option value="District 2">District 2</option>
                            <option value="District 3">District 3</option>
                            <option value="District 4">District 4</option>
                            <option value="District 5">District 5</option>
                            <option value="District 6">District 6</option>
                            <option value="District 7">District 7</option>
                            <option value="District 8">District 8</option>
                            <option value="District 9">District 9</option>
                            <option value="District 10">District 10</option>
                          </>
                        )}
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Address {newAddress.lat && newAddress.lng && <span style={{ color: '#4caf50', fontWeight: 'bold' }}>(Auto-filled from GPS)</span>}</label>
                    <input
                      type="text"
                      value={newAddress.address_line}
                      onChange={(e) => handleAddressInputChange("address_line", e.target.value)}
                      placeholder="Street address, building number, etc. (or use GPS)"
                    />
                  </div>

                  <div className="form-group">
                    <label>Note</label>
                    <input
                      type="text"
                      value={newAddress.note || ""}
                      onChange={(e) => handleAddressInputChange("note", e.target.value)}
                      placeholder="Optional note"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleGetGPSClick}
                    className="gps-btn"
                  >
                    {newAddress.lat && newAddress.lng ? "✓ GPS Location Retrieved" : "Get Current GPS Location"}
                  </button>

                  <div className="form-group">
                    <label>
                      <input
                        type="checkbox"
                        checked={newAddress.isDefault || false}
                        onChange={(e) => handleAddressInputChange("isDefault", e.target.checked)}
                      />
                      Set as default address
                    </label>
                  </div>

                  <div className="form-actions">
                    <button onClick={handleAddAddressClick} disabled={addressFormLoading} className="btn-primary">
                      {addressFormLoading ? "Adding..." : "Add Address"}
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
