// components/tracking/ArrivedPopup.jsx
import React from 'react';
import { MdCheckCircle } from 'react-icons/md';
import { DroneIcon } from 'shared-ui';
import './ArrivedPopup.css';

export const ArrivedPopup = ({ visible, order, onConfirmDelivery }) => {
    if (!visible) return null;

    return (
        <div className="arrived-popup-overlay">
            <div className="arrived-popup-content" onClick={(e) => e.stopPropagation()}>
                <div className="arrived-popup-icon">
                    <DroneIcon size={60} color="#4caf50" />
                </div>

                <h2>Drone đã đến!</h2>

                <p className="arrived-popup-message">
                    Đơn hàng của bạn đã được giao đến vị trí.
                    Nhấn nút bên dưới để xác nhận bạn đã nhận được hàng.
                </p>

                <div className="arrived-popup-info">
                    <p><strong>Mã đơn hàng:</strong> {order?.id}</p>
                    {order?.drone_id && (
                        <p><strong>Mã Drone:</strong> {order.drone_id}</p>
                    )}
                </div>

                <button className="arrived-popup-confirm" onClick={onConfirmDelivery}>
                    <MdCheckCircle size={20} />
                    <span>Xác nhận đã nhận hàng</span>
                </button>

                <p className="arrived-popup-note">
                    Đơn hàng sẽ tự động hoàn thành sau 10 phút nếu không xác nhận
                </p>
            </div>
        </div>
    );
};
