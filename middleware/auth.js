const jwt = require("jsonwebtoken");
const { unauthorizedError } = require("../utils/responseUtils");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1]; // Bearer TOKEN

  if (!token) {
    return unauthorizedError(res, "Access token required");
  }

  jwt.verify(
    token,
    process.env.JWT_SECRET || "your-secret-key",
    (err, user) => {
      if (err) {
        return unauthorizedError(res, "Invalid or expired token");
      }
      req.user = user;
      next();
    }
  );
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

const signPatientToken = (patient) =>
  jwt.sign(
    { id: patient.id, role: "patient", type: "patient" },
    process.env.JWT_SECRET || "your-secret-key",
    { expiresIn: "7d" }
  );

const sanitizePatient = (p) => {
  if (!p) return p;
  const { password, ...rest } = p;
  return rest;
};

module.exports = {
  authenticateToken,
  authorizeRoles,
};
