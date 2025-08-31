const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const Product = require('../models/Product');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.get('/', requireAdmin, async (req, res) => { 
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching orders', error: error.message });
  }
});

router.get('/my-orders', requireAuth, async (req, res) => {
  try {
    const orders = await Order.find({ clerkUserId: req.user._id.toString() })
      .sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    console.error('Error in /my-orders:', error);
    res.status(500).json({ message: 'Error fetching your orders', error: error.message });
  }
});

router.post('/', requireAuth, async (req, res) => {
  try {
    const { items, totalAmount, shippingAddress } = req.body;
    const userId = req.user._id.toString();
    if (!items || items.length === 0) {
      return res.status(400).json({ message: 'Order must have at least one item' });
    }

    const newOrder = new Order({
      clerkUserId: userId,
      items,
      totalAmount,
      shippingAddress,
      status: 'ordered'
    });

    for (const item of items) {
      await Product.findByIdAndUpdate(
        item.productId,
        { $inc: { quantity: -item.quantity } }
      );
    }

    const savedOrder = await newOrder.save();
    res.status(201).json(savedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error creating order', error: error.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { status } = req.body;
    const validStatuses = ['ordered', 'processing', 'shipped', 'delivered', 'cancelled', 'finished'];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const updatedOrder = await Order.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedOrder) {
      return res.status(404).json({ message: 'Order not found' });
    }
    res.json(updatedOrder);
  } catch (error) {
    res.status(400).json({ message: 'Error updating order', error: error.message });
  }
});

module.exports = router;