require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors()); // 👈 ALLOW ALL ORIGINS
app.use(express.json());
app.use(express.json());

// 👇 REQUIRED to access uploaded images
app.use('/uploads', express.static('uploads'));

app.use('/api/auth', require('./routes/auth'));
app.use('/api/products', require('./routes/product'));


app.listen(3000, () => console.log('Server running on port 3000'));






