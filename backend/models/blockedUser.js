const { Model } = require("sequelize");

module.exports = (sequelize, DataTypes) => {
  class BlockedUser extends Model {
    static associate(models) {
      BlockedUser.belongsTo(models.user, { as: 'Blocker', foreignKey: 'blockerId' });
      BlockedUser.belongsTo(models.user, { as: 'Blocked', foreignKey: 'blockedId' });
    }
  }

  BlockedUser.init({
    blockerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE'
    },
    blockedId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE'
    }
  }, {
    sequelize,
    modelName: 'BlockedUser',
    tableName: 'BlockedUsers',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['blockerId', 'blockedId']
      }
    ]
  });

  return BlockedUser;
};
