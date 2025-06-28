'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'publicKey', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'encryptedPrivateKey', {
      type: Sequelize.TEXT,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'salt', {
      type: Sequelize.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn('Users', 'iv', {
      type: Sequelize.STRING,
      allowNull: true,
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Users', 'publicKey');
    await queryInterface.removeColumn('Users', 'encryptedPrivateKey');
    await queryInterface.removeColumn('Users', 'salt');
    await queryInterface.removeColumn('Users', 'iv');
  }
};
