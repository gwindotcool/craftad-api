const express = require('express');
const router = express.Router();

router.get('/online/:userId',
    (req, res) => {
    const { userId } = req.params;
    const isOnline = global.onlineUsers.has(userId);
    res.json({
        success: true,
        online: isOnline,
    })

    })
module.exports = router;