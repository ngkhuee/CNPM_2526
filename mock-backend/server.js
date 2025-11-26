const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const { generateToken, validateToken, logger } = require("./middlewares");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Auto-save changes to db.json
const saveDb = () => {
  const db = router.db.getState();
  fs.writeFileSync(
    path.join(__dirname, "db.json"),
    JSON.stringify(db, null, 2),
    "utf-8"
  );
  console.log("[DB] Saved changes to db.json");
};

// No auto-save interval - save only on actual write operations

// ========== DRONE SIMULATION FUNCTIONS ==========
/**
 * Simulate drone flying from base to restaurant
 * Duration: 20 seconds
 * Flow: searching -> going_to_restaurant -> at_restaurant
 * Base location: 273 An Dương Vương (10.7626, 106.682)
 */
const simulateDroneToRestaurant = (orderId, droneId) => {
  const db = router.db;
  const BASE_LOCATION = { lat: 10.7626, lng: 106.682 };

  console.log(`[DRONE SIM] Starting base -> restaurant for order ${orderId}, drone ${droneId}`);

  // Get order and restaurant location
  const order = db.get("orders").find({ id: orderId }).value();
  if (!order) {
    console.log(`[DRONE SIM] Order ${orderId} not found`);
    return;
  }

  const restaurant = db.get("restaurants").find({ id: order.restaurant_id }).value();
  const restaurantLat = restaurant?.latitude || restaurant?.lat || 10.776;
  const restaurantLng = restaurant?.longitude || restaurant?.lng || 106.7;

  // Validate order state
  if (!order) {
    console.log(`[DRONE SIM] Order ${orderId} not found`);
    return;
  }

  // Check if order is in valid state for starting simulation
  if (order.drone_journey_stage !== "searching") {
    console.log(`[DRONE SIM] Order ${orderId} not in searching stage (current: ${order.drone_journey_stage}), skipping`);
    return;
  }

  // Validate drone is assigned
  if (!droneId || order.drone_id !== droneId) {
    console.log(`[DRONE SIM] Drone mismatch for order ${orderId}: expected ${droneId}, got ${order.drone_id}`);
    return;
  }

  console.log(`[DRONE SIM] ✅ Starting simulation for order ${orderId} with drone ${droneId}`);

  // Step 1: Wait 1 second before starting to move (let frontend show "searching" state)
  setTimeout(() => {
    // Re-check order state before proceeding
    const currentOrder = db.get("orders").find({ id: orderId }).value();
    if (!currentOrder || currentOrder.drone_journey_stage !== "searching") {
      console.log(`[DRONE SIM] Order ${orderId} state changed, aborting simulation`);
      return;
    }
    // Set to "going_to_restaurant" and start moving
    db.get("orders")
      .find({ id: orderId })
      .assign({
        drone_journey_stage: "going_to_restaurant",
        current_gps: {
          lat: BASE_LOCATION.lat,
          lng: BASE_LOCATION.lng,
          latitude: BASE_LOCATION.lat,
          longitude: BASE_LOCATION.lng,
        },
        updated_at: new Date().toISOString(),
      })
      .write();

    // Set drone at base location
    db.get("drones")
      .find({ id: droneId })
      .assign({
        latitude: BASE_LOCATION.lat,
        longitude: BASE_LOCATION.lng,
        current_location: {
          lat: BASE_LOCATION.lat,
          lng: BASE_LOCATION.lng,
        },
        updated_at: new Date().toISOString(),
      })
      .write();

    console.log(`[DRONE SIM] Order ${orderId}: drone leaving base NOW, going to restaurant`);

    // Step 2: Simulate GPS movement from base to restaurant using RECURSIVE setTimeout
    const steps = 20; // 20 steps
    const interval = 100; // 100ms per step = 2 seconds total
    let currentStep = 0;

    const moveStep = () => {
      currentStep++;
      if (currentStep > steps) {
        // Finished moving - arrived at restaurant
        const currentOrder = db.get("orders").find({ id: orderId }).value();
        if (currentOrder && currentOrder.drone_journey_stage === "going_to_restaurant") {
          db.get("orders")
            .find({ id: orderId })
            .assign({
              status: "preparing", // Update status to preparing when drone arrives
              drone_journey_stage: "at_restaurant",
              current_gps: {
                lat: restaurantLat,
                lng: restaurantLng,
                latitude: restaurantLat,
                longitude: restaurantLng,
              },
              updated_at: new Date().toISOString(),
            })
            .write();

          // Set drone to exact restaurant location
          db.get("drones")
            .find({ id: droneId })
            .assign({
              latitude: restaurantLat,
              longitude: restaurantLng,
              current_location: {
                lat: restaurantLat,
                lng: restaurantLng,
              },
              updated_at: new Date().toISOString(),
            })
            .write();

          console.log(`[DRONE SIM] ✅ Order ${orderId}: drone ARRIVED at restaurant - Status changed to PREPARING`);
        }
        return;
      }

      // Calculate current position
      const progress = currentStep / steps;
      const currentLat = BASE_LOCATION.lat + (restaurantLat - BASE_LOCATION.lat) * progress;
      const currentLng = BASE_LOCATION.lng + (restaurantLng - BASE_LOCATION.lng) * progress;

      // Update drone location
      db.get("drones")
        .find({ id: droneId })
        .assign({
          latitude: currentLat,
          longitude: currentLng,
          current_location: {
            lat: currentLat,
            lng: currentLng,
          },
          updated_at: new Date().toISOString(),
        })
        .write();

      // Update order current_gps so frontend can track drone in real-time
      db.get("orders")
        .find({ id: orderId })
        .assign({
          current_gps: {
            lat: currentLat,
            lng: currentLng,
            latitude: currentLat,
            longitude: currentLng,
          },
          updated_at: new Date().toISOString(),
        })
        .write();

      console.log(`[DRONE SIM] 🚁 Drone ${droneId} step ${currentStep}/${steps}: (${currentLat.toFixed(5)}, ${currentLng.toFixed(5)}) - ${Math.round(progress * 100)}%`);

      // Schedule next step
      setTimeout(moveStep, interval);
    };

    // Start first step
    moveStep();
  }, 1000); // 1 second delay before starting
};

/**
 * Simulate drone flying from restaurant to customer, then return to base
 * Duration: 15 seconds (delivery) + 10 seconds (return to base)
 * Flow: going_to_customer -> at_customer -> arrived -> returning_to_base -> (drone available)
 * Base location: 273 An Dương Vương (10.7626, 106.682)
 */
