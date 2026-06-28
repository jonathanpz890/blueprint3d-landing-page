import mongoose from 'mongoose';
import fs from 'fs';
import path from 'path';
import CustomerModel, { ICustomer } from '../models/Customer';
import FilamentModel from '../models/Filament';
import GalleryItemModel from '../models/GalleryItem';
import OrderModel from '../models/Order';
import ModelingRequestModel from '../models/ModelingRequest';
import AnalyticsEventModel, { AnalyticsEventType } from '../models/AnalyticsEvent';

export interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone?: string;
    comments: string;
  };
  models: {
    name: string;
    size: number;
    material: string;
    color: string;
    infill: number;
    layerHeight: number;
    quantity: number;
    weightg: number;
    timeSeconds: number;
    price: number;
    fileKey?: string;
  }[];
  subtotal: number;
  vatAmount: number;
  totalWithVat: number;
  status: 'pending' | 'slicing' | 'printing' | 'completed' | 'shipped';
  createdAt: string;
  thingiverseUrl?: string;
  thingiverseName?: string;
}

export interface Filament {
  id: string;
  material: ('PLA' | 'PETG' | 'TPU')[];
  nameEn: string;
  nameHe: string;
  hex: string;
  stock: boolean;
  active: boolean;
  isDefault?: boolean;
}

export interface GalleryItem {
  id: string;
  titleEn: string;
  titleHe: string;
  descEn: string;
  descHe: string;
  material: string;
  layerHeight: string;
  infill: string;
  weight: string;
  time: string;
  imageUrl: string;
  category: 'fdm' | 'flexible' | 'mechanical' | 'artistic';
  createdAt: string;
}

export interface ModelingRequest {
  id: string;
  name: string;
  email: string;
  phone?: string;
  projectName: string;
  description: string;
  dimensions: string;
  notes: string;
  status: 'new' | 'reviewing' | 'quoted' | 'in_progress' | 'completed';
  createdAt: string;
}

