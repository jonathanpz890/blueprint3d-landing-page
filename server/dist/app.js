"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const path_1 = __importDefault(require("path"));
const slicer_routes_1 = __importDefault(require("./routes/slicer.routes"));
const management_routes_1 = __importDefault(require("./routes/management.routes"));
const models_routes_1 = __importDefault(require("./routes/models.routes"));
// Load environment variables (Token configured)
dotenv_1.default.config();
const db_service_1 = require("./services/db.service");
// Initialize DB connection
db_service_1.DBService.connectDB();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 5001;
// Middlewares
app.use((0, cors_1.default)({
    origin: '*', // For development, allow all origins
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files
app.use('/temp', express_1.default.static(path_1.default.join(__dirname, '../temp')));
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api', slicer_routes_1.default);
app.use('/api', management_routes_1.default);
app.use('/api/models', models_routes_1.default);
// Health check endpoint
app.get('/health', (_req, res) => {
    res.status(200).json({ status: 'ok', time: new Date() });
});
// 404 Route handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found' });
});
// Global Error Handler
app.use((err, _req, res, _next) => {
    console.error('Unhandled Server Error:', err);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server'
    });
});
app.listen(PORT, () => {
    console.log(`🚀 Slicing server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
exports.default = app;
