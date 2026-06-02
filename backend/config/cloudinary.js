const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Storage for post images
const imageStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rabbit/posts',
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
    transformation: [{ width: 1200, crop: 'limit' }],
  },
});

// Storage for study materials (PDFs, docs)
const documentStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'rabbit/study-materials',
    allowed_formats: ['pdf', 'doc', 'docx', 'ppt', 'pptx'],
    resource_type: 'raw',
  },
});

const uploadImage = multer({ storage: imageStorage });
const uploadDocument = multer({ storage: documentStorage });

module.exports = { cloudinary, uploadImage, uploadDocument };
