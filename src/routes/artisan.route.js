const express = require('express');
const router = express.Router();

const { protect, } = require('../middleware/auth.middleware')
const { authorizeRoles, } = require('../middleware/role.middleware')
const { createArtisanProfile } = require('../controllers/artisan.controller')

router.post('/create', protect,authorizeRoles("artisan","admin"), createArtisanProfile)

module.exports = router