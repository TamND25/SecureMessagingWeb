module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Messages", "encryptedKeyForSender", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    await queryInterface.addColumn("Messages", "encryptedKeyForReceiver", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
    // optional: remove old "encryptedKey"
    await queryInterface.removeColumn("Messages", "encryptedKey");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Messages", "encryptedKeyForSender");
    await queryInterface.removeColumn("Messages", "encryptedKeyForReceiver");
    await queryInterface.addColumn("Messages", "encryptedKey", {
      type: Sequelize.TEXT,
      allowNull: true,
    });
  },
};
