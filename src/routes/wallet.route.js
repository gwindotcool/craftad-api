const express = require("express");

const router = express.Router();


const walletController = require("../controllers/wallet.controller");
const {protect} = require("../middleware/auth.middleware");
const {authorizeRoles} = require("../middleware/role.middleware");





router.get("/me", protect,walletController.getMyWallet);

router.post("/withdraw", protect, authorizeRoles("artisan", "admin"), walletController.withdrawFunds);
router.patch("/approve/:withdrawalId",protect, authorizeRoles("artisan", "admin"), authorizeRoles( "admin"), walletController.approveWithdrawal);
router.get("/history", protect, walletController.getWithdrawalHistory);

module.exports = router;