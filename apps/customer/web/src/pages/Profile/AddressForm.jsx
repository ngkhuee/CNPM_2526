import React, { useState, useEffect } from "react";
import { MdLocationOn, MdCheckCircle, MdAdd } from "react-icons/md";

const PROVINCES = {
    "TP.HCM": ["District 1", "District 2", "District 3", "District 4", "District 5", "District 6", "District 7", "District 8", "District 9", "District 10", "District 11", "District 12", "Binh Chanh", "Cần Giuộc", "Cần Thạnh", "Nhà Bè", "Tân Phú", "Tân Bình", "Thủ Đức", "Gò Vấp"],
    "Hà Nội": ["District Ba Đình", "District Hoàn Kiếm", "District Tây Hồ", "District Long Biên", "District Hồng Bàng", "District Đống Đa", "District Thanh Xuân", "District Hai Bà Trưng", "District Cầu Giấy", "District Bắc Từ Liêm", "District Tây Hồ"],
    "Đà Nẵng": ["District Hải Châu", "District Thanh Khê", "District Sơn Trà", "District Ngũ Hành Sơn", "District Liên Chiểu"],
};

const AddressForm = ({
    show,
    loading,
    newAddress,
    onInputChange,
    onGetGPS,
    onAddAddress,
    onToggleForm,
}) => {
    const [selectedCity, setSelectedCity] = useState(newAddress.city || "TP.HCM");

    const handleCityChange = (city) => {
        setSelectedCity(city);
        onInputChange("city", city);
        onInputChange("district", ""); // Reset district when city changes
    };

    const availableDistricts = PROVINCES[selectedCity] || [];

    return (
        <>
            {show && (
                <div className="address-form">
                    <h3>Add new address</h3>

                    <div className="form-row">
                        <div className="form-group">
                            <label>Province/City</label>
                            <select
                                value={selectedCity}
                                onChange={(e) => handleCityChange(e.target.value)}
                            >
                                <option value="">Select province/city</option>
                                {Object.keys(PROVINCES).map((city) => (
                                    <option key={city} value={city}>
                                        {city}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label>District/County</label>
                            <select
                                value={newAddress.district}
                                onChange={(e) => onInputChange("district", e.target.value)}
                            >
                                <option value="">Select district/county</option>
                                {availableDistricts.map((district) => (
                                    <option key={district} value={district}>
                                        {district}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Specific address</label>
                        <input
                            type="text"
                            value={newAddress.address_line}
                            onChange={(e) => onInputChange("address_line", e.target.value)}
                            placeholder="House number, street name, ..."
                        />
                    </div>

                    <div className="form-group">
                        <label>Note</label>
                        <input
                            type="text"
                            value={newAddress.note || ""}
                            onChange={(e) => onInputChange("note", e.target.value)}
                            placeholder="Note (if needed)"
                        />
                    </div>

                    <button
                        type="button"
                        onClick={onGetGPS}
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
                                <MdCheckCircle /> GPS Already taken
                            </>
                        ) : (
                            <>
                                <MdLocationOn /> Get GPS location
                            </>
                        )}
                    </button>

                    <div className="form-group">
                        <label>
                            <input
                                type="checkbox"
                                checked={newAddress.isDefault || false}
                                onChange={(e) => onInputChange("isDefault", e.target.checked)}
                            />
                                Set as default address
                        </label>
                    </div>

                    <div className="form-actions">
                        <button onClick={onAddAddress} disabled={loading} className="btn-primary">
                            {loading ? "Adding..." : "Add address"}
                        </button>
                    </div>
                </div>
            )}
        </>
    );
};

export default AddressForm;
