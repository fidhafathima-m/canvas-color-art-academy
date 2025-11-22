const express = require('express');
const { auth, requireAdmin } = require('../middlewares/auth');

const router = express.Router();

// Admin dashboard data
router.get('/dashboard', auth, requireAdmin, (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'Welcome to Admin Dashboard',
            stats: {
                totalUsers: 150,
                activeCourses: 8,
                revenue: 45000,
                newEnrollments: 12
            },
            user: req.user
        }
    });
});

module.exports = router;