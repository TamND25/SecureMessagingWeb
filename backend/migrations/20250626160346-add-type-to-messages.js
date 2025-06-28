"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("Messages", "type", {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: "text",
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("Messages", "type");
  },
};