const simulateDroneToCustomer = (orderId) => {
  try {
    console.log(`[DRONE SIM] ========== FUNCTION CALLED ==========`);
    console.log(`[DRONE SIM] Received orderId: ${orderId}`);
    const db = router.db;
    const BASE_LOCATION = { lat: 10.7626, lng: 106.682 };

    const order = db.get("orders").find({ id: orderId }).value();
    console.log(`[DRONE SIM] Order found:`, order ? `YES (drone: ${order.drone_id})` : `NO`);

    if (!order || !order.drone_id) {
      console.log(`[DRONE SIM] ❌ CANNOT START: order=${!!order}, drone_id=${order?.drone_id}`);
      return;
    }

    console.log(`[DRONE SIM] ========== STARTING DELIVERY SIMULATION ==========`);
    console.log(`[DRONE SIM] Order ID: ${orderId}`);
    console.log(`[DRONE SIM] Drone ID: ${order.drone_id}`);
    console.log(`[DRONE SIM] Current status: ${order.status}, stage: ${order.drone_journey_stage}`);

    // Validate order state
    if (order.drone_journey_stage !== "at_restaurant") {
      console.log(`[DRONE SIM] ❌ Order ${orderId} drone not at restaurant (stage: ${order.drone_journey_stage}), cannot start delivery`);
      return;
    }

    console.log(`[DRONE SIM] ✅ Validation passed, starting restaurant -> customer for order ${orderId}`);

    // Wait 2 seconds before starting (let frontend show "ready" state)
    setTimeout(() => {
      // Re-check order state before proceeding
      const currentOrder = db.get("orders").find({ id: orderId }).value();
      if (!currentOrder) {
        console.log(`[DRONE SIM] ❌ Order ${orderId} not found, aborting delivery`);
        return;
      }

      // Allow "at_restaurant" or "ready" status
      if (currentOrder.drone_journey_stage !== "at_restaurant" && currentOrder.status !== "ready") {
        console.log(`[DRONE SIM] ❌ Order ${orderId} state changed (status: ${currentOrder.status}, stage: ${currentOrder.drone_journey_stage}), aborting delivery`);
        return;
      }

      // NOW set status to delivering and start moving
      db.get("orders")
        .find({ id: orderId })
        .assign({
          drone_journey_stage: "going_to_customer",
          status: "delivering",
          updated_at: new Date().toISOString(),
        })
        .write();

      console.log(`[DRONE SIM] ✅ Order ${orderId}: Status changed to DELIVERING, drone starting journey`);

      // Simulate GPS movement from restaurant to customer
      const pickup = order.pickup_gps || { latitude: 10.776, longitude: 106.7 };
      const dropoff = order.dropoff_gps || { latitude: 10.7867657, longitude: 106.7001391 };

      const pickupLat = pickup.latitude || pickup.lat || 10.776;
      const pickupLng = pickup.longitude || pickup.lng || 106.7;
      const dropoffLat = dropoff.latitude || dropoff.lat || 10.7867657;
      const dropoffLng = dropoff.longitude || dropoff.lng || 106.7001391;

      const steps = 40; // 40 steps - nhiều steps hơn để thấy di chuyển mượt
      const interval = 200; // 200ms per step = 8 seconds total
      let currentStep = 0;

      const moveToCustomer = () => {
        currentStep++;
        if (currentStep > steps) {
          // Arrived at customer
          console.log(`[DRONE SIM] ✅ Order ${orderId}: drone ARRIVED at customer`);

          db.get("orders")
            .find({ id: orderId })
            .assign({
              status: "arrived",
              drone_journey_stage: "at_customer",
              current_gps: {
                lat: dropoffLat,
                lng: dropoffLng,
                latitude: dropoffLat,
                longitude: dropoffLng,
              },
              updated_at: new Date().toISOString(),
            })
            .write();

          db.get("drones")
            .find({ id: order.drone_id })
            .assign({
              latitude: dropoffLat,
              longitude: dropoffLng,
              current_location: {
                lat: dropoffLat,
                lng: dropoffLng,
              },
              updated_at: new Date().toISOString(),
            })
            .write();

          // After 2 seconds at customer, start returning to base
          setTimeout(() => {
            console.log(`[DRONE SIM] 🔙 Order ${orderId}: drone returning to base`);
            returnToBase(order.drone_id, dropoffLat, dropoffLng);
          }, 2000);

          // Auto-complete order after 10 minutes if customer doesn't confirm
          setTimeout(() => {
            const currentOrder = db.get("orders").find({ id: orderId }).value();
            if (currentOrder && currentOrder.status === "arrived") {
              console.log(`[AUTO-COMPLETE] ⏰ Order ${orderId}: Auto-completing after 10 minutes`);
              db.get("orders")
                .find({ id: orderId })
                .assign({
                  status: "delivered",
                  actual_delivery_time: new Date().toISOString(),
                  updated_at: new Date().toISOString(),
                })
                .write();
            }
          }, 10 * 60 * 1000); // 10 minutes
          return;
        }

        // Calculate current position
        const progress = currentStep / steps;
        const currentLat = pickupLat + (dropoffLat - pickupLat) * progress;
        const currentLng = pickupLng + (dropoffLng - pickupLng) * progress;

        console.log(`[DRONE SIM] 🚁 Drone step ${currentStep}/${steps}: (${currentLat.toFixed(6)}, ${currentLng.toFixed(6)}) - ${Math.round(progress * 100)}%`);

        db.get("orders")
          .find({ id: orderId })
          .assign({
            current_gps: {
              lat: currentLat,
              lng: currentLng,
              latitude: currentLat,
              longitude: currentLng,
            },
            updated_at: new Date().toISOString(),
          })
          .write();

        db.get("drones")
          .find({ id: order.drone_id })
          .assign({
            latitude: currentLat,
            longitude: currentLng,
            current_location: {
              lat: currentLat,
              lng: currentLng,
            },
            updated_at: new Date().toISOString(),
          })
          .write();

        // Schedule next step
        setTimeout(moveToCustomer, interval);
      };

      // Start movement
      moveToCustomer();

      // Helper function to return drone to base
      function returnToBase(droneId, startLat, startLng) {
        const returnSteps = 10; // 10 steps
        const returnInterval = 1000; // 1 second per step = 10 seconds total
        let returnStep = 0;

        const moveToBase = () => {
          returnStep++;
          if (returnStep > returnSteps) {
            // Arrived at base
            console.log(`[DRONE SIM] ✅ Drone ${droneId}: ARRIVED at base, now available`);

            db.get("drones")
              .find({ id: droneId })
              .assign({
                status: "available",
                assigned_order_id: null,
                latitude: BASE_LOCATION.lat,
                longitude: BASE_LOCATION.lng,
                current_location: {
                  lat: BASE_LOCATION.lat,
                  lng: BASE_LOCATION.lng,
                  address: "273 An Dương Vương, Phường Chợ Quán, TP. HCM"
                },
                battery_level: 100,
                updated_at: new Date().toISOString(),
              })
              .write();
            return;
          }

          const returnProgress = returnStep / returnSteps;
          const currentReturnLat = startLat + (BASE_LOCATION.lat - startLat) * returnProgress;
          const currentReturnLng = startLng + (BASE_LOCATION.lng - startLng) * returnProgress;

          console.log(`[DRONE SIM] 🔙 Drone ${droneId} returning step ${returnStep}/${returnSteps}: (${currentReturnLat.toFixed(6)}, ${currentReturnLng.toFixed(6)})`);

          db.get("drones")
            .find({ id: droneId })
            .assign({
              latitude: currentReturnLat,
              longitude: currentReturnLng,
              current_location: {
                lat: currentReturnLat,
                lng: currentReturnLng,
              },
              updated_at: new Date().toISOString(),
            })
            .write();

          // Schedule next step
          setTimeout(moveToBase, returnInterval);
        };

        // Start return journey
        moveToBase();
      }
    }, 2000); // 2 seconds delay before starting delivery
  } catch (error) {
    console.error(`[DRONE SIM] ❌❌❌ ERROR IN simulateDroneToCustomer:`, error);
  }
};

