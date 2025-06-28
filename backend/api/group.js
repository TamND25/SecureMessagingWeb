const express = require("express");
const router = express.Router();
const groupController = require("../controllers/group.controller");
const authenticateToken = require("../middleware/authenticateToken");

router.post("/createGroup", authenticateToken, groupController.createGroup);

router.get("/my-groups", authenticateToken, groupController.getMyGroups);

router.post("/leave/:groupId", authenticateToken, groupController.leaveGroup);

router.get('/:groupId/members', authenticateToken, groupController.getGroupMembers);

router.post("/add-members", authenticateToken, groupController.addMembers);

router.post("/promote", authenticateToken, groupController.promoteToOwner);

router.post("/demote", authenticateToken, groupController.demoteOwner);

router.post("/kick", authenticateToken, groupController.kickUser);

router.delete("/delete/:groupId", authenticateToken, groupController.deleteGroup);

module.exports = router;
