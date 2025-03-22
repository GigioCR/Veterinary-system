const jwt = require("jsonwebtoken");
require('dotenv').config();

const auth = async (req, res, next) => {
  try {
    // Check if the Authorization header is present and well-formed
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Authorization header missing or malformed" });
    }

    // Extract the token from the Authorization header
    const token = req.headers.authorization.split(" ")[1];
    // Verify the token with the secret
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);

    // Attach the user info from the decoded token to the request object
    req.user = {
      userId: decodedToken.userId,
      name: decodedToken.name,
      userType: decodedToken.userType,
    };

    // Proceed to the next middleware/endpoint
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: "Token expired, please login again" });
    } else if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: "Invalid token, please login" });
    } else {
      res.status(401).json({ message: "Unauthorized access" });
    }
  }
};

// Allow only specific user types to access specific role routes
const restrictTo = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.userType)) {
      return res.status(403).json({ message: "Access forbidden: You do not have the correct permissions" });
    }
    next();
  };
};

module.exports = { auth, restrictTo };
