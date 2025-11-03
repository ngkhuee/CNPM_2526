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

  const user = db.get("accounts").find({ email, password }).value();

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
  const existingUser = db.get("accounts").find({ email }).value();

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

  db.get("accounts").push(newUser).write();

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

// Apply auth middleware (after custom routes)
server.use(validateToken);

// Use default router
server.use(router);

server.listen(PORT, () => {
  console.log(`\nJSON Server is running!`);
  console.log(`Server: http://localhost:${PORT}`);
  console.log(`Resources:`);
  console.log(`   - http://localhost:${PORT}/foods`);
  console.log(`   - http://localhost:${PORT}/restaurants`);
  console.log(`   - http://localhost:${PORT}/orders`);
  console.log(`   - http://localhost:${PORT}/accounts`);
  console.log(`\nAuth endpoints:`);
  console.log(`   - POST http://localhost:${PORT}/auth/login`);
  console.log(`   - POST http://localhost:${PORT}/auth/register`);
  console.log(`\n`);
});
