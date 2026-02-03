const { Inventory } = require('../models');
const { Op } = require('sequelize');


/* ================= HELPER FUNCTION ================= */

/**
 * Generate next custom product ID (PROD001, PROD002...)
 */
/* ================= HELPER FUNCTION ================= */
const generateProductId = async () => {
  const lastProduct = await Inventory.findOne({
    order: [['createdAt', 'DESC']]
  });

  if (!lastProduct) return 'PROD001';

  const lastNumber = parseInt(
    lastProduct.product_id.replace('PROD', ''),
    10
  );

  return `PROD${String(lastNumber + 1).padStart(3, '0')}`;
};


/* ================= ADD PRODUCT ================= */
exports.addProduct = async (req, res) => {
  try {
     const productId = await generateProductId();
    const product = await Inventory.create({
      product_id: productId,
      user_id: req.user.id,
      product_name: req.body.productName,
      category: req.body.category,
      batch_number: req.body.batchNumber,
      box_number: req.body.boxNumber,
      expiry_date: req.body.expiryDate,
      purchase_price: req.body.purchasePrice,
      selling_price: req.body.sellingPrice,
      stock_quantity: req.body.stockQuantity,
      supplier: req.body.supplier,
      invoice_number: req.body.invoiceNumber
    });

    res.status(201).json({
      success: true,
      message: 'Product added successfully',
      data: product
    });

  } catch (err) {
    console.error('ADD PRODUCT ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= UPDATE PRODUCT ================= */
exports.updateProduct = async (req, res) => {
  try {
    const { productId, sellingPrice, stockQuantity } = req.body;

    const product = await Inventory.findOne({
      where: {
        product_id: productId,
        user_id: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    await product.update({
      selling_price: sellingPrice,
      stock_quantity: stockQuantity
    });

    res.json({
      success: true,
      message: 'Product updated successfully'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= DELETE PRODUCT ================= */
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.body;

    const deleted = await Inventory.destroy({
      where: {
        product_id: productId,
        user_id: req.user.id
      }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({
      success: true,
      message: 'Product deleted successfully'
    });

  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= FILTER PRODUCTS ================= */
exports.filterProducts = async (req, res) => {
  try {
    const { category, stock } = req.query;

    let where = { user_id: req.user.id };

    if (category) {
      where.category = category;
    }

    if (stock === 'in-stock') {
      where.stock_quantity = { [Op.gt]: 0 };
    }

    if (stock === 'out-of-stock') {
      where.stock_quantity = 0;
    }

    const products = await Inventory.findAll({ where });

    res.json({
      success: true,
      data: products
    });

  } catch (err) {
    console.error('FILTER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= GET ALL PRODUCTS ================= */
exports.getProducts = async (req, res) => {
  try {
    const products = await Inventory.findAll({
      where: { user_id: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      count: products.length,
      data: products
    });

  } catch (err) {
    console.error('GET PRODUCTS ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

