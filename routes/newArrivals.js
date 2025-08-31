const express = require('express');
const router = express.Router();
const NewArrival = require('../models/NewArrival');
const Product = require('../models/Product');
const { requireAdmin } = require('../middleware/auth');

router.get('/', async (req, res) => {
  try {
    const newArrivals = await NewArrival.find({ isActive: true })
      .populate('product', 'name price image category')
      .sort({ position: 1, createdAt: -1 })
      .limit(10);
    res.json(newArrivals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching new arrivals', error: error.message });
  }
});


router.get('/all', requireAdmin, async (req, res) => {
  try {
    const newArrivals = await NewArrival.find()
      .populate('product', 'name price image category')
      .sort({ position: 1, createdAt: -1 });

    res.json(newArrivals);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching new arrivals', error: error.message });
  }
});


router.post('/', requireAdmin, async (req, res) => {
  try {
    const { productId, title, subtitle, price, image, position, featured } = req.body;
    const product = await Product.findById(productId);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    const existingArrival = await NewArrival.findOne({ product: productId });
    if (existingArrival) {
      return res.status(400).json({ message: 'Product is already in new arrivals' });
    }

    const newArrival = new NewArrival({
      product: productId,
      title: title || product.name,
      subtitle: subtitle || `From $${product.price}`,
      price: price || `From $${product.price}`,
      image: image || product.image,
      position: position || 0,
      featured: featured || false
    });

    const savedArrival = await newArrival.save();
    await savedArrival.populate('product', 'name price image category');

    res.status(201).json(savedArrival);
  } catch (error) {
    res.status(400).json({ message: 'Error creating new arrival', error: error.message });
  }
});

router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { title, subtitle, price, image, position, isActive, featured } = req.body;

    const updatedArrival = await NewArrival.findByIdAndUpdate(
      req.params.id,
      {
        ...(title && { title }),
        ...(subtitle && { subtitle }),
        ...(price && { price }),
        ...(image && { image }),
        ...(position !== undefined && { position }),
        ...(isActive !== undefined && { isActive }),
        ...(featured !== undefined && { featured })
      },
      { new: true, runValidators: true }
    ).populate('product', 'name price image category');

    if (!updatedArrival) {
      return res.status(404).json({ message: 'New arrival not found' });
    }

    res.json(updatedArrival);
  } catch (error) {
    res.status(400).json({ message: 'Error updating new arrival', error: error.message });
  }
});

router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const deletedArrival = await NewArrival.findByIdAndDelete(req.params.id);

    if (!deletedArrival) {
      return res.status(404).json({ message: 'New arrival not found' });
    }

    res.json({ message: 'New arrival deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting new arrival', error: error.message });
  }
});

router.patch('/:id/toggle', requireAdmin, async (req, res) => {
  try {
    const newArrival = await NewArrival.findById(req.params.id);

    if (!newArrival) {
      return res.status(404).json({ message: 'New arrival not found' });
    }

    newArrival.isActive = !newArrival.isActive;
    const updatedArrival = await newArrival.save();
    await updatedArrival.populate('product', 'name price image category');

    res.json(updatedArrival);
  } catch (error) {
    res.status(400).json({ message: 'Error toggling new arrival', error: error.message });
  }
});

module.exports = router;