const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth.middleware");

const { getPaymentHistory, releasePayment, getPlatformEarnings, initializePayment, paystackWebhook} = require("../controllers/payment.controller");
const {authorizeRoles} = require("../middleware/role.middleware");


router.post("/initialize/:jobId", protect, authorizeRoles("customer"),initializePayment);

router.get("/history", protect,authorizeRoles("customer", "admin"), getPaymentHistory);
router.get("/platform-earnings", protect, authorizeRoles("admin"), getPlatformEarnings);
router.post("/paystack/webhook", paystackWebhook);
// router.get("/verify/:reference", protect, authorizeRoles("admin","customer"),verifyPayment);
router.post("/release/:jobId", protect,authorizeRoles("customer", "admin"), releasePayment);



module.exports = router;


