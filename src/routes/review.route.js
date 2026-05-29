const express = require("express");
const router = express.Router();
const {protect} = require("../middleware/auth.middleware");
const {authorizeRoles} = require("../middleware/role.middleware");
const { createReview } = require("../controllers/review.controller");

router.post('/:jobId', protect,authorizeRoles("customer", "admin"), createReview);

module.exports = router;