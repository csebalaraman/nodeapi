const { User } = require('../models');
const bcrypt = require('bcryptjs');
const { Op, fn, col, literal } = require('sequelize');
const {
  ROLE_STAFF, STAFF_STATUS
} = require('../constants/inventory');

/* ================= ADD STAFF ================= */
exports.addStaff = async (req, res) => {
  try {
    console.log('ADD STAFF REQUEST BODY 👉', req.body);
    console.log('ADD STAFF USER ID 👉', req.user?.id);

    const { name, email, phone, staff_role, password, status } = req.body;

    // Ensure request is authenticated
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // Validate required fields
    if (!name || !email || !phone || !staff_role || !password) {
      return res.status(400).json({
        success: false,
        message: 'All fields are required'
      });
    }

    // Check if email already exists
    const exists = await User.findOne({ where: { email } });
    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    // Hash the password
    const hash = await bcrypt.hash(password, 10);

    // Create staff
    const staff = await User.create({
      name,
      email,
      phone,
      password: hash,
      role: 'STAFF',
      staff_role,
      status: status || 'ACTIVE',
      createdBy: req.user.id
    });

    console.log('STAFF CREATED 👉', staff);

    res.status(201).json({
      success: true,
      message: 'Staff added successfully',
      data: {
        id: staff.id,
        name: staff.name,
        email: staff.email,
        phone: staff.phone,
        staff_role: staff.staff_role,
        status: staff.status,
        role: staff.role
      }
    });

  } catch (err) {
    console.error('ADD STAFF ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};


/* ================= LIST / FILTER STAFF ================= */
exports.listStaff = async (req, res) => {
  try {
    const {
      search = '',
      role = 'all',      // 👈 renamed
      status = 'all',
      stock = 'all',     // 👈 accepted but optional
      page = 1,
      limit = 10
    } = req.query;

    const offset = (page - 1) * limit;

    /* ================= WHERE CONDITION ================= */
    let where = {
    role: 'STAFF',
    staff_role: { [Op.ne]: null }
    };

    /* 🔍 Search (name / email / phone) */
    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    /* 🧑‍⚕️ Staff Role Filter */
    if (role !== 'all') {
      where.staff_role = role;
    }

    /* 📌 Status Filter */
    if (status !== 'all') {
      where.status = status;
    }

    /* 🧪 Stock Filter (optional – future ready) */
    // if (stock !== 'all') {
    //   where.stock_access = stock;
    // }

    /* ================= STAFF LIST ================= */
    const { rows, count } = await User.findAndCountAll({
      where,
      attributes: [
        'id',
        'name',
        'email',
        'phone',
        'staff_role',
        'status',
        'createdAt'
      ],
      limit: Number(limit),
      offset: Number(offset),
      order: [['createdAt', 'DESC']]
    });

    /* ================= STAFF SUMMARY ================= */
    const summary = await User.findOne({
      where: {
        role: 'STAFF',
        createdBy: req.user.id
      },
      attributes: [
        [fn('COUNT', col('id')), 'total_staff'],
        [fn('SUM', literal(`CASE WHEN status = 'ACTIVE' THEN 1 ELSE 0 END`)), 'active_staff'],
        [fn('SUM', literal(`CASE WHEN status = 'INACTIVE' THEN 1 ELSE 0 END`)), 'inactive_staff'],
        [fn('SUM', literal(`CASE WHEN staff_role = 'Pharmacist' THEN 1 ELSE 0 END`)), 'pharmacists_count']
      ],
      raw: true
    });

    res.json({
      success: true,
      total: count,
      page: Number(page),
      limit: Number(limit),
      data: rows,
      summary: {
        totalStaff: Number(summary?.total_staff) || 0,
        activeStaff: Number(summary?.active_staff) || 0,
        inactiveStaff: Number(summary?.inactive_staff) || 0,
        pharmacists: Number(summary?.pharmacists_count) || 0
      }
    });

  } catch (err) {
    console.error('LIST STAFF ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.getStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ where: { id: req.params.id, role: 'STAFF' } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (err) {
    console.error('GET STAFF ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await User.findOne({ where: { id: req.params.id, role: 'STAFF' } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    staff.status = status || staff.status;
    staff.name = req.body.name || staff.name;
    staff.email = req.body.email || staff.email;
    staff.phone = req.body.phone || staff.phone;
    staff.staff_role = req.body.staff_role || staff.staff_role; 
    await staff.save();
    res.json({ message: 'Staff updated successfully', staff });
  } catch (err) {
    console.error('UPDATE STAFF ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const staff = await User.findOne({ where: { id: req.params.id, role: 'STAFF' } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    await staff.destroy();
    res.json({ message: 'Staff deleted successfully' });
  } catch (err) {
    console.error('DELETE STAFF ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.updateStaffStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const staff = await User.findOne({ where: { id: req.params.id, role: 'STAFF' } });
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    staff.status = status || staff.status;
    await staff.save();
    res.json({ message: 'Staff status updated successfully', staff });  
} catch (err) {
    console.error('UPDATE STAFF STATUS ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};
