import { Request, Response } from 'express';
import { DBService } from '../services/db.service';

const AUTH_TOKEN = 'secret-admin-session-token-987654321';

// Authentication middleware check helper
export const checkAuth = (req: Request, res: Response, next: () => void): void => {
  const authHeader = req.headers.authorization;
  if (!authHeader || authHeader !== `Bearer ${AUTH_TOKEN}`) {
    res.status(401).json({ error: 'Unauthorized admin access' });
    return;
  }
  next();
};

export const loginAdminController = async (req: Request, res: Response): Promise<void> => {
  const { username, password } = req.body;
  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPass = process.env.ADMIN_PASS || 'admin3d';

  if (username === adminUser && password === adminPass) {
    res.status(200).json({
      success: true,
      token: AUTH_TOKEN
    });
  } else {
    res.status(401).json({
      success: false,
      error: 'Invalid administrator credentials'
    });
  }
};

// Orders controllers
export const getOrdersController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const orders = await DBService.getOrders();
    res.status(200).json({ success: true, data: orders });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch orders', message: error.message });
  }
};

export const addOrderController = async (req: Request, res: Response): Promise<void> => {
  const { customer, models, subtotal, vatAmount, totalWithVat, thingiverseUrl, thingiverseName } = req.body;

  if (!customer || !customer.name || !customer.email || !models || !Array.isArray(models) || models.length === 0) {
    res.status(400).json({ error: 'Invalid order request payload' });
    return;
  }

  try {
    const newOrder = await DBService.addOrder({
      customer,
      models,
      subtotal: Number(subtotal),
      vatAmount: Number(vatAmount),
      totalWithVat: Number(totalWithVat),
      thingiverseUrl: thingiverseUrl || '',
      thingiverseName: thingiverseName || ''
    } as any);
    res.status(201).json({ success: true, data: newOrder });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save order', message: error.message });
  }
};

