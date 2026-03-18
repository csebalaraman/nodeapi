'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Suppliers', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      supplier_name: {
        type: Sequelize.STRING,
        allowNull: false
      },

      contact_person: {
        type: Sequelize.STRING,
        allowNull: false
      },

      mobile_number: {
        type: Sequelize.STRING,
        allowNull: false
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      gst_number: {
        type: Sequelize.STRING,
        allowNull: false
      },

      address: {
        type: Sequelize.TEXT,
        allowNull: false
      },

      status: {
        type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
        defaultValue: 'ACTIVE'
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
    await queryInterface.dropTable('Suppliers');
  }
};