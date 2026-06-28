"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const slicer_controller_1 = require("../controllers/slicer.controller");
const upload_middleware_1 = require("../middleware/upload.middleware");
const router = (0, express_1.Router)();
// Route to slice an STL file
// Expects multipart/form-data with key 'file' containing the STL,
// and optional fields 'material', 'infill', and 'layerHeight'
router.post('/slice', upload_middleware_1.upload.single('file'), slicer_controller_1.sliceModelController);
exports.default = router;
