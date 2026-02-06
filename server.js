require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ limit: '10mb' })); // ✅ only once
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

/* ================= ROUTES ================= */
app.get('/api', (req, res) => {
  res.json({ status: true, message: 'API is working 🚀' });
});

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Node API running on http://127.0.0.1:${PORT}`);
});