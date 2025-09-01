// controllers/orderController.js
const Order = require('../models/Order');
const Product = require('../models/Product');

exports.updateOrderStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Pending', 'Shipped', 'Delivered', 'Cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ error: 'Invalid status' });
        }
        const updatedOrder = await Order.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        if (!updatedOrder) {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.json(updatedOrder);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update order status' });
    }
};


exports.createOrder = async (req, res) => {
  try {
    const session = await mongoose.startSession();
    session.startTransaction();
    
    try {
      const { items, totalPrice } = req.body;
      const userId = req.user.id;

      // Check stock and reserve products
      for (const item of items) {
        const product = await Product.findById(item.productId).session(session);
        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for ${product.name}`);
        }
        product.stock -= item.quantity;
        await product.save({ session });
      }

      const newOrder = new Order({
        userId,
        items,
        totalPrice,
      });

      await newOrder.save({ session });
      await session.commitTransaction();
      
      res.status(201).json({ message: 'Order created successfully', order: newOrder });
    } catch (err) {
      await session.abortTransaction();
      throw err;
    } finally {
      session.endSession();
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
