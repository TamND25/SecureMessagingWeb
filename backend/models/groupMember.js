module.exports = (sequelize, DataTypes) => {
  const GroupMember = sequelize.define('GroupMember', {
    groupId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    isOwner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  }, {
    tableName: 'group_members',
    timestamps: true,
  });

  GroupMember.associate = (models) => {
    GroupMember.belongsTo(models.user, { foreignKey: 'userId', as: 'User' });
    GroupMember.belongsTo(models.Group, { foreignKey: 'groupId', as: 'Group' });
  };

  return GroupMember;
};
