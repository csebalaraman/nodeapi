'use strict';
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Pharmacy extends Model {
    static associate(models) {
      Pharmacy.belongsTo(models.User, {
        foreignKey: 'userId'
      });
    }
  }

  Pharmacy.init(
    {
      userId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },

      pharmacyName: {
        type: DataTypes.STRING,
        allowNull: false
      },

      phone: {
        type: DataTypes.STRING,
        allowNull: false
      },

      email: {
        type: DataTypes.STRING,
        allowNull: false
      },

      address: DataTypes.TEXT,
      city: DataTypes.STRING,
      state: DataTypes.STRING,
      pincode: DataTypes.STRING,

      openTime: DataTypes.STRING,
      closeTime: DataTypes.STRING,

      workingDays: DataTypes.JSON,

      gstPercentage: {
        type: DataTypes.STRING,
        defaultValue: '0'
      },

      invoicePrefix: {
        type: DataTypes.STRING,
        defaultValue: 'INV'
      },

      logo: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'Pharmacy',
      tableName: 'Pharmacies'
    }
  );

  return Pharmacy;
};
