const db = require("../models");
const Message = db.message;
const Reaction = db.Reaction;
const User = db.user;
const { Op } = require("sequelize");

exports.sendMessage = async (req, res) => {
  const { receiverId, content, timer, type } = req.body;
  const senderId = req.user.id;

  if (!content || (!receiverId )) {
    return res.status(400).json({ error: "Missing fields" });
  }

  try {
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      timer,
      type: type || "text",
      isEdited: false,
      deletedFor: [],
    });

    const sender = await User.findByPk(senderId);
    const enrichedMessage = {
      ...message.dataValues,
      senderName: sender.username,
    };

    res.status(201).json(enrichedMessage);
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(500).json({ error: "Failed to send message" });
  }
};

exports.uploadFile = async (req, res) => {
  const { receiverId, iv, encryptedKeyForSender, encryptedKeyForReceiver, mimeType } = req.body;
  const senderId = req.user.id;
  const fileUrl = req.file?.path || req.file?.secure_url;
  if (!fileUrl) {
    console.error("No valid file path returned from Cloudinary");
    return res.status(500).json({ error: "Upload failed — no file URL" });
  }

  console.log("Body fields:", { receiverId, iv, encryptedKeyForSender, encryptedKeyForReceiver, mimeType });
  console.log("req.file =", req.file);

  if (!req.file || (!receiverId )) {
    return res.status(400).json({ error: "Missing file or recipient" });
  }

  try {
    const message = await Message.create({
      senderId,
      receiverId,
      content: fileUrl,
      type: "file",
      iv,
      encryptedKeyForSender: encryptedKeyForSender || null,
      encryptedKeyForReceiver: encryptedKeyForReceiver || null,
      mimeType,
      isEdited: false,
      deletedFor: [],
    });

    const sender = await User.findByPk(senderId);
    const enrichedMessage = {
      ...message.dataValues,
      senderName: sender.username,
    };

    res.status(201).json({
      message: "File uploaded and message sent",
      messageData: enrichedMessage,
    });
  } catch (err) {
    console.error("Upload failed:", err.message);

    res.status(500).json({ error: "Upload failed" });
  }
};


exports.getConversation = async (req, res) => {
  const userId = req.user.id;
  const otherId = parseInt(req.params.userId);

  try {
    const messages = await Message.findAll({
      where: {
        [Op.and]: [
          {
            [Op.or]: [
              { senderId: userId, receiverId: otherId },
              { senderId: otherId, receiverId: userId },
            ],
          },
          {
            [Op.or]: [
              { deletedFor: null },
              { deletedFor: { [Op.not]: { [Op.contains]: [userId] } } },
            ],
          },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [
        { model: User, as: "Sender", attributes: ["id", "username"] },
        { model: User, as: "Receiver", attributes: ["id", "username"] },
        { model: Reaction, as: "Reactions" },
      ],
    });

    const enrichedMessages = messages.map((msg) => ({
      ...msg.dataValues,
      senderName: msg.Sender?.username || "Unknown",
    }));

    res.json(enrichedMessages);
  } catch (err) {
    console.error("Error getting messages:", err);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

exports.editMessage = async (req, res) => {
  const { id } = req.params;
  const { content, iv, encryptedKeyForSender, encryptedKeyForReceiver } = req.body;
  const userId = req.user.id;

  try {
    const message = await Message.findByPk(id);
    if (!message || message.senderId !== userId) {
      return res.status(403).json({ error: "Unauthorized or message not found" });
    }

    message.content = content;
    message.iv = iv;
    message.encryptedKeyForSender = encryptedKeyForSender;
    message.encryptedKeyForReceiver = encryptedKeyForReceiver;
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
    if (!message) return res.status(404).json({ error: "Message not found" });

    if (message.senderId === userId) {
      await message.destroy();
      return res.json({ message: "Message permanently deleted" });
    } else {
      const deletedFor = message.deletedFor || [];
      if (!deletedFor.includes(userId)) {
        message.deletedFor = [...deletedFor, userId];
        await message.save();
      }
      return res.json({ message: "Message hidden for current user" });
    }
  } catch (err) {
    console.error("Error hard-deleting or hiding message:", err);
    res.status(500).json({ error: "Failed to delete or hide message" });
  }
};

exports.reactToMessage = async (req, res) => {
  const userId = req.user.id;
  const { id } = req.params;
  const { type } = req.body;

  try {
    const [reaction, created] = await Reaction.findOrCreate({
      where: { messageId: id, userId },
      defaults: { type },
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
