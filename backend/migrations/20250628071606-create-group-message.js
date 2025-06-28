"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("GroupMessages", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      content: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      iv: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      type: {
        type: Sequelize.STRING,
        allowNull: false,
        defaultValue: "text",
      },
      mimeType: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      originalName: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      senderId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Users",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      groupId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "Groups",
          key: "id",
        },
        onDelete: "CASCADE",
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable("GroupMessages");
  },
};
