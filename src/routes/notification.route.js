const express = require('express');
const router = express.Router();
const { protect } = require ('../middleware/auth.middleware');
const Notification = require('../models/Notification.model');


router.get("/", protect, async (req, res) => {
    const notifications = await Notification.find({
        user: req.user.id
    }).sort({ createdAt: -1 });

    res.json({
        success: true,
        data: notifications
    });
});

module.exports = router;