const DEFAULT_FILAMENTS: Omit<Filament, '_id'>[] = [
  // PLA
  { id: 'pla_black', material: ['PLA'], nameEn: 'Solid Black', nameHe: 'שחור אטום', hex: '#111827', stock: true, active: true },
  { id: 'pla_white', material: ['PLA'], nameEn: 'Snow White', nameHe: 'לבן שלג', hex: '#ffffff', stock: true, active: true },
  { id: 'pla_gray', material: ['PLA'], nameEn: 'Slate Gray', nameHe: 'אפור צפחה', hex: '#64748b', stock: true, active: true },
  { id: 'pla_silver', material: ['PLA'], nameEn: 'Metallic Silver', nameHe: 'כסף מטאלי', hex: '#cbd5e1', stock: true, active: true },
  { id: 'pla_gold', material: ['PLA'], nameEn: 'Silk Gold', nameHe: 'זהב משי', hex: '#eab308', stock: true, active: true },
  { id: 'pla_copper', material: ['PLA'], nameEn: 'Silk Copper', nameHe: 'נחושת משי', hex: '#b45309', stock: true, active: true },
  { id: 'pla_wood', material: ['PLA'], nameEn: 'Wood / Bamboo', nameHe: 'עץ / במבוק', hex: '#c89d7c', stock: true, active: true },
  { id: 'pla_red', material: ['PLA'], nameEn: 'Crimson Red', nameHe: 'אדום קרימזון', hex: '#ef4444', stock: true, active: true },
  { id: 'pla_orange', material: ['PLA'], nameEn: 'Vibrant Orange', nameHe: 'כתום מרהיב', hex: '#f97316', stock: true, active: true },
  { id: 'pla_yellow', material: ['PLA'], nameEn: 'Sun Yellow', nameHe: 'צהוב שמש', hex: '#facc15', stock: true, active: true },
  { id: 'pla_lime', material: ['PLA'], nameEn: 'Lime Green', nameHe: 'ירוק ליים', hex: '#84cc16', stock: true, active: true },
  { id: 'pla_green', material: ['PLA'], nameEn: 'Grass Green', nameHe: 'ירוק דשא', hex: '#22c55e', stock: true, active: true },
  { id: 'pla_army', material: ['PLA'], nameEn: 'Army Green', nameHe: 'ירוק צבא', hex: '#3f6212', stock: true, active: true },
  { id: 'pla_teal', material: ['PLA'], nameEn: 'Teal / Cyan', nameHe: 'טורקיז', hex: '#06b6d4', stock: true, active: true },
  { id: 'pla_blue', material: ['PLA'], nameEn: 'Royal Blue', nameHe: 'כחול רויאל', hex: '#2563eb', stock: true, active: true },
  { id: 'pla_purple', material: ['PLA'], nameEn: 'Lilac Purple', nameHe: 'סגול לילך', hex: '#a78bfa', stock: true, active: true },
  { id: 'pla_pink', material: ['PLA'], nameEn: 'Bubblegum Pink', nameHe: 'ורוד מסטיק', hex: '#f472b6', stock: true, active: true },
  { id: 'pla_brown', material: ['PLA'], nameEn: 'Chocolate Brown', nameHe: 'חום שוקולד', hex: '#78350f', stock: true, active: true },
  
  // PETG
  { id: 'petg_black', material: ['PETG'], nameEn: 'Solid Black', nameHe: 'שחור אטום', hex: '#111827', stock: true, active: true },
  { id: 'petg_white', material: ['PETG'], nameEn: 'Snow White', nameHe: 'לבן שלג', hex: '#ffffff', stock: true, active: true },
  { id: 'petg_gray', material: ['PETG'], nameEn: 'Slate Gray', nameHe: 'אפור צפחה', hex: '#64748b', stock: true, active: true },
  { id: 'petg_silver', material: ['PETG'], nameEn: 'Metallic Silver', nameHe: 'כסף מטאלי', hex: '#cbd5e1', stock: true, active: true },
  { id: 'petg_gold', material: ['PETG'], nameEn: 'Silk Gold', nameHe: 'זהב משי', hex: '#eab308', stock: true, active: true },
  { id: 'petg_copper', material: ['PETG'], nameEn: 'Silk Copper', nameHe: 'נחושת משי', hex: '#b45309', stock: true, active: true },
  { id: 'petg_wood', material: ['PETG'], nameEn: 'Wood / Bamboo', nameHe: 'עץ / במבוק', hex: '#c89d7c', stock: true, active: true },
  { id: 'petg_red', material: ['PETG'], nameEn: 'Crimson Red', nameHe: 'אדום קרימזון', hex: '#ef4444', stock: true, active: true },
  { id: 'petg_orange', material: ['PETG'], nameEn: 'Vibrant Orange', nameHe: 'כתום מרהיב', hex: '#f97316', stock: true, active: true },
  { id: 'petg_yellow', material: ['PETG'], nameEn: 'Sun Yellow', nameHe: 'צהוב שמש', hex: '#facc15', stock: true, active: true },
  { id: 'petg_lime', material: ['PETG'], nameEn: 'Lime Green', nameHe: 'ירוק ליים', hex: '#84cc16', stock: true, active: true },
  { id: 'petg_green', material: ['PETG'], nameEn: 'Grass Green', nameHe: 'ירוק דשא', hex: '#22c55e', stock: true, active: true },
  { id: 'petg_army', material: ['PETG'], nameEn: 'Army Green', nameHe: 'ירוק צבא', hex: '#3f6212', stock: true, active: true },
  { id: 'petg_teal', material: ['PETG'], nameEn: 'Teal / Cyan', nameHe: 'טורקיז', hex: '#06b6d4', stock: true, active: true },
  { id: 'petg_blue', material: ['PETG'], nameEn: 'Royal Blue', nameHe: 'כחול רויאל', hex: '#2563eb', stock: true, active: true },
  { id: 'petg_purple', material: ['PETG'], nameEn: 'Lilac Purple', nameHe: 'סגול לילך', hex: '#a78bfa', stock: true, active: true },
  { id: 'petg_pink', material: ['PETG'], nameEn: 'Bubblegum Pink', nameHe: 'ורוד מסטיק', hex: '#f472b6', stock: true, active: true },
  { id: 'petg_brown', material: ['PETG'], nameEn: 'Chocolate Brown', nameHe: 'חום שוקולד', hex: '#78350f', stock: true, active: true },
  
  // TPU
  { id: 'tpu_black', material: ['TPU'], nameEn: 'Flexible Black', nameHe: 'שחור גמיש', hex: '#111827', stock: true, active: true },
  { id: 'tpu_white', material: ['TPU'], nameEn: 'Flexible White', nameHe: 'לבן גמיש', hex: '#ffffff', stock: true, active: true },
  { id: 'tpu_clear', material: ['TPU'], nameEn: 'Translucent Clear', nameHe: 'שקוף גמיש', hex: '#f1f5f9', stock: true, active: true },
  { id: 'tpu_red', material: ['TPU'], nameEn: 'Flexible Red', nameHe: 'אדום גמיש', hex: '#ef4444', stock: true, active: true },
  { id: 'tpu_blue', material: ['TPU'], nameEn: 'Flexible Blue', nameHe: 'כחול גמיש', hex: '#2563eb', stock: true, active: true }
];

