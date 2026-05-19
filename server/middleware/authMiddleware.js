// server/middleware/authMiddleware.js
import jwt from "jsonwebtoken";

const authMiddleware = (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({ error: "No authorization header" });
    }

    // Extract token from "Bearer <token>"
    const token = authHeader.split(" ")[1];
    if (!token) {
      return res.status(401).json({ error: "No token provided" });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "your_secret_key");
    
    // Attach user info to request
    req.user = {
      id: decoded.userId,
      email: decoded.email,
      name: decoded.name
    };

    next();
  } catch (error) {
    console.error("❌ Auth middleware error:", error.message);
    
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ error: "Invalid token" });
    }
    
    res.status(401).json({ error: "Authentication failed" });
  }
};

export default authMiddleware;
