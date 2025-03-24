import React, { useEffect, useState } from 'react';
import { Elements } from '@stripe/react-stripe-js';
import { Box, Container, Typography, Alert, CircularProgress } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import { stripePromise } from '../lib/stripe';
import api, { CreateOrderRequest } from '../services/api';
import CheckoutForm from '../components/CheckoutForm';
import { useCart } from '../contexts/CartContext';

interface LocationState {
  order: CreateOrderRequest;
}

export default function Checkout() {
  const [clientSecret, setClientSecret] = useState<string>();
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { order } = (location.state as LocationState) || {};
  const { clearCart } = useCart();

  useEffect(() => {
    if (!order) {
      navigate('/cart');
      return;
    }

    const createOrder = async () => {
      try {
        setIsLoading(true);
        console.log('Creating order:', order);
        
        // Create the order
        const { data: createdOrder } = await api.createOrder(order);
        console.log('Order created:', createdOrder);
        
        // Get the payment intent
        console.log('Creating payment intent for order:', createdOrder.id);
        const { data } = await api.createPaymentIntent(createdOrder.id);
        console.log('Payment intent created:', data);
        
        setClientSecret(data.clientSecret);
      } catch (err) {
        console.error('Checkout error:', err);
        setError(err instanceof Error ? err.message : 'Failed to create order. Please try again.');
      } finally {
        setIsLoading(false);
      }
    };

    createOrder();
  }, [order, navigate]);

  const handleSuccess = () => {
    clearCart();
    navigate('/order-success');
  };

  if (isLoading) {
    return (
      <Container sx={{ py: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
        <CircularProgress />
        <Typography>Preparing your order...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Typography>
          There was an error preparing your order. Please try again or contact support if the problem persists.
        </Typography>
      </Container>
    );
  }

  if (!clientSecret) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          Failed to initialize payment. Please try again.
        </Alert>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>
      
      <Box sx={{ mt: 4 }}>
        <Elements
          stripe={stripePromise}
          options={{
            clientSecret,
            appearance: {
              theme: 'stripe',
            },
          }}
        >
          <CheckoutForm
            onSuccess={handleSuccess}
            onError={setError}
          />
        </Elements>
      </Box>
    </Container>
  );
} 