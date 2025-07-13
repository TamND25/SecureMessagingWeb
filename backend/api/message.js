const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const messageController = require("../controllers/message.controller");
const parser = require("../middleware/cloudinaryUpload");

router.post("/send", authenticateToken, messageController.sendMessage);
router.post("/file", authenticateToken, parser.single("file"), messageController.uploadFile);
router.get("/conversation/:userId", authenticateToken, messageController.getConversation);

router.put("/:id/edit", authenticateToken, messageController.editMessage);

router.post("/:id/soft-delete", authenticateToken, messageController.softDelete);
router.delete("/:id", authenticateToken, messageController.hardDelete);

router.post("/:id/react", authenticateToken, messageController.reactToMessage);

module.exports = router;
