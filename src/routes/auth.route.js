const express = require("express");
const { registerUser, loginUser} = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth.middleware");
const { authorizeRoles } = require("../middleware/role.middleware");

const router = express.Router();


router.post("/register", registerUser)
router.post("/login", loginUser)

router.get("/profile",protect,(req, res) => {
    res.status(200).json({
        success: true,
        user: req.user,
    })
} );

router.get(
    "/admin-dashboard",
    protect,
    authorizeRoles("admin"),
    (req, res) => {
        res.json({
            success: true,
            message: "Welcome Admin",
        });
    }
);

router.get("/artisan-area", protect, authorizeRoles("artisan","admin"),(req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome Artisan"
    })

})

router.get("/request-service", protect, authorizeRoles("customer","admin"),(req, res) => {
    res.status(200).json({
        success: true,
        message: "Welcome to customer Dashboard"
    })
})

module.exports = router;