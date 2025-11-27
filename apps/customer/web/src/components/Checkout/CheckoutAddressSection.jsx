import React from "react";
import { MdLocationOn } from "react-icons/md";

const CheckoutAddressSection = ({
    useNewAddress,
    selectedAddressId,
    addresses,
    customer,
    gpsLocation,
    loadingGPS,
    errors,
    touched,
    onSelectAddressType,
    onSelectSavedAddress,
    onAddressInput,
    onBlur,
    onGetGPS,
    getFieldError,
    setGpsLocationFn,
}) => {
    return (
        <div className="checkout-section">
            <h3 style={{ marginBottom: "20px" }}>Địa chỉ giao hàng</h3>

            {/* Address selection radio buttons */}
            <div className="address-selection">
                <label>
                    <input
                        type="radio"
                        checked={!useNewAddress}
                        onChange={() => onSelectAddressType(false)}
                    />
                    <span> Chọn địa chỉ đã lưu</span>
                </label>
                <label>
                    <input
                        type="radio"
                        checked={useNewAddress}
                        onChange={() => onSelectAddressType(true)}
                    />
                    <span> Nhập địa chỉ mới</span>
                </label>
            </div>

            {/* Saved addresses list */}
            {!useNewAddress && addresses.length > 0 && (
                <div className="saved-addresses">
                    {addresses.map((addr) => (
                        <div
                            key={addr.id}
                            className={`address-card ${selectedAddressId === addr.id ? "selected" : ""
                                }`}
                            onClick={() => onSelectSavedAddress(addr, setGpsLocationFn)}
                        >
                            <strong>{addr.address_line}</strong>
                            <br />
                            <small>
                                {addr.district}, {addr.city}
                                {addr.is_default && (
                                    <span className="default-badge">(Mặc định)</span>
                                )}
                            </small>
                        </div>
                    ))}
                </div>
            )}

            {/* New address input with GPS button */}
            {useNewAddress && (
                <>
                    <div className="address-input-container">
                        <textarea
                            name="address"
                            value={customer.address}
                            onChange={onAddressInput}
                            onBlur={() => onBlur("address")}
                            placeholder="Nhập địa chỉ chi tiết"
                            style={{
                                borderColor: getFieldError("address") ? "#dc3545" : "auto",
                            }}
                        />
                        <button
                            type="button"
                            onClick={onGetGPS}
                            disabled={loadingGPS}
                            className="gps-button"
                            title="Lấy tọa độ GPS"
                        >
                            <MdLocationOn /> {loadingGPS ? "Đang lấy GPS..." : "Dùng vị trí của tôi"}
                        </button>
                    </div>
                    {getFieldError("address") && (
                        <small style={{ color: "#dc3545" }}>
                            {getFieldError("address")}
                        </small>
                    )}

                    {/* GPS status indicator */}
                    {gpsLocation && (
                        <div
                            style={{
                                background: "#d4edda",
                                border: "1px solid #c3e6cb",
                                borderRadius: "6px",
                                padding: "10px",
                                marginTop: "10px",
                                fontSize: "14px",
                                color: "#155724",
                            }}
                        >
                            Vị trí GPS: {gpsLocation.lat.toFixed(6)},{" "}
                            {gpsLocation.lng.toFixed(6)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CheckoutAddressSection;
