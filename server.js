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
// Fixed CORS configuration
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl requests)
    if (!origin) return callback(null, true);
    
    // Remove trailing slash for comparison
    const normalizedOrigin = origin.endsWith('/') ? origin.slice(0, -1) : origin;
    const allowedOrigins = [
      'http://localhost:5173', // For local development
      'https://billion-star-front.vercel.app' // Your production frontend
    ];
    
    // Check if the normalized origin is in the allowed list
    const isAllowed = allowedOrigins.some(allowed => {
      const normalizedAllowed = allowed.endsWith('/') ? allowed.slice(0, -1) : allowed;
      return normalizedOrigin === normalizedAllowed;
    });
    
    if (isAllowed) {
      console.log('CORS allowed for origin:', origin);
      return callback(null, origin); // Return the original origin
    } else {
      console.log('CORS blocked for origin:', origin);
      return callback(new Error('Not allowed by CORS'), false);
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

// Add request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// TEST ROUTES - Add these before your other routes
app.get('/api/health', (req, res) => {
  res.json({ 
    message: 'Server is running!', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

app.get('/api/test/new-arrivals', async (req, res) => {
  try {
    // Mock response to test the route without database dependency
    res.json([
      { 
        _id: 'test1', 
        title: 'Test Product 1', 
        price: 'From $49.99', 
        image: 'https://images.unsplash.com/photo-1529139574466-a303027c1d8b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80',
        subtitle: 'Test product description'
      }
    ]);
  } catch (error) {
    res.status(500).json({ message: 'Test error', error: error.message });
  }
});

app.post('/api/test/auth/login', (req, res) => {
  // Mock login response
  res.json({
    message: 'Test login successful',
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      username: 'testuser',
      isAdmin: false
    }
  });
});

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

// 404 handler for undefined routes
app.use('*', (req, res) => {
  console.log('404 - Route not found:', req.originalUrl);
  res.status(404).json({ 
    message: 'Route not found', 
    path: req.originalUrl,
    method: req.method,
    suggestion: 'Check your API endpoint URL'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  console.error('Global error:', error);
  res.status(error.status || 500).json({
    message: error.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
  });
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/api/health`);
  console.log(`Test new arrivals: http://localhost:${PORT}/api/test/new-arrivals`);
});
