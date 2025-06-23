'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Friendships', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      requesterId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users', // must match your users table name
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      addresseeId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: 'Users',
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      status: {
        type: Sequelize.ENUM('pending', 'accepted', 'declined'),
        allowNull: false,
        defaultValue: 'pending',
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
      }
    });

    // Optional: add a unique index on requesterId + addresseeId to avoid duplicates
    await queryInterface.addIndex('Friendships', ['requesterId', 'addresseeId'], {
      unique: true,
      name: 'friendship_unique_pair'
    });
  },

  async down(queryInterface) {
    // Drop ENUM type first (Postgres), Sequelize drops automatically in MySQL
    await queryInterface.dropTable('Friendships');
  }
};
