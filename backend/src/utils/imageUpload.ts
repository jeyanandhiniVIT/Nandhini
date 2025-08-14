import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Set up Cloudinary storage
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'profile_pictures', // Folder name in Cloudinary
    allowed_formats: ['jpg', 'png', 'jpeg'], // Allowed formats
  } as { folder: string; allowed_formats: string[] },
});

// Initialize multer with Cloudinary storage
const upload = multer({ storage: storage });

// Set up local storage for logo
const logoStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'assets/');
  },
  filename: function (req, file, cb) {
    cb(null, 'logo.png');
  },
});

const uploadLogoLocal = multer({ storage: logoStorage });

// Utility function for handling image uploads
export const uploadImage = upload.single('profilePicture');
export const uploadLogoFile = uploadLogoLocal.single('logo');
