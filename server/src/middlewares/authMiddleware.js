import jwt from "jsonwebtoken";
import User from "../models/User.js";

// JWT Secret (should be in .env in production)
const JWT_SECRET = process.env.JWT_SECRET || "luxeestate_jwt_secret_key_2024";

/**
 * Protect routes - verify JWT token
 */
export const protect = async (req, res, next) => {
    let token;

    // Check for Bearer token in Authorization header
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        try {
            // Get token from header
            token = req.headers.authorization.split(" ")[1];

            // Verify token
            const decoded = jwt.verify(token, JWT_SECRET);

            // Get user from token (without password)
            req.user = await User.findById(decoded.id).select("-password");

            if (!req.user) {
                return res.status(401).json({
                    success: false,
                    message: "User not found",
                });
            }

            next();
        } catch (error) {
            console.error("Auth middleware error:", error.message);
            return res.status(401).json({
                success: false,
                message: "Not authorized, token invalid",
            });
        }
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: "Not authorized, no token provided",
        });
    }
};

/**
 * Check if user has required role
 */
export const authorize = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({
                success: false,
                message: "Not authorized",
            });
        }

        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user.role}' is not authorized to access this route`,
            });
        }
        next();
    };
};
