const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class Group extends Model {
    static associate(models) {
      Group.belongsTo(models.user, {
        foreignKey: 'createdBy',
        as: 'creator',
      });

      Group.belongsToMany(models.user, {
        through: models.GroupMember,
        foreignKey: 'groupId',
        otherKey: 'userId',
        as: 'members',
      });

      Group.hasMany(models.message, {
        foreignKey: 'groupId',
        as: 'messages',
      });

      Group.hasMany(models.GroupMember, {
        foreignKey: 'groupId',
        as: 'groupMembers',
      });
    }
  }

  Group.init(
    {
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      avatar: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      createdBy: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "Group",
      tableName: "groups",
      timestamps: true,
    }
  );

  return Group;
};
