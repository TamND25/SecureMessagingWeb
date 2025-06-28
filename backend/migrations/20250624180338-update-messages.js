'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'groupId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'Groups',
        key: 'id'
      },
      onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('Messages', 'isEdited', {
      type: Sequelize.BOOLEAN,
      defaultValue: false
    });

    await queryInterface.addColumn('Messages', 'timer', {
      type: Sequelize.INTEGER,
      allowNull: true
    });

    await queryInterface.addColumn('Messages', 'deletedFor', {
      type: Sequelize.JSON,
      defaultValue: []
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'groupId');
    await queryInterface.removeColumn('Messages', 'isEdited');
    await queryInterface.removeColumn('Messages', 'timer');
    await queryInterface.removeColumn('Messages', 'deletedFor');
  }
};
