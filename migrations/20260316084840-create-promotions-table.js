'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Promotions', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      offer_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      description: {
        type: Sequelize.TEXT
      },

      offer_type: {
        type: Sequelize.ENUM('PERCENTAGE', 'FLAT', 'BUY_X_GET_Y'),
        allowNull: false
      },

      headline: {
        type: Sequelize.STRING
      },

      discount_value: {
        type: Sequelize.FLOAT
      },

      minimum_order_value: {
        type: Sequelize.FLOAT
      },

      category: {
        type: Sequelize.STRING
      },

      applicable_products: {
        type: Sequelize.JSON
      },

      valid_from: {
        type: Sequelize.DATE
      },

      valid_to: {
        type: Sequelize.DATE
      },

      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE'
      },

      show_homepage_banner: {
        type: Sequelize.BOOLEAN,
        defaultValue: false
      },

      createdBy: {
        type: Sequelize.INTEGER
      },

      createdAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      },

      updatedAt: {
        type: Sequelize.DATE,
        defaultValue: Sequelize.NOW
      }

    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Promotions');
  }
};