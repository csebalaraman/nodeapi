'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Inventories', 'status', {
      type: Sequelize.ENUM(
        'in_stock',
        'low_stock',
        'out_of_stock',
        'expired'
      ),
      allowNull: false,
      defaultValue: 'in_stock',
      after: 'stock_quantity'
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Inventories', 'status');
  }
};