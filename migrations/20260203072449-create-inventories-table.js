'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Inventories', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
       product_id: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true
      },

      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false
      },

      product_name: Sequelize.STRING,
      category: Sequelize.STRING,
      batch_number: Sequelize.STRING,

      box_number: Sequelize.INTEGER,
      expiry_date: Sequelize.DATEONLY,

      purchase_price: Sequelize.FLOAT,
      selling_price: Sequelize.FLOAT,

      stock_quantity: Sequelize.INTEGER,

      supplier: Sequelize.STRING,
      invoice_number: Sequelize.STRING,

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
    await queryInterface.dropTable('Inventories');
  }
};
