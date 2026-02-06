module.exports = (sequelize, DataTypes) => {
  const Inventory = sequelize.define(
    'Inventory',
    {
      product_id: DataTypes.STRING,
      user_id: DataTypes.INTEGER,
      product_name: DataTypes.STRING,
      category: DataTypes.STRING,
      batch_number: DataTypes.STRING,
      box_number: DataTypes.INTEGER,
      expiry_date: DataTypes.DATEONLY,
      purchase_price: DataTypes.FLOAT,
      selling_price: DataTypes.FLOAT,
      stock_quantity: DataTypes.INTEGER,
      supplier: DataTypes.STRING,
      invoice_number: DataTypes.STRING,
      status: {
        type: DataTypes.ENUM(
          'in_stock',
          'low_stock',
          'out_of_stock',
          'expired'
        ),
        defaultValue: 'in_stock'
      }
    },
    {
      tableName: 'Inventories',

      timestamps: true,
      

      // 🔥🔥 THIS IS THE KEY FIX 🔥🔥
      underscored: false,

      // explicitly map timestamp fields
      createdAt: 'createdAt',
      updatedAt: 'updatedAt'
    }
  );

  Inventory.associate = models => {
    Inventory.belongsTo(models.User, {
      foreignKey: 'user_id'
    });
  };

  return Inventory;
};