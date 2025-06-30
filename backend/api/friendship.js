const express = require('express');
const router = express.Router();
const friendshipController = require('../controllers/friendship.controller');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/sendRequest', authenticateToken, friendshipController.sendRequest);

router.post('/accept', authenticateToken, friendshipController.acceptRequest);

router.post('/decline', authenticateToken, friendshipController.declineRequest);

router.get('/requests', authenticateToken, friendshipController.getPendingRequests);

router.get('/accepted', authenticateToken, friendshipController.getAcceptedFriends);

router.post('/unfriend', authenticateToken, friendshipController.unfriendUser);

router.post('/block', authenticateToken, friendshipController.blockUser);

router.get('/blocked', authenticateToken, friendshipController.getBlockedUsers);

router.post('/unblock', authenticateToken, friendshipController.unblockUser);

module.exports = router;
