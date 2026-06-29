"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAnalyticsController = exports.trackEventController = exports.updateModelingRequestStatusController = exports.addModelingRequestController = exports.getModelingRequestsController = exports.uploadImageController = exports.deleteGalleryItemController = exports.updateGalleryItemController = exports.addGalleryItemController = exports.getGalleryController = exports.deleteFilamentController = exports.addFilamentController = exports.updateFilamentController = exports.getFilamentsController = exports.updateOrderStatusController = exports.addOrderController = exports.getOrdersController = exports.loginAdminController = exports.checkAuth = void 0;
const db_service_1 = require("../services/db.service");
const AUTH_TOKEN = 'secret-admin-session-token-987654321';
// Authentication middleware check helper
const checkAuth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
        res.status(401).json({ error: 'Unauthorized admin access' });
        return;
    }
    next();
};
exports.checkAuth = checkAuth;
const loginAdminController = async (req, res) => {
    const { username, password } = req.body;
    const adminUser = process.env.ADMIN_USER || 'admin';
    const adminPass = process.env.ADMIN_PASS || 'admin3d';
    if (username === adminUser && password === adminPass) {
        res.status(200).json({
            success: true,
            token: AUTH_TOKEN
        });
    }
    else {
        res.status(401).json({
            success: false,
            error: 'Invalid administrator credentials'
        });
    }
};
exports.loginAdminController = loginAdminController;
// Orders controllers
const getOrdersController = async (_req, res) => {
    try {
        const orders = await db_service_1.DBService.getOrders();
        res.status(200).json({ success: true, data: orders });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
    }
};
exports.getOrdersController = getOrdersController;
const addOrderController = async (req, res) => {
    const { customer, models, subtotal, vatAmount, totalWithVat, thingiverseUrl, thingiverseName } = req.body;
    if (!customer || !customer.name || !customer.email || !models || !Array.isArray(models) || models.length === 0) {
        res.status(400).json({ error: 'Invalid order request payload' });
        return;
    }
    try {
        const newOrder = await db_service_1.DBService.addOrder({
            customer,
            models,
            subtotal: Number(subtotal),
            vatAmount: Number(vatAmount),
            totalWithVat: Number(totalWithVat),
            thingiverseUrl: thingiverseUrl || '',
            thingiverseName: thingiverseName || ''
        });
        res.status(201).json({ success: true, data: newOrder });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save order', message: error.message });
    }
};
exports.addOrderController = addOrderController;
const updateOrderStatusController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['pending', 'slicing', 'printing', 'completed', 'shipped'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ error: `Invalid status: must be one of ${validStatuses.join(', ')}` });
        return;
    }
    try {
        const updated = await db_service_1.DBService.updateOrderStatus(id, status);
        if (!updated) {
            res.status(404).json({ error: 'Order not found' });
            return;
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update order status', message: error.message });
    }
};
exports.updateOrderStatusController = updateOrderStatusController;
// Filaments controllers
const getFilamentsController = async (_req, res) => {
    try {
        const filaments = await db_service_1.DBService.getFilaments();
        res.status(200).json({ success: true, data: filaments });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch filaments', message: error.message });
    }
};
exports.getFilamentsController = getFilamentsController;
const updateFilamentController = async (req, res) => {
    const { id } = req.params;
    const { material, nameEn, nameHe, hex, stock, active, isDefault } = req.body;
    if (material !== undefined) {
        if (!Array.isArray(material) || material.length === 0) {
            res.status(400).json({ error: 'Material must be a non-empty array of strings' });
            return;
        }
        const validMaterials = ['PLA', 'PETG', 'TPU'];
        if (material.some((m) => !validMaterials.includes(m))) {
            res.status(400).json({ error: 'Invalid material type. Supported values are PLA, PETG, TPU' });
            return;
        }
    }
    try {
        const updated = await db_service_1.DBService.updateFilament(id, {
            ...(material !== undefined && { material }),
            ...(nameEn !== undefined && { nameEn }),
            ...(nameHe !== undefined && { nameHe }),
            ...(hex !== undefined && { hex }),
            ...(stock !== undefined && { stock: Boolean(stock) }),
            ...(active !== undefined && { active: Boolean(active) }),
            ...(isDefault !== undefined && { isDefault: Boolean(isDefault) })
        });
        if (!updated) {
            res.status(404).json({ error: 'Filament color not found' });
            return;
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update filament', message: error.message });
    }
};
exports.updateFilamentController = updateFilamentController;
const addFilamentController = async (req, res) => {
    const { material, nameEn, nameHe, hex, stock, active, isDefault } = req.body;
    if (!material || !Array.isArray(material) || material.length === 0 || !nameEn || !nameHe || !hex) {
        res.status(400).json({ error: 'Material array, English name, Hebrew name, and Hex color are required' });
        return;
    }
    const validMaterials = ['PLA', 'PETG', 'TPU'];
    if (material.some((m) => !validMaterials.includes(m))) {
        res.status(400).json({ error: 'Invalid material type. Supported values are PLA, PETG, TPU' });
        return;
    }
    try {
        const newFilament = await db_service_1.DBService.addFilament({
            material,
            nameEn,
            nameHe,
            hex,
            stock: stock !== undefined ? Boolean(stock) : true,
            active: active !== undefined ? Boolean(active) : true,
            isDefault: isDefault !== undefined ? Boolean(isDefault) : false
        });
        res.status(201).json({ success: true, data: newFilament });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add filament color', message: error.message });
    }
};
exports.addFilamentController = addFilamentController;
const deleteFilamentController = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await db_service_1.DBService.deleteFilament(id);
        if (!success) {
            res.status(404).json({ error: 'Filament color not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Filament color deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete filament color', message: error.message });
    }
};
exports.deleteFilamentController = deleteFilamentController;
// Gallery controllers
const getGalleryController = async (_req, res) => {
    try {
        const gallery = await db_service_1.DBService.getGallery();
        res.status(200).json({ success: true, data: gallery });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch showcase items', message: error.message });
    }
};
exports.getGalleryController = getGalleryController;
const addGalleryItemController = async (req, res) => {
    const { titleEn, titleHe, descEn, descHe, material, layerHeight, infill, weight, time, imageUrl, category } = req.body;
    if (!titleEn || !titleHe || !category) {
        res.status(400).json({ error: 'Title and category are required' });
        return;
    }
    try {
        const newItem = await db_service_1.DBService.addGalleryItem({
            titleEn, titleHe, descEn, descHe, material, layerHeight, infill, weight, time, imageUrl, category
        });
        res.status(201).json({ success: true, data: newItem });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to add showcase item', message: error.message });
    }
};
exports.addGalleryItemController = addGalleryItemController;
const updateGalleryItemController = async (req, res) => {
    const { id } = req.params;
    const { titleEn, titleHe, descEn, descHe, material, layerHeight, infill, weight, time, imageUrl, category } = req.body;
    try {
        const updated = await db_service_1.DBService.updateGalleryItem(id, {
            ...(titleEn !== undefined && { titleEn }),
            ...(titleHe !== undefined && { titleHe }),
            ...(descEn !== undefined && { descEn }),
            ...(descHe !== undefined && { descHe }),
            ...(material !== undefined && { material }),
            ...(layerHeight !== undefined && { layerHeight }),
            ...(infill !== undefined && { infill }),
            ...(weight !== undefined && { weight }),
            ...(time !== undefined && { time }),
            ...(imageUrl !== undefined && { imageUrl }),
            ...(category !== undefined && { category })
        });
        if (!updated) {
            res.status(404).json({ error: 'Showcase item not found' });
            return;
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update showcase item', message: error.message });
    }
};
exports.updateGalleryItemController = updateGalleryItemController;
const deleteGalleryItemController = async (req, res) => {
    const { id } = req.params;
    try {
        const success = await db_service_1.DBService.deleteGalleryItem(id);
        if (!success) {
            res.status(404).json({ error: 'Showcase item not found' });
            return;
        }
        res.status(200).json({ success: true, message: 'Showcase item deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to delete showcase item', message: error.message });
    }
};
exports.deleteGalleryItemController = deleteGalleryItemController;
const uploadImageController = async (req, res) => {
    try {
        if (!req.file) {
            res.status(400).json({ error: 'No image file provided' });
            return;
        }
        // Construct public URL
        const fileUrl = `http://localhost:5001/uploads/${req.file.filename}`;
        res.status(200).json({
            success: true,
            url: fileUrl
        });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to upload image', message: error.message });
    }
};
exports.uploadImageController = uploadImageController;
// ======================= Modeling Requests =======================
const getModelingRequestsController = async (_req, res) => {
    try {
        const requests = await db_service_1.DBService.getModelingRequests();
        res.status(200).json({ success: true, data: requests });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch modeling requests', message: error.message });
    }
};
exports.getModelingRequestsController = getModelingRequestsController;
const addModelingRequestController = async (req, res) => {
    const { name, email, phone, projectName, description, dimensions, notes } = req.body;
    if (!name || !email || !projectName || !description) {
        res.status(400).json({ error: 'Missing required fields: name, email, projectName, description' });
        return;
    }
    try {
        const newRequest = await db_service_1.DBService.addModelingRequest({ name, email, phone: phone || '', projectName, description, dimensions: dimensions || '', notes: notes || '' });
        res.status(201).json({ success: true, data: newRequest });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to save modeling request', message: error.message });
    }
};
exports.addModelingRequestController = addModelingRequestController;
const updateModelingRequestStatusController = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;
    const validStatuses = ['new', 'reviewing', 'quoted', 'in_progress', 'completed'];
    if (!validStatuses.includes(status)) {
        res.status(400).json({ error: `Invalid status: must be one of ${validStatuses.join(', ')}` });
        return;
    }
    try {
        const updated = await db_service_1.DBService.updateModelingRequestStatus(id, status);
        if (!updated) {
            res.status(404).json({ error: 'Modeling request not found' });
            return;
        }
        res.status(200).json({ success: true, data: updated });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to update modeling request status', message: error.message });
    }
};
exports.updateModelingRequestStatusController = updateModelingRequestStatusController;
// ======================= Analytics =======================
const trackEventController = async (req, res) => {
    const { eventType, sessionId, page, language, payload } = req.body;
    const validTypes = [
        'page_view', 'quote_started', 'quote_priced', 'quote_abandoned',
        'quote_ordered', 'explore_model_opened', 'modeling_request_submitted', 'contact_form_submitted'
    ];
    if (!eventType || !validTypes.includes(eventType) || !sessionId) {
        res.status(400).json({ error: 'Invalid analytics event payload' });
        return;
    }
    try {
        await db_service_1.DBService.trackEvent({ eventType, sessionId, page: page || '', language: language || 'en', payload: payload || {} });
        res.status(200).json({ success: true });
    }
    catch (error) {
        // Silently succeed on analytics errors — don't break the client
        res.status(200).json({ success: false, warning: 'Event not stored' });
    }
};
exports.trackEventController = trackEventController;
const getAnalyticsController = async (req, res) => {
    const days = parseInt(req.query.days) || 30;
    try {
        const summary = await db_service_1.DBService.getAnalyticsSummary(days);
        res.status(200).json({ success: true, data: summary });
    }
    catch (error) {
        res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
    }
};
exports.getAnalyticsController = getAnalyticsController;
