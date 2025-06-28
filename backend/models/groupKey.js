const { Model, DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  class GroupKey extends Model {
    static associate(models) {
      GroupKey.belongsTo(models.Group, {
        foreignKey: 'groupId',
        as: 'group',
      });

      GroupKey.belongsTo(models.user, {
        foreignKey: 'recipientId',
        as: 'recipient',
      });
    }
  }

  GroupKey.init(
    {
      groupId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      recipientId: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      encryptedKey: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      sequelize,
      modelName: "GroupKey",
      tableName: "group_keys",
      timestamps: false,
      indexes: [
        {
          unique: true,
          fields: ["groupId", "recipientId"],
        },
      ],
    }
  );

  return GroupKey;
};
