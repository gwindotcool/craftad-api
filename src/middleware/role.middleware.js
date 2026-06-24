exports.authorizeRoles = (...roles) => {
    return (req, res, next) => {
        try {
            const userRole = req.user.role;

            if (!req.user) {
                return res.status(401).json({
                    success:false,
                    message:"Unauthorized"
                });
            }

            if (!roles.includes(userRole)) {
                return res.status(403).json({
                    success: false,
                    message: "You do not have permission to access this resource",
                })
            }
            return next();

        }catch (error){
            return res.status(401).json({
                success: false,
                message: error.message,
            })
        }
    }
}