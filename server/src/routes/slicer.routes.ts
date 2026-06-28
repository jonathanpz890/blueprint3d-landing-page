import { Router } from 'express';
import { sliceModelController } from '../controllers/slicer.controller';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// Route to slice an STL file
// Expects multipart/form-data with key 'file' containing the STL,
// and optional fields 'material', 'infill', and 'layerHeight'
router.post('/slice', upload.single('file'), sliceModelController);

export default router;
