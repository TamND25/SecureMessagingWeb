const db = require("../models");
const Message = db.message;
const Reaction = db.Reaction;
const User = db.user;
const { Op } = require("sequelize");

exports.sendMessage = async (req, res) => {
  const { receiverId, groupId, content, timer } = req.body;
  const senderId = req.user.id;

  if (!content || (!receiverId && !groupId)) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const message = await Message.create({
      senderId,
      receiverId,
      groupId,
      content,
      timer,
      type: type || "text",
      deletedFor: [],
    });

    res.status(201).json(message);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.getConversation = async (req, res) => {
  const userId = req.user.id;
  const otherId = parseInt(req.params.userId);

  console.log("Fetching conversation for", userId, "with", otherId);


  try {
    const messages = await Message.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { senderId: userId, receiverId: otherId },
              { senderId: otherId, receiverId: userId },
            ]
          },
          {
            [Op.or]: [
              { deletedFor: null },
              { deletedFor: { [Op.not]: { [Op.contains]: [userId] } } }
            ]
          }
        ]
      },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, as: "Sender", attributes: ["id", "username"] },
        { model: User, as: "Receiver", attributes: ["id", "username"] },
        { model: Reaction, as: "Reactions" }
      ]
    });

    res.json(messages);
  } catch (err) {
    console.error("Error getting messages:", err);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

exports.getGroupMessages = async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;

  try {
    const messages = await Message.findAll({
      where: {
        groupId,
        [Op.or]: [
          { deletedFor: null },
          { deletedFor: { [Op.notContains]: [userId] } }
        ]
      },
      order: [["createdAt", "ASC"]],
      include: [{ model: Reaction, as: "Reactions" }]
    });

    res.json(messages);
  } catch (err) {
    console.error("Error getting group messages:", err);
    res.status(500).json({ error: "Failed to get group messages" });
  }
};

exports.editMessage = async (req, res) => {
  const { id } = req.params;
  const { content } = req.body;
  const userId = req.user.id;

  try {
    const message = await Message.findByPk(id);
    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: "Unauthorized or message not found" });
    }

    message.content = content;
    message.isEdited = true;
    await message.save();

    res.json(message);
  } catch (err) {
    console.error("Error editing message:", err);
    res.status(500).json({ error: "Failed to edit message" });
  }
};

exports.softDelete = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  console.log("Before soft delete:", Message.deletedFor);


  try {
    const message = await Message.findByPk(id);
    if (!message) return res.status(404).json({ error: "Message not found" });

    const deletedFor = message.deletedFor || [];
    message.deletedFor = [...new Set([...deletedFor, userId])];
    await message.save();

    res.json({ message: "Message hidden for current user" });
  } catch (err) {
    console.error("Error soft-deleting message:", err);
    res.status(500).json({ error: "Failed to hide message" });
  }
};

exports.hardDelete = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    const message = await Message.findByPk(id);
    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: "Unauthorized or not found" });
    }

    await message.destroy();
    res.json({ message: "Message permanently deleted" });
  } catch (err) {
    console.error("Error hard-deleting message:", err);
    res.status(500).json({ error: "Failed to delete message" });
  }
};

exports.reactToMessage = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { type } = req.body;

  try {
    const [reaction, created] = await Reaction.findOrCreate({
      where: { messageId: id, userId },
      defaults: { type }
    });

    if (!created) {
      reaction.type = type;
      await reaction.save();
    }

    res.json(reaction);
  } catch (err) {
    console.error("Error reacting to message:", err);
    res.status(500).json({ error: "Failed to react" });
  }
};

exports.uploadFile = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const fileUrl = `/uploads/${req.file.filename}`;
  res.status(200).json({
    message: "File uploaded successfully",
    fileUrl,
    fileName: req.file.originalname,
  });
};
