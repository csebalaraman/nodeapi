const { User } = require('../models');
const { Pharmacy } = require('../models');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');
const { sendEmail } = require('../utils/email');
const { otpTemplate } = require('../utils/emailTemplates');
const { generateOTP } = require('../utils/otp'); 
const { generateResetToken } = require('../utils/token');


/* ================= REGISTER ================= */
exports.register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Validate role (case-insensitive)
    const validRoles = ['PHARMACY_ADMIN', 'STAFF', 'SUPER_ADMIN'];
    let userRole = 'PHARMACY_ADMIN';
    if (role && typeof role === 'string') {
      const normalized = role.trim().toUpperCase();
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
      message: 'Login successfully',
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
    success: 200,
    message: 'Logged out successfully'
  });
};


exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2️⃣ Prevent OTP spam: allow new OTP only if previous expired
    if (user.otpExpiresAt && new Date() < user.otpExpiresAt) {
      return res.status(429).json({
        message: 'OTP already sent. Please wait before requesting again.'
      });
    }

    // 3️⃣ Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    await user.update({ otp, otpExpiresAt: otpExpiry });

    // 4️⃣ Send OTP
    if (process.env.NODE_ENV === 'development') {
      // DEV: log OTP instead of sending email
      console.log('DEV OTP 👉', otp);
      return res.json({
        success: true,
        message: 'OTP generated (development mode)',
        otp // remove in production
      });
    }

    // PROD: send email
    await sendEmail({
      to: email,
      subject: 'DisburseX – Password Reset OTP',
      html: otpTemplate(otp)
    });

    res.json({ success: true, message: 'OTP sent to email' });

  } catch (err) {
    console.error('FORGOT PASSWORD ERROR 👉', err);
    res.status(500).json({ message: 'Email sending failed' });
  }
};


exports.verifyForgotOTP = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    // 1️⃣ Find user by email and role
    const user = await User.findOne({ where: { email, role } });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // 2️⃣ Check OTP match
    if (!user.otp || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // 3️⃣ Check OTP expiry
    if (!user.otpExpiresAt || new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    // 4️⃣ Generate reset token
    const resetToken = generateResetToken();

    await user.update({
      resetToken,
      resetTokenExpiresAt: new Date(Date.now() + 15 * 60 * 1000), // 15 mins
      otp: null,
      otpExpiresAt: null
    });

    // 5️⃣ Return reset token to client
    res.json({
      success: true,
      message: 'OTP verified successfully',
      resetToken
    });

  } catch (err) {
    console.error('VERIFY FORGOT OTP ERROR 👉', err);
    res.status(500).json({ message: 'Server error' });
  }
};
exports.resetPassword = async (req, res) => {
  try {
    const { resetToken, newPassword, confirmPassword } = req.body;

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const user = await User.findOne({ where: { resetToken } });
    if (!user || new Date() > user.resetTokenExpiresAt) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const hash = await bcrypt.hash(newPassword, 10);

    await user.update({
      password: hash,
      resetToken: null,
      resetTokenExpiresAt: null
    });

    res.json({ success: true, message: 'Password reset successful' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};



exports.loginOtpRequest = async (req, res) => {
  try {
    const { email, role } = req.body;

    // 1️⃣ Find user
    const user = await User.findOne({ where: { email, role } });
    if (!user) return res.status(404).json({ message: 'User not found' });

    // 2️⃣ Prevent OTP spam: allow new OTP only if previous expired
    if (user.otpExpiresAt && new Date() < user.otpExpiresAt) {
      return res.status(429).json({
        message: 'OTP already sent. Please wait before requesting again.'
      });
    }

    // 3️⃣ Generate OTP
    const otp = generateOTP();
    const otpExpiry = new Date(Date.now() + 5 * 60 * 1000); // 5 mins

    await user.update({ otp, otpExpiresAt: otpExpiry });

    // 4️⃣ DEV mode: log OTP instead of sending email
    if (process.env.NODE_ENV === 'development') {
      console.log('DEV LOGIN OTP 👉', otp);
      return res.json({
        success: true,
        message: 'OTP generated (development mode)',
        otp // remove in production
      });
    }

    // 5️⃣ PROD: send email
    await sendEmail({
      to: email,
      subject: 'DisburseX – Login OTP',
      html: otpTemplate(otp, 'login')
    });

    res.json({ success: true, message: 'OTP sent to email' });

  } catch (err) {
    console.error('LOGIN OTP ERROR 👉', err);
    res.status(500).json({ message: 'OTP email failed' });
  }
};



exports.loginOtpVerify = async (req, res) => {
  try {
    const { email, otp, role } = req.body;

    const user = await User.findOne({ where: { email, role } });

    if (!user || user.otp !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    if (new Date() > user.otpExpiresAt) {
      return res.status(400).json({ message: 'OTP expired' });
    }

    const token = jwt.sign(
      { id: user.id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    await user.update({ otp: null });

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

exports.pharmacySetup = async (req, res) => {
  try {
    const userId = req.user.id;

    // ❌ Prevent duplicate setup
    // const existingPharmacy = await Pharmacy.findOne({ where: { userId } });
    // if (existingPharmacy) {
    //   return res.status(409).json({
    //     success: false,
    //     message: 'Pharmacy already setup for this user'
    //   });
    // }

    /* ================= WORKING DAYS SAFE PARSE ================= */
    let workingDays = [];

    if (req.body.workingDays) {
      if (Array.isArray(req.body.workingDays)) {
        // ✅ Already an array
        workingDays = req.body.workingDays;
      } else if (typeof req.body.workingDays === 'string') {
        try {
          // Try JSON string
          workingDays = JSON.parse(req.body.workingDays);
        } catch {
          // Fallback: comma-separated
          workingDays = req.body.workingDays
            .split(',')
            .map(day => day.trim());
        }
      }
    }

    /* ================= CREATE PHARMACY ================= */
    const pharmacy = await Pharmacy.create({
      userId,
      pharmacyName: req.body.pharmacyName,
      phone: req.body.phone,
      email: req.body.email,
      address: req.body.address,
      city: req.body.city,
      state: req.body.state,
      pincode: req.body.pincode,
      openTime: req.body.openTime,
      closeTime: req.body.closeTime,
      workingDays,
      gstPercentage: req.body.gstPercentage,
      invoicePrefix: req.body.invoicePrefix,

      // ✅ Logo path from Multer
      logo: req.file ? req.file.path : null
    });

    return res.status(201).json({
      success: true,
      message: 'Pharmacy setup completed successfully',
      pharmacy
    });

  } catch (error) {
    console.error('PHARMACY SETUP ERROR 👉', error);
    return res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
};