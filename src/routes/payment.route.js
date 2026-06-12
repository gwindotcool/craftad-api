const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth.middleware");

const { getPaymentHistory, releasePayment, getPlatformEarnings, initializePayment, verifyPayment} = require("../controllers/payment.controller");
const {authorizeRoles} = require("../middleware/role.middleware");


router.post("/initialize/:jobId", protect, authorizeRoles("admin"),initializePayment);

router.get("/history", protect,authorizeRoles("customer", "admin"), getPaymentHistory);
router.post("/release/:jobId", protect,authorizeRoles("customer", "admin"), releasePayment);
router.get("/platform-earnings", protect, authorizeRoles("admin"), getPlatformEarnings);
router.get("/verify/:reference", protect, authorizeRoles("admin"),verifyPayment);

module.exports = router;


