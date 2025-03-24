import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Schema for order item validation
const OrderItemSchema = z.object({
  bookId: z.number().int().positive(),
  quantity: z.number().int().positive(),
});

// Schema for order validation
const OrderSchema = z.object({
  userId: z.number().int().positive(),
  items: z.array(OrderItemSchema),
});

// Get user's orders
router.get('/:userId', async (req: Request<{ userId: string }>, res: Response, next: NextFunction) => {
  try {
    const { userId } = req.params;
    const orders = await prisma.order.findMany({
      where: { userId: parseInt(userId) },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });
    res.json(orders);
  } catch (error) {
    next(error);
  }
});

// Create a new order
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const orderData = OrderSchema.parse(req.body);
    
    // Verify all books exist and calculate total price
    const bookIds = orderData.items.map(item => item.bookId);
    const books = await prisma.book.findMany({
      where: {
        id: {
          in: bookIds,
        },
      },
    });

    if (books.length !== bookIds.length) {
      res.status(400).json({ error: 'One or more books not found' });
      return;
    }

    const total = orderData.items.reduce((sum, item) => {
      const book = books.find(b => b.id === item.bookId);
      return sum + (book?.price || 0) * item.quantity;
    }, 0);

    const order = await prisma.order.create({
      data: {
        userId: orderData.userId,
        total,
        status: 'pending',
        items: {
          create: orderData.items.map(item => {
            const book = books.find(b => b.id === item.bookId)!;
            return {
              bookId: item.bookId,
              quantity: item.quantity,
              price: book.price,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            book: true,
          },
        },
      },
    });

    res.status(201).json(order);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    next(error);
  }
});

export default router; 