export class DBService {
  public static async connectDB(): Promise<void> {
    const uri = process.env.MONGODB_CONECTION_URI || process.env.MONGODB_CONNECTION_URI;
    if (!uri) {
      console.error('⚠️ No MongoDB connection URI found in environment variables!');
      return;
    }

    try {
      await mongoose.connect(uri);
      console.log('🔌 Connected to MongoDB successfully.');
      
      // Auto seed filaments if empty
      const filamentCount = await FilamentModel.countDocuments();
      if (filamentCount === 0) {
        console.log('🌱 Seeding default filaments in MongoDB...');
        await FilamentModel.insertMany(DEFAULT_FILAMENTS);
        console.log('✅ Default filaments seeded successfully.');
      }
    } catch (error) {
      console.error('❌ Failed to connect to MongoDB:', error);
    }
  }

  // Helper to map DB Order doc to clean JSON response interface
  private static mapOrder(doc: any): Order {
    return {
      id: doc.id,
      customer: {
        name: doc.customer?.name || 'Unknown',
        email: doc.customer?.email || '',
        phone: doc.customer?.phone || '',
        comments: doc.comments || ''
      },
      models: doc.models.map((m: any) => ({
        name: m.name,
        size: m.size,
        material: m.material,
        color: m.color,
        infill: m.infill,
        layerHeight: m.layerHeight,
        quantity: m.quantity,
        weightg: m.weightg,
        timeSeconds: m.timeSeconds,
        price: m.price,
        fileKey: m.fileKey
      })),
      subtotal: doc.subtotal,
      vatAmount: doc.vatAmount,
      totalWithVat: doc.totalWithVat,
      status: doc.status,
      createdAt: doc.createdAt.toISOString(),
      thingiverseUrl: (doc as any).thingiverseUrl || '',
      thingiverseName: (doc as any).thingiverseName || ''
    };
  }

  // Orders CRUD
  public static async getOrders(): Promise<Order[]> {
    const docs = await OrderModel.find().populate<{ customer: ICustomer }>('customer').sort({ createdAt: -1 });
    return docs.map(doc => this.mapOrder(doc));
  }

