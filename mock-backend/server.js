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
  console.log("[DB] Auto-saved changes to db.json");
};

// Save database every 5 seconds if there are changes
let saveInterval = setInterval(() => {
  saveDb();
}, 5000);

// Save on server shutdown
process.on("SIGINT", () => {
  console.log("\nSaving database before shutdown...");
  clearInterval(saveInterval);
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
    if (order.status === "pending") {
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

  const now = new Date();
  const dayOfWeek = DAYS_OF_WEEK[now.getDay()];
  const currentTime = `${String(now.getHours()).padStart(2, "0")}:${String(
    now.getMinutes()
  ).padStart(2, "0")}`;

  const dayHours = openingHours[dayOfWeek];

  if (!dayHours || !dayHours.open || !dayHours.close) {
    return false;
  }

  return currentTime >= dayHours.open && currentTime < dayHours.close;
};

// ========== CUSTOM ORDER CREATION ENDPOINT ==========
// POST /orders - Create new order with auto-populated user_id from token
server.post("/orders", (req, res) => {
  const userId = req.user?.id;
  if (!userId) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Token required",
    });
  }

  const db = router.db;
  const orderData = req.body;

  // Validate required fields
  if (!orderData.restaurant_id || !Array.isArray(orderData.items) || orderData.items.length === 0) {
    return res.status(400).json({
      success: false,
      message: "restaurant_id and items are required",
    });
  }

  // Check if restaurant is open
  const restaurant = db.get("restaurants").find({ id: orderData.restaurant_id }).value();
  if (!restaurant) {
    return res.status(404).json({
      success: false,
      message: "Restaurant not found",
    });
  }

  if (!isRestaurantOpenHelper(restaurant.opening_hours)) {
    return res.status(400).json({
      success: false,
      message: `Restaurant is currently closed. Opening hours: ${JSON.stringify(restaurant.opening_hours)}`,
      code: "RESTAURANT_CLOSED",
    });
  }

  // Auto-populate user_id from token
  const newOrder = {
    id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    user_id: userId, // Auto-populate from token
    restaurant_id: orderData.restaurant_id,
    items: orderData.items || [],
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
  });

  res.status(201).json(newOrder);
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

  // Filter orders by user_id from token OR restaurant_id from query param
  let orders = db.get("orders").value() || [];

  if (restaurantId) {
    // Admin panel requesting orders for specific restaurant
    orders = orders.filter(order => order.restaurant_id === restaurantId);
  } else if (userId) {
    // Customer requesting their own orders
    orders = orders.filter(order => order.user_id === userId);
  }

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

  // Set order to delivering status with mock GPS movement
  // Ensure consistent format: use both latitude/longitude AND lat/lng for compatibility
  const pickup = order.pickup_gps || { latitude: 10.776, longitude: 106.7 };
  const dropoff = order.dropoff_gps || { latitude: 10.7867657, longitude: 106.7001391 };

  // Normalize to ensure we have latitude/longitude format
  const pickupLat = pickup.latitude || pickup.lat || 10.776;
  const pickupLng = pickup.longitude || pickup.lng || 106.7;
  const dropoffLat = dropoff.latitude || dropoff.lat || 10.7867657;
  const dropoffLng = dropoff.longitude || dropoff.lng || 106.7001391;

  // Update order to delivering
  db.get("orders")
    .find({ id: orderId })
    .assign({
      status: "delivering",
      current_gps: {
        latitude: pickupLat,
        longitude: pickupLng,
      },
      updated_at: new Date().toISOString(),
    })
    .write();

  console.log(`[SIMULATE DELIVERY] Starting simulation for order ${orderId}`);
  console.log(`[SIMULATE DELIVERY] From: (${pickupLat}, ${pickupLng}) To: (${dropoffLat}, ${dropoffLng})`);

  // Simulate progressive movement from pickup to dropoff in steps
  const steps = 10;
  const interval = 1500; // 1.5 seconds per step

  for (let i = 1; i <= steps; i++) {
    setTimeout(() => {
      const progress = i / steps;
      const currentLat = pickupLat + (dropoffLat - pickupLat) * progress;
      const currentLng = pickupLng + (dropoffLng - pickupLng) * progress;

      db.get("orders")
        .find({ id: orderId })
        .assign({
          current_gps: {
            latitude: currentLat,
            longitude: currentLng,
          },
          updated_at: new Date().toISOString(),
        })
        .write();

      console.log(`[SIMULATE DELIVERY] Step ${i}/${steps}: (${currentLat.toFixed(6)}, ${currentLng.toFixed(6)})`);

      // Last step - mark as arrived (not delivered yet)
      if (i === steps) {
        setTimeout(() => {
          db.get("orders")
            .find({ id: orderId })
            .assign({
              status: "arrived",
              current_gps: {
                latitude: dropoffLat,
                longitude: dropoffLng,
              },
              updated_at: new Date().toISOString(),
            })
            .write();
          console.log(`[SIMULATE DELIVERY] Drone arrived at destination for order ${orderId}`);
        }, 500);
      }
    }, i * interval);
  }

  res.json({
    success: true,
    message: "Drone delivery simulation started",
    orderId,
    steps,
    interval,
  });
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
