module.exports = (sequelize, DataTypes) => {
  const GroupMessage = sequelize.define("GroupMessage", {
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    iv: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "text", // "text" or "file"
    },
    mimeType: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    originalName: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    senderId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
},
    deletedFor: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
  });

  GroupMessage.associate = (models) => {
    GroupMessage.belongsTo(models.user, { foreignKey: "senderId", as: "sender" });
    GroupMessage.belongsTo(models.Group, { foreignKey: "groupId" });
  };

  return GroupMessage;
};
