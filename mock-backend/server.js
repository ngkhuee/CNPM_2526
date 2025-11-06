const jsonServer = require("json-server");
const server = jsonServer.create();
const router = jsonServer.router("db.json");
const middlewares = jsonServer.defaults();
const { generateToken, validateToken, logger } = require("./middlewares");

require("dotenv").config();
const PORT = process.env.PORT || 4000;

// Middlewares
server.use(middlewares);
server.use(jsonServer.bodyParser);
server.use(logger);

// Serve static files (images)
const express = require("express");
server.use("/images", express.static("public/images"));

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

// Custom routes rewriter - Load from routes.json
const routes = require("./routes.json");
console.log("Loading custom routes:", routes);
server.use(jsonServer.rewriter(routes));

// ========== CUSTOM ENDPOINTS ==========

// Auth - Login
server.post("/auth/login", (req, res) => {
  const { email, password } = req.body;
  const db = router.db;

  const user = db.get("users").find({ email, password }).value();

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
  const { email, password, name, phone } = req.body;
  const db = router.db;

  // Check if email exists
  const existingUser = db.get("users").find({ email }).value();

  if (existingUser) {
    return res.status(400).json({
      success: false,
      message: "Email already exists",
    });
  }

  // Create new user
  const newUser = {
    id: `u${Date.now()}`,
    email,
    password,
    name,
    phone: phone || "",
    role: "customer",
    status: "active",
    createdAt: new Date().toISOString(),
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

// Cart - Add item
server.post("/carts/:userId/add", (req, res) => {
  const { userId } = req.params;
  const { foodId, quantity } = req.body;
  const db = router.db;

  let cart = db.get("carts").find({ userId }).value();

  if (!cart) {
    cart = {
      id: `cart${Date.now()}`,
      userId,
      items: [],
      updatedAt: new Date().toISOString(),
    };
    db.get("carts").push(cart).write();
  }

  const existingItemIndex = cart.items.findIndex(
    (item) => item.foodId === foodId
  );

  if (existingItemIndex !== -1) {
    cart.items[existingItemIndex].quantity += quantity;
  } else {
    cart.items.push({ foodId, quantity });
  }

  cart.updatedAt = new Date().toISOString();

  db.get("carts").find({ userId }).assign(cart).write();

  res.json({ success: true, cart });
});

// Cart - Remove item
server.delete("/carts/:userId/items/:foodId", (req, res) => {
  const { userId, foodId } = req.params;
  const db = router.db;

  let cart = db.get("carts").find({ userId }).value();

  if (!cart) {
    return res.status(404).json({
      success: false,
      message: "Cart not found",
    });
  }

  cart.items = cart.items.filter((item) => item.foodId !== foodId);
  cart.updatedAt = new Date().toISOString();

  db.get("carts").find({ userId }).assign(cart).write();

  res.json({ success: true, cart });
});

// Cart - Clear
server.delete("/carts/:userId/clear", (req, res) => {
  const { userId } = req.params;
  const db = router.db;

  let cart = db.get("carts").find({ userId }).value();

  if (cart) {
    cart.items = [];
    cart.updatedAt = new Date().toISOString();

    db.get("carts").find({ userId }).assign(cart).write();
  }

  res.json({ success: true, cart: cart || { userId, items: [] } });
});

// Menus with calculated rating
server.get("/menus", (req, res) => {
  const db = router.db;
  const menus = db.get("menus").value();
  const reviews = db.get("reviews").value();

  // Calculate rating for each menu item
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

    return {
      ...menu,
      rating: avgRating,
      reviewCount: foodReviews.length,
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

// Single menu item with rating
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
  const foodReviews = reviews.filter((review) => review.food_id === menu.id);

  let avgRating = 0;
  if (foodReviews.length > 0) {
    const totalRating = foodReviews.reduce(
      (sum, review) => sum + review.rating,
      0
    );
    avgRating = totalRating / foodReviews.length;
  }

  res.json({
    ...menu,
    rating: avgRating,
    reviewCount: foodReviews.length,
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

// Use default router
server.use(router);

server.listen(PORT, () => {
  console.log(`\nJSON Server is running!`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`\nAuth endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/auth/login`);
  console.log(`   - POST http://localhost:${PORT}/auth/register`);
  console.log(`\n`);
});
