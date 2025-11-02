const jwt = require("jsonwebtoken");
require("dotenv").config();

const SECRET_KEY = process.env.JWT_SECRET || "tomato-secret-key";

// Generate JWT token
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    SECRET_KEY,
    { expiresIn: "24h" }
  );
};

// Validate JWT token
const validateToken = (req, res, next) => {
  // Public routes - không cần auth
  const publicRoutes = [
    "/auth/login",
    "/auth/register",
    "/foods",
    "/restaurants",
    "/categories",
    "/promotions",
  ];

  // Allow GET requests to public endpoints
  if (
    req.method === "GET" &&
    publicRoutes.some((route) => req.path.startsWith(route))
  ) {
    return next();
  }

  // Allow POST to login/register
  if (
    req.method === "POST" &&
    (req.path === "/auth/login" || req.path === "/auth/register")
  ) {
    return next();
  }

  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "No token provided. Please login.",
    });
  }

  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token",
    });
  }
};

// Log requests
const logger = (req, res, next) => {
  const timestamp = new Date().toISOString();
  console.log(`[${timestamp}] ${req.method} ${req.url}`);
  next();
};

module.exports = {
  generateToken,
  validateToken,
  logger,
};
