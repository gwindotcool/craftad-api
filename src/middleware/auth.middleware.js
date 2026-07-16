const jwt = require("jsonwebtoken");
const User = require("../models/User");

exports.protect = async (req, res, next) => {
    try {

        let token;

        // Get token from header
        if (
            req.headers.authorization &&
            req.headers.authorization.startsWith("Bearer ")
        ) {
            token = req.headers.authorization.split(" ")[1];
        }


        if (!token) {
            return res.status(401).json({
                success: false,
                message: "No token provided"
            });
        }


        // Verify token
        const decoded = jwt.verify(
            token,
            process.env.JWT_SECRET
        );


        console.log("Decoded:", decoded);


        // Find user by ID only
        const user = await User.findById(decoded.id);


        console.log("User found:", user);


        if (!user) {
            return res.status(401).json({
                success: false,
                message: "User no longer exists"
            });
        }


        // Check deleted account
        if (user.isDeleted === true) {
            return res.status(403).json({
                success: false,
                message: "Account has been deleted"
            });
        }


        // Check account status
        if (
            user.accountStatus &&
            user.accountStatus !== "active"
        ) {
            return res.status(403).json({
                success: false,
                message: "Account is not active"
            });
        }


        // Attach user
        req.user = user;


        next();


    } catch (error) {

        console.error("AUTH ERROR:", error.message);

        return res.status(401).json({
            success: false,
            message: "Invalid or expired token"
        });
    }
};