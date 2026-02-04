require('dotenv').config();
const express = require('express');
const cors = require('cors');
const https = require('https');
const fs = require('fs');

const app = express();

/* ================= MIDDLEWARE ================= */
app.use(cors());
app.use(express.json({ strict: true }));
app.use(express.urlencoded({ extended: true }));

// Static uploads
app.use('/uploads', express.static('uploads'));

/* ================= ROUTES ================= */
app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));
app.use('/api/inventory', require('./routes/inventoryRoutes'));

/* ================= HTTPS SERVER ================= */
const sslOptions = {
  key: fs.readFileSync('/home/ec2-user/ssl/key.pem'),
  cert: fs.readFileSync('/home/ec2-user/ssl/cert.pem'),
};

app.listen(3000, () => console.log('Server running on port 3000'));






