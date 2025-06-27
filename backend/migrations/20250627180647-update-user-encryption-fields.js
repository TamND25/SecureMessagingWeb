'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'encryptedKey', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.removeColumn('users', 'salt');
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.addColumn('users', 'salt', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.removeColumn('users', 'encryptedKey');
  },
};
