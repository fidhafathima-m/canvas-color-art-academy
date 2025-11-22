const express = require('express');
const { auth } = require('../middlewares/auth');

const router = express.Router();

// User dashboard data
router.get('/dashboard', auth, (req, res) => {
    res.json({
        success: true,
        data: {
            message: 'Welcome to User Dashboard',
            enrolledCourses: [
                'Basic Drawing',
                'Watercolor Painting',
                'Clay Modeling'
            ],
            progress: 65,
            user: req.user
        }
    });
});

module.exports = router;