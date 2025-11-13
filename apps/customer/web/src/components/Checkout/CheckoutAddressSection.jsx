import React from "react";

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
}) => {
    return (
        <div className="checkout-section">
            <h3>Delivery Address</h3>

            {/* Address selection radio buttons */}
            <div className="address-selection">
                <label>
                    <input
                        type="radio"
                        checked={!useNewAddress}
                        onChange={() => onSelectAddressType(false)}
                    />
                    <span> Select saved address</span>
                </label>
                <label>
                    <input
                        type="radio"
                        checked={useNewAddress}
                        onChange={() => onSelectAddressType(true)}
                    />
                    <span> Enter new address</span>
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
                            onClick={() => onSelectSavedAddress(addr)}
                        >
                            <strong>{addr.address_line}</strong>
                            <br />
                            <small>
                                {addr.district}, {addr.city}
                                {addr.is_default && (
                                    <span className="default-badge">(Default)</span>
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
                            placeholder="Enter detailed address"
                            style={{
                                borderColor: getFieldError("address") ? "#dc3545" : "auto",
                            }}
                        />
                        <button
                            type="button"
                            onClick={onGetGPS}
                            disabled={loadingGPS}
                            className="gps-button"
                            title="Get GPS coordinates"
                        >
                            <MdLocationOn /> {loadingGPS ? "Getting GPS..." : "Use My Location"}
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
                            GPS Location: {gpsLocation.lat.toFixed(6)},{" "}
                            {gpsLocation.lng.toFixed(6)}
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default CheckoutAddressSection;
