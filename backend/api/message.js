const express = require("express");
const multer = require("multer");
const path = require("path");
const router = express.Router();
const authenticateToken = require("../middleware/authenticateToken");
const messageController = require("../controllers/message.controller");

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1e9) + ext;
    cb(null, uniqueName);
  },
});

const upload = multer({ storage });

router.post("/send", authenticateToken, messageController.sendMessage);
router.post("/file", authenticateToken, upload.single("file"), messageController.uploadFile);
router.get("/conversation/:userId", authenticateToken, messageController.getConversation);

router.put("/:id/edit", authenticateToken, messageController.editMessage);

router.post("/:id/soft-delete", authenticateToken, messageController.softDelete);
router.delete("/:id", authenticateToken, messageController.hardDelete);

router.post("/:id/react", authenticateToken, messageController.reactToMessage);

module.exports = router;
