import { Router, Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';
import Stripe from 'stripe';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
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
router.post('/webhook', async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'];
  const webhookId = req.headers['stripe-idempotency-key'];

  console.log('Received webhook:', {
    id: webhookId,
    signature: sig ? 'present' : 'missing',
    body: req.body ? 'present' : 'missing'
  });

  if (!sig) {
    console.error('No signature found in webhook request');
    return res.status(400).json({ error: 'No signature found' });
  }

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );

    console.log('Successfully verified webhook:', {
      id: event.id,
      type: event.type,
      created: new Date(event.created * 1000).toISOString()
    });

    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = parseInt(paymentIntent.metadata.orderId);

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'completed' },
        });
        console.log(`Updated order ${orderId} to completed`);
        break;
      }
      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        const orderId = parseInt(paymentIntent.metadata.orderId);

        await prisma.order.update({
          where: { id: orderId },
          data: { status: 'failed' },
        });
        console.log(`Updated order ${orderId} to failed`);
        break;
      }
      default: {
        console.log(`Unhandled event type: ${event.type}`);
      }
    }

    // Return 200 to acknowledge receipt and prevent retries
    res.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    // Return 400 to indicate the webhook was invalid
    res.status(400).json({ error: (error as Error).message });
  }
});

export default router; 