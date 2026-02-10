'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Users', 'staff_role', {
      type: Sequelize.ENUM('Pharmacist', 'Cashier', 'Inventory Staff'),
      allowNull: true,
      after: 'role'
    });

    await queryInterface.addColumn('Users', 'phone', {
      type: Sequelize.STRING,
      allowNull: true,
      after: 'email'
    });

    await queryInterface.addColumn('Users', 'status', {
      type: Sequelize.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE',
      after: 'staff_role'
    });

    await queryInterface.addColumn('Users', 'createdBy', {
      type: Sequelize.INTEGER,
      allowNull: true
    });
  },

  async down(queryInterface) {
    await queryInterface.removeColumn('Users', 'staff_role');
    await queryInterface.removeColumn('Users', 'phone');
    await queryInterface.removeColumn('Users', 'status');
    await queryInterface.removeColumn('Users', 'createdBy');
  }
};