module.exports = (sequelize, DataTypes) => {

  const Supplier = sequelize.define('Supplier', {

    supplier_name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    contact_person: {
      type: DataTypes.STRING,
      allowNull: false
    },

    mobile_number: {
      type: DataTypes.STRING,
      allowNull: false
    },

    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },

    gst_number: {
      type: DataTypes.STRING,
      allowNull: false
    },

    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },

    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE'
    },

    createdBy: DataTypes.INTEGER

  });

  return Supplier;
};