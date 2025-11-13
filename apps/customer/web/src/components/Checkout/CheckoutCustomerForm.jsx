import React from "react";

const CheckoutCustomerForm = ({
    customer,
    errors,
    touched,
    onInput,
    onBlur,
    getFieldError,
}) => {
    return (
        <div className="checkout-section">
            <h3>Customer Information</h3>

            {/* Full Name */}
            <label>Full Name</label>
            <input
                type="text"
                name="name"
                value={customer.name}
                onChange={onInput}
                onBlur={() => onBlur("name")}
                placeholder="Enter full name"
                style={{
                    borderColor: getFieldError("name") ? "#dc3545" : "auto",
                }}
            />
            {getFieldError("name") && (
                <small style={{ color: "#dc3545" }}>{getFieldError("name")}</small>
            )}

            {/* Phone Number */}
            <label>Phone Number</label>
            <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={onInput}
                onBlur={() => onBlur("phone")}
                placeholder="Enter phone number"
                style={{
                    borderColor: getFieldError("phone") ? "#dc3545" : "auto",
                }}
            />
            {getFieldError("phone") && (
                <small style={{ color: "#dc3545" }}>{getFieldError("phone")}</small>
            )}
        </div>
    );
};

export default CheckoutCustomerForm;
