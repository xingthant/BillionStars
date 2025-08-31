require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const cloudinary = require('cloudinary').v2;

// Load environment variables from .env file
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Cloudinary Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Middleware - ORDER IS IMPORTANT!
app.use(cors({
  origin: 'https://billion-star-front.vercel.app/',
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Import Routes
const productRoutes = require('./routes/products');
const categoryRoutes = require('./routes/categories');
const uploadRoutes = require('./routes/upload');
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const usersRoutes = require('./routes/users');
const newArrivalRoutes = require('./routes/newArrivals');

// Use Routes
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/new-arrivals', newArrivalRoutes);


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
