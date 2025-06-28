const express = require("express");
const router = express.Router();
const groupMessageController = require("../controllers/groupMessage.controller");
const authenticateToken = require("../middleware/authenticateToken");
const multer = require("multer");

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 }
});

router.use(authenticateToken);

router.get("/:groupId", groupMessageController.getGroupMessages);

router.post("/:groupId", groupMessageController.sendGroupMessage);

router.post("/:groupId/file", upload.single("file"), groupMessageController.uploadGroupFile);

router.put("/:messageId", authenticateToken, groupMessageController.editGroupMessage);

router.delete("/:messageId", authenticateToken, groupMessageController.deleteGroupMessage);

module.exports = router;
