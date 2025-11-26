// components/tracking/OrderStatusHeader.jsx
import React from 'react';
import { MdCheckCircle, MdSchedule, MdInfo } from 'react-icons/md';
import { DroneIcon } from 'shared-ui';
import './OrderStatusHeader.css';

export const OrderStatusHeader = ({ order, isDelivered }) => {
    const isDelivering = order?.status === 'delivering';
    const isCancelled = order?.status === 'cancelled';
    const isRejected = order?.status === 'rejected';

    // Determine header status
    let statusText = 'Đang xử lý';
    let statusColor = '#ff6b35';
    let StatusIcon = MdSchedule;

    if (isDelivered) {
        statusText = 'Đã giao hàng';
        statusColor = '#4caf50';
        StatusIcon = MdCheckCircle;
    } else if (isCancelled) {
        statusText = 'Đã hủy';
        statusColor = '#f44336';
        StatusIcon = MdInfo;
    } else if (isRejected) {
        statusText = 'Bị từ chối';
        statusColor = '#d32f2f';
        StatusIcon = MdInfo;
    } else if (isDelivering) {
        statusColor = '#ff6b35';
    }

    return (
        <div className="order-status-header">
            <div className="status-content">
                <div className="status-left">
                    <h3 style={{ color: statusColor }}>{statusText}</h3>
                    {(isCancelled || isRejected) && (
                        <p style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>
                            Đơn hàng này đã bị {order.status === 'cancelled' ? 'hủy' : 'từ chối'}
                            {isRejected && order.rejection_reason && `: ${order.rejection_reason}`}
                        </p>
                    )}
                </div>
                <div className="status-icon">
                    {isDelivering ? (
                        <DroneIcon size={36} color={statusColor} />
                    ) : (
                        <StatusIcon size={36} color={statusColor} />
                    )}
                </div>
            </div>
            {isDelivering && order?.drone_id && (
                <div className="drone-info">
                    <MdInfo size={14} />
                    <span>Drone: {order.drone_id}</span>
                </div>
            )}
        </div>
    );
};
