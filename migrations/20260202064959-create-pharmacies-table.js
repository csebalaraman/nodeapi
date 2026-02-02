'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Pharmacies', {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },

      userId: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      pharmacyName: {
        type: Sequelize.STRING,
        allowNull: false
      },

      phone: {
        type: Sequelize.STRING,
        allowNull: false
      },

      email: {
        type: Sequelize.STRING,
        allowNull: false
      },

      address: Sequelize.TEXT,
      city: Sequelize.STRING,
      state: Sequelize.STRING,
      pincode: Sequelize.STRING,

      openTime: Sequelize.STRING,
      closeTime: Sequelize.STRING,

      workingDays: {
        type: Sequelize.JSON
      },

      gstPercentage: {
        type: Sequelize.STRING,
        defaultValue: '0'
      },

      invoicePrefix: {
        type: Sequelize.STRING,
        defaultValue: 'INV'
      },

      logo: Sequelize.STRING,

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },

      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },

  async down(queryInterface) {
    await queryInterface.dropTable('Pharmacies');
  }
};
