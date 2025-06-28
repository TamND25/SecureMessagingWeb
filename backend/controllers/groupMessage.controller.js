const fs = require("fs");
const path = require("path");
const { GroupMessage, GroupMember, user: User } = require("../models");

exports.getGroupMessages = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  try {
    const member = await GroupMember.findOne({ where: { groupId, userId } });
    if (!member) return res.status(403).json({ error: "Not a group member" });

    const messages = await GroupMessage.findAll({
      where: { groupId },
      include: [{ model: User, as: "sender", attributes: ["id", "username"] }],
      order: [["createdAt", "ASC"]],
    });

    const formatted = messages
    .filter((msg) => !Array.isArray(msg.deletedFor) || !msg.deletedFor.includes(userId))
    .map((msg) => ({
      id: msg.id,
      content: msg.content,
      iv: msg.iv,
      senderId: msg.senderId,
      senderName: msg.sender?.username || "Unknown",
      groupId: msg.groupId,
      type: msg.type,
      mimeType: msg.mimeType,
      originalName: msg.originalName,
      createdAt: msg.createdAt,
    }));

    res.json(formatted);
  } catch (err) {
    console.error("Fetch group messages error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.sendGroupMessage = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  try {
    const member = await GroupMember.findOne({ where: { groupId, userId } });
    if (!member) return res.status(403).json({ error: "Not a group member" });

    const { content, iv } = req.body;

    const newMessage = await GroupMessage.create({
      content,
      iv,
      senderId: userId,
      groupId,
      type: "text",
    });

    const populated = await GroupMessage.findByPk(newMessage.id, {
      include: [{ model: User, as: "sender", attributes: ["id", "username"] }],
    });

    res.json({
      id: populated.id,
      content: populated.content,
      iv: populated.iv,
      senderId: populated.senderId,
      senderName: populated.sender.username,
      groupId: populated.groupId,
      type: populated.type,
      createdAt: populated.createdAt,
    });
  } catch (err) {
    console.error("Send group message error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.uploadGroupFile = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;
  const file = req.file;
  const { iv, originalName, mimeType } = req.body;

  if (!file || !iv || !originalName || !mimeType) {
    return res.status(400).json({ error: "Missing file, IV, originalName, or mimeType" });
  }

  try {
    const member = await GroupMember.findOne({ where: { groupId, userId } });
    if (!member) return res.status(403).json({ error: "Not a group member" });

    const ext = path.extname(originalName);
    const oldPath = path.join("uploads", file.filename);
    const newFilename = file.filename + ext;
    const newPath = path.join("uploads", newFilename);

    fs.renameSync(oldPath, newPath);
    const fileUrl = `/uploads/${newFilename}`;

    const message = await GroupMessage.create({
      senderId: userId,
      groupId,
      content: fileUrl,
      type: "file",
      iv,
      mimeType,
      originalName,
    });

    const sender = await User.findByPk(userId);

    res.status(201).json({
      message: "File uploaded and message sent",
      messageData: {
        ...message.dataValues,
        senderName: sender.username,
      },
    });
  } catch (err) {
    console.error("Upload group file error:", err);
    res.status(500).json({ error: "Upload failed" });
  }
};

exports.editGroupMessage = async (req, res) => {
  const messageId = req.params.messageId;
  const userId = req.user.id;
  const { content, iv } = req.body;

  try {
    const message = await GroupMessage.findByPk(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });
    if (message.senderId !== userId) return res.status(403).json({ error: "Unauthorized" });

    message.content = content;
    message.iv = iv;
    await message.save();

    res.json({ success: true });
  } catch (err) {
    console.error("Edit group message error:", err);
    res.status(500).json({ error: "Server error" });
  }
};

exports.deleteGroupMessage = async (req, res) => {
  const userId = req.user.id;
  const messageId = req.params.messageId;
  const { deleteForEveryone } = req.body;

  try {
    const message = await GroupMessage.findByPk(messageId);
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (deleteForEveryone) {
      if (message.senderId !== userId) {
        return res.status(403).json({ error: "Only sender can delete for everyone" });
      }

      if (message.type === "file" && message.content?.startsWith("/uploads/")) {
        const filePath = path.join(__dirname, "..", message.content);
        if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
      }

      await message.destroy();
      return res.json({ success: true, deleted: "everyone" });
    }

    const deletedFor = Array.isArray(message.deletedFor) ? message.deletedFor : [];
    if (!deletedFor.includes(userId)) {
      deletedFor.push(userId);
      message.deletedFor = deletedFor;
      await message.save();
    }

    res.json({ success: true, deleted: "self" });
  } catch (err) {
    console.error("Delete group message error:", err);
    res.status(500).json({ error: "Server error" });
  }
};
