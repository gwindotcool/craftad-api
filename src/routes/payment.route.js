const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth.middleware");

const { makePayment, getPaymentHistory, releasePayment} = require("../controllers/payment.controller");
const {authorizeRoles} = require("../middleware/role.middleware");

router.post("/pay/:jobId", protect,authorizeRoles("customer", "admin"), makePayment);
router.get("/history", protect,authorizeRoles("customer", "admin"), getPaymentHistory);
router.post("/release/:jobId", protect,authorizeRoles("customer", "admin"), releasePayment);

module.exports = router;


