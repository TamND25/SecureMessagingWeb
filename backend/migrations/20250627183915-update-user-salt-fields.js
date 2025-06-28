module.exports = {
  async up(qi, Sequelize) {
    await qi.addColumn('users', 'salt', { type: Sequelize.STRING, allowNull: true });
  },
  async down(qi) {
    await qi.removeColumn('users', 'salt');
  }
};
