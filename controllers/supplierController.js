const { Supplier } = require('../models');
const { Op } = require('sequelize');


/* ================= ADD SUPPLIER ================= */
exports.addSupplier = async (req, res) => {
  try {

    const {
      supplier_name,
      contact_person,
      mobile_number,
      email,
      gst_number,
      address,
      status
    } = req.body;

    if (!supplier_name || !contact_person || !mobile_number || !email || !gst_number || !address) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    const exists = await Supplier.findOne({ where: { email } });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Supplier already exists with this email'
      });
    }

    const supplier = await Supplier.create({
      supplier_name,
      contact_person,
      mobile_number,
      email,
      gst_number,
      address,
      status,
      createdBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Supplier created successfully',
      data: supplier
    });

  } catch (err) {
    console.error('ADD SUPPLIER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= LIST SUPPLIERS ================= */
exports.listSuppliers = async (req, res) => {
  try {

    const {
      search = '',
      status = 'all',
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    let where = {};

    if (search) {
      where[Op.or] = [
        { supplier_name: { [Op.like]: `%${search}%` } },
        { contact_person: { [Op.like]: `%${search}%` } },
        { mobile_number: { [Op.like]: `%${search}%` } }
      ];
    }

    if (status !== 'all') {
      where.status = status;
    }

    const { rows, count } = await Supplier.findAndCountAll({
      where,
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      success: true,
      total: count,
      page: Number(page),
      limit: Number(limit),
      data: rows
    });

  } catch (err) {
    console.error('LIST SUPPLIER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= GET SUPPLIER ================= */
exports.getSupplier = async (req, res) => {
  try {

    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    res.json(supplier);

  } catch (err) {
    console.error('GET SUPPLIER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= UPDATE SUPPLIER ================= */
exports.updateSupplier = async (req, res) => {
  try {

    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.update(req.body);

    res.json({
      success: true,
      message: 'Supplier updated successfully',
      data: supplier
    });

  } catch (err) {
    console.error('UPDATE SUPPLIER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= DELETE SUPPLIER ================= */
exports.deleteSupplier = async (req, res) => {
  try {

    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    await supplier.destroy();

    res.json({
      success: true,
      message: 'Supplier deleted successfully'
    });

  } catch (err) {
    console.error('DELETE SUPPLIER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= UPDATE STATUS ================= */
exports.updateSupplierStatus = async (req, res) => {
  try {

    const supplier = await Supplier.findByPk(req.params.id);

    if (!supplier) {
      return res.status(404).json({ message: 'Supplier not found' });
    }

    supplier.status = req.body.status;

    await supplier.save();

    res.json({
      success: true,
      message: 'Supplier status updated',
      data: supplier
    });

  } catch (err) {
    console.error('STATUS ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};