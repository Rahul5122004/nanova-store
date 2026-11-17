import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const uploadRoot = path.join(__dirname, '../../uploads');

// Ensure upload folders exist
['products', 'qr', 'payments', 'expenses', 'gallery'].forEach((dir) => {
  const fullPath = path.join(uploadRoot, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
  }
});

function getStorage(subFolder) {
  return multer.diskStorage({
    destination: (req, file, cb) => {
      const dest = path.join(uploadRoot, subFolder);
      cb(null, dest);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname).toLowerCase();
      cb(null, `${subFolder}-${uniqueSuffix}${ext}`);
    }
  });
}

function fileFilter(req, file, cb) {
  const allowedExtensions = ['.png', '.jpg', '.jpeg', '.webp', '.svg'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files (.png, .jpg, .jpeg, .webp, .svg) are allowed.'));
  }
}

export const uploadProductImages = multer({
  storage: getStorage('products'),
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
  fileFilter
});

export const uploadQrCode = multer({
  storage: getStorage('qr'),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter
});

export const uploadPaymentProof = multer({
  storage: getStorage('payments'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter
});

export const uploadExpenseReceipt = multer({
  storage: getStorage('expenses'),
  limits: { fileSize: 8 * 1024 * 1024 },
  fileFilter
});

export const uploadGalleryImage = multer({
  storage: getStorage('gallery'),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter
});
