const { Product, User } = require('../models');
const { Op } = require('sequelize');
/**
 * CREATE PRODUCT (with image)
 */
exports.create = async (req, res) => {
  try {
    const product = await Product.create({
      name: req.body.name,
      price: req.body.price,
      userId: req.user.id,
      image: req.file ? `uploads/products/${req.file.filename}` : null
    });

    res.status(201).json({
      message: 'Product created',
      data: product
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * LIST PRODUCTS (user based)
 */
exports.list = async (req, res) => {
  try {
    const products = await Product.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    res.json({
      message: 'Product list api',
      data: products
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * UPDATE PRODUCT (with image)
 */
exports.update = async (req, res) => {
  try {
    const updateData = {
      name: req.body.name,
      price: req.body.price
    };

    if (req.file) {
      updateData.image = `uploads/products/${req.file.filename}`;
    }

    const updated = await Product.update(updateData, {
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!updated[0]) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Updated successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


/**
 * SINGLE PRODUCT
 */
exports.show = async (req, res) => {
  const product = await Product.findOne({
    where: {
      id: req.params.id,
      userId: req.user.id
    }
  });

  if (!product) {
    return res.status(404).json({ message: 'Product not found' });
  }

  res.json(product);
};


/**
 * DELETE PRODUCT
 */
exports.delete = async (req, res) => {
  try {
    const deleted = await Product.destroy({
      where: { id: req.params.id, userId: req.user.id }
    });

    if (!deleted) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


exports.search = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({ message: 'Search query is required' });
  }

  const products = await Product.findAll({
    where: {
      userId: req.user.id,
      [Op.or]: [
        { name: { [Op.like]: `%${q}%` } },
        { price: !isNaN(q) ? q : null }
      ]
    }
  });

  res.json({
    message: 'Product search list',
    data: products
  });
};
