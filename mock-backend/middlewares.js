// mock-backend/middlewares.js
const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "tomato-food-delivery-secret-key";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      roles: user.roles,
    },
    SECRET_KEY,
    { expiresIn: "30d" }
  );
};

// Validate JWT token
const validateToken = (req, res, next) => {
  // Public routes - GET only (without auth)
  const publicGetRoutes = [
    "/foods",
    "/restaurants",
    "/categories",
    "/promotions",
    "/menus",
    "/drones",
    "/settings",
    "/payments",
    "/notifications",
    "/reviews", // GET reviews is public
    "/users", // GET user info is public (needed for displaying review authors)
    "/withdrawals", // GET withdrawals is public (for admin dashboard)
    "/restaurant_balances", // GET balances is public (for admin dashboard)
  ];

  // Allow GET requests to public endpoints
  const requestPath = req.path || req.url.split("?")[0];
  if (
    req.method === "GET" &&
    publicGetRoutes.some((route) => requestPath.startsWith(route))
  ) {
    return next();
  }

  // Allow GET /orders, /users (requires token but let the route handler check)
  // This allows the routes to check for admin/auth before filtering

  // Allow GET /auth/login and POST for register (public)
  if (req.method === "GET" && requestPath === "/auth/login") {
    return next();
  }

  // Allow POST to login/register
  if (
    req.method === "POST" &&
    (req.path === "/auth/login" || req.path === "/auth/register")
  ) {
    return next();
  }

  // Allow POST to /restaurants/register and /users/register-owner (public)
  if (
    req.method === "POST" &&
    (requestPath === "/restaurants/register" ||
      requestPath === "/users/register-owner")
  ) {
    return next();
  }

  // Allow upload endpoint
  if (req.method === "POST" && requestPath === "/upload") {
    return next();
  }

  // All other POST, PUT, PATCH, DELETE require token
  const token = req.headers.authorization?.split(" ")[1];

  console.log("[validateToken] Path:", requestPath, "Method:", req.method);
  console.log("[validateToken] Authorization header:", req.headers.authorization);
  console.log("[validateToken] Token extracted:", token ? "YES" : "NO");

  if (!token) {
    console.error("[validateToken] ❌ No token provided for path:", req.path, "Method:", req.method);
    return res.status(401).json({
      success: false,
      message: "No token provided. Please login.",
    });
  }

  console.log("Token found, verifying... Path:", req.path, "Method:", req.method);

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    console.error("Token verification failed:", error.message);
    console.error("Token:", token);
    console.error("Secret key length:", SECRET_KEY.length);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
      error: error.message,
    });
  }
};

// Log requests
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url} - Path: ${req.path}`);
  next();
};

module.exports = {
  generateToken,
  validateToken,
  logger,
};
