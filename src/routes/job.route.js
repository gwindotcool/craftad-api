const express = require('express');
const router = express.Router();
const {protect} = require('../middleware/auth.middleware');
const { authorizeRoles, } = require('../middleware/role.middleware');
const { createJob, matchArtisans, acceptJob, updateJobStatus, suggestJobs,assignArtisan,getAllJobs,getMyJobs,getActiveJobs,
    getCompletedJobs,getJobHistory
} = require('../controllers/job.controller');


router.post('/create', protect,authorizeRoles("customer", "admin"), createJob);
router.get('/match/:jobId', protect,authorizeRoles("customer", "admin","artisan"), matchArtisans);
router.patch('/assign/:jobId', protect, authorizeRoles("customer", "admin"), assignArtisan);

router.patch('/accept/:jobId', protect,authorizeRoles("artisan", "admin"), acceptJob);
router.patch( "/status/:jobId", protect, authorizeRoles("artisan","admin"), updateJobStatus);
router.get('/suggested', protect, authorizeRoles("artisan", "admin"), suggestJobs);
router.get('/my-jobs', protect, authorizeRoles("artisan", "admin"), getMyJobs);
router.get('/my-jobs', protect, authorizeRoles("artisan", "admin"), getMyJobs);
router.get('/active-jobs', protect, authorizeRoles("artisan", "admin"), getActiveJobs);
router.get('/completed-jobs', protect, authorizeRoles("artisan", "admin"), getCompletedJobs);
router.get('/history', protect, authorizeRoles("artisan", "admin"), getJobHistory);







module.exports = router;