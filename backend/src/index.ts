import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';
import bookRoutes from './routes/books';
import orderRoutes from './routes/orders';
import stripeRoutes from './routes/stripe';
import authRoutes from './routes/auth';

dotenv.config();

const app = express();
const prisma = new PrismaClient();
const port = process.env.PORT || 3000;

app.use(cors());

// Handle raw body for webhook
app.use('/api/stripe/webhook', express.raw({ type: 'application/json' }));

// Handle JSON for all other routes
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', bookRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stripe', stripeRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 