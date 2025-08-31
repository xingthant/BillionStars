const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  name: { type: String, required: true },
  image: { type: String, required: true },
  price: { type: Number, required: true },
  quantity: { type: Number, required: true },
});

const addressSchema = new mongoose.Schema({
  city: { type: String, required: true },
  street: { type: String, required: true },
  building: { type: String, required: true },
  contactPhoneNumber: { type: String, required: true },
});

const orderSchema = new mongoose.Schema({
  clerkUserId: { type: String, required: true },
  items: [orderItemSchema],
  totalAmount: { type: Number, required: true },
  shippingAddress: addressSchema,
  status: {
    type: String,
    required: true,
    enum: ['ordered', 'processing', 'shipped', 'delivered', 'cancelled', 'finished'], 
    default: 'ordered'
  },
}, { timestamps: true }); 

module.exports = mongoose.model('Order', orderSchema);