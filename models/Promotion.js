module.exports = (sequelize, DataTypes) => {

  const Promotion = sequelize.define('Promotion', {

    offer_name: {
      type: DataTypes.STRING,
      allowNull: false
    },

    description: DataTypes.TEXT,

    offer_type: {
      type: DataTypes.ENUM('PERCENTAGE', 'FLAT', 'BUY_X_GET_Y')
    },

    headline: DataTypes.STRING,

    discount_value: DataTypes.FLOAT,

    minimum_order_value: DataTypes.FLOAT,

    category: DataTypes.STRING,

    applicable_products: DataTypes.JSON,

    valid_from: DataTypes.DATE,

    valid_to: DataTypes.DATE,

    status: {
      type: DataTypes.ENUM('ACTIVE', 'INACTIVE'),
      defaultValue: 'ACTIVE'
    },

    show_homepage_banner: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },

    createdBy: DataTypes.INTEGER

  });

  return Promotion;
};