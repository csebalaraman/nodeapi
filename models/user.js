'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      User.hasMany(models.Product, { foreignKey: 'userId' });
    }
  }
  User.init({
    name: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: {
      type: DataTypes.ENUM('PHARMACY_ADMIN', 'STAFF', 'SUPER_ADMIN'),
      defaultValue: 'PHARMACY_ADMIN'
    },
      staff_role: {
    type: DataTypes.ENUM('Pharmacist', 'Cashier', 'Inventory Staff'),
    allowNull: true
  },
   status: {
    type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
    defaultValue: 'ACTIVE'
  },
    phone: DataTypes.STRING,
    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE'
    },
    createdBy: DataTypes.INTEGER,
    otp: DataTypes.STRING,
    otpExpiresAt: DataTypes.DATE,
    resetToken: DataTypes.STRING,
    resetTokenExpiresAt: DataTypes.DATE
  }, {
    sequelize,
    modelName: 'User',
  });

  return User;
};