// ========== BACKGROUND DRONE ASSIGNMENT SERVICE ==========
// ========== RESUME STUCK SIMULATIONS ON SERVER START ==========
// Resume any orders stuck in "going_to_restaurant" or "going_to_customer" stages
const resumeStuckSimulations = () => {
  const db = router.db;
  const orders = db.get("orders").value() || [];
  const BASE_LOCATION = { lat: 10.7626, lng: 106.682 };

  orders.forEach((order) => {
    // Release drones from completed orders
    if (["arrived", "delivered", "completed", "cancelled"].includes(order.status) && order.drone_id) {
      const drone = db.get("drones").find({ id: order.drone_id }).value();
      if (drone && drone.status === "busy" && drone.assigned_order_id === order.id) {
        console.log(`[RESUME] Releasing drone ${order.drone_id} from completed order ${order.id}`);
        db.get("drones")
          .find({ id: order.drone_id })
          .assign({
            status: "available",
            assigned_order_id: null,
            latitude: BASE_LOCATION.lat,
            longitude: BASE_LOCATION.lng,
            current_location: {
              lat: BASE_LOCATION.lat,
              lng: BASE_LOCATION.lng,
              address: "273 An Dương Vương, Phường Chợ Quán, TP. HCM"
            },
            battery_level: 100,
            updated_at: new Date().toISOString(),
          })
          .write();
      }
      return; // Skip further processing
    }

    if (order.drone_id && order.drone_journey_stage) {
      // Handle orders stuck in "searching" state with drone already assigned
      if (order.drone_journey_stage === "searching") {
        console.log(`[RESUME] Order ${order.id} stuck in searching with drone ${order.drone_id}, restarting simulation...`);
        // Restart the simulation to restaurant
        simulateDroneToRestaurant(order.id, order.drone_id);
        return;
      }

      if (order.drone_journey_stage === "going_to_restaurant") {
        console.log(`[RESUME] Order ${order.id} stuck in going_to_restaurant, completing journey...`);
        // Complete the journey to restaurant immediately
        const restaurant = db.get("restaurants").find({ id: order.restaurant_id }).value();
        const restaurantLat = restaurant?.latitude || restaurant?.lat || 10.776;
        const restaurantLng = restaurant?.longitude || restaurant?.lng || 106.7;

        db.get("orders")
          .find({ id: order.id })
          .assign({
            drone_journey_stage: "at_restaurant",
            updated_at: new Date().toISOString(),
          })
          .write();

        db.get("drones")
          .find({ id: order.drone_id })
          .assign({
            latitude: restaurantLat,
            longitude: restaurantLng,
            current_location: {
              lat: restaurantLat,
              lng: restaurantLng,
            },
            updated_at: new Date().toISOString(),
          })
          .write();

        console.log(`[RESUME] Order ${order.id} drone now at restaurant`);
      } else if (order.drone_journey_stage === "at_restaurant" && order.status === "ready") {
        // Handle orders stuck in "ready" state (restaurant marked ready but simulation didn't start)
        console.log(`[RESUME] Order ${order.id} stuck in ready state, restarting delivery simulation...`);
        simulateDroneToCustomer(order.id);
        return;
      } else if (order.drone_journey_stage === "going_to_customer") {
        console.log(`[RESUME] Order ${order.id} stuck in going_to_customer, completing delivery...`);
        // Complete the delivery to customer immediately
        const dropoff = order.dropoff_gps || { lat: 10.7867657, lng: 106.7001391 };
        const dropoffLat = dropoff.latitude || dropoff.lat || 10.7867657;
        const dropoffLng = dropoff.longitude || dropoff.lng || 106.7001391;

        db.get("orders")
          .find({ id: order.id })
          .assign({
            drone_journey_stage: "at_customer",
            status: "arrived",
            updated_at: new Date().toISOString(),
          })
          .write();

        db.get("drones")
          .find({ id: order.drone_id })
          .assign({
            latitude: dropoffLat,
            longitude: dropoffLng,
            current_location: {
              lat: dropoffLat,
              lng: dropoffLng,
            },
            updated_at: new Date().toISOString(),
          })
          .write();

        console.log(`[RESUME] Order ${order.id} drone now at customer`);
      }
    }
  });
};

// Run resume on server start
console.log("[INIT] Checking for stuck simulations...");
resumeStuckSimulations();

// Automatically assign drones to confirmed orders every 5 seconds
let droneAssignmentInterval = setInterval(() => {
  const db = router.db;
  const orders = db.get("orders").value() || [];
  const drones = db.get("drones").value() || [];

  // Find orders that need drone assignment (status='confirmed' means payment completed and restaurant confirmed)
  const ordersNeedingDrone = orders.filter(
    (order) =>
      order.status === "confirmed" &&
      !order.drone_id &&
      !order.drone_journey_stage
  );

  if (ordersNeedingDrone.length === 0) {
    return; // No orders to process
  }

  // Find available drones
  const availableDrones = drones.filter(
    (drone) => drone.status === "available"
  );

  if (availableDrones.length === 0) {
    console.log(
      `[DRONE ASSIGNMENT] ${ordersNeedingDrone.length} orders waiting, but no drones available`
    );
    return;
  }

  // Assign drones to orders (one drone per order)
  ordersNeedingDrone.slice(0, availableDrones.length).forEach((order, index) => {
    const drone = availableDrones[index];

    // Update order
    db.get("orders")
      .find({ id: order.id })
      .assign({
        drone_id: drone.id,
        drone_journey_stage: "searching",
        updated_at: new Date().toISOString(),
      })
      .write();

    // Update drone
    db.get("drones")
      .find({ id: drone.id })
      .assign({
        status: "busy",
        assigned_order_id: order.id,
        updated_at: new Date().toISOString(),
      })
      .write();

    console.log(
      `[DRONE ASSIGNMENT] Assigned drone ${drone.identifier} to order ${order.id}`
    );

    // Start drone simulation to restaurant
    simulateDroneToRestaurant(order.id, drone.id);
  });
}, 5000);

// Save on server shutdown
process.on("SIGINT", () => {
  console.log("\nSaving database before shutdown...");
  clearInterval(droneAssignmentInterval);
  saveDb();
  console.log("Database saved. Shutting down...");
  process.exit(0);
});

// Middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(logger);

// Serve static files (images)
const express = require("express");
server.use("/images", express.static("public/images"));
// không phải API upload, mà chỉ là phần serve ảnh tĩnh trong backend.

// CORS
server.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  next();
});

// ========== MULTER CONFIGURATION ==========
// Configure storage for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const category = req.body.category || "other";
    const uploadDir = path.join(__dirname, "public/images", category);

    // Create directory if not exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    // Sanitize filename and add timestamp
    const ext = path.extname(file.originalname);
    const name = path
      .basename(file.originalname, ext)
      .replace(/[^a-zA-Z0-9_-]/g, "_");
    const timestamp = Date.now();
    cb(null, `${name}_${timestamp}${ext}`);
  },
});

