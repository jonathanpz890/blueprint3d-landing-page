import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Ensure standard temporary uploads directory exists
const uploadDir = path.join(__dirname, '../../temp/uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    // Append .stl extension to ensure slicer reads it correctly
    cb(null, `${uniqueSuffix}-${file.originalname}`);
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 100 * 1024 * 1024 // Allow up to 100MB models
  },
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (ext !== '.stl') {
      return cb(new Error('Only STL files are allowed.'));
    }
    cb(null, true);
  }
});
