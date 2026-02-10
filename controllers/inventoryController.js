const { Inventory } = require('../models');
const { Op, fn, col, literal } = require('sequelize');
const {
  PHARMACY_CATEGORIES,
  STOCK_STATUS
} = require('../constants/inventory');


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


// /* ================= FILTER PRODUCTS ================= */
// exports.filterProducts = async (req, res) => {
//   try {
//     const { category, stock } = req.query;

//     let where = { user_id: req.user.id };

//     if (category) {
//       where.category = category;
//     }

//     if (stock === 'in-stock') {
//       where.stock_quantity = { [Op.gt]: 0 };
//     }

//     if (stock === 'out-of-stock') {
//       where.stock_quantity = 0;
//     }

//     const products = await Inventory.findAll({ where });

//     res.json({
//       success: true,
//       data: products
//     });

//   } catch (err) {
//     console.error('FILTER ERROR 👉', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };


/* ================= FILTER PRODUCTS ================= */
exports.filterProducts = async (req, res) => {
  try {
    const {
      search = '',
      category = 'all',
      stock = 'all',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let where = {
      user_id: req.user.id
    };

    /* 🔍 Search (product name / product id) */
    if (search) {
      where[Op.or] = [
        { product_name: { [Op.like]: `%${search}%` } },
        { product_id: { [Op.like]: `%${search}%` } }
      ];
    }

    /* 📦 Category filter */
    if (category !== 'all') {
      where.category = category;
    }

    /* 📊 Stock filter (BASED ON STATUS) */
    if (stock !== 'all') {
      switch (stock) {
      case 'in_stock':
        where.stock_quantity = { [Op.gt]: 20 };
        break;

      case 'low_stock':
        where.stock_quantity = { [Op.between]: [1, 20] };
        break;

        case 'out_of_stock':
          where.stock_quantity = 0;
          break;

        case 'expired':
          where.expiry_date = { [Op.lt]: new Date() };
          break;

        case 'expiring_soon':
          where.expiry_date = {
            [Op.between]: [
              new Date(),
              new Date(new Date().setDate(new Date().getDate() + 30))
            ]
          };
          break;
      }
    }

    /* 📄 Fetch products with dynamic status */
    const { rows, count } = await Inventory.findAndCountAll({
      where,
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['createdAt', 'DESC']],
      attributes: {
        include: [
          [
            literal(`
                CASE
                WHEN expiry_date < CURDATE() THEN 'expired'
                WHEN expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                  THEN 'expiring_soon'
                WHEN stock_quantity = 0 THEN 'out_of_stock'
                WHEN stock_quantity <= 20 THEN 'low_stock'
                ELSE 'in_stock'
              END
            `),
            'status'
          ]
        ]
      }
    });

    /* 📊 Dashboard summary */
    const summary = await Inventory.findOne({
      where: { user_id: req.user.id },
      attributes: [
        [fn('COUNT', col('id')), 'total_products'],
        [fn('SUM', col('purchase_price')), 'total_stock_value'],
        [
          fn(
            'SUM',
            literal('CASE WHEN stock_quantity BETWEEN 1 AND 20 THEN 1 ELSE 0 END')
          ),
          'low_stock_items'
        ],
        [
          fn(
            'SUM',
            literal('CASE WHEN expiry_date < CURDATE() THEN 1 ELSE 0 END')
          ),
          'expired_items'
        ],
        [
          fn(
            'SUM',
            literal(`
              CASE
                WHEN expiry_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 30 DAY)
                THEN 1 ELSE 0
              END
            `)
          ),
          'expiring_soon_items'
        ]
      ],
      raw: true
    });

    res.json({
      success: true,

      /* pagination */
      total: count,
      page: parseInt(page),
      limit: parseInt(limit),

      /* product list */
      data: rows,

      /* UI helpers */
      meta: {
        categories: PHARMACY_CATEGORIES,
        stock_status: STOCK_STATUS
      },

      /* dashboard cards */
      summary
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



/* ================= GET SINGLE PRODUCT ================= */
exports.getSingleProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    const product = await Inventory.findOne({
      where: {
        product_id: productId,
        user_id: req.user.id
      }
    });

    if (!product) {
      return res.status(404).json({
        success: false,
        message: 'Product not found'
      });
    }

    res.json({
      success: true,
      data: product
    });

  } catch (err) {
    console.error('GET SINGLE PRODUCT ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


