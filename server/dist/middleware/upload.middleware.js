"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upload = void 0;
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Ensure standard temporary uploads directory exists
const uploadDir = path_1.default.join(__dirname, '../../temp/uploads');
if (!fs_1.default.existsSync(uploadDir)) {
    fs_1.default.mkdirSync(uploadDir, { recursive: true });
}
const storage = multer_1.default.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, uploadDir);
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        // Append .stl extension to ensure slicer reads it correctly
        cb(null, `${uniqueSuffix}-${file.originalname}`);
    }
});
exports.upload = (0, multer_1.default)({
    storage,
    limits: {
        fileSize: 100 * 1024 * 1024 // Allow up to 100MB models
    },
    fileFilter: (_req, file, cb) => {
        const ext = path_1.default.extname(file.originalname).toLowerCase();
        if (ext !== '.stl') {
            return cb(new Error('Only STL files are allowed.'));
        }
        cb(null, true);
    }
});
