"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    return queryInterface.removeColumn("messages", "groupId");
  },

  down: async (queryInterface, Sequelize) => {
    return queryInterface.addColumn("messages", "groupId", {
      type: Sequelize.INTEGER,
      references: {
        model: "groups",
        key: "id",
      },
      onUpdate: "CASCADE",
      onDelete: "SET NULL",
    });
  },
};
