// components/tracking/ArrivedPopup.jsx
import React from 'react';
import { MdCheckCircle, MdClose } from 'react-icons/md';
import { DroneIcon } from 'shared-ui';
import './ArrivedPopup.css';

export const ArrivedPopup = ({ visible, order, onClose }) => {
    if (!visible) return null;

    return (
        <div className="arrived-popup-overlay" onClick={onClose}>
            <div className="arrived-popup-content" onClick={(e) => e.stopPropagation()}>
                <button className="arrived-popup-close" onClick={onClose}>
                    <MdClose size={24} />
                </button>

                <div className="arrived-popup-icon">
                    <DroneIcon size={60} color="#4caf50" />
                </div>

                <h2>Drone đã đến!</h2>

                <p className="arrived-popup-message">
                    Đơn hàng của bạn đã được giao đến vị trí.
                    Vui lòng nhận hàng của bạn.
                </p>

                <div className="arrived-popup-info">
                    <p><strong>Mã đơn hàng:</strong> {order?.id}</p>
                    {order?.drone_id && (
                        <p><strong>Mã Drone:</strong> {order.drone_id}</p>
                    )}
                </div>

                <button className="arrived-popup-confirm" onClick={onClose}>
                    <MdCheckCircle size={20} />
                    <span>Tôi đã nhận được hàng</span>
                </button>

                <p className="arrived-popup-note">
                    Đơn hàng sẽ tự động được đánh dấu đã giao sau 10 phút
                </p>
            </div>
        </div>
    );
};
