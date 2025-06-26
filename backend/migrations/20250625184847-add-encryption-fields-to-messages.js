'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Messages', 'encryptedKey', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Messages', 'iv', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Messages', 'encryptedKey');
    await queryInterface.removeColumn('Messages', 'iv');
  },
};
