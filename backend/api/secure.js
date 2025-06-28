const express = require('express');
const router = express.Router();
const secureController = require('../controllers/secure.controller');
const authenticateToken = require('../middleware/authenticateToken');

router.post('/registerKeys', authenticateToken, secureController.registerKeys);

router.get('/getUserKey/:userId', authenticateToken, secureController.getUserKey);

router.post('/sendMessage', authenticateToken, secureController.sendMessage);

router.get('/receiveMessages', authenticateToken, secureController.receiveMessages);

router.get('/getGroupKeys/:groupId', authenticateToken, secureController.getGroupKeys);

router.post('/saveGroupKeys/:groupId', authenticateToken, secureController.saveGroupKeys);

module.exports = router;