// File filter - only allow images
const fileFilter = (req, file, cb) => {
  const allowedMimes = ["image/png", "image/jpeg", "image/jpg", "image/webp"];

  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only PNG, JPG, JPEG, WebP images are allowed"), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

// ========== IMAGE UPLOAD ENDPOINT ==========
server.post("/upload", upload.single("file"), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
      });
    }

    const category = req.body.category || "other";
    const imagePath = `/images/${category}/${req.file.filename}`;
    const protocol = req.protocol || "http";
    const host = req.get("host") || `localhost:${PORT}`;
    const imageUrl = `${protocol}://${host}${imagePath}`;

    res.json({
      success: true,
      message: "File uploaded successfully",
      filename: req.file.filename,
      path: imagePath,
      url: imageUrl,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message || "Upload failed",
    });
  }
});

// Error handler for multer
server.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    return res.status(400).json({
      success: false,
      message: `Upload error: ${error.message}`,
    });
  }

  if (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next();
});

// Custom routes rewriter - Load from routes.json
const routes = require("./routes.json");
console.log("Loading custom routes:", routes);
server.use(jsonServer.rewriter(routes));

// ========== CUSTOM ENDPOINTS ==========

// ========== AUTO-CANCEL PENDING ORDERS (Before auth middleware - PUBLIC) ==========
// Check and auto-cancel pending orders older than 30 minutes
server.post("/orders/check-pending-expiry", (req, res) => {
  const db = router.db;
  const orders = db.get("orders").value();
  const PENDING_TIMEOUT = 30 * 60 * 1000; // 30 minutes in milliseconds
  const now = Date.now();

  let cancelledCount = 0;

  orders.forEach((order) => {
    // Only auto-cancel if payment not completed
    if (order.status === "pending" && order.payment_status === "pending") {
      const createdAt = new Date(order.created_at).getTime();
      const timeDiff = now - createdAt;

      // If order is pending for more than 30 minutes, cancel it
      if (timeDiff > PENDING_TIMEOUT) {
        order.status = "cancelled";
        order.cancellation_reason = "Auto-cancelled: Payment not completed within 30 minutes";
        order.updated_at = new Date().toISOString();
        cancelledCount++;
      }
    }
  });

  // Write changes back to db
  if (cancelledCount > 0) {
    db.set("orders", orders).write();
  }

  res.json({
    success: true,
    message: `${cancelledCount} pending orders auto-cancelled`,
    cancelled_count: cancelledCount,
  });
});

// ========== CUSTOM ORDER CREATION ENDPOINT (Before auth middleware) ==========
// POST /orders - Create new order with auto-populated user_id from token
server.post("/orders", (req, res) => {
  console.log("[POST /orders] ✅ Handler called!");
  console.log("[POST /orders] req.headers.authorization:", req.headers.authorization);

  // Manually validate token since this handler is before validateToken middleware
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    console.log("[POST /orders] ❌ No token provided");
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token required",
    });
  }

  // Verify token
  let decoded;
  try {
    const SECRET_KEY = process.env.JWT_SECRET || "tomato-food-delivery-secret-key";
    const jwt = require("jsonwebtoken");
    decoded = jwt.verify(token, SECRET_KEY);
    console.log("[POST /orders] ✅ Token valid, userId:", decoded.id);
  } catch (error) {
    console.log("[POST /orders] ❌ Token invalid:", error.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }

  const userId = decoded.id;
  if (!userId) {
    console.log("[POST /orders] ❌ No userId in token");
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid token",
    });
  }

  const db = router.db;
  const orderData = req.body;

  console.log("[POST /orders] Request body:", JSON.stringify(orderData, null, 2));
  console.log("[POST /orders] restaurant_id:", orderData.restaurant_id);
  console.log("[POST /orders] items type:", typeof orderData.items, "length:", orderData.items?.length);
  if (orderData.items && orderData.items.length > 0) {
    console.log("[POST /orders] First item:", JSON.stringify(orderData.items[0], null, 2));
  }

  // Validate required fields
  if (!orderData.restaurant_id) {
    console.log("[POST /orders] ❌ Missing restaurant_id");
    return res.status(400).json({
      success: false,
      message: "restaurant_id is required",
    });
  }

  // Validate items - make sure it exists and is an array
  if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    console.log("[POST /orders] ❌ Invalid items:", {
      exists: !!orderData.items,
      isArray: Array.isArray(orderData.items),
      length: orderData.items?.length,
      itemsValue: orderData.items
    });
    return res.status(400).json({
      success: false,
      message: "Order must contain at least one item. Please add items to your cart before placing an order.",
      details: {
        itemsReceived: orderData.items,
        isArray: Array.isArray(orderData.items)
      }
    });
  }

  // Check if restaurant is open
  const restaurant = db.get("restaurants").find({ id: orderData.restaurant_id }).value();
  if (!restaurant) {
    console.log("[POST /orders] ❌ Restaurant not found:", orderData.restaurant_id);
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  // Check opening hours
  const isOpen = isRestaurantOpenHelper(restaurant.opening_hours);
  console.log("[POST /orders] Restaurant open check:", {
    restaurantId: restaurant.id,
    restaurantName: restaurant.name,
    isOpen: isOpen,
    openingHours: restaurant.opening_hours
  });

  if (!isOpen) {
    console.log("[POST /orders] ❌ Restaurant is closed");
    return res.status(400).json({
      success: false,
      message: `Restaurant is currently closed. Opening hours: ${JSON.stringify(restaurant.opening_hours)}`,
      code: "RESTAURANT_CLOSED",
    });
  }

  // Auto-populate user_id and pickup_gps from restaurant location
  const newOrder = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId, // Auto-populate from token
    restaurant_id: orderData.restaurant_id,
    items: (orderData.items || []).map(item => ({
      // Support all field name variations - check in priority order
      menu_id: item.menu_id || item.food_id || item.foodId || item.id,
      name: item.name || "",
      quantity: item.quantity || 1,
      unit_price: item.unit_price || item.price || 0,
      subtotal: (item.quantity || 1) * (item.unit_price || item.price || 0),
    })),
    subtotal: orderData.subtotal || 0,
    delivery_fee: orderData.delivery_fee || 0,
    discount_amount: orderData.discount_amount || 0,
    total_amount: orderData.total_amount || 0,
    payment_method: orderData.payment_method || "momo",
    payment_status: orderData.payment_status || "pending",
    status: orderData.status || "pending",
    special_instructions: orderData.special_instructions || "",
    customer: orderData.customer || {},
    delivery_address: orderData.delivery_address,
    delivery_address_id: orderData.delivery_address_id,
    // Auto-populate pickup_gps from restaurant location
    pickup_gps: orderData.pickup_gps || restaurant.location || null,
    dropoff_gps: orderData.dropoff_gps,
    promotion_code: orderData.promotion_code,
    promotion_id: orderData.promotion_id,
    order_number: orderData.order_number || `ORD-${Date.now()}`,
    created_at: orderData.created_at || new Date().toISOString(),
    updated_at: orderData.updated_at || new Date().toISOString(),
  };

  // Add to database
  db.get("orders").push(newOrder).write();

  console.log("[POST /orders] Order created:", {
    orderId: newOrder.id,
    userId,
    restaurantId: newOrder.restaurant_id,
    items: newOrder.items.length,
    pickup_gps: newOrder.pickup_gps,
    dropoff_gps: newOrder.dropoff_gps,
  });

  res.status(201).json(newOrder);
});

