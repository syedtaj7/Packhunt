import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { config } from 'dotenv';
import { prisma } from './lib/prisma';

// Import routes
import packagesRouter from './routes/packages';
import searchRouter from './routes/search';
import categoriesRouter from './routes/categories';

// Load environment variables
config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet()); // Security headers
app.use(compression()); // Compress responses
app.use(cors({
  origin: process.env.FRONTEND_URL ? [process.env.FRONTEND_URL, 'http://localhost:8080'] : '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rate limiting - 1000 requests per 15 minutes per IP (generous for development)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// Health check endpoint
app.get('/health', (req: Request, res: Response) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    database: 'connected'
  });
});

// API Routes
app.use('/api/packages', packagesRouter);
app.use('/api/search', searchRouter);
app.use('/api/categories', categoriesRouter);

// Root endpoint
app.get('/', (req: Request, res: Response) => {
  res.json({
    message: 'PackHunt API Server',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      packages: '/api/packages',
      search: '/api/search',
      categories: '/api/categories',
    }
  });
});

// 404 handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`
🚀 PackHunt API Server is running!

📍 Local:    http://localhost:${PORT}
🔗 Health:   http://localhost:${PORT}/health
📦 Packages: http://localhost:${PORT}/api/packages
🔍 Search:   http://localhost:${PORT}/api/search
📂 Categories: http://localhost:${PORT}/api/categories

Environment: ${process.env.NODE_ENV || 'development'}
Frontend: ${process.env.FRONTEND_URL || 'http://localhost:8080'}
  `);
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('SIGTERM received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('\nSIGINT received, closing server...');
  await prisma.$disconnect();
  process.exit(0);
});
 
 

