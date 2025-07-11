module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define("Message", {
    senderId: { type: DataTypes.INTEGER, allowNull: false },
    receiverId: { type: DataTypes.INTEGER, allowNull: true },
    content: { type: DataTypes.TEXT, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false, defaultValue: "text" },
    isEdited: { type: DataTypes.BOOLEAN, defaultValue: false },
    timer: { type: DataTypes.INTEGER, allowNull: true },
    deletedFor: { type: DataTypes.JSON, defaultValue: [] },
    encryptedKeyForSender: { type: DataTypes.TEXT, allowNull: true },
    encryptedKeyForReceiver: { type: DataTypes.TEXT, allowNull: true },
    iv: { type: DataTypes.STRING, allowNull: true },
    mimeType: { type: DataTypes.STRING, allowNull: true},
  });

  Message.associate = models => {
    Message.belongsTo(models.user, { foreignKey: 'senderId', as: 'Sender' });
    Message.belongsTo(models.user, { foreignKey: 'receiverId', as: 'Receiver' });

    if (models.Reaction) {
      Message.hasMany(models.Reaction, { foreignKey: 'messageId', as: 'Reactions' });
    }
  };

  return Message;
};
