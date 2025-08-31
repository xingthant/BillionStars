const Product = require('../models/Product');
const Order = require('../models/Order');

// Get all products
exports.getProducts = async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        console.error('Error fetching products:', err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
};

// Get a single product by ID
exports.getProductById = async (req, res) => {
    try {
        const productId = req.params.id;
        const product = await Product.findById(productId);
        if (!product) {
            return res.status(404).json({ error: 'Product not found' });
        }
        res.json(product);
    } catch (err) {
        console.error('Error fetching product by ID:', err);
        res.status(500).json({ error: 'Failed to fetch product' });
    }
};

// Create a new order (requires authentication)
exports.createOrder = async (req, res) => {
    try {
        const { items, totalPrice } = req.body;
        const userId = req.user.id;  // Get user ID from authentication
        const newOrder = new Order({
            userId,
            items,
            totalPrice,
            status: 'Pending'
        });
        await newOrder.save();
        res.status(201).json(newOrder);
    } catch (err) {
        console.error('Error creating order:', err);
        res.status(500).json({ error: 'Failed to create order' });
    }
};
