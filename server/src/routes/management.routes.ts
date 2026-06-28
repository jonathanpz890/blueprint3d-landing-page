import { Router } from 'express';
import {
  checkAuth,
  loginAdminController,
  getOrdersController,
  addOrderController,
  updateOrderStatusController,
  getFilamentsController,
  updateFilamentController,
  addFilamentController,
  deleteFilamentController,
  getGalleryController,
  addGalleryItemController,
  updateGalleryItemController,
  deleteGalleryItemController,
  uploadImageController,
  getModelingRequestsController,
  addModelingRequestController,
  updateModelingRequestStatusController,
  trackEventController,
  getAnalyticsController
} from '../controllers/management.controller';
import { imageUpload } from '../middleware/imageUpload.middleware';

const router = Router();

// Public endpoints
router.post('/auth/login', loginAdminController);
router.post('/orders', addOrderController);          // Public order creation from quote page
router.get('/filaments', getFilamentsController);     // Public query of active stock filaments
router.get('/gallery', getGalleryController);         // Public query of gallery items
router.post('/modeling-requests', addModelingRequestController); // Public modeling request submission

// Login protected administration endpoints
router.post('/upload/image', checkAuth, imageUpload.single('file'), uploadImageController);
router.get('/orders', checkAuth, getOrdersController);
router.put('/orders/:id/status', checkAuth, updateOrderStatusController);
router.post('/filaments', checkAuth, addFilamentController);
router.put('/filaments/:id', checkAuth, updateFilamentController);
router.delete('/filaments/:id', checkAuth, deleteFilamentController);
router.post('/gallery', checkAuth, addGalleryItemController);
router.put('/gallery/:id', checkAuth, updateGalleryItemController);
router.delete('/gallery/:id', checkAuth, deleteGalleryItemController);
router.get('/modeling-requests', checkAuth, getModelingRequestsController);
router.put('/modeling-requests/:id/status', checkAuth, updateModelingRequestStatusController);

// Analytics endpoints
router.post('/analytics/event', trackEventController);            // Public — client-side tracking
router.get('/analytics', checkAuth, getAnalyticsController);      // Protected — management dashboard

export default router;
