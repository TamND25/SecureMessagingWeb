module.exports = (sequelize, DataTypes) => {
  const Reaction = sequelize.define("Reaction", {
    messageId: { type: DataTypes.INTEGER, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
    type: { type: DataTypes.STRING, allowNull: false }
  });

  Reaction.associate = models => {
    Reaction.belongsTo(models.message, { foreignKey: 'messageId', as: 'message' });
    Reaction.belongsTo(models.user, { foreignKey: 'userId', as: 'user' });
  };

  return Reaction;
};
