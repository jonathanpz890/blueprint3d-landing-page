"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sliceModelController = void 0;
const slicer_service_1 = require("../services/slicer.service");
const fs_1 = __importDefault(require("fs"));
const slicerService = new slicer_service_1.SlicerService();
const sliceModelController = async (req, res) => {
    const file = req.file;
    if (!file) {
        res.status(400).json({ error: 'No STL file uploaded' });
        return;
    }
    const { material = 'PLA', infill = '20', layerHeight = '0.20' } = req.body;
    // Parse parameters
    const parsedInfill = parseInt(infill, 10);
    const parsedLayerHeight = parseFloat(layerHeight);
    // Validate inputs
    if (isNaN(parsedInfill) || parsedInfill < 10 || parsedInfill > 100) {
        // Delete file before returning error
        if (fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        res.status(400).json({ error: 'Infill must be a number between 10 and 100' });
        return;
    }
    const validLayerHeights = [0.12, 0.20, 0.28];
    if (isNaN(parsedLayerHeight) || !validLayerHeights.includes(parsedLayerHeight)) {
        // Delete file before returning error
        if (fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        res.status(400).json({ error: 'Layer height must be one of: 0.12, 0.20, 0.28' });
        return;
    }
    const validMaterials = ['PLA', 'PETG', 'TPU'];
    if (!validMaterials.includes(material.toUpperCase())) {
        // Delete file before returning error
        if (fs_1.default.existsSync(file.path))
            fs_1.default.unlinkSync(file.path);
        res.status(400).json({ error: 'Material must be one of: PLA, PETG, TPU' });
        return;
    }
    try {
        console.log(`[SlicerController] Slicing requested for file: ${file.originalname}`);
        console.log(`[SlicerController] Configs: material=${material}, infill=${parsedInfill}%, layerHeight=${parsedLayerHeight}mm`);
        const result = await slicerService.sliceModel(file.path, material.toUpperCase(), parsedInfill, parsedLayerHeight);
        res.status(200).json({
            success: true,
            data: result
        });
    }
    catch (error) {
        console.error('[SlicerController] Slicing error:', error);
        // Ensure file gets deleted if service threw error before cleanup
        if (fs_1.default.existsSync(file.path)) {
            try {
                fs_1.default.unlinkSync(file.path);
            }
            catch (err) {
                // ignore
            }
        }
        if (error.message === 'MODEL_TOO_LARGE') {
            res.status(400).json({
                error: 'Model Too Large',
                message: 'The model is too large to fit on the Bambu Lab P1S build volume (256mm x 256mm x 256mm). Please scale it down or split it.'
            });
            return;
        }
        if (error.message === 'INVALID_STL_FILE') {
            res.status(400).json({
                error: 'Invalid STL File',
                message: 'The STL file appears to be empty or corrupted and could not be parsed.'
            });
            return;
        }
        res.status(500).json({
            error: 'Slicing engine failure',
            message: error.message || 'Slicing execution failed'
        });
    }
};
exports.sliceModelController = sliceModelController;
