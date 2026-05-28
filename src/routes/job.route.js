const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth.middleware');
const { authorizeRoles, } = require('../middleware/role.middleware');
const { createJob, matchArtisans, acceptJob, updateJobStatus, suggestJobs } = require('../controllers/job.controller');

router.post('/create', protect,authorizeRoles("customer", "admin"), createJob);
router.get('/match/:jobId', protect,authorizeRoles("customer", "admin"), matchArtisans);
router.patch('/accept/:jobId', protect,authorizeRoles("artisan", "admin"), acceptJob);
router.patch( "/status/:jobId", protect, authorizeRoles("artisan","admin"), updateJobStatus);
router.get('/suggested', protect, authorizeRoles("artisan", "admin"), suggestJobs);

module.exports = router;