"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("messages", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      senderId: { type: Sequelize.INTEGER, allowNull: false },
      receiverId: { type: Sequelize.INTEGER, allowNull: true },
      groupId: { type: Sequelize.INTEGER, allowNull: true },
      content: { type: Sequelize.TEXT, allowNull: false },
      isEdited: { type: Sequelize.BOOLEAN, defaultValue: false },
      timer: { type: Sequelize.INTEGER, allowNull: true },
      deletedFor: { type: Sequelize.JSON, defaultValue: [] },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });

    await queryInterface.createTable("reactions", {
      id: { type: Sequelize.INTEGER, autoIncrement: true, primaryKey: true },
      messageId: { type: Sequelize.INTEGER, allowNull: false },
      userId: { type: Sequelize.INTEGER, allowNull: false },
      type: { type: Sequelize.STRING, allowNull: false },
      createdAt: Sequelize.DATE,
      updatedAt: Sequelize.DATE
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("reactions");
    await queryInterface.dropTable("messages");
  }
};
