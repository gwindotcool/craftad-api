const express = require("express");

const router = express.Router();


const walletController = require("../controllers/wallet.controller");
const {protect} = require("../middleware/auth.middleware");
const {authorizeRoles} = require("../middleware/role.middleware");
const {getTransactions} = require("../controllers/transaction.controller");



router.get(
    "/me",
    protect,
    walletController.getMyWallet
);

router.post(
    "/withdraw",
    protect,
    authorizeRoles("artisan"),
    walletController.withdrawFunds
);

router.patch(
    "/approve/:withdrawalId",
    protect,
    authorizeRoles("admin"),
    walletController.approveWithdrawal
);

router.patch(
    "/reject/:withdrawalId",
    protect,
    authorizeRoles("admin"),
    walletController.rejectWithdrawal
);

router.get(
    "/history",
    protect,
    walletController.getWithdrawalHistory
);

router.get(
    "/admin/withdrawals",
    protect,
    authorizeRoles("admin"),
    walletController.getAllWithdrawals
);

router.get(
    "/transactions",
    protect,getTransactions
);



module.exports = router;