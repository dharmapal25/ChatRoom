const express = require('express');
require('dotenv').config();
const app = express();

// Middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');

app.use('/api/auth', authRoutes);





module.exports = app;