import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import slicerRoutes from './routes/slicer.routes';
import managementRoutes from './routes/management.routes';
import modelsRoutes from './routes/models.routes';


// Load environment variables (Token configured)
dotenv.config();

import { DBService } from './services/db.service';

// Initialize DB connection
DBService.connectDB();

const app = express();
const PORT = process.env.PORT || 5001;

// Middlewares
app.use(cors({
  origin: '*', // For development, allow all origins
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files
app.use('/temp', express.static(path.join(__dirname, '../temp')));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api', slicerRoutes);
app.use('/api', managementRoutes);
app.use('/api/models', modelsRoutes);

// Health check endpoint
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok', time: new Date() });
});

// 404 Route handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Global Error Handler
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error('Unhandled Server Error:', err);
  res.status(500).json({
    error: 'Internal Server Error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong on the server'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Slicing server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});

export default app;
