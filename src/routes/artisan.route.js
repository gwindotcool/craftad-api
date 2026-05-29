const express = require('express');
const router = express.Router();

const { protect, } = require('../middleware/auth.middleware')
const { authorizeRoles, } = require('../middleware/role.middleware')
const { createArtisanProfile,getMyProfile } = require('../controllers/artisan.controller')

router.post('/create', protect,authorizeRoles("artisan","admin"), createArtisanProfile)
router.get("/me", protect, authorizeRoles("artisan", "admin"), getMyProfile);

module.exports = router