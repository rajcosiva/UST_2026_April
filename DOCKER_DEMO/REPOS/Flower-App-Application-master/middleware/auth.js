// middleware/auth.js
const User = require('../models/user');

module.exports = async (req, res, next) => {
    try {
        // Example of fetching userId from a session or other identifier
        const userId = req.session.userId; // Adjust based on your session setup

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        req.user = user; // Attach user to request object
        next();
    } catch (error) {
        console.error('Error fetching user:', error);
        res.status(500).send('Server error');
    }
};
