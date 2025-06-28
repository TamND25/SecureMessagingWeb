'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.addColumn('GroupMessages', 'deletedFor', {
      type: Sequelize.JSON,
      allowNull: false,
      defaultValue: [],
    });
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.removeColumn('GroupMessages', 'deletedFor');
  }
};
