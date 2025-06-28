module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('group_members', 'createdAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW'),
    });
    await queryInterface.addColumn('group_members', 'updatedAt', {
      allowNull: false,
      type: Sequelize.DATE,
      defaultValue: Sequelize.fn('NOW'),
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('group_members', 'createdAt');
    await queryInterface.removeColumn('group_members', 'updatedAt');
  },
};