// Middleware to validate order status transitions
server.patch("/orders/:id", (req, res, next) => {
  if (req.body.status === 'confirmed') {
    const db = router.db;
    const orderId = req.params.id;
    const order = db.get('orders').find({ id: orderId }).value();

    // Validate: can only confirm if payment is completed (check both payment_status and status)
    if (order && order.payment_status !== 'paid' && order.status !== 'paid') {
      return res.status(400).json({
        success: false,
        message: 'Cannot confirm order: Payment not completed',
        code: 'PAYMENT_NOT_COMPLETED'
      });
    }
  }
  next();
});

// Apply auth middleware (after custom routes)
server.use(validateToken);

// ========== PROTECTED CART ENDPOINTS (After auth middleware) ==========
server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;

  // Validation: Check empty fields
  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
      fieldError: "email"
    });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
      fieldError: "password"
    });
  }

  // Validation: Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
      fieldError: "email"
    });
  }

  const user = db.get("users").find({ email: email.trim(), password }).value();

  if (user) {
    const token = generateToken(user);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      token,
      user: userWithoutPassword,
      message: "Login successful",
    });
  } else {
    res.status(401).json({
      success: false,
      message: "Invalid email or password",
    });
  }
});

// Auth - Register
server.post("/auth/register", (req, res) => {
  const { email, password, confirmPassword, name, phone } = req.body;
  const db = router.db;

  // Validation: Check empty fields
  if (!email || !email.trim()) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
      fieldError: "email"
    });
  }

  if (!password || !password.trim()) {
    return res.status(400).json({
      success: false,
      message: "Password is required",
      fieldError: "password"
    });
  }

  if (!name || !name.trim()) {
    return res.status(400).json({
      success: false,
      message: "Name is required",
      fieldError: "name"
    });
  }

  // Validation: Check email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return res.status(400).json({
      success: false,
      message: "Invalid email format",
      fieldError: "email"
    });
  }

  // Validation: Check password length
  // if (password.length < 6) {
  //   return res.status(400).json({
  //     success: false,
  //     message: "Password must be at least 6 characters",
  //     fieldError: "password"
  //   });
  // }

  // Validation: Check password confirmation
  if (confirmPassword && password !== confirmPassword) {
    return res.status(400).json({
      success: false,
      message: "Passwords do not match",
      fieldError: "confirmPassword"
    });
  }

  // Validation: Check phone format (if provided)
  if (phone && phone.trim()) {
    const phoneRegex = /^[0-9]{10,11}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be 10-11 digits",
        fieldError: "phone"
      });
    }
  }

  // Check if email exists
  const existingUser = db.get("users").find({ email: email.trim() }).value();

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
      fieldError: "email"
    });
  }

  // Create new user
  const newUser = {
    id: `u${Date.now()}`,
    email: email.trim(),
    password,
    name: name.trim(),
    phone: (phone && phone.trim()) || "",
    roles: ["customer"],
    status: "active",
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  db.get("users").push(newUser).write();

  const token = generateToken(newUser);
  const { password: _, ...userWithoutPassword } = newUser;

  res.status(201).json({
    success: true,
    token,
    user: userWithoutPassword,
    message: "Registration successful",
  });
});

// Menus with calculated rating and sold count
server.get("/menus", (req, res) => {
  const db = router.db;
  const menus = db.get("menus").value();
  const reviews = db.get("reviews").value();
  const orders = db.get("orders").value();

  // Calculate rating and sold count for each menu item
  const menusWithRating = menus.map((menu) => {
    const foodReviews = reviews.filter((review) => review.food_id === menu.id);

    let avgRating = 0;
    if (foodReviews.length > 0) {
      const totalRating = foodReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      avgRating = totalRating / foodReviews.length;
    }

    // Calculate sold count from orders
    let soldCount = 0;
    orders.forEach((order) => {
      if (order.items && Array.isArray(order.items)) {
        order.items.forEach((item) => {
          if (item.menu_id === menu.id) {
            soldCount += item.quantity || 0;
          }
        });
      }
    });

    return {
      ...menu,
      rating: avgRating,
      reviewCount: foodReviews.length,
      sold: soldCount,
    };
  });

  // Apply filters if query params provided
  let result = menusWithRating;

  if (req.query.restaurant_id) {
    result = result.filter(
      (item) => item.restaurant_id === req.query.restaurant_id
    );
  }

  if (req.query.category_id) {
    result = result.filter(
      (item) => item.category_id === req.query.category_id
    );
  }

  res.json(result);
});

// Single menu item with rating and sold count
server.get("/menus/:id", (req, res) => {
  const db = router.db;
  const menu = db
    .get("menus")
    .find({ id: parseInt(req.params.id) })
    .value();

  if (!menu) {
    return res.status(404).json({ error: "Menu item not found" });
  }

  const reviews = db.get("reviews").value();
  const orders = db.get("orders").value();
  const foodReviews = reviews.filter((review) => review.food_id === menu.id);

  let avgRating = 0;
  if (foodReviews.length > 0) {
    const totalRating = foodReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    avgRating = totalRating / foodReviews.length;
  }

  // Calculate sold count from orders
  let soldCount = 0;
  orders.forEach((order) => {
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item) => {
        if (item.menu_id === menu.id) {
          soldCount += item.quantity || 0;
        }
      });
    }
  });

  res.json({
    ...menu,
    rating: avgRating,
    reviewCount: foodReviews.length,
    sold: soldCount,
  });
});

// Restaurants with calculated rating and review count
server.get("/restaurants", (req, res) => {
  const db = router.db;
  const restaurants = db.get("restaurants").value();
  const reviews = db.get("reviews").value();
  const menus = db.get("menus").value();

  // Calculate rating and review count for each restaurant
  const restaurantsWithRating = restaurants.map((restaurant) => {
    // Get all reviews for this restaurant
    const restaurantReviews = reviews.filter(
      (review) => review.restaurant_id === restaurant.id
    );

    // Calculate average rating
    let avgRating = 0;
    if (restaurantReviews.length > 0) {
      const totalRating = restaurantReviews.reduce(
        (sum, review) => sum + review.rating,
        0
      );
      avgRating = totalRating / restaurantReviews.length;
    }

    return {
      ...restaurant,
      rating: avgRating || restaurant.rating, // Use calculated or fallback to existing
      total_reviews: restaurantReviews.length,
    };
  });

  res.json(restaurantsWithRating);
});

// Single restaurant with calculated rating
server.get("/restaurants/:id", (req, res) => {
  const db = router.db;
  const restaurant = db.get("restaurants").find({ id: req.params.id }).value();

  if (!restaurant) {
    return res.status(404).json({ error: "Restaurant not found" });
  }

  const reviews = db.get("reviews").value();
  const restaurantReviews = reviews.filter(
    (review) => review.restaurant_id === restaurant.id
  );

  let avgRating = 0;
  if (restaurantReviews.length > 0) {
    const totalRating = restaurantReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    avgRating = totalRating / restaurantReviews.length;
  }

  res.json({
    ...restaurant,
    rating: avgRating || restaurant.rating,
    total_reviews: restaurantReviews.length,
  });
});

