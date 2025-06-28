const db = require("../models");
const User = db.user;
const Message = db.message;
const GroupKey = db.GroupKey || {};
const { Op } = require("sequelize");

exports.registerKeys = async (req, res) => {
  const { publicKey, encryptedPrivateKey, encryptedKey, iv } = req.body;
  const userId = req.user.id;

  if (!publicKey || !encryptedPrivateKey || !encryptedKey || !iv) {
    return res.status(400).json({ error: "Missing key fields" });
  }

  try {
    await User.update(
      { publicKey, encryptedPrivateKey, encryptedKey, iv },
      { where: { id: userId } }
    );
    res.status(200).json({ message: "Keys registered successfully" });
  } catch (err) {
    console.error("Key registration failed:", err);
    res.status(500).json({ error: "Failed to register keys" });
  }
};

exports.getUserKey = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findByPk(userId, {
      attributes: ["publicKey"],
    });

    if (!user || !user.publicKey) {
      return res.status(404).json({ error: "Public key not found" });
    }

    res.json({ publicKey: user.publicKey });
  } catch (err) {
    console.error("Error getting user key:", err);
    res.status(500).json({ error: "Failed to retrieve public key" });
  }
};

exports.sendMessage = async (req, res) => {
  const senderId = req.user.id;
  const { receiverId, content, type, timer, encryptedKeyForSender, encryptedKeyForReceiver, iv } = req.body;

  if (!content || (!receiverId )) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const message = await Message.create({
      senderId,
      receiverId,
      content,
      type: type || "text",
      timer,
      encryptedKeyForSender,
      encryptedKeyForReceiver,
      iv,
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
    console.error("Secure message send error:", err);
    res.status(500).json({ error: "Failed to send secure message" });
  }
};

exports.receiveMessages = async (req, res) => {
  const userId = req.user.id;

  try {
    const messages = await Message.findAll({
      where: {
        [Op.or]: [
          { receiverId: userId },
        ],
        [Op.or]: [
          { deletedFor: null },
          { deletedFor: { [Op.notContains]: [userId] } },
        ],
      },
      order: [["createdAt", "ASC"]],
      include: [{ model: User, as: "Sender", attributes: ["id", "username"] }],
    });

    const enrichedMessages = messages.map((msg) => ({
      ...msg.dataValues,
      senderName: msg.Sender?.username || "Unknown",
    }));

    res.json(enrichedMessages);
  } catch (err) {
    console.error("Secure message fetch error:", err);
    res.status(500).json({ error: "Failed to get messages" });
  }
};

exports.getGroupKeys = async (req, res) => {
  const groupId = req.params.groupId;
  const userId = req.user.id;

  try {
    const key = await GroupKey.findOne({
      where: { groupId, recipientId: userId },
      attributes: ["encryptedKey"],
    });

    if (!key) {
      return res.status(404).json({ error: "Encrypted group key not found for this user" });
    }

    res.json({ encryptedKey: key.encryptedKey });
  } catch (err) {
    console.error("Group key fetch error:", err);
    res.status(500).json({ error: "Failed to get group key" });
  }
};

exports.saveGroupKeys = async (req, res) => {
  const groupId = req.params.groupId;
  const keyEntries = req.body;

  if (!Array.isArray(keyEntries) || keyEntries.length === 0) {
    return res.status(400).json({ error: "Missing or invalid key entries" });
  }

  try {
    await Promise.all(
      keyEntries.map(({ recipientId, encryptedKey }) => {
        if (!recipientId || !encryptedKey) {
          throw new Error("Each key entry must include recipientId and encryptedKey");
        }

        return GroupKey.upsert({
          groupId,
          recipientId,
          encryptedKey,
        });
      })
    );

    res.status(200).json({ message: "Group keys saved" });
  } catch (err) {
    console.error("Group key save error:", err);
    res.status(500).json({ error: "Failed to save group keys" });
  }
};