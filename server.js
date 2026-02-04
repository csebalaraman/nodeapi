require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();

/* ================= CORS ================= */
app.use(cors({
  origin: [
    "http://18.60.129.193:3000",
    "https://warm-sunburst-5f7d7c.netlify.app"
  ],
  credentials: true
}));

/* ================= BODY PARSER ================= */
app.use(express.json({ strict: true }));
app.use(express.urlencoded({ extended: true }));

/* ================= STATIC ================= */
app.use('/uploads', express.static('uploads'));

/* ================= ROUTES ================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));

app.listen(3000, () => console.log('Server running on port 3000'));