// Restaurant Registration - Public endpoint (không cần auth)
server.post("/restaurants/register", (req, res) => {
  const db = router.db;
  const restaurantData = req.body;

  // Validate required fields
  if (
    !restaurantData.name ||
    !restaurantData.email ||
    !restaurantData.owner_id
  ) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // Check if email already exists
  const existingRestaurant = db
    .get("restaurants")
    .find({ email: restaurantData.email })
    .value();

  if (existingRestaurant) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  // Add restaurant to database
  db.get("restaurants").push(restaurantData).write();

  res.status(201).json({
    success: true,
    restaurant: restaurantData,
    message: "Restaurant registered successfully",
  });
});

// User Registration for Restaurant Owner - Public endpoint
server.post("/users/register-owner", (req, res) => {
  const db = router.db;
  const userData = req.body;

  // Validate required fields
  if (!userData.email || !userData.password || !userData.restaurant_id) {
    return res.status(400).json({
      success: false,
      message: "Missing required fields",
    });
  }

  // Check if email already exists
  const existingUser = db.get("users").find({ email: userData.email }).value();

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already registered",
    });
  }

  // Add user to database
  db.get("users").push(userData).write();

  res.status(201).json({
    success: true,
    user: { ...userData, password: undefined }, // Don't return password
    message: "User registered successfully",
  });
});

// Apply auth middleware (after custom routes)
server.use(validateToken);

// ========== USER PROFILE UPDATE ENDPOINT ==========
// Update user profile (name, phone, gender, dob, avatar, email)
server.put("/users/:id", (req, res) => {
  const db = router.db;
  const userId = req.params.id;
  const updateData = req.body;

  console.log(`[PUT /users/:id] Updating user ${userId} with:`, updateData);

  // Validate auth - must be the same user or admin
  if (req.user?.id !== userId && !req.user?.roles?.includes('admin')) {
    return res.status(403).json({
      success: false,
      message: "Unauthorized: Can only update own profile",
    });
  }

  // Find user
  const user = db.get("users").find({ id: userId }).value();

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  // Allowed fields to update
  const allowedFields = ["name", "phone", "gender", "dob", "avatar", "email", "full_name"];

  // Validate email uniqueness if email is being updated
  if (updateData.email && updateData.email !== user.email) {
    const existingEmail = db.get("users").find({ email: updateData.email }).value();
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: "Email already in use",
      });
    }
  }

  // Update only allowed fields
  const updates = {};
  allowedFields.forEach((field) => {
    if (updateData.hasOwnProperty(field)) {
      updates[field] = updateData[field];
    }
  });

  // Add metadata
  updates.updated_at = new Date().toISOString();

  // Perform update
  const updatedUser = { ...user, ...updates };
  db.get("users").find({ id: userId }).assign(updatedUser).write();

  console.log(`[PUT /users/:id] Updated user:`, updatedUser);

  // Return updated user without password
  const { password: _, ...userWithoutPassword } = updatedUser;

  res.json({
    success: true,
    user: userWithoutPassword,
    message: "Profile updated successfully",
  });
});

// ========== PROTECTED CART ENDPOINTS (After auth middleware) ==========

// Cart - Get user's cart
server.get("/carts", (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const db = router.db;
  let cart = db.get("carts").find({ user_id: userId }).value();

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  // Add restaurant name if cart has items
  if (cart.restaurant_id) {
    const restaurant = db.get("restaurants").find({ id: cart.restaurant_id }).value();
    cart.restaurant_name = restaurant?.name || "Unknown";
  }

  res.json(cart);
});

// Cart - Add item with restaurant validation
server.post("/carts/add", (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { restaurant_id, food_id, quantity = 1, note = "" } = req.body;
  const db = router.db;

  // Validate input
  if (!restaurant_id || !food_id) {
    return res.status(400).json({
      success: false,
      message: "restaurant_id and food_id are required",
    });
  }

  // Get food details
  const food = db.get("menus").find({ id: parseInt(food_id) }).value();
  if (!food) {
    return res.status(404).json({
      success: false,
      message: "Food not found",
    });
  }

  let cart = db.get("carts").find({ user_id: userId }).value();

  // Create cart if doesn't exist
  if (!cart) {
    cart = {
      id: db.get("carts").value().length + 1,
      user_id: userId,
      restaurant_id: restaurant_id,
      items: [],
      updated_at: new Date().toISOString(),
    };
    db.get("carts").push(cart).write();
  }

  // Check if cart has items from different restaurant
  // If yes, auto-clear cart and switch to new restaurant
  if (cart.items.length > 0 && cart.restaurant_id !== restaurant_id) {
    console.log(`[carts/add] Cart has items from different restaurant (${cart.restaurant_id}), auto-clearing for new restaurant (${restaurant_id})`);
    // Auto-clear: reset to new restaurant
    cart.items = [];
    cart.restaurant_id = restaurant_id;
  }

  // Update restaurant_id if cart is empty
  if (cart.items.length === 0) {
    cart.restaurant_id = restaurant_id;
  }

  // Check if item already exists in cart
  const existingItemIndex = cart.items.findIndex(
    (item) => item.food_id === parseInt(food_id)
  );

  if (existingItemIndex !== -1) {
    // Update existing item
    cart.items[existingItemIndex].quantity += quantity;
    cart.items[existingItemIndex].note = note;
    cart.items[existingItemIndex].subtotal = cart.items[existingItemIndex].quantity * cart.items[existingItemIndex].price;
  } else {
    // Add new item
    const newItem = {
      item_id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      food_id: parseInt(food_id),
      name: food.name,
      price: food.price,
      image: food.image,
      quantity: quantity,
      note: note,
      subtotal: food.price * quantity,
    };
    cart.items.push(newItem);
  }

  // Calculate total
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  cart.updated_at = new Date().toISOString();

  // Set restaurant ID and name
  cart.restaurant_id = restaurant_id;
  const restaurant = db.get("restaurants").find({ id: restaurant_id }).value();
  cart.restaurant_name = restaurant?.name || "Unknown";

  db.get("carts").find({ user_id: userId }).assign(cart).write();

  res.json(cart);
});

// Cart - Update item
server.patch("/carts/item/:item_id", (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { item_id } = req.params;
  const { quantity, note } = req.body;
  const db = router.db;

  let cart = db.get("carts").find({ user_id: userId }).value();

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  const itemIndex = cart.items.findIndex((item) => item.item_id === item_id);
  if (itemIndex === -1) {
    return res.status(404).json({
      success: false,
      message: "Item not found in cart",
    });
  }

  // Update item
  if (quantity !== undefined) {
    cart.items[itemIndex].quantity = quantity;
    cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;
  }
  if (note !== undefined) {
    cart.items[itemIndex].note = note;
  }

  // Recalculate total
  cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  cart.updated_at = new Date().toISOString();

  db.get("carts").find({ user_id: userId }).assign(cart).write();

  res.json(cart);
});

// Cart - Remove item
server.delete("/carts/item/:item_id", (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const { item_id } = req.params;
  const db = router.db;

  let cart = db.get("carts").find({ user_id: userId }).value();

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter((item) => item.item_id !== item_id);

  // Clear restaurant_id and restaurant_name if cart is empty
  if (cart.items.length === 0) {
    cart.restaurant_id = null;
    cart.restaurant_name = null;
    cart.total = 0;
  } else {
    cart.total = cart.items.reduce((sum, item) => sum + item.subtotal, 0);
  }

  cart.updated_at = new Date().toISOString();

  db.get("carts").find({ user_id: userId }).assign(cart).write();

  res.json(cart);
});

