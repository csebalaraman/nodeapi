require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ strict: true }));
app.use(express.urlencoded({ extended: true }));

app.use('/uploads', express.static('uploads'));

/* ================= ROUTES ================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '18.60.129.193', () => {
  console.log(`Node API running on https://18.60.129.193`);
});