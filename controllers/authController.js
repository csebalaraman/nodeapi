const { User } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role (case-insensitive)
    const validRoles = ['user', 'admin', 'superadmin'];
    let userRole = 'user';
    if (role && typeof role === 'string') {
      const normalized = role.trim().toLowerCase();
      if (validRoles.includes(normalized)) userRole = normalized;
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already registered'
      });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hash, role: userRole });

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('REGISTER ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= LOGIN ================= */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

        const token = jwt.sign(
        { id: user.id },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN }
      );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (err) {
    console.error('LOGIN ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= UPDATE PROFILE ================= */
exports.updateProfile = async (req, res) => {
  try {
    console.log('REQ.USER 👉', req.user);

    const userId = req.user?.id;
    const { name, email, currentPassword, newPassword } = req.body;

    if (!userId) {
      return res.status(401).json({ message: 'Unauthorized - userId missing' });
    }

    // 🔹 Fetch user
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    /* ================= EMAIL CHECK ================= */
    if (email) {
      const emailExists = await User.findOne({
        where: {
          email,
          id: { [Op.ne]: userId }
        }
      });

      if (emailExists) {
        return res.status(409).json({
          success: false,
          message: 'Email already in use'
        });
      }
    }

    /* ================= PASSWORD UPDATE ================= */
    let passwordHash = user.password;

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({
          message: 'Current password is required'
        });
      }

      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(401).json({
          message: 'Current password is incorrect'
        });
      }

      // Prevent same password reuse
      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res.status(400).json({
          message: 'New password must be different'
        });
      }

      passwordHash = await bcrypt.hash(newPassword, 10);
    }

    /* ================= UPDATE ================= */
    await User.update(
      { name, email, password: passwordHash },
      { where: { id: userId } }
    );

    const updatedUser = await User.findByPk(userId, {
      attributes: { exclude: ['password'] }
    });

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: updatedUser
    });

  } catch (err) {
    console.error('UPDATE PROFILE ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/* ================= LOGOUT ================= */
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Logout successful (client clears token)'
  });
};
