const express = require("express");

const router = express.Router();

const adminController = require("../controllers/admin.controller");

const {protect} = require("../middleware/auth.middleware");

const {authorizeRoles} = require("../middleware/role.middleware");

router.get("/dashboard", protect, authorizeRoles("admin"), adminController.getDashboardStats);

module.exports = router;