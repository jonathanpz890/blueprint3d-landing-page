"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const management_controller_1 = require("../controllers/management.controller");
const imageUpload_middleware_1 = require("../middleware/imageUpload.middleware");
const router = (0, express_1.Router)();
// Public endpoints
router.post('/auth/login', management_controller_1.loginAdminController);
router.post('/orders', management_controller_1.addOrderController); // Public order creation from quote page
router.get('/filaments', management_controller_1.getFilamentsController); // Public query of active stock filaments
router.get('/gallery', management_controller_1.getGalleryController); // Public query of gallery items
router.post('/modeling-requests', management_controller_1.addModelingRequestController); // Public modeling request submission
// Login protected administration endpoints
router.post('/upload/image', management_controller_1.checkAuth, imageUpload_middleware_1.imageUpload.single('file'), management_controller_1.uploadImageController);
router.get('/orders', management_controller_1.checkAuth, management_controller_1.getOrdersController);
router.put('/orders/:id/status', management_controller_1.checkAuth, management_controller_1.updateOrderStatusController);
router.post('/filaments', management_controller_1.checkAuth, management_controller_1.addFilamentController);
router.put('/filaments/:id', management_controller_1.checkAuth, management_controller_1.updateFilamentController);
router.delete('/filaments/:id', management_controller_1.checkAuth, management_controller_1.deleteFilamentController);
router.post('/gallery', management_controller_1.checkAuth, management_controller_1.addGalleryItemController);
router.put('/gallery/:id', management_controller_1.checkAuth, management_controller_1.updateGalleryItemController);
router.delete('/gallery/:id', management_controller_1.checkAuth, management_controller_1.deleteGalleryItemController);
router.get('/modeling-requests', management_controller_1.checkAuth, management_controller_1.getModelingRequestsController);
router.put('/modeling-requests/:id/status', management_controller_1.checkAuth, management_controller_1.updateModelingRequestStatusController);
exports.default = router;
