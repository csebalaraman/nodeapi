require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());

// ✅ SAFE JSON PARSER (NO strict, NO duplicate)
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: false }));

app.use('/uploads', express.static('uploads'));

/* ================= ROUTES ================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));
app.use('/api/customers', require('./routes/customerRoutes'));

/* ================= SERVER ================= */
const PORT = process.env.PORT || 3000;

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Node API running on http://127.0.0.1:${PORT}`);
});