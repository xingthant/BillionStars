const express = require('express');
const app = express();

console.log('Testing route imports...');

const testRouteFile = (filePath, name) => {
  try {
    require(filePath);
    console.log(`✓ ${name} routes loaded successfully`);
    return true;
  } catch (error) {
    console.error(`✗ Error in ${name} routes:`, error.message);
    return false;
  }
};

// Test each route file individually
testRouteFile('./routes/products', 'products');
testRouteFile('./routes/orders', 'orders');
testRouteFile('./routes/users', 'users');
testRouteFile('./routes/auth', 'auth');
testRouteFile('./routes/newArrivals', 'newArrivals');
testRouteFile('./routes/upload', 'upload');
testRouteFile('./routes/categories', 'categories');

console.log('Route testing completed');
