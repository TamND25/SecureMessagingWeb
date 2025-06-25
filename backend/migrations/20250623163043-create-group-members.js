'use strict';
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('group_members', {
      groupId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'groups', key: 'id' },
        onDelete: 'CASCADE'
      },
      userId: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE'
      }
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('group_members');
  }
};
