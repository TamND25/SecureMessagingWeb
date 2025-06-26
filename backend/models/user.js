const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Friendship, { foreignKey: 'requesterId', as: 'requestedFriends' });
      User.hasMany(models.Friendship, { foreignKey: 'addresseeId', as: 'receivedFriends' });

      User.hasMany(models.message, { foreignKey: 'senderId', as: 'sentMessages' });
      User.hasMany(models.message, { foreignKey: 'receiverId', as: 'receivedMessages' });

      User.belongsToMany(models.Group, {
        through: models.GroupMember,
        foreignKey: 'userId',
        as: 'groups',
      });

      User.hasMany(models.Group, {
        foreignKey: 'createdBy',
        as: 'ownedGroups',
      });

      User.hasMany(models.Reaction, { foreignKey: 'userId', as: 'reactions' });
    }
  }

  User.init(
    {
      username: { type: DataTypes.STRING, allowNull: false, unique: true },
      email: { type: DataTypes.STRING, allowNull: false, unique: true },
      password: { type: DataTypes.STRING, allowNull: false },
      publicKey: { type: DataTypes.TEXT, allowNull: true },
      encryptedPrivateKey: { type: DataTypes.TEXT, allowNull: true },
      salt: { type: DataTypes.STRING, allowNull: true },
      iv: { type: DataTypes.STRING, allowNull: true },
    },
    {
      sequelize,
      modelName: "user",
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};
