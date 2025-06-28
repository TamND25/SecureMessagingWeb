'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_keys', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'groups',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      recipientId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      encryptedKey: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
    });

    await queryInterface.addConstraint('group_keys', {
      fields: ['groupId', 'recipientId'],
      type: 'unique',
      name: 'unique_group_user_key'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_keys');
  },
};
