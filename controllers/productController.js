const Product = require('../models/Product');
const cloudinary = require('../config/cloudinary');

// Create a new product
exports.createProduct = async (req, res) => {
    try {
        const { name, description, price, stock, images, category } = req.body;

        // Upload images to Cloudinary if provided
        const uploadedImages = [];
        if (images && images.length > 0) {
            for (let i = 0; i < images.length; i++) {
                const uploadedImage = await cloudinary.uploader.upload(images[i], {
                    folder: 'e-commerce/products',
                    resource_type: 'image'
                });
                uploadedImages.push(uploadedImage.secure_url);
            }
        }

        const newProduct = new Product({
            name,
            description,
            price,
            stock,
            images: uploadedImages,  // Save Cloudinary URLs
            category
        });

        await newProduct.save();
        res.status(201).json(newProduct);
    } catch (err) {
        console.error('Error creating product:', err);
        res.status(500).json({ error: 'Failed to create product' });
    }
};

// Update a product by ID
exports.updateProduct = async (req, res) => {
    try {
        const productId = req.params.id;
        const updatedData = req.body;

        // If images are provided, upload them to Cloudinary
        if (updatedData.images && updatedData.images.length > 0) {
            const uploadedImages = [];
            for (let i = 0; i < updatedData.images.length; i++) {
                const uploadedImage = await cloudinary.uploader.upload(updatedData.images[i], {
                    folder: 'e-commerce/products',
                    resource_type: 'image'
                });
                uploadedImages.push(uploadedImage.secure_url);
            }
            updatedData.images = uploadedImages;
        }

        const updatedProduct = await Product.findByIdAndUpdate(productId, updatedData, { new: true });

        if (!updatedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }

        res.json(updatedProduct);
    } catch (err) {
        console.error('Error updating product:', err);
        res.status(500).json({ error: 'Failed to update product' });
    }
};


// Delete a product
exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);
    if (!deletedProduct) {
      return res.status(404).json({ message: 'Product not found' });
    }

    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to delete product' });
  }
};

// Get all products
exports.getAllProducts = async (req, res) => {
  try {
    const { category, search, sort } = req.query;

    let filter = {};
    if (category) {
      filter.category = category;
    }
    if (search) {
      filter.$text = { $search: search }; // Assuming we have a text index on the 'name' field in Product schema
    }

    let products = Product.find(filter);

    if (sort) {
      products = products.sort(sort); // Example: 'price' or '-price' for ascending/descending
    }

    const result = await products.exec();
    res.json(result);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch products' });
  }
};

// Get product by ID
exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to fetch product' });
  }
};