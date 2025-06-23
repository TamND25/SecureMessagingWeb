const express = require('express');
const router = express.Router();
const db = require('../models');
const User = db.user;
const authenticateToken = require('../middleware/authenticateToken');
const userController = require('../controllers/user.controller');

router.get('/current', authenticateToken, async (req, res) => {
  try {
    console.log("req.user =", req.user);

    const user = await User.findByPk(req.user.id);

    if (!user) {
      console.log("User not found with ID:", req.user.id);
      return res.status(404).json({ error: 'User not found' });
    }

    const { username, email } = user;
    res.json({ username, email });

  } catch (err) {
    console.error("Error fetching current user:", err);
    res.status(500).json({ error: 'Failed to fetch current user' });
  }
});

router.get('/search', userController.searchUsers);

router.get('/by-username/:username', authenticateToken, userController.getUserByUsername);

module.exports = router;
