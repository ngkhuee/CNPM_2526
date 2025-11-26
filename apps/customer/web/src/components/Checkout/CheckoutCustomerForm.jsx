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
            <h3>Thông tin Khách hàng</h3>

            {/* Full Name */}
            <label>Họ và tên</label>
            <input
                type="text"
                name="name"
                value={customer.name}
                onChange={onInput}
                onBlur={() => onBlur("name")}
                placeholder="Nhập họ và tên"
                style={{
                    borderColor: getFieldError("name") ? "#dc3545" : "auto",
                }}
            />
            {getFieldError("name") && (
                <small style={{ color: "#dc3545" }}>{getFieldError("name")}</small>
            )}

            {/* Phone Number */}
            <label>Số điện thoại</label>
            <input
                type="text"
                name="phone"
                value={customer.phone}
                onChange={onInput}
                onBlur={() => onBlur("phone")}
                placeholder="Nhập số điện thoại"
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
