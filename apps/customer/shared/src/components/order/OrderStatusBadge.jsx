/**
 * Order Status Badge Component - shared between web and mobile
 */

import React from "react";
import { orderValidationService } from "shared-services";

export const OrderStatusBadge = ({ status, showLabel = true }) => {
    const style = orderValidationService.getStatusBadgeStyle(status);
    const label = orderValidationService.getStatusLabel(status);

    return (
        <span style={style}>
            {showLabel && label}
        </span>
    );
};

export default OrderStatusBadge;