  public static async addOrder(order: Omit<Order, 'id' | 'status' | 'createdAt'>): Promise<Order> {
    // 1. Find or create the customer
    let customerDoc = await CustomerModel.findOne({ email: order.customer.email.toLowerCase() });
    if (!customerDoc) {
      customerDoc = await CustomerModel.create({
        name: order.customer.name,
        email: order.customer.email.toLowerCase(),
        phone: order.customer.phone || '',
        comments: order.customer.comments // save initial comments here as well
      });
    } else if (order.customer.phone) {
      // Update phone if provided and customer already exists
      customerDoc.phone = order.customer.phone;
      await customerDoc.save();
    }

    // 2. Generate random order ID
    const orderId = 'P3D-' + Math.floor(100000 + Math.random() * 900000);

    // 3. Move any temporary uploaded STL files to permanent uploads folder
    if (order.models && Array.isArray(order.models)) {
      const tempUploadsDir = path.join(__dirname, '../../temp/uploads');
      const permUploadsDir = path.join(__dirname, '../../uploads');

      // Ensure perm uploads directory exists
      if (!fs.existsSync(permUploadsDir)) {
        fs.mkdirSync(permUploadsDir, { recursive: true });
      }

      for (const model of order.models) {
        if (model.fileKey) {
          const tempFilePath = path.join(tempUploadsDir, model.fileKey);
          const permFilePath = path.join(permUploadsDir, model.fileKey);

          if (fs.existsSync(tempFilePath)) {
            try {
              fs.renameSync(tempFilePath, permFilePath);
              console.log(`[DBService] Successfully persisted STL file: ${model.fileKey}`);
            } catch (err) {
              console.error(`[DBService] Failed to move STL file ${model.fileKey}:`, err);
            }
          } else {
            console.warn(`[DBService] STL file not found in temp storage: ${model.fileKey}`);
          }
        }
      }
    }

    // 4. Create the order document
    const newOrderDoc = await OrderModel.create({
      id: orderId,
      customer: customerDoc._id,
      comments: order.customer.comments || '',
      models: order.models,
      subtotal: order.subtotal,
      vatAmount: order.vatAmount,
      totalWithVat: order.totalWithVat,
      status: 'pending',
      thingiverseUrl: (order as any).thingiverseUrl || '',
      thingiverseName: (order as any).thingiverseName || ''
    });

    // Populate and map the response
    const populated = await newOrderDoc.populate<{ customer: ICustomer }>('customer');
    return this.mapOrder(populated);
  }

  public static async updateOrderStatus(id: string, status: Order['status']): Promise<Order | null> {
    const doc = await OrderModel.findOneAndUpdate({ id }, { status }, { new: true }).populate<{ customer: ICustomer }>('customer');
    if (!doc) return null;
    return this.mapOrder(doc);
  }

  // Filaments CRUD
  public static async getFilaments(): Promise<Filament[]> {
    const docs = await FilamentModel.find().sort({ material: 1, id: 1 });
    return docs.map(doc => ({
      id: doc.id,
      material: doc.material,
      nameEn: doc.nameEn,
      nameHe: doc.nameHe,
      hex: doc.hex,
      stock: doc.stock,
      active: doc.active,
      isDefault: doc.isDefault || false
    }));
  }

  public static async updateFilament(id: string, updates: Partial<Omit<Filament, 'id'>>): Promise<Filament | null> {
    if (updates.isDefault === true) {
      await FilamentModel.updateMany({ id: { $ne: id } }, { isDefault: false });
    }
    const doc = await FilamentModel.findOneAndUpdate({ id }, updates, { new: true });
    if (!doc) return null;
    return {
      id: doc.id,
      material: doc.material,
      nameEn: doc.nameEn,
      nameHe: doc.nameHe,
      hex: doc.hex,
      stock: doc.stock,
      active: doc.active,
      isDefault: doc.isDefault || false
    };
  }

  public static async addFilament(filament: Omit<Filament, 'id'>): Promise<Filament> {
    if (filament.isDefault === true) {
      await FilamentModel.updateMany({}, { isDefault: false });
    }
    const cleanName = filament.nameEn
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '');
    const matPrefix = filament.material && filament.material.length > 0
      ? filament.material.map(m => m.toLowerCase()).join('_')
      : 'color';
    let baseId = `${matPrefix}_${cleanName || 'color'}`;
    let id = baseId;
    let suffix = 1;
    while (await FilamentModel.findOne({ id })) {
      id = `${baseId}_${suffix}`;
      suffix++;
    }

    const doc = await FilamentModel.create({
      id,
      material: filament.material,
      nameEn: filament.nameEn,
      nameHe: filament.nameHe,
      hex: filament.hex,
      stock: filament.stock !== undefined ? filament.stock : true,
      active: filament.active !== undefined ? filament.active : true,
      isDefault: filament.isDefault !== undefined ? filament.isDefault : false
    });

