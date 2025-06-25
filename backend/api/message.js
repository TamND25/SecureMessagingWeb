const express = require("express");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const messageController = require("../controllers/message.controller");

router.post("/send", authenticateToken, messageController.sendMessage);
router.get("/conversation/:userId", authenticateToken, messageController.getConversation);
router.get("/group/:groupId", authenticateToken, messageController.getGroupMessages);

router.put("/:id/edit", authenticateToken, messageController.editMessage);

router.post("/:id/soft-delete", authenticateToken, messageController.softDelete);
router.delete("/:id", authenticateToken, messageController.hardDelete);

router.post("/:id/react", authenticateToken, messageController.reactToMessage);

module.exports = router;