// Cart - Clear
server.delete("/carts/clear", (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const db = router.db;

  let cart = db.get("carts").find({ user_id: userId }).value();

  if (cart) {
    cart.items = [];
    cart.restaurant_id = null;
    cart.restaurant_name = null;
    cart.total = 0;
    cart.updated_at = new Date().toISOString();

    db.get("carts").find({ user_id: userId }).assign(cart).write();
  }

  res.json(cart || { user_id: userId, items: [], restaurant_id: null, restaurant_name: null, total: 0 });
});

// Helper function to check if restaurant is open
const isRestaurantOpenHelper = (openingHours) => {
  if (!openingHours || typeof openingHours !== "object") {
    return true;
  }

  const DAYS_OF_WEEK = [
    "sunday",
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
  ];

  // Use Vietnam timezone (UTC+7)
  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

  const dayOfWeek = DAYS_OF_WEEK[vietnamTime.getDay()];
  const currentTime = `${String(vietnamTime.getHours()).padStart(2, "0")}:${String(
    vietnamTime.getMinutes()
  ).padStart(2, "0")}`;

  console.log(`[isRestaurantOpenHelper] Day: ${dayOfWeek}, Time: ${currentTime}`);

  const dayHours = openingHours[dayOfWeek];

  if (!dayHours || !dayHours.open || !dayHours.close) {
    return false;
  }

  return currentTime >= dayHours.open && currentTime < dayHours.close;
};

// ========== DEBUG ENDPOINT - Check server time and opening status ==========
server.get("/debug/server-time", (req, res) => {
  const restaurantId = req.query.restaurant_id;
  const db = router.db;

  const now = new Date();
  const vietnamTime = new Date(now.toLocaleString('en-US', { timeZone: 'Asia/Ho_Chi_Minh' }));

  const DAYS_OF_WEEK = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  const dayOfWeek = DAYS_OF_WEEK[vietnamTime.getDay()];
  const currentTime = `${String(vietnamTime.getHours()).padStart(2, "0")}:${String(vietnamTime.getMinutes()).padStart(2, "0")}`;

  let response = {
    server_time_utc: now.toISOString(),
    server_time_vietnam: vietnamTime.toISOString(),
    server_day: dayOfWeek,
    server_time_hhmm: currentTime,
  };

  if (restaurantId) {
    const restaurant = db.get("restaurants").find({ id: restaurantId }).value();
    if (restaurant) {
      const isOpen = isRestaurantOpenHelper(restaurant.opening_hours);
      response.restaurant = {
        id: restaurant.id,
        name: restaurant.name,
        opening_hours: restaurant.opening_hours,
        today_hours: restaurant.opening_hours[dayOfWeek],
        is_open: isOpen,
        check_details: {
          current_time: currentTime,
          today: dayOfWeek,
          open_time: restaurant.opening_hours[dayOfWeek]?.open,
          close_time: restaurant.opening_hours[dayOfWeek]?.close,
        }
      };
    }
  }

  res.json(response);
});

// ========== CUSTOM GET ORDERS ENDPOINT WITH RESTAURANT DATA ==========
// Intercept GET /orders and /orders/:id to include restaurant data
server.get("/orders/:id", (req, res, next) => {
  const db = router.db;
  const orderId = req.params.id;

  const order = db.get("orders").find({ id: orderId }).value();
  if (!order) {
    return next(); // Let default router handle 404
  }

  // Enrich order with restaurant data
  const restaurant = db.get("restaurants").find({ id: order.restaurant_id }).value();

  const enrichedOrder = {
    ...order,
    restaurant: restaurant ? {
      id: restaurant.id,
      name: restaurant.name,
      address: restaurant.address,
      phone: restaurant.phone,
      email: restaurant.email,
      image: restaurant.image,
    } : null,
  };

  res.json(enrichedOrder);
});

// GET /orders - List orders with restaurant data
server.get("/orders", (req, res, next) => {
  const db = router.db;
  const userId = req.user?.id;
  const restaurantId = req.query.restaurant_id;
  const user = db.get("users").find({ id: userId }).value();
  const isAdmin = user?.roles?.includes("admin");

  // Get all orders
  let orders = db.get("orders").value() || [];

  if (restaurantId) {
    // Requesting orders for specific restaurant
    orders = orders.filter(order => order.restaurant_id === restaurantId);
  } else if (!isAdmin && userId) {
    // Non-admin customer requesting their own orders
    orders = orders.filter(order => order.user_id === userId);
  }
  // If admin without restaurant_id: return ALL orders

  // Enrich each order with restaurant data
  const enrichedOrders = orders.map(order => {
    const restaurant = db.get("restaurants").find({ id: order.restaurant_id }).value();
    return {
      ...order,
      restaurant: restaurant ? {
        id: restaurant.id,
        name: restaurant.name,
        address: restaurant.address,
        phone: restaurant.phone,
        email: restaurant.email,
        image: restaurant.image,
      } : null,
    };
  });

  res.json(enrichedOrders);
});

