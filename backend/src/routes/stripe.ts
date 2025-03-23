import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { z } from 'zod';
import { json } from 'express';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-02-24.acacia',
});

// Create a payment intent
router.post('/create-payment-intent', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { orderId } = z.object({ orderId: z.number() }).parse(req.body);

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      select: {
        id: true,
        total: true,
        status: true,
      },
    });

    if (!order) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(order.total * 100), // Convert to cents
      currency: 'usd',
      metadata: {
        orderId: order.id.toString(),
      },
    });

    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: error.errors });
      return;
    }
    next(error);
  }
});

// Handle webhook
router.post('/webhook', json({ type: 'application/json', verify: (req, res, buf) => {
  (req as any).rawBody = buf;
}}), async (req: Request, res: Response, next: NextFunction) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      (req as any).rawBody,
      sig!,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = parseInt(paymentIntent.metadata.orderId);

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'completed' },
        });
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = parseInt(paymentIntent.metadata.orderId);

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'failed' },
        });
        break;
      }
    }

    res.json({ received: true });
  } catch (error) {
    next(error);
  }
});

export default router;