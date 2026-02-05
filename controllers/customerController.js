const { Customer } = require('../models');
const { Op, fn, col, literal } = require('sequelize');

/* ================= HELPER ================= */
const generateCustomerId = async () => {
  const last = await Customer.findOne({ order: [['createdAt', 'DESC']] });
  if (!last) return 'CUST001';

  const num = parseInt(last.customer_id.replace('CUST', ''), 10);
  return `CUST${String(num + 1).padStart(3, '0')}`;
};

/* ================= ADD CUSTOMER ================= */
exports.addCustomer = async (req, res) => {
  try {
    const customerId = await generateCustomerId();

    const avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(
      req.body.name
    )}&background=0D9488&color=fff`;

    const customer = await Customer.create({
      customer_id: customerId,
      user_id: req.user.id,
      name: req.body.name,
      mobile: req.body.mobile,
      email: req.body.email || null,
      avatar
    });

    res.status(201).json({
      success: true,
      message: 'Customer added successfully',
      data: customer
    });
  } catch (err) {
    console.error('ADD CUSTOMER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= GET ALL CUSTOMERS (PAGINATION) ================= */
exports.getAllCustomers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const search = req.query.search || '';

    const where = {
      user_id: req.user.id,
      ...(search && {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { mobile: { [Op.like]: `%${search}%` } }
        ]
      })
    };

    const { count, rows } = await Customer.findAndCountAll({
      where,
      order: [['createdAt', 'DESC']],
      limit,
      offset
    });

    res.json({
      success: true,
      data: rows,
      pagination: {
        total: count,
        page,
        pages: Math.ceil(count / limit)
      }
    });
  } catch (err) {
    console.error('CUSTOMER LIST ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= VIEW CUSTOMER ================= */
exports.viewCustomerProfile = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    res.json({ success: true, data: customer });
  } catch (err) {
    console.error('VIEW CUSTOMER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= SAVE NOTES ================= */
exports.saveCustomerNotes = async (req, res) => {
  try {
    const customer = await Customer.findOne({
      where: { id: req.params.id, user_id: req.user.id }
    });

    if (!customer) {
      return res.status(404).json({ message: 'Customer not found' });
    }

    customer.notes = req.body.notes;
    await customer.save();

    res.json({
      success: true,
      message: 'Notes saved successfully'
    });
  } catch (err) {
    console.error('SAVE NOTES ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

// exports.customerStats = async (req, res) => {
//   try {
//     const userId = req.user.id;

//     /* ================= TOTAL CUSTOMERS ================= */
//     const totalCustomers = await Customer.count({
//       where: { user_id: userId }
//     });

//     /* ================= NEW CUSTOMERS (THIS MONTH) ================= */
//     const startOfMonth = new Date();
//     startOfMonth.setDate(1);
//     startOfMonth.setHours(0, 0, 0, 0);

//     const newCustomers = await Customer.count({
//       where: {
//         user_id: userId,
//         createdAt: { [Op.gte]: startOfMonth }
//       }
//     });

//     /* ================= REPEAT CUSTOMERS ================= */
//     // Order model must exist
//     const repeatCustomersRaw = await Order.findAll({
//       attributes: [
//         'customer_id',
//         [fn('COUNT', col('customer_id')), 'orderCount']
//       ],
//       where: { user_id: userId },
//       group: ['customer_id'],
//       having: literal('COUNT(customer_id) > 1')
//     });

//     const repeatCustomers = repeatCustomersRaw.length;

//     res.json({
//       success: true,
//       data: {
//         totalCustomers,
//         newCustomers,
//         repeatCustomers
//       }
//     });

//   } catch (err) {
//     console.error('CUSTOMER STATS ERROR 👉', err);
//     res.status(500).json({ message: 'Server error' });
//   }
// };



exports.customerStats = async (req, res) => {
  try {
    const userId = req.user.id;

    /* ================= TOTAL CUSTOMERS ================= */
    const totalCustomers = await Customer.count({
      where: { user_id: userId }
    });

    /* ================= NEW CUSTOMERS (THIS MONTH) ================= */
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const newCustomers = await Customer.count({
      where: {
        user_id: userId,
        createdAt: {
          [Op.gte]: startOfMonth
        }
      }
    });

    res.json({
      success: true,
      data: {
        totalCustomers,
        newCustomers,
        repeatCustomers: 0 // future use
      }
    });

  } catch (err) {
    console.error('CUSTOMER STATS ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};