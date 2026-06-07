const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth.middleware');
const { authorizeRoles, } = require('../middleware/role.middleware');
const { createJob, matchArtisans, acceptJob, updateJobStatus, suggestJobs,assignArtisan,getActiveJobs,getJobHistory,
    cancelJob
} = require('../controllers/job.controller');


router.post('/create', protect,authorizeRoles("customer", "admin"), createJob);

router.get('/match/:jobId', protect,authorizeRoles("customer", "admin","artisan"), matchArtisans);
router.patch("/accept/:jobId", protect, authorizeRoles("artisan", "admin"), acceptJob);
router.patch('/assign/:jobId', protect, authorizeRoles("customer", "admin"), assignArtisan);

router.patch( "/status/:jobId", protect, authorizeRoles("artisan","admin"), updateJobStatus);
router.get('/suggested', protect, authorizeRoles("artisan", "admin"), suggestJobs);
router.get('/active-jobs', protect, authorizeRoles("artisan", "admin"), getActiveJobs);
router.get('/history', protect, authorizeRoles("artisan", "admin"), getJobHistory);
router.patch('/cancel/:jobId',protect, authorizeRoles("customer", "admin"), cancelJob);








module.exports = router;