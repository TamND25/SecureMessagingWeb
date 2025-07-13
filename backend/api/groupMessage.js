const express = require("express");
const router = express.Router();
const groupMessageController = require("../controllers/groupMessage.controller");
const authenticateToken = require("../middleware/authenticateToken");
const multer = require("multer");
const parser = require("../middleware/cloudinaryUpload");

router.use(authenticateToken);

router.get("/:groupId", groupMessageController.getGroupMessages);

router.post("/:groupId", groupMessageController.sendGroupMessage);

router.post("/:groupId/file", parser.single("file"), groupMessageController.uploadGroupFile);

router.put("/:messageId", authenticateToken, groupMessageController.editGroupMessage);

router.delete("/:messageId", authenticateToken, groupMessageController.deleteGroupMessage);

module.exports = router;
