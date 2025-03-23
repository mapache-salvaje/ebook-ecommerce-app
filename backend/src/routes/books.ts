import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

// Schema for book validation
const BookSchema = z.object({
  title: z.string().min(1),
  author: z.string().min(1),
  price: z.number().positive(),
  description: z.string().min(1),
  coverImage: z.string().url(),
});

// Get all books
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const books = await prisma.book.findMany();
    res.json(books);
  } catch (error) {
    next(error);
  }
});

// Get a single book
router.get('/:id', async (req: Request<{ id: string }>, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const book = await prisma.book.findUnique({
      where: { id: parseInt(id) },
    });
    
    if (!book) {
      res.status(404).json({ error: 'Book not found' });
      return;
    }
    
    res.json(book);
  } catch (error) {
    next(error);
  }
});

// Create a new book
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const bookData = BookSchema.parse(req.body);
    const book = await prisma.book.create({
      data: bookData,
    });
    res.status(201).json(book);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    next(error);
  }
});

export default router; 