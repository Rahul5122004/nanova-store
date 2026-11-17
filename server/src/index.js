import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { config } from './config/db.config.js';
import { initDatabase } from './db/index.js';
import { createTablesIfNotExist } from './db/schema.js';
import { seedDatabase } from './db/seed.js';
import { setSocketIO } from './services/notificationService.js';

// Route imports
import authRoutes from './routes/auth.routes.js';
import productsRoutes from './routes/products.routes.js';
import inventoryRoutes from './routes/inventory.routes.js';
import ordersRoutes from './routes/orders.routes.js';
import purchasesRoutes from './routes/purchases.routes.js';
import suppliersRoutes from './routes/suppliers.routes.js';
import expensesRoutes from './routes/expenses.routes.js';
import reportsRoutes from './routes/reports.routes.js';
import paymentsRoutes from './routes/payments.routes.js';
import customersRoutes from './routes/customers.routes.js';
import settingsRoutes from './routes/settings.routes.js';
import notificationsRoutes from './routes/notifications.routes.js';
import galleryRoutes from './routes/gallery.routes.js';
import { authenticateAdmin } from './middleware/auth.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = http.createServer(app);

// Socket.IO Setup
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE']
  }
});

setSocketIO(io);

io.on('connection', (socket) => {
  console.log(`[Socket.IO] Client connected: ${socket.id}`);
  socket.on('disconnect', () => {
    console.log(`[Socket.IO] Client disconnected: ${socket.id}`);
  });
});

// Middlewares
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '20mb' }));

// Static file uploads directory
const uploadsPath = path.join(__dirname, '../uploads');
app.use('/uploads', express.static(uploadsPath));

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    project: 'NANOVA Dual-Brand E-Commerce Platform',
    timestamp: new Date().toISOString()
  });
});

// Mount Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/purchases', purchasesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/reports', reportsRoutes);
app.use('/api/payments', paymentsRoutes);
app.use('/api/customers', customersRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/notifications', notificationsRoutes);
app.use('/api/gallery', galleryRoutes);

// Direct Reset All Endpoint Alias (Fail-Safe)
app.post('/api/reset-all', authenticateAdmin, async (req, res) => {
  try {
    const { query: dbQuery } = await import('./db/index.js');
    await dbQuery('DELETE FROM order_items');
    await dbQuery('DELETE FROM invoices');
    await dbQuery('DELETE FROM payments');
    await dbQuery('DELETE FROM orders');
    await dbQuery('DELETE FROM inventory_transactions');
    await dbQuery('DELETE FROM product_images');
    await dbQuery('DELETE FROM product_variants');
    await dbQuery('DELETE FROM products');
    await dbQuery('DELETE FROM customers');
    await dbQuery('DELETE FROM expenses');
    await dbQuery('DELETE FROM notifications');

    res.json({
      success: true,
      message: 'Website data completely wiped. The website is now 100% fresh and blank!'
    });
  } catch (err) {
    console.error('[Reset All Error]:', err);
    res.status(500).json({ success: false, message: err.message });
  }
});

// 404 Handler for undefined API routes (ensures JSON is always returned, never HTML)
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API route not found: ${req.method} ${req.originalUrl}`
  });
});

// Serve frontend client build in production
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads') || req.path.startsWith('/socket.io')) {
    return next();
  }
  const indexPath = path.join(clientDistPath, 'index.html');
  res.sendFile(indexPath, (err) => {
    if (err) next();
  });
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Server Error]:', err);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

// Start Server
async function startServer() {
  try {
    await initDatabase();
    await createTablesIfNotExist();
    await seedDatabase(false);

    server.on('error', (err) => {
      if (err.code === 'EADDRINUSE') {
        console.error(`\n[Server Error]: Port ${config.port} is already in use by another running process.`);
        console.error(`Please close any existing terminal running Nanova or run: taskkill /F /IM node.exe\n`);
      } else {
        console.error('[Server Error]:', err);
      }
      process.exit(1);
    });

    server.listen(config.port, '0.0.0.0', () => {
      console.log(`=======================================================`);
      console.log(`  NANOVA DUAL-BRAND E-COMMERCE & AUTOMATION PLATFORM   `);
      console.log(`  Backend API Running on http://localhost:${config.port}`);
      console.log(`  WebSocket notifications ready on port ${config.port}`);
      console.log(`=======================================================`);
    });
  } catch (err) {
    console.error('[Fatal Start Error]:', err);
    process.exit(1);
  }
}

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, server, io, startServer };
