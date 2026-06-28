"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.DBService = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const Customer_1 = __importDefault(require("../models/Customer"));
const Filament_1 = __importDefault(require("../models/Filament"));
const GalleryItem_1 = __importDefault(require("../models/GalleryItem"));
const Order_1 = __importDefault(require("../models/Order"));
const ModelingRequest_1 = __importDefault(require("../models/ModelingRequest"));
const DEFAULT_FILAMENTS = [
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
class DBService {
    static async connectDB() {
        const uri = process.env.MONGODB_CONECTION_URI || process.env.MONGODB_CONNECTION_URI;
        if (!uri) {
            console.error('⚠️ No MongoDB connection URI found in environment variables!');
            return;
        }
        try {
            await mongoose_1.default.connect(uri);
            console.log('🔌 Connected to MongoDB successfully.');
            // Auto seed filaments if empty
            const filamentCount = await Filament_1.default.countDocuments();
            if (filamentCount === 0) {
                console.log('🌱 Seeding default filaments in MongoDB...');
                await Filament_1.default.insertMany(DEFAULT_FILAMENTS);
                console.log('✅ Default filaments seeded successfully.');
            }
        }
        catch (error) {
            console.error('❌ Failed to connect to MongoDB:', error);
        }
    }
    // Helper to map DB Order doc to clean JSON response interface
    static mapOrder(doc) {
        return {
            id: doc.id,
            customer: {
                name: doc.customer?.name || 'Unknown',
                email: doc.customer?.email || '',
                phone: doc.customer?.phone || '',
                comments: doc.comments || ''
            },
            models: doc.models.map((m) => ({
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
            thingiverseUrl: doc.thingiverseUrl || '',
            thingiverseName: doc.thingiverseName || ''
        };
    }
    // Orders CRUD
    static async getOrders() {
        const docs = await Order_1.default.find().populate('customer').sort({ createdAt: -1 });
        return docs.map(doc => this.mapOrder(doc));
    }
    static async addOrder(order) {
        // 1. Find or create the customer
        let customerDoc = await Customer_1.default.findOne({ email: order.customer.email.toLowerCase() });
        if (!customerDoc) {
            customerDoc = await Customer_1.default.create({
                name: order.customer.name,
                email: order.customer.email.toLowerCase(),
                phone: order.customer.phone || '',
                comments: order.customer.comments // save initial comments here as well
            });
        }
        else if (order.customer.phone) {
            // Update phone if provided and customer already exists
            customerDoc.phone = order.customer.phone;
            await customerDoc.save();
        }
        // 2. Generate random order ID
        const orderId = 'P3D-' + Math.floor(100000 + Math.random() * 900000);
        // 3. Move any temporary uploaded STL files to permanent uploads folder
        if (order.models && Array.isArray(order.models)) {
            const tempUploadsDir = path_1.default.join(__dirname, '../../temp/uploads');
            const permUploadsDir = path_1.default.join(__dirname, '../../uploads');
            // Ensure perm uploads directory exists
            if (!fs_1.default.existsSync(permUploadsDir)) {
                fs_1.default.mkdirSync(permUploadsDir, { recursive: true });
            }
            for (const model of order.models) {
                if (model.fileKey) {
                    const tempFilePath = path_1.default.join(tempUploadsDir, model.fileKey);
                    const permFilePath = path_1.default.join(permUploadsDir, model.fileKey);
                    if (fs_1.default.existsSync(tempFilePath)) {
                        try {
                            fs_1.default.renameSync(tempFilePath, permFilePath);
                            console.log(`[DBService] Successfully persisted STL file: ${model.fileKey}`);
                        }
                        catch (err) {
                            console.error(`[DBService] Failed to move STL file ${model.fileKey}:`, err);
                        }
                    }
                    else {
                        console.warn(`[DBService] STL file not found in temp storage: ${model.fileKey}`);
                    }
                }
            }
        }
        // 4. Create the order document
        const newOrderDoc = await Order_1.default.create({
            id: orderId,
            customer: customerDoc._id,
            comments: order.customer.comments || '',
            models: order.models,
            subtotal: order.subtotal,
            vatAmount: order.vatAmount,
            totalWithVat: order.totalWithVat,
            status: 'pending',
            thingiverseUrl: order.thingiverseUrl || '',
            thingiverseName: order.thingiverseName || ''
        });
        // Populate and map the response
        const populated = await newOrderDoc.populate('customer');
        return this.mapOrder(populated);
    }
    static async updateOrderStatus(id, status) {
        const doc = await Order_1.default.findOneAndUpdate({ id }, { status }, { new: true }).populate('customer');
        if (!doc)
            return null;
        return this.mapOrder(doc);
    }
    // Filaments CRUD
    static async getFilaments() {
        const docs = await Filament_1.default.find().sort({ material: 1, id: 1 });
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
    static async updateFilament(id, updates) {
        if (updates.isDefault === true) {
            await Filament_1.default.updateMany({ id: { $ne: id } }, { isDefault: false });
        }
        const doc = await Filament_1.default.findOneAndUpdate({ id }, updates, { new: true });
        if (!doc)
            return null;
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
    static async addFilament(filament) {
        if (filament.isDefault === true) {
            await Filament_1.default.updateMany({}, { isDefault: false });
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
        while (await Filament_1.default.findOne({ id })) {
            id = `${baseId}_${suffix}`;
            suffix++;
        }
        const doc = await Filament_1.default.create({
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
    static async deleteFilament(id) {
        const result = await Filament_1.default.findOneAndDelete({ id });
        return result !== null;
    }
    // Gallery CRUD
    static async getGallery() {
        const docs = await GalleryItem_1.default.find().sort({ createdAt: -1 });
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
    static async addGalleryItem(item) {
        const doc = await GalleryItem_1.default.create(item);
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
    static async updateGalleryItem(id, updates) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return null;
        const doc = await GalleryItem_1.default.findByIdAndUpdate(id, updates, { new: true });
        if (!doc)
            return null;
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
    static async deleteGalleryItem(id) {
        if (!mongoose_1.default.Types.ObjectId.isValid(id))
            return false;
        const result = await GalleryItem_1.default.findByIdAndDelete(id);
        return result !== null;
    }
    // ======================= Modeling Requests =======================
    static async getModelingRequests() {
        const docs = await ModelingRequest_1.default.find().sort({ createdAt: -1 });
        return docs.map(doc => this.mapModelingRequest(doc));
    }
    static async addModelingRequest(data) {
        const id = 'MDL-' + Math.floor(100000 + Math.random() * 900000);
        const doc = await ModelingRequest_1.default.create({ id, ...data, status: 'new' });
        return this.mapModelingRequest(doc);
    }
    static async updateModelingRequestStatus(id, status) {
        const doc = await ModelingRequest_1.default.findOneAndUpdate({ id }, { status }, { new: true });
        if (!doc)
            return null;
        return this.mapModelingRequest(doc);
    }
    static mapModelingRequest(doc) {
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
}
exports.DBService = DBService;
