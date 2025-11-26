/**
 * orderTransformer.js - MOBILE VERSION
 * Copy từ packages/shared-services/src/utils/orderTransformer.js
 * Vì React Native không thể import từ shared-services (import.meta error)
 * 
 * QUAN TRỌNG: Keep in sync với shared-services version!
 */

/**
 * Helper: Normalize GPS format
 */
const normalizeGPS = (gps) => {
    if (!gps) return null;

    const lat = gps.lat || gps.latitude || null;
    const lng = gps.lng || gps.longitude || null;

    if (lat === null || lng === null) return null;

    return {
        lat,
        lng,
        latitude: lat,
        longitude: lng,
    };
};

/**
 * Transform order from API format (snake_case) to Frontend format
 */
export const transformOrderFromAPI = (apiOrder, options = {}) => {
    if (!apiOrder) return null;

    const order = {
        // IDs
        id: String(apiOrder.id),
        userId: apiOrder.user_id,
        user_id: apiOrder.user_id,
        restaurantId: apiOrder.restaurant_id,
        restaurant_id: apiOrder.restaurant_id,
        addressId: apiOrder.address_id,
        address_id: apiOrder.address_id,
        droneId: apiOrder.drone_id,
        drone_id: apiOrder.drone_id,

        // Items
        items: (apiOrder.items || []).map(item => ({
            foodId: item.menu_id || item.food_id || item.id,
            menu_id: item.menu_id,
            food_id: item.menu_id || item.food_id,
            id: item.id || item.menu_id,
            name: item.name,
            quantity: item.quantity,
            price: item.unit_price || item.price,
            unit_price: item.unit_price || item.price,
            subtotal: item.subtotal || (item.quantity * (item.unit_price || item.price || 0))
        })),

        // Money
        subtotal: apiOrder.subtotal || 0,
        deliveryFee: apiOrder.delivery_fee || 0,
        delivery_fee: apiOrder.delivery_fee || 0,
        discountAmount: apiOrder.discount_amount || 0,
        discount_amount: apiOrder.discount_amount || 0,
        totalPrice: apiOrder.total_amount || 0,
        totalAmount: apiOrder.total_amount || 0,
        total_amount: apiOrder.total_amount || 0,

        // Status
        status: apiOrder.status,
        paymentMethod: apiOrder.payment_method,
        payment_method: apiOrder.payment_method,
        paymentStatus: apiOrder.payment_status,
        payment_status: apiOrder.payment_status,

        // Instructions
        specialInstructions: apiOrder.special_instructions || '',
        special_instructions: apiOrder.special_instructions || '',

        // Timestamps
        createdAt: apiOrder.created_at,
        created_at: apiOrder.created_at,
        updatedAt: apiOrder.updated_at,
        updated_at: apiOrder.updated_at,

        // Relations
        user: apiOrder.user || null,
        restaurant: apiOrder.restaurant || null,
        address: apiOrder.address || null,
        customer: apiOrder.customer || null,

        // Display fields
        restaurantName: apiOrder.restaurant?.name || 'Unknown Restaurant',
        restaurant_name: apiOrder.restaurant?.name || 'Unknown Restaurant',
        customerName: apiOrder.customer?.name || apiOrder.user?.full_name || 'Unknown',
        customerPhone: apiOrder.customer?.phone || apiOrder.user?.phone || '',
        customerAddress: apiOrder.customer?.address || apiOrder.delivery_address || '',
        customerEmail: apiOrder.customer?.email || apiOrder.user?.email || '',
        deliveryAddress: apiOrder.delivery_address || apiOrder.customer?.address || '',
        delivery_address: apiOrder.delivery_address || apiOrder.customer?.address || '',

        // GPS
        pickup_gps: normalizeGPS(apiOrder.pickup_gps),
        pickupGPS: normalizeGPS(apiOrder.pickup_gps),
        dropoff_gps: normalizeGPS(apiOrder.dropoff_gps),
        dropoffGPS: normalizeGPS(apiOrder.dropoff_gps),
        current_gps: normalizeGPS(apiOrder.current_gps),
        currentGPS: normalizeGPS(apiOrder.current_gps),

        // Drone tracking
        drone_journey_stage: apiOrder.drone_journey_stage,
        droneJourneyStage: apiOrder.drone_journey_stage,
        estimated_delivery_time: apiOrder.estimated_delivery_time,
        estimatedDeliveryTime: apiOrder.estimated_delivery_time,
        actual_delivery_time: apiOrder.actual_delivery_time,
        actualDeliveryTime: apiOrder.actual_delivery_time,

        // Promotion
        promo_code: apiOrder.promo_code || apiOrder.promotion_code,
        promotion_code: apiOrder.promo_code || apiOrder.promotion_code,
        promoCode: apiOrder.promo_code || apiOrder.promotion_code,
        promotion_id: apiOrder.promotion_id,
        promotionId: apiOrder.promotion_id,

        // Order number
        order_number: apiOrder.order_number,
        orderNumber: apiOrder.order_number,

        // Rejection
        rejection_reason: apiOrder.rejection_reason,
        rejectionReason: apiOrder.rejection_reason,
        rejected_at: apiOrder.rejected_at,
        rejectedAt: apiOrder.rejected_at,
    };

    // Address info
    if (apiOrder.address) {
        order.addressInfo = {
            fullAddress: apiOrder.address.full_address || apiOrder.address.address_line,
            street: apiOrder.address.street,
            ward: apiOrder.address.ward,
            district: apiOrder.address.district,
            city: apiOrder.address.city,
            phone: apiOrder.address.phone,
            latitude: apiOrder.address.latitude,
            longitude: apiOrder.address.longitude,
        };
    }

    return order;
};

