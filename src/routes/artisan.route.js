const express = require('express');
const router = express.Router();

const { protect, } = require('../middleware/auth.middleware')
const { authorizeRoles, } = require('../middleware/role.middleware')
const { createArtisanProfile,getMyProfile, becomeArtisan, updateArtisanProfile} = require('../controllers/artisan.controller')

router.patch("/become-artisan", protect, becomeArtisan);
router.post('/create', protect,authorizeRoles("artisan","admin"), createArtisanProfile)
router.get("/me", protect, authorizeRoles("artisan", "admin"), getMyProfile);
router.patch("/update", protect, authorizeRoles("artisan"), updateArtisanProfile);

module.exports = router