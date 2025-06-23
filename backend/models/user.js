const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class User extends Model {
    static associate(models) {
      User.hasMany(models.Friendship, { foreignKey: 'requesterId', as: 'requestedFriends' });
      User.hasMany(models.Friendship, { foreignKey: 'addresseeId', as: 'receivedFriends' });
      User.hasMany(models.message, { foreignKey: 'senderId', as: 'sentMessages' });
      User.hasMany(models.message, { foreignKey: 'receiverId', as: 'receivedMessages' });
    }
  }

  User.init(
    {
      username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "User",
      tableName: "users",
      timestamps: true,
    }
  );

  return User;
};