/**
 * Transform order from Frontend to API format
 */
export const transformOrderToAPI = (frontendOrder) => {
    if (!frontendOrder) return null;

    const extractGPS = (gpsObj) => {
        if (!gpsObj) return null;
        return {
            lat: gpsObj.lat || gpsObj.latitude,
            lng: gpsObj.lng || gpsObj.longitude,
        };
    };

    const apiOrder = {
        user_id: frontendOrder.userId || frontendOrder.user_id || frontendOrder.customerId,
        restaurant_id: frontendOrder.restaurantId || frontendOrder.restaurant_id,
        address_id: frontendOrder.addressId || frontendOrder.address_id,
        drone_id: frontendOrder.droneId || frontendOrder.drone_id,

        items: (frontendOrder.items || []).map(item => ({
            menu_id: item.foodId || item.menu_id || item.food_id || item.id,
            name: item.name,
            quantity: item.quantity,
            unit_price: item.price || item.unit_price,
            subtotal: (item.price || item.unit_price || 0) * item.quantity
        })),

        subtotal: frontendOrder.subtotal,
        delivery_fee: frontendOrder.deliveryFee || frontendOrder.delivery_fee || 0,
        discount_amount: frontendOrder.discountAmount || frontendOrder.discount_amount || 0,
        total_amount: frontendOrder.totalAmount || frontendOrder.total_amount || frontendOrder.totalPrice,

        payment_method: frontendOrder.paymentMethod || frontendOrder.payment_method || 'momo',
        payment_status: frontendOrder.paymentStatus || frontendOrder.payment_status || 'pending',
        status: frontendOrder.status || 'pending',

        special_instructions: frontendOrder.specialInstructions || frontendOrder.special_instructions || '',

        customer: frontendOrder.customer,
        delivery_address: frontendOrder.deliveryAddress || frontendOrder.delivery_address || frontendOrder.customer?.address,

        pickup_gps: extractGPS(frontendOrder.pickupGPS || frontendOrder.pickup_gps),
        dropoff_gps: extractGPS(frontendOrder.dropoffGPS || frontendOrder.dropoff_gps || frontendOrder.gps),

        promotion_code: frontendOrder.promotion_code || frontendOrder.promo_code || frontendOrder.promoCode || null,
        promotion_id: frontendOrder.promotion_id || frontendOrder.promotionId || null,

        order_number: frontendOrder.order_number || frontendOrder.orderNumber || `ORD-${Date.now()}`,

        created_at: frontendOrder.created_at || frontendOrder.createdAt || new Date().toISOString(),
        updated_at: new Date().toISOString(),
    };

    // Remove undefined
    Object.keys(apiOrder).forEach(key => {
        if (apiOrder[key] === undefined) {
            delete apiOrder[key];
        }
    });

    return apiOrder;
};

/**
 * Helper: Extract foodIds from order items
 */
export const extractFoodIds = (order) => {
    if (!order || !order.items) return [];
    return order.items.map(item => item.foodId || item.menu_id).filter(Boolean);
};

/**
 * Helper: Calculate order totals
 */
export const calculateOrderTotals = (order) => {
    const subtotal = order.subtotal || 0;
    const deliveryFee = order.deliveryFee || order.delivery_fee || 0;
    const discountAmount = order.discountAmount || order.discount_amount || 0;
    const total = subtotal + deliveryFee - discountAmount;

    return {
        subtotal,
        deliveryFee,
        discountAmount,
        total,
    };
};