    return {
      id: doc.id,
      material: doc.material,
      nameEn: doc.nameEn,
      nameHe: doc.nameHe,
      hex: doc.hex,
      stock: doc.stock,
      active: doc.active,
      isDefault: doc.isDefault || false
    };
  }

  public static async deleteFilament(id: string): Promise<boolean> {
    const result = await FilamentModel.findOneAndDelete({ id });
    return result !== null;
  }

  // Gallery CRUD
  public static async getGallery(): Promise<GalleryItem[]> {
    const docs = await GalleryItemModel.find().sort({ createdAt: -1 });
    return docs.map(doc => ({
      id: doc._id.toString(),
      titleEn: doc.titleEn,
      titleHe: doc.titleHe,
      descEn: doc.descEn,
      descHe: doc.descHe,
      material: doc.material,
      layerHeight: doc.layerHeight,
      infill: doc.infill,
      weight: doc.weight,
      time: doc.time,
      imageUrl: doc.imageUrl,
      category: doc.category,
      createdAt: doc.createdAt.toISOString()
    }));
  }

  public static async addGalleryItem(item: Omit<GalleryItem, 'id' | 'createdAt'>): Promise<GalleryItem> {
    const doc = await GalleryItemModel.create(item);
    return {
      id: doc._id.toString(),
      titleEn: doc.titleEn,
      titleHe: doc.titleHe,
      descEn: doc.descEn,
      descHe: doc.descHe,
      material: doc.material,
      layerHeight: doc.layerHeight,
      infill: doc.infill,
      weight: doc.weight,
      time: doc.time,
      imageUrl: doc.imageUrl,
      category: doc.category,
      createdAt: doc.createdAt.toISOString()
    };
  }

  public static async updateGalleryItem(id: string, updates: Partial<Omit<GalleryItem, 'id' | 'createdAt'>>): Promise<GalleryItem | null> {
    if (!mongoose.Types.ObjectId.isValid(id)) return null;
    const doc = await GalleryItemModel.findByIdAndUpdate(id, updates, { new: true });
    if (!doc) return null;
    return {
      id: doc._id.toString(),
      titleEn: doc.titleEn,
      titleHe: doc.titleHe,
      descEn: doc.descEn,
      descHe: doc.descHe,
      material: doc.material,
      layerHeight: doc.layerHeight,
      infill: doc.infill,
      weight: doc.weight,
      time: doc.time,
      imageUrl: doc.imageUrl,
      category: doc.category,
      createdAt: doc.createdAt.toISOString()
    };
  }

  public static async deleteGalleryItem(id: string): Promise<boolean> {
    if (!mongoose.Types.ObjectId.isValid(id)) return false;
    const result = await GalleryItemModel.findByIdAndDelete(id);
    return result !== null;
  }

  // ======================= Modeling Requests =======================

  public static async getModelingRequests(): Promise<ModelingRequest[]> {
    const docs = await ModelingRequestModel.find().sort({ createdAt: -1 });
    return docs.map(doc => this.mapModelingRequest(doc));
  }

  public static async addModelingRequest(data: Omit<ModelingRequest, 'id' | 'status' | 'createdAt'>): Promise<ModelingRequest> {
    const id = 'MDL-' + Math.floor(100000 + Math.random() * 900000);
    const doc = await ModelingRequestModel.create({ id, ...data, status: 'new' });
    return this.mapModelingRequest(doc);
  }

  public static async updateModelingRequestStatus(id: string, status: ModelingRequest['status']): Promise<ModelingRequest | null> {
    const doc = await ModelingRequestModel.findOneAndUpdate({ id }, { status }, { new: true });
    if (!doc) return null;
    return this.mapModelingRequest(doc);
  }

  private static mapModelingRequest(doc: any): ModelingRequest {
    return {
      id: doc.id,
      name: doc.name,
      email: doc.email,
      phone: doc.phone || '',
      projectName: doc.projectName,
      description: doc.description,
      dimensions: doc.dimensions || '',
      notes: doc.notes || '',
      status: doc.status,
      createdAt: doc.createdAt.toISOString()
    };
  }

  // ======================= Analytics =======================

  public static async trackEvent(data: {
    eventType: AnalyticsEventType;
    sessionId: string;
    page?: string;
    language?: string;
    payload?: Record<string, any>;
  }): Promise<void> {
    await AnalyticsEventModel.create(data);
  }

  public static async getAnalyticsSummary(days: number = 30): Promise<any> {
    const since = new Date(Date.now() - days * 24 * 60 * 60 * 1000);

    // --- Page views per page ---
    const pageViewsRaw = await AnalyticsEventModel.aggregate([
      { $match: { eventType: 'page_view', createdAt: { $gte: since } } },
      { $group: { _id: '$page', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // --- Unique sessions per page ---
    const uniqueSessionsRaw = await AnalyticsEventModel.aggregate([
      { $match: { eventType: 'page_view', createdAt: { $gte: since } } },
      { $group: { _id: { page: '$page', session: '$sessionId' } } },
      { $group: { _id: '$_id.page', uniqueSessions: { $sum: 1 } } },
      { $sort: { uniqueSessions: -1 } }
    ]);

    const uniqueSessionsMap: Record<string, number> = {};
    uniqueSessionsRaw.forEach((r: any) => { uniqueSessionsMap[r._id] = r.uniqueSessions; });

    const pageViews = pageViewsRaw.map((r: any) => ({
      page: r._id || 'unknown',
      views: r.count,
      uniqueSessions: uniqueSessionsMap[r._id] || 0
    }));

    // --- Quote funnel ---
    const [qStarted, qPriced, qAbandoned, qOrdered] = await Promise.all([
      AnalyticsEventModel.countDocuments({ eventType: 'quote_started', createdAt: { $gte: since } }),
      AnalyticsEventModel.countDocuments({ eventType: 'quote_priced', createdAt: { $gte: since } }),
      AnalyticsEventModel.countDocuments({ eventType: 'quote_abandoned', createdAt: { $gte: since } }),
      AnalyticsEventModel.countDocuments({ eventType: 'quote_ordered', createdAt: { $gte: since } })
    ]);

    const abandonmentRate = qPriced > 0 ? Math.round((qAbandoned / qPriced) * 100) : 0;
    const conversionRate = qStarted > 0 ? Math.round((qOrdered / qStarted) * 100) : 0;

    // --- Total sessions ---
    const totalSessionsResult = await AnalyticsEventModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      { $group: { _id: '$sessionId' } },
      { $count: 'total' }
    ]);
    const totalSessions = totalSessionsResult[0]?.total || 0;

    // --- Events over time (daily buckets) ---
    const eventsOverTime = await AnalyticsEventModel.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' },
            day: { $dayOfMonth: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } }
    ]);

    const dailyEvents = eventsOverTime.map((r: any) => ({
      date: `${r._id.year}-${String(r._id.month).padStart(2,'0')}-${String(r._id.day).padStart(2,'0')}`,
      count: r.count
    }));

    // --- Top explored models ---
    const topModels = await AnalyticsEventModel.aggregate([
      { $match: { eventType: 'explore_model_opened', createdAt: { $gte: since } } },
      { $group: { _id: { modelName: '$payload.modelName', thingId: '$payload.thingId' }, opens: { $sum: 1 } } },
      { $sort: { opens: -1 } },
      { $limit: 10 }
    ]);

    // --- Other event counts ---
    const [modelingSubmitted, contactSubmitted] = await Promise.all([
      AnalyticsEventModel.countDocuments({ eventType: 'modeling_request_submitted', createdAt: { $gte: since } }),
      AnalyticsEventModel.countDocuments({ eventType: 'contact_form_submitted', createdAt: { $gte: since } })
    ]);

    return {
      period: { days, since: since.toISOString() },
      totalSessions,
      pageViews,
      quoteFunnel: {
        started: qStarted,
        priced: qPriced,
        abandoned: qAbandoned,
        ordered: qOrdered,
        abandonmentRate,
        conversionRate
      },
      dailyEvents,
      topExploreModels: topModels.map((r: any) => ({
        modelName: r._id.modelName || 'Unknown',
        thingId: r._id.thingId || '',
        opens: r.opens
      })),
      otherEvents: {
        modelingSubmitted,
        contactSubmitted
      }
    };
  }
}
