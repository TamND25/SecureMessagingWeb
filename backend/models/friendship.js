const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Friendship extends Model {
    static associate(models) {
      Friendship.belongsTo(models.user, { as: 'Requester', foreignKey: 'requesterId' });
      Friendship.belongsTo(models.user, { as: 'Addressee', foreignKey: 'addresseeId' });
    }
  }

  Friendship.init({
    requesterId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    addresseeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'Users', key: 'id' },
      onDelete: 'CASCADE',
    },
    status: {
      type: DataTypes.ENUM('pending', 'accepted', 'declined'),
      allowNull: false,
      defaultValue: 'pending',
    }
  }, {
    sequelize,
    modelName: 'Friendship',
    tableName: 'Friendships',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['requesterId', 'addresseeId']
      }
    ]
  });

  return Friendship;
};
  