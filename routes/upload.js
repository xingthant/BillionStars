const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const cloudinary = require('cloudinary').v2;
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.post('/', requireAuth, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No image file provided' });
    }
    const dataUri = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`;

    const result = await cloudinary.uploader.upload(dataUri, {
      folder: 'cloth-ecommerce', 
    });
    res.json({ imageUrl: result.secure_url });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Image upload failed', error: error.message });
  }
});

module.exports = router;