export const updateOrderStatusController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;

  const validStatuses = ['pending', 'slicing', 'printing', 'completed', 'shipped'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status: must be one of ${validStatuses.join(', ')}` });
    return;
  }

  try {
    const updated = await DBService.updateOrderStatus(id, status as any);
    if (!updated) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update order status', message: error.message });
  }
};

// Filaments controllers
export const getFilamentsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const filaments = await DBService.getFilaments();
    res.status(200).json({ success: true, data: filaments });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch filaments', message: error.message });
  }
};

export const updateFilamentController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { material, nameEn, nameHe, hex, stock, active, isDefault } = req.body;

  if (material !== undefined) {
    if (!Array.isArray(material) || material.length === 0) {
      res.status(400).json({ error: 'Material must be a non-empty array of strings' });
      return;
    }
    const validMaterials = ['PLA', 'PETG', 'TPU'];
    if (material.some((m: any) => !validMaterials.includes(m))) {
      res.status(400).json({ error: 'Invalid material type. Supported values are PLA, PETG, TPU' });
      return;
    }
  }

  try {
    const updated = await DBService.updateFilament(id, {
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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update filament', message: error.message });
  }
};

export const addFilamentController = async (req: Request, res: Response): Promise<void> => {
  const { material, nameEn, nameHe, hex, stock, active, isDefault } = req.body;

  if (!material || !Array.isArray(material) || material.length === 0 || !nameEn || !nameHe || !hex) {
    res.status(400).json({ error: 'Material array, English name, Hebrew name, and Hex color are required' });
    return;
  }

  const validMaterials = ['PLA', 'PETG', 'TPU'];
  if (material.some((m: any) => !validMaterials.includes(m))) {
    res.status(400).json({ error: 'Invalid material type. Supported values are PLA, PETG, TPU' });
    return;
  }

  try {
    const newFilament = await DBService.addFilament({
      material,
      nameEn,
      nameHe,
      hex,
      stock: stock !== undefined ? Boolean(stock) : true,
      active: active !== undefined ? Boolean(active) : true,
      isDefault: isDefault !== undefined ? Boolean(isDefault) : false
    });
    res.status(201).json({ success: true, data: newFilament });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add filament color', message: error.message });
  }
};

export const deleteFilamentController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const success = await DBService.deleteFilament(id);
    if (!success) {
      res.status(404).json({ error: 'Filament color not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Filament color deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete filament color', message: error.message });
  }
};

// Gallery controllers
export const getGalleryController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const gallery = await DBService.getGallery();
    res.status(200).json({ success: true, data: gallery });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch showcase items', message: error.message });
  }
};

export const addGalleryItemController = async (req: Request, res: Response): Promise<void> => {
  const { titleEn, titleHe, descEn, descHe, material, layerHeight, infill, weight, time, imageUrl, category } = req.body;

  if (!titleEn || !titleHe || !category) {
    res.status(400).json({ error: 'Title and category are required' });
    return;
  }

  try {
    const newItem = await DBService.addGalleryItem({
      titleEn, titleHe, descEn, descHe, material, layerHeight, infill, weight, time, imageUrl, category
    });
    res.status(201).json({ success: true, data: newItem });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to add showcase item', message: error.message });
  }
};

export const updateGalleryItemController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { titleEn, titleHe, descEn, descHe, material, layerHeight, infill, weight, time, imageUrl, category } = req.body;

  try {
    const updated = await DBService.updateGalleryItem(id, {
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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update showcase item', message: error.message });
  }
};

export const deleteGalleryItemController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  try {
    const success = await DBService.deleteGalleryItem(id);
    if (!success) {
      res.status(404).json({ error: 'Showcase item not found' });
      return;
    }
    res.status(200).json({ success: true, message: 'Showcase item deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to delete showcase item', message: error.message });
  }
};

export const uploadImageController = async (req: Request, res: Response): Promise<void> => {
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
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to upload image', message: error.message });
  }
};

// ======================= Modeling Requests =======================

export const getModelingRequestsController = async (_req: Request, res: Response): Promise<void> => {
  try {
    const requests = await DBService.getModelingRequests();
    res.status(200).json({ success: true, data: requests });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch modeling requests', message: error.message });
  }
};

export const addModelingRequestController = async (req: Request, res: Response): Promise<void> => {
  const { name, email, phone, projectName, description, dimensions, notes } = req.body;
  if (!name || !email || !projectName || !description) {
    res.status(400).json({ error: 'Missing required fields: name, email, projectName, description' });
    return;
  }
  try {
    const newRequest = await DBService.addModelingRequest({ name, email, phone: phone || '', projectName, description, dimensions: dimensions || '', notes: notes || '' });
    res.status(201).json({ success: true, data: newRequest });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save modeling request', message: error.message });
  }
};

export const updateModelingRequestStatusController = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { status } = req.body;
  const validStatuses = ['new', 'reviewing', 'quoted', 'in_progress', 'completed'];
  if (!validStatuses.includes(status)) {
    res.status(400).json({ error: `Invalid status: must be one of ${validStatuses.join(', ')}` });
    return;
  }
  try {
    const updated = await DBService.updateModelingRequestStatus(id, status as any);
    if (!updated) {
      res.status(404).json({ error: 'Modeling request not found' });
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to update modeling request status', message: error.message });
  }
};

// ======================= Analytics =======================

export const trackEventController = async (req: Request, res: Response): Promise<void> => {
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
    await DBService.trackEvent({ eventType, sessionId, page: page || '', language: language || 'en', payload: payload || {} });
    res.status(200).json({ success: true });
  } catch (error: any) {
    // Silently succeed on analytics errors — don't break the client
    res.status(200).json({ success: false, warning: 'Event not stored' });
  }
};

export const getAnalyticsController = async (req: Request, res: Response): Promise<void> => {
  const days = parseInt(req.query.days as string) || 30;
  try {
    const summary = await DBService.getAnalyticsSummary(days);
    res.status(200).json({ success: true, data: summary });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to fetch analytics', message: error.message });
  }
};
