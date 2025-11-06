import apiClient from "../config/apiClient";
import { ENDPOINTS } from "../config/endpoints";

/**
 * Drone Simulation Service
 * Automatically simulates drone delivery process when order is ready
 */

// Delay helper function
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Simulate drone picking up and delivering order
 * @param {string} orderId - Order ID
 * @param {string} droneId - Drone ID
 * @returns {Promise<void>}
 */
export const simulateDroneDelivery = async (orderId, droneId) => {
  try {
    console.log(
      `🚁 Starting drone simulation for order ${orderId} with drone ${droneId}`
    );

    // Step 1: Update drone status to "picking_up" (5 seconds)
    console.log("📦 Step 1: Drone is picking up the order...");
    await apiClient.patch(ENDPOINTS.DRONES.BY_ID(droneId), {
      status: "busy",
      updated_at: new Date().toISOString(),
    });
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "picking_up",
      updated_at: new Date().toISOString(),
    });
    await delay(5000); // 5 seconds

    // Step 2: Update to "picked_up" (3 seconds)
    console.log("✅ Step 2: Order picked up successfully!");
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "picked_up",
      updated_at: new Date().toISOString(),
    });
    await delay(3000); // 3 seconds

    // Step 3: Update to "delivering" (10 seconds)
    console.log("🚀 Step 3: Drone is delivering...");
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "delivering",
      updated_at: new Date().toISOString(),
    });
    await delay(10000); // 10 seconds

    // Step 4: Update to "delivered"
    console.log("🎉 Step 4: Order delivered successfully!");
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "delivered",
      actual_delivery_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Release drone
    await apiClient.patch(ENDPOINTS.DRONES.BY_ID(droneId), {
      status: "available",
      assigned_order_id: null,
      updated_at: new Date().toISOString(),
    });

    console.log(`✅ Drone simulation completed for order ${orderId}`);
  } catch (error) {
    console.error(`❌ Error in drone simulation for order ${orderId}:`, error);
    throw error;
  }
};

/**
 * Simulate drone movement from restaurant to customer
 * Updates drone location coordinates in steps
 * @param {string} droneId - Drone ID
 * @param {Object} startLocation - {lat, lng} - Restaurant location
 * @param {Object} endLocation - {lat, lng} - Customer location
 * @param {number} steps - Number of intermediate steps (default: 8)
 * @param {number} intervalMs - Delay between steps in milliseconds (default: 2000)
 * @returns {Promise<void>}
 */
export const simulateDroneMovement = async (
  droneId,
  startLocation,
  endLocation,
  steps = 8,
  intervalMs = 2000
) => {
  try {
    console.log(
      `📍 Simulating drone movement from ${JSON.stringify(startLocation)} to ${JSON.stringify(endLocation)}`
    );

    const latStep = (endLocation.lat - startLocation.lat) / steps;
    const lngStep = (endLocation.lng - startLocation.lng) / steps;

    for (let i = 1; i <= steps; i++) {
      const currentLat = startLocation.lat + latStep * i;
      const currentLng = startLocation.lng + lngStep * i;

      await apiClient.patch(ENDPOINTS.DRONES.BY_ID(droneId), {
        latitude: currentLat,
        longitude: currentLng,
        updated_at: new Date().toISOString(),
      });

      console.log(
        `🚁 Drone at step ${i}/${steps}: ${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}`
      );

      if (i < steps) {
        await delay(intervalMs);
      }
    }

    console.log("✅ Drone movement simulation completed");
  } catch (error) {
    console.error("❌ Error simulating drone movement:", error);
    throw error;
  }
};

/**
 * Combined simulation: delivery process + GPS movement
 * This runs both simulations concurrently
 * @param {string} orderId - Order ID
 * @param {string} droneId - Drone ID
 * @param {Object} restaurantLocation - {lat, lng}
 * @param {Object} customerLocation - {lat, lng}
 * @returns {Promise<void>}
 */
export const runFullDroneSimulation = async (
  orderId,
  droneId,
  restaurantLocation,
  customerLocation
) => {
  try {
    console.log(`🎬 Starting full drone simulation for order ${orderId}`);

    // Step 1: Picking up (5 seconds) - drone stays at restaurant
    console.log("📦 Phase 1: Picking up order at restaurant...");
    await apiClient.patch(ENDPOINTS.DRONES.BY_ID(droneId), {
      status: "busy",
      latitude: restaurantLocation.lat,
      longitude: restaurantLocation.lng,
      updated_at: new Date().toISOString(),
    });
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "picking_up",
      updated_at: new Date().toISOString(),
    });
    await delay(5000);

    // Step 2: Picked up (3 seconds)
    console.log("✅ Phase 2: Order picked up!");
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "picked_up",
      updated_at: new Date().toISOString(),
    });
    await delay(3000);

    // Step 3: Delivering with movement (16 seconds = 8 steps * 2 seconds)
    console.log("🚀 Phase 3: Delivering with GPS tracking...");
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "delivering",
      updated_at: new Date().toISOString(),
    });

    // Simulate movement during delivery
    await simulateDroneMovement(
      droneId,
      restaurantLocation,
      customerLocation,
      8,
      2000
    );

    // Step 4: Delivered
    console.log("🎉 Phase 4: Delivery complete!");
    await apiClient.patch(ENDPOINTS.ORDERS.BY_ID(orderId), {
      status: "delivered",
      actual_delivery_time: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });

    // Release drone back to available
    await apiClient.patch(ENDPOINTS.DRONES.BY_ID(droneId), {
      status: "available",
      assigned_order_id: null,
      latitude: customerLocation.lat,
      longitude: customerLocation.lng,
      updated_at: new Date().toISOString(),
    });

    console.log(`✅ Full simulation completed for order ${orderId}`);
  } catch (error) {
    console.error(`❌ Error in full drone simulation:`, error);
    throw error;
  }
};

/**
 * Auto-trigger simulation when order becomes "ready"
 * This should be called by restaurant when they mark order as ready
 * @param {string} orderId - Order ID
 * @returns {Promise<void>}
 */
export const autoTriggerDelivery = async (orderId) => {
  try {
    // Fetch order details
    const order = await apiClient.get(ENDPOINTS.ORDERS.BY_ID(orderId));

    if (!order.drone_id) {
      console.warn(`⚠️ Order ${orderId} does not have an assigned drone`);
      alert(
        "Warning: Order has no drone assigned. Please confirm order first to assign a drone."
      );
      return;
    }

    // Fetch restaurant and customer locations
    const restaurant = await apiClient.get(
      `/restaurants/${order.restaurant_id}`
    );
    const addresses = await apiClient.get("/addresses");
    const customerAddress = addresses.find((a) => a.id === order.address_id);

    const restaurantLocation = restaurant.location || {
      lat: 10.77,
      lng: 106.68,
    };
    const customerLocation = order.dropoff_gps ||
      customerAddress?.location || {
        lat: 10.8,
        lng: 106.7,
      };

    console.log(`🚁 Auto-triggering delivery for order ${orderId}`);
    console.log(`📍 From: ${JSON.stringify(restaurantLocation)}`);
    console.log(`📍 To: ${JSON.stringify(customerLocation)}`);

    // Run the full simulation
    await runFullDroneSimulation(
      orderId,
      order.drone_id,
      restaurantLocation,
      customerLocation
    );
  } catch (error) {
    console.error(`❌ Failed to auto-trigger delivery:`, error);
    throw error;
  }
};

export default {
  simulateDroneDelivery,
  simulateDroneMovement,
  runFullDroneSimulation,
  autoTriggerDelivery,
};
