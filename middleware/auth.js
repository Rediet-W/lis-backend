const jwt = require("jsonwebtoken");
const { unauthorizedError } = require("../utils/responseUtils");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return unauthorizedError(res, "Access token required");
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Normalize to req.user.id and req.user.role
    const normalized = {
      ...decoded,
      id:
        decoded.id ??
        decoded.userId ??
        decoded.user_id ??
        decoded.sub ??
        decoded.user?.id ??
        null,
      role: decoded.role ?? decoded.user?.role ?? null,
    };

    if (!normalized.id) {
      return unauthorizedError(res, "Invalid token payload");
    }

    req.user = normalized;
    return next();
  } catch (err) {
    return unauthorizedError(res, "Invalid or expired token");
  }
};
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return unauthorizedError(res, "Authentication required");
    }

    if (!roles.includes(req.user.role)) {
      return unauthorizedError(res, "Insufficient permissions");
    }

    next();
  };
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