// ========== UPDATE ORDER ENDPOINT ==========
// PATCH /orders/:id - Update order status, drone_id, and other fields
// Authentication required: user must be the order owner or restaurant owner
server.patch("/orders/:id", (req, res) => {
  const db = router.db;
  const orderId = req.params.id;
  const userId = req.user?.id;
  const updateData = req.body;

  console.log(`[PATCH /orders/:id] Updating order ${orderId}`);
  console.log(`[PATCH /orders/:id] User ID: ${userId}`);
  console.log(`[PATCH /orders/:id] Update data:`, updateData);

  // Find the order
  const order = db.get("orders").find({ id: orderId }).value();
  if (!order) {
    console.log(`[PATCH /orders/:id] Order ${orderId} not found`);
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  // Authorization check: must be order owner (customer) or restaurant owner
  const user = db.get("users").find({ id: userId }).value();
  const isOrderOwner = order.user_id === userId;
  const userRestaurantId = user?.restaurantId || user?.restaurant_id;
  const isRestaurantOwner = userRestaurantId === order.restaurant_id;

  if (!isOrderOwner && !isRestaurantOwner) {
    console.log(`[PATCH /orders/:id] ❌ Unauthorized - User ${userId} cannot update order ${orderId}`);
    return res.status(403).json({
      success: false,
      message: "You are not authorized to update this order",
    });
  }

  // Build update object - only include provided fields
  const updatedOrder = { ...order };

  if (updateData.status !== undefined) {
    updatedOrder.status = updateData.status;
    console.log(`[PATCH /orders/:id] Status updated to: ${updateData.status}`);

    // Auto-release drone when order is completed/delivered/cancelled
    if (["delivered", "completed", "cancelled"].includes(updateData.status) && order.drone_id) {
      const BASE_LOCATION = { lat: 10.7626, lng: 106.682 };
      console.log(`[PATCH /orders/:id] Auto-releasing drone ${order.drone_id} from order ${orderId}`);
      db.get("drones")
        .find({ id: order.drone_id })
        .assign({
          status: "available",
          assigned_order_id: null,
          latitude: BASE_LOCATION.lat,
          longitude: BASE_LOCATION.lng,
          current_location: {
            lat: BASE_LOCATION.lat,
            lng: BASE_LOCATION.lng,
            address: "273 An Dương Vương, Phường Chợ Quán, TP. HCM"
          },
          battery_level: 100,
          updated_at: new Date().toISOString(),
        })
        .write();
    }
  }

  if (updateData.drone_id !== undefined) {
    updatedOrder.drone_id = updateData.drone_id;
    console.log(`[PATCH /orders/:id] Drone ID updated to: ${updateData.drone_id}`);
  }

  if (updateData.special_instructions !== undefined) {
    updatedOrder.special_instructions = updateData.special_instructions;
  }

  if (updateData.estimated_delivery_time !== undefined) {
    updatedOrder.estimated_delivery_time = updateData.estimated_delivery_time;
  }

  if (updateData.actual_delivery_time !== undefined) {
    updatedOrder.actual_delivery_time = updateData.actual_delivery_time;
  }

  if (updateData.rejection_reason !== undefined) {
    updatedOrder.rejection_reason = updateData.rejection_reason;
  }

  if (updateData.rejected_at !== undefined) {
    updatedOrder.rejected_at = updateData.rejected_at;
  }

  if (updateData.current_gps !== undefined) {
    updatedOrder.current_gps = updateData.current_gps;
  }

  updatedOrder.updated_at = new Date().toISOString();

  // Update in database
  db.get("orders")
    .find({ id: orderId })
    .assign(updatedOrder)
    .write();

  console.log(`[PATCH /orders/:id] ✅ Order ${orderId} updated successfully`);

  res.json({
    success: true,
    message: "Order updated successfully",
    order: updatedOrder,
  });
});

// ========== GET DRONE STATUS ENDPOINT ==========
// GET /orders/:id/drone-status - Get drone journey status for an order
server.get("/orders/:id/drone-status", (req, res) => {
  const db = router.db;
  const orderId = req.params.id;

  const order = db.get("orders").find({ id: orderId }).value();
  if (!order) {
    return res.status(404).json({
      success: false,
      message: "Order not found",
    });
  }

  let droneInfo = null;
  if (order.drone_id) {
    const drone = db.get("drones").find({ id: order.drone_id }).value();
    if (drone) {
      droneInfo = {
        id: drone.id,
        identifier: drone.identifier,
        status: drone.status,
        battery_level: drone.battery_level,
        current_location: drone.current_location,
      };
    }
  }

  res.json({
    success: true,
    order_id: order.id,
    drone_id: order.drone_id,
    drone_journey_stage: order.drone_journey_stage,
    drone: droneInfo,
  });
});

// ========== SIMULATE DRONE DELIVERY ENDPOINT ==========
// POST /orders/:id/simulate-delivery - Trigger drone movement simulation
// Drone moves from pickup_gps to dropoff_gps, then order status becomes "arrived"
server.post("/orders/:id/simulate-delivery", (req, res) => {
  const db = router.db;
  const orderId = req.params.id;

  const order = db.get("orders").find({ id: orderId }).value();
  if (!order) {
    return res.status(404).json({ error: "Order not found" });
  }

  if (!order.drone_id) {
    return res.status(400).json({ error: "Order has no drone assigned" });
  }

  // VALIDATION: Drone must be at restaurant before restaurant can mark ready
  if (order.drone_journey_stage !== "at_restaurant") {
    return res.status(400).json({
      error: "Cannot start delivery: Drone has not arrived at restaurant yet",
      code: "DRONE_NOT_AT_RESTAURANT",
      current_stage: order.drone_journey_stage,
    });
  }

  // Use the new simulation function
  console.log(`[API] POST /orders/${orderId}/simulate-delivery - Starting drone simulation`);
  console.log(`[API] Order status: ${order.status}, drone_journey_stage: ${order.drone_journey_stage}`);

  // Mark order as "ready" (food is ready for pickup)
  // Status will be updated to "delivering" by simulateDroneToCustomer after delay
  db.get("orders")
    .find({ id: orderId })
    .assign({
      status: "ready",
      updated_at: new Date().toISOString(),
    })
    .write();

  console.log(`[API] Order marked as ready, starting drone simulation`);

  // Start simulation - it will update status to "delivering" after the initial delay
  simulateDroneToCustomer(orderId);

  res.json({
    success: true,
    message: "Order marked as ready, drone will start delivery simulation",
    orderId,
    drone_id: order.drone_id,
    status: "ready",
  });
});

// ========== DRONE ENDPOINTS ==========
// GET /drones/available - Get all available drones
server.get("/drones/available", (req, res) => {
  const db = router.db;
  const drones = db.get("drones").value() || [];
  const availableDrones = drones.filter(d => d.status === "available");
  console.log(`[GET /drones/available] Found ${availableDrones.length} available drones`);
  res.json(availableDrones);
});

// GET /drones/:id - Get drone by ID
server.get("/drones/:id", (req, res, next) => {
  const db = router.db;
  const droneId = req.params.id;
  const drone = db.get("drones").find({ id: droneId }).value();

  if (!drone) {
    return next(); // Let json-server handle 404
  }

  res.json(drone);
});

// PATCH /drones/:id - Update drone
server.patch("/drones/:id", (req, res, next) => {
  const db = router.db;
  const droneId = req.params.id;
  const updateData = req.body;

  console.log(`[PATCH /drones/:id] Updating drone ${droneId}`);
  console.log(`[PATCH /drones/:id] Update data:`, updateData);

  const drone = db.get("drones").find({ id: droneId }).value();
  if (!drone) {
    return next(); // Let json-server handle 404
  }

  // Update drone with new data
  db.get("drones")
    .find({ id: droneId })
    .assign({
      ...updateData,
      updated_at: new Date().toISOString(),
    })
    .write();

  const updatedDrone = db.get("drones").find({ id: droneId }).value();
  console.log(`[PATCH /drones/:id] ✅ Drone ${droneId} updated`);
  res.json(updatedDrone);
});

// ========== ADDRESSES ENDPOINT - Filter by User ==========
// GET /addresses - Return only addresses belonging to authenticated user
server.get("/addresses", (req, res, next) => {
  const db = router.db;
  const userId = req.user?.id;

  if (!userId) {
    // No authenticated user - return empty array or 401
    return res.status(401).json({ error: "Unauthorized" });
  }

  // Get all addresses and filter by user_id
  let addresses = db.get("addresses").value() || [];
  addresses = addresses.filter(addr => addr.user_id === userId);

  res.json(addresses);
});

// Use default router
server.use(router);

// Middleware to trigger save after write operations
server.use((req, res, next) => {
  res.on("finish", () => {
    if (["POST", "PUT", "PATCH", "DELETE"].includes(req.method)) {
      // Save immediately after write operations
      saveDb();
    }
  });
  next();
});

server.listen(PORT, () => {
  console.log(`\nJSON Server is running with AUTO-SAVE enabled!`);
  console.log(`    Server: http://localhost:${PORT}`);
  console.log(`    Database: db.json (auto-saves every 10s and on changes)